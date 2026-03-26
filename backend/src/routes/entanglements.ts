import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { logger } from "../utils/logger";

export const entanglementsRouter = Router();

/**
 * GET /api/entanglements/:customerId
 * Returns the full entanglement network for a customer:
 * - Direct links (family, co-borrower, guarantor, shared address, shared employer)
 * - Each linked node includes their own latest risk score
 * - Instability propagation score = weighted sum of linked risk impacts
 */
entanglementsRouter.get("/:customerId", async (req: Request, res: Response): Promise<void> => {
  const { customerId } = req.params;

  try {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        persona: true,
        riskScores: { orderBy: { scoredAt: "desc" }, take: 1 },
      },
    });

    if (!customer) {
      res.status(404).json({ error: "Customer not found" });
      return;
    }

    const entanglements = await prisma.entanglement.findMany({
      where: { customerId },
      include: {
        linkedCustomer: {
          include: {
            persona: true,
            riskScores: { orderBy: { scoredAt: "desc" }, take: 1 },
          },
        },
      },
    });

    // Build the network graph nodes/edges
    const centerNode = {
      id:        customer.id,
      name:      customer.name,
      risk:      customer.riskScores[0] ? Math.round(Number(customer.riskScores[0].probability) * 100) : 0,
      riskState: customer.riskScores[0]?.riskState || "Unknown",
      persona:   customer.persona?.name || "Unknown",
      color:     customer.persona?.color || "#6A0DAD",
      isCenter:  true,
    };

    const linkedNodes = entanglements.map(e => ({
      id:            e.linkedCustomer?.id || e.id,
      name:          e.linkedName,
      risk:          e.linkedCustomer?.riskScores[0]
                       ? Math.round(Number(e.linkedCustomer.riskScores[0].probability) * 100)
                       : e.linkedRiskScore ? Math.round(Number(e.linkedRiskScore) * 100) : 0,
      riskState:     e.linkedCustomer?.riskScores[0]?.riskState || "Unknown",
      persona:       e.linkedCustomer?.persona?.name || "External",
      color:         e.linkedCustomer?.persona?.color || "#555577",
      isCenter:      false,
      relationship:  e.relationship,
      linkType:      e.linkType,
      riskImpact:    `+${Number(e.riskImpactPct).toFixed(1)}%`,
      riskImpactPct: Number(e.riskImpactPct),
    }));

    const edges = entanglements.map(e => ({
      source:      customer.id,
      target:      e.linkedCustomer?.id || e.id,
      linkType:    e.linkType,
      relationship:e.relationship,
      riskImpact:  Number(e.riskImpactPct),
      label:       e.relationship,
    }));

    // Instability propagation: sum of all risk impacts weighted by linked node risk
    const totalRiskImpact = entanglements.reduce((sum, e) => {
      const linkedRisk = e.linkedCustomer?.riskScores[0]
        ? Number(e.linkedCustomer.riskScores[0].probability)
        : Number(e.linkedRiskScore || 0);
      return sum + (Number(e.riskImpactPct) / 100) * linkedRisk;
    }, 0);

    const baseRisk = customer.riskScores[0] ? Number(customer.riskScores[0].probability) : 0;
    const propagatedRisk = Math.min(1, baseRisk + totalRiskImpact);

    res.json({
      nodes:               [centerNode, ...linkedNodes],
      edges,
      totalEntanglements:  entanglements.length,
      baseRisk:            Math.round(baseRisk * 100),
      propagatedRisk:      Math.round(propagatedRisk * 100),
      riskAmplification:   Math.round(totalRiskImpact * 100),
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
