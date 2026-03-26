import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { simulateIntervention } from "../services/mlService";
import { logger } from "../utils/logger";

export const interventionsRouter = Router();

// POST /api/interventions/simulate
interventionsRouter.post("/simulate", async (req: Request, res: Response): Promise<void> => {
  const { customerId, actionType } = req.body;

  if (!customerId || !actionType) {
    res.status(400).json({ error: "customerId and actionType are required" });
    return;
  }

  const VALID_ACTIONS = ["EMI Holiday", "Loan Restructuring", "Partial Payment Plan", "Flexible Repayment"];
  if (!VALID_ACTIONS.includes(actionType)) {
    res.status(400).json({ error: `Invalid actionType. Must be one of: ${VALID_ACTIONS.join(", ")}` });
    return;
  }

  try {
    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) {
      res.status(404).json({ error: "Customer not found" });
      return;
    }

    // Get latest risk
    const latestRisk = await prisma.riskScore.findFirst({
      where: { customerId },
      orderBy: { scoredAt: "desc" },
    });

    const features = {
      salary_delay_freq:         Number(customer.salaryDelayFreq),
      credit_utilization_ratio:  Number(customer.creditUtilization) / 100,
      emi_payment_consistency:   Number(customer.emiPaymentConsistency),
      withdrawal_spikes:         customer.withdrawalSpikes / 10,
      loan_to_income_ratio:      Number(customer.loanToIncomeRatio),
      past_intervention_success: 0,
      linked_instability_score:  0,
    };

    const mlResult = await simulateIntervention(features, actionType);
    const preProbability = latestRisk ? Number(latestRisk.probability) : features.salary_delay_freq * 0.5;
    const riskReduction = ((preProbability - mlResult.probability) / preProbability) * 100;

    res.json({
      customerId,
      actionType,
      preProbability:       preProbability,
      projectedProbability: mlResult.probability,
      riskReductionPct:     Math.max(0, riskReduction).toFixed(1),
      confidenceScore:      mlResult.confidence_score,
      projectedRiskState:   mlResult.risk_state,
      featureImportance:    mlResult.feature_importance,
    });
  } catch (err) {
    logger.error("POST /interventions/simulate error:", err);
    res.status(500).json({ error: "Simulation failed" });
  }
});

// POST /api/interventions - save applied intervention
interventionsRouter.post("/", async (req: Request, res: Response): Promise<void> => {
  const {
    customerId,
    analystId,
    actionType,
    preProbability,
    projectedProbability,
    confidenceScore,
    riskReductionPct,
    notes,
    status = "applied",
  } = req.body;

  if (!customerId || !actionType || preProbability === undefined || projectedProbability === undefined) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  try {
    const intervention = await prisma.intervention.create({
      data: {
        customerId,
        analystId:            analystId || null,
        actionType,
        preProbability,
        projectedProbability,
        confidenceScore:      confidenceScore || 0.7,
        riskReductionPct:     riskReductionPct || 0,
        status,
        notes:                notes || null,
        appliedAt:            status === "applied" ? new Date() : null,
      },
    });

    res.status(201).json(intervention);
  } catch (err) {
    logger.error("POST /interventions error:", err);
    res.status(500).json({ error: "Failed to save intervention" });
  }
});

// GET /api/interventions?customerId=CUST_01
interventionsRouter.get("/", async (req: Request, res: Response): Promise<void> => {
  const { customerId } = req.query;
  try {
    const interventions = await prisma.intervention.findMany({
      where: customerId ? { customerId: customerId as string } : {},
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    res.json(interventions);
  } catch (err) {
    logger.error("GET /interventions error:", err);
    res.status(500).json({ error: "Failed to fetch interventions" });
  }
});
