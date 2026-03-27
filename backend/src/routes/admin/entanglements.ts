import { Router, Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { logger } from "../../utils/logger";

export const entanglementsRouter = Router();

/**
 * Weight factors for contagion propagation by link type.
 * Reference: QFSE architecture spec — Entanglement Contagion Model.
 */
const WEIGHT_FACTORS: Record<string, number> = {
  guarantor:       0.7,
  co_borrower:     0.6,
  shared_address:  0.4,
  shared_employer: 0.3,
  family:          0.5,
};

/**
 * Compute normalized contagion score using the formula:
 *   contagionScore = (baseRisk + Σ(linkedRisk × weight)) / (1 + Σ(weight))
 * Result clamped to [0, 1].
 */
function computeContagionScore(
  baseRisk: number,
  linkedEntries: Array<{ risk: number; weight: number }>
): number {
  if (linkedEntries.length === 0) return baseRisk;

  const weightedSum  = linkedEntries.reduce((s, e) => s + e.risk * e.weight, 0);
  const totalWeight  = linkedEntries.reduce((s, e) => s + e.weight, 0);

  return Math.min(1, (baseRisk + weightedSum) / (1 + totalWeight));
}

/**
 * GET /api/entanglements/:customerId
 * Returns social-financial topology graph with full contagion score.
 */
entanglementsRouter.get("/:customerId", async (req: Request, res: Response): Promise<void> => {
  const { customerId } = req.params;

  try {
    const customer = await prisma.customer.findUnique({
      where:   { id: customerId },
      include: {
        persona:    true,
        riskScores: { orderBy: { scoredAt: "desc" }, take: 1 },
      },
    });

    if (!customer) {
      res.status(404).json({ error: "Customer not found" });
      return;
    }

    const entanglements = await prisma.entanglement.findMany({
      where:   { customerId },
      include: {
        linkedCustomer: {
          include: {
            persona:    true,
            riskScores: { orderBy: { scoredAt: "desc" }, take: 1 },
          },
        },
      },
    });

    const baseRisk = customer.riskScores[0]
      ? Number(customer.riskScores[0].probability)
      : 0;

    // ── Build graph nodes ─────────────────────────────────────
    const centerNode = {
      id:        customer.id,
      name:      customer.name,
      risk:      Math.round(baseRisk * 100),
      riskState: customer.riskScores[0]?.riskState ?? "Unknown",
      persona:   customer.persona?.name ?? "Unknown",
      color:     customer.persona?.color ?? "#6A0DAD",
      isCenter:  true,
    };

    const linkedEntries: Array<{ risk: number; weight: number }> = [];

    const linkedNodes = entanglements.map(e => {
      const linkedRisk = e.linkedCustomer?.riskScores[0]
        ? Number(e.linkedCustomer.riskScores[0].probability)
        : Number(e.linkedRiskScore ?? 0);

      const weight = WEIGHT_FACTORS[e.linkType] ?? 0.3;
      linkedEntries.push({ risk: linkedRisk, weight });

      return {
        id:            e.linkedCustomer?.id ?? e.id,
        name:          e.linkedName,
        risk:          Math.round(linkedRisk * 100),
        riskState:     e.linkedCustomer?.riskScores[0]?.riskState ?? "Unknown",
        persona:       e.linkedCustomer?.persona?.name ?? "External",
        color:         e.linkedCustomer?.persona?.color ?? "#555577",
        isCenter:      false,
        relationship:  e.relationship,
        linkType:      e.linkType,
        weightFactor:  weight,
        riskImpact:    `+${Number(e.riskImpactPct).toFixed(1)}%`,
        riskImpactPct: Number(e.riskImpactPct),
      };
    });

    const edges = entanglements.map(e => ({
      source:       customer.id,
      target:       e.linkedCustomer?.id ?? e.id,
      linkType:     e.linkType,
      relationship: e.relationship,
      weightFactor: WEIGHT_FACTORS[e.linkType] ?? 0.3,
      riskImpact:   Number(e.riskImpactPct),
      label:        e.relationship,
    }));

    // ── Contagion score ───────────────────────────────────────
    const contagionScore = computeContagionScore(baseRisk, linkedEntries);

    // ── Risk amplification (delta from base) ──────────────────
    const riskAmplification = Math.max(0, contagionScore - baseRisk);

    res.json({
      nodes:              [centerNode, ...linkedNodes],
      edges,
      totalEntanglements: entanglements.length,
      baseRisk:           Math.round(baseRisk * 100),
      contagionScore:     Math.round(contagionScore * 100),
      propagatedRisk:     Math.round(contagionScore * 100),
      riskAmplification:  Math.round(riskAmplification * 100),
      weightFactors:      WEIGHT_FACTORS,
      linkTypeSummary: {
        family:          entanglements.filter(e => e.linkType === "family").length,
        co_borrower:     entanglements.filter(e => e.linkType === "co_borrower").length,
        guarantor:       entanglements.filter(e => e.linkType === "guarantor").length,
        shared_address:  entanglements.filter(e => e.linkType === "shared_address").length,
        shared_employer: entanglements.filter(e => e.linkType === "shared_employer").length,
      },
    });
  } catch (err) {
    logger.error(`GET /entanglements/${customerId} error:`, err);
    res.status(500).json({ error: "Failed to fetch entanglement network" });
  }
});
