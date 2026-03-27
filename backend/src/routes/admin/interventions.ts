import { Router, Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { simulateIntervention, isSimulationOutput } from "../../services/mlService";
import { logger } from "../../utils/logger";
import { z } from "zod";
import { validateBody } from "../../middleware/validation";

export const interventionsRouter = Router();

const VALID_ACTIONS = [
  "EMI Holiday",
  "Loan Restructuring",
  "Partial Payment Plan",
  "Flexible Repayment",
] as const;

// ── Zod schemas ───────────────────────────────────────────────
const SimulateSchema = z.object({
  customerId: z.string().min(1),
  actionType: z.enum(VALID_ACTIONS),
});

const SaveSchema = z.object({
  customerId:           z.string().min(1),
  actionType:           z.enum(VALID_ACTIONS),
  preProbability:       z.number().min(0).max(1),
  projectedProbability: z.number().min(0).max(1),
  confidenceScore:      z.number().min(0).max(1).optional(),
  riskReductionPct:     z.number().optional(),
  notes:                z.string().optional(),
  analystId:            z.string().optional(),
  status:               z.enum(["simulated", "applied", "rejected"]).optional(),
});

// ── Entanglement weight factors for contagion score ───────────
const LINK_WEIGHTS: Record<string, number> = {
  guarantor:       0.7,
  co_borrower:     0.6,
  shared_address:  0.4,
  shared_employer: 0.3,
  family:          0.5,
};

/**
 * Compute the linked_instability_score for a customer
 * based on their entanglement network. Normalized 0-1.
 */
async function computeLinkedInstabilityScore(customerId: string): Promise<number> {
  const entanglements = await prisma.entanglement.findMany({
    where: { customerId },
    include: {
      linkedCustomer: {
        include: { riskScores: { orderBy: { scoredAt: "desc" }, take: 1 } },
      },
    },
  });

  if (entanglements.length === 0) return 0;

  let weightedSum   = 0;
  let totalWeight   = 0;

  for (const e of entanglements) {
    const weight = LINK_WEIGHTS[e.linkType] ?? 0.3;
    const linkedRisk = e.linkedCustomer?.riskScores[0]
      ? Number(e.linkedCustomer.riskScores[0].probability)
      : Number(e.linkedRiskScore ?? 0);

    weightedSum += linkedRisk * weight;
    totalWeight += weight;
  }

  // Normalize: result in [0, 1]
  return totalWeight > 0 ? Math.min(1, weightedSum / totalWeight) : 0;
}

// ── POST /api/interventions/simulate ─────────────────────────
interventionsRouter.post(
  "/simulate",
  validateBody(SimulateSchema),
  async (req: Request, res: Response): Promise<void> => {
    const { customerId, actionType } = req.body as z.infer<typeof SimulateSchema>;

    try {
      const customer = await prisma.customer.findUnique({ where: { id: customerId } });
      if (!customer) {
        res.status(404).json({ error: "Customer not found" });
        return;
      }

      // Get latest risk score from DB as the "original" probability
      const latestRisk = await prisma.riskScore.findFirst({
        where:   { customerId },
        orderBy: { scoredAt: "desc" },
      });
      const preProbability = latestRisk ? Number(latestRisk.probability) : 0.5;

      // Compute real contagion-weighted instability score
      const linkedInstabilityScore = await computeLinkedInstabilityScore(customerId);

      // Build full feature vector from DB
      const features = {
        salary_delay_freq:         Number(customer.salaryDelayFreq),
        credit_utilization_ratio:  Number(customer.creditUtilization) / 100,
        emi_payment_consistency:   Number(customer.emiPaymentConsistency),
        withdrawal_spikes:         Number(customer.withdrawalSpikes) / 10,
        loan_to_income_ratio:      Number(customer.loanToIncomeRatio),
        past_intervention_success: 0,
        linked_instability_score:  linkedInstabilityScore,
      };

      const mlResult = await simulateIntervention(features, actionType);

      // Resolve fields from either ML response shape via type guard
      let simProbability: number;
      let confidenceScore: number;
      let projectedRiskState: string;
      let featureImportance: Record<string, number>;
      let modifiedFeatures: Record<string, number>;

      if (isSimulationOutput(mlResult)) {
        simProbability     = mlResult.simulated_probability;
        confidenceScore    = mlResult.confidence_score;
        projectedRiskState = mlResult.projected_risk_state;
        featureImportance  = mlResult.feature_importance;
        modifiedFeatures   = mlResult.modified_features;
      } else {
        // Fallback: old /simulate-intervention shape returns full MlRiskOutput
        simProbability     = mlResult.probability;
        confidenceScore    = mlResult.confidence_score;
        projectedRiskState = mlResult.risk_state;
        featureImportance  = mlResult.feature_importance;
        modifiedFeatures   = {};
      }

      const delta = preProbability - simProbability;
      const riskReductionPct = preProbability > 0
        ? Math.max(0, (delta / preProbability) * 100)
        : 0;

      res.json({
        customerId,
        actionType,
        originalRisk:         Math.round(preProbability * 100),
        simulatedRisk:        Math.round(simProbability * 100),
        delta:                parseFloat(delta.toFixed(4)),
        riskReductionPct:     parseFloat(riskReductionPct.toFixed(1)),
        preProbability,
        projectedProbability: simProbability,
        confidenceScore,
        projectedRiskState,
        featureImportance,
        linkedInstabilityScore,
        modifiedFeatures,
      });
    } catch (err) {
      logger.error("POST /interventions/simulate error:", err);
      res.status(500).json({ error: "Simulation failed" });
    }
  }
);

// ── POST /api/interventions — save applied intervention ───────
interventionsRouter.post(
  "/",
  validateBody(SaveSchema),
  async (req: Request, res: Response): Promise<void> => {
    const body = req.body as z.infer<typeof SaveSchema>;

    try {
      const intervention = await prisma.intervention.create({
        data: {
          customerId:           body.customerId,
          analystId:            body.analystId ?? null,
          actionType:           body.actionType,
          preProbability:       body.preProbability,
          projectedProbability: body.projectedProbability,
          confidenceScore:      body.confidenceScore ?? 0.7,
          riskReductionPct:     body.riskReductionPct ?? 0,
          status:               body.status ?? "applied",
          notes:                body.notes ?? null,
          appliedAt:            (body.status ?? "applied") === "applied" ? new Date() : null,
        },
      });

      res.status(201).json(intervention);
    } catch (err) {
      logger.error("POST /interventions error:", err);
      res.status(500).json({ error: "Failed to save intervention" });
    }
  }
);

// ── GET /api/interventions?customerId=CUST_01 ─────────────────
interventionsRouter.get("/", async (req: Request, res: Response): Promise<void> => {
  const { customerId } = req.query;
  try {
    const interventions = await prisma.intervention.findMany({
      where:   customerId ? { customerId: customerId as string } : {},
      orderBy: { createdAt: "desc" },
      take:    50,
    });
    res.json(interventions);
  } catch (err) {
    logger.error("GET /interventions error:", err);
    res.status(500).json({ error: "Failed to fetch interventions" });
  }
});
