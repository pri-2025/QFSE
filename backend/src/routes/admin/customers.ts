import { Router, Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { predictRisk } from "../../services/mlService";
import { logger } from "../../utils/logger";

export const customersRouter = Router();

// Helper: classify risk state from probability
function getRiskState(prob: number): string {
  if (prob < 0.30) return "Healthy";
  if (prob < 0.50) return "Watchlist";
  if (prob < 0.75) return "At Risk";
  return "Imminent Default";
}

// Helper: get latest risk score for a customer
async function getLatestRisk(customerId: string) {
  return prisma.riskScore.findFirst({
    where: { customerId },
    orderBy: { scoredAt: "desc" },
  });
}

// GET /api/customers - list all customers with latest risk
customersRouter.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const { persona, riskState, limit = "100", offset = "0" } = req.query;

    const customers = await prisma.customer.findMany({
      include: {
        persona: true,
        riskScores: {
          orderBy: { scoredAt: "desc" },
          take: 1,
        },
        entanglements: { take: 5 },
        interventions: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
    });

    // Filter by persona name if provided
    let filtered = customers;
    if (persona && typeof persona === "string") {
      filtered = customers.filter(c => c.persona?.name === persona);
    }

    // Filter by riskState if provided
    if (riskState && typeof riskState === "string") {
      const states = riskState.split(",");
      filtered = filtered.filter(c => {
        const latestRisk = c.riskScores[0];
        return latestRisk && states.includes(latestRisk.riskState);
      });
    }

    const result = filtered.map(c => {
      const latestRisk = c.riskScores[0];
      return {
        id:                   c.id,
        name:                 c.name,
        email:                c.email,
        phone:                c.phone,
        persona:              c.persona?.name || "Unknown",
        personaColor:         c.persona?.color || "#6A0DAD",
        personaEmoji:         c.persona?.emoji || "⚪",
        loanAmount:           Number(c.loanAmount),
        emiAmount:            Number(c.emiAmount),
        emiDueDays:           c.emiDueDays,
        affordabilitySurplus: Number(c.affordabilitySurplus),
        employer:             c.employer,
        risk:                 latestRisk ? Math.round(Number(latestRisk.probability) * 100) : 0,
        defaultProb:          latestRisk ? Number(latestRisk.probability) : 0,
        riskState:            latestRisk?.riskState || "Healthy",
        featureImportance:    latestRisk?.featureImportance || {},
        entanglementCount:    c.entanglements.length,
        lastIntervention:     c.interventions[0]?.actionType || null,
      };
    });

    res.json({ data: result, total: result.length });
  } catch (err) {
    logger.error("GET /customers error:", err);
    res.status(500).json({ error: "Failed to fetch customers" });
  }
});

// GET /api/customers/:id - full customer profile
customersRouter.get("/:id", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        persona: true,
        loans: true,
        riskScores: {
          orderBy: { scoredAt: "desc" },
          take: 30, // last 30 snapshots for wave graph
        },
        entanglements: true,
        interventions: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        timeline: {
          orderBy: { eventDate: "desc" },
          take: 20,
        },
        snapshots: {
          orderBy: { snapshotMonth: "desc" },
          take: 6,
        },
      },
    });

    if (!customer) {
      res.status(404).json({ error: "Customer not found" });
      return;
    }

    const latestRisk = customer.riskScores[0];

    res.json({
      id:                      customer.id,
      name:                    customer.name,
      email:                   customer.email,
      phone:                   customer.phone,
      persona:                 customer.persona?.name || "Unknown",
      personaColor:            customer.persona?.color || "#6A0DAD",
      personaEmoji:            customer.persona?.emoji || "⚪",
      monthlyIncome:           Number(customer.monthlyIncome),
      loanAmount:              Number(customer.loanAmount),
      emiAmount:               Number(customer.emiAmount),
      emiDueDays:              customer.emiDueDays,
      creditUtilization:       Number(customer.creditUtilization),
      salaryDelayFreq:         Number(customer.salaryDelayFreq),
      emiPaymentConsistency:   Number(customer.emiPaymentConsistency),
      withdrawalSpikes:        customer.withdrawalSpikes,
      loanToIncomeRatio:       Number(customer.loanToIncomeRatio),
      affordabilitySurplus:    Number(customer.affordabilitySurplus),
      employer:                customer.employer,
      address:                 customer.address,
      risk:                    latestRisk ? Math.round(Number(latestRisk.probability) * 100) : 0,
      defaultProb:             latestRisk ? Number(latestRisk.probability) : 0,
      riskState:               latestRisk?.riskState || "Healthy",
      featureImportance:       latestRisk?.featureImportance || {},
      // Time-series wave data
      waveData: customer.riskScores.reverse().map(rs => ({
        date:  rs.scoredAt.toISOString().split("T")[0],
        risk:  Math.round(Number(rs.probability) * 100),
        state: rs.riskState,
      })),
      loans: customer.loans.map(l => ({
        id:            l.id,
        type:          l.loanType,
        sanctionedAmt: Number(l.sanctionedAmt),
        outstandingAmt:Number(l.outstandingAmt),
        emiAmount:     Number(l.emiAmount),
        tenureMonths:  l.tenureMonths,
        interestRate:  Number(l.interestRate),
        disbursedAt:   l.disbursedAt,
        maturityDate:  l.maturityDate,
        status:        l.status,
      })),
      entanglements: customer.entanglements.map(e => ({
        id:           e.id,
        name:         e.linkedName,
        relationship: e.relationship,
        linkType:     e.linkType,
        riskImpact:   `+${e.riskImpactPct}%`,
        risk:         e.linkedRiskScore ? Math.round(Number(e.linkedRiskScore) * 100) : 0,
      })),
      interventions: customer.interventions.map(i => ({
        id:                  i.id,
        actionType:          i.actionType,
        preProbability:      Number(i.preProbability),
        projectedProbability:Number(i.projectedProbability),
        actualProbability:   i.actualProbability ? Number(i.actualProbability) : null,
        confidenceScore:     Number(i.confidenceScore),
        riskReductionPct:    Number(i.riskReductionPct),
        status:              i.status,
        notes:               i.notes,
        simulatedAt:         i.simulatedAt,
        appliedAt:           i.appliedAt,
      })),
      timeline: customer.timeline.map(t => ({
        id:           t.id,
        eventDate:    t.eventDate,
        eventType:    t.eventType,
        severity:     t.severity,
        title:        t.title,
        description:  t.description,
        riskAtEvent:  t.riskAtEvent ? Number(t.riskAtEvent) : null,
      })),
      snapshots: customer.snapshots.map(s => ({
        month:         s.snapshotMonth.toISOString().split("T")[0],
        avgBalance:    s.avgBalance ? Number(s.avgBalance) : null,
        totalCredits:  s.totalCredits ? Number(s.totalCredits) : null,
        totalDebits:   s.totalDebits ? Number(s.totalDebits) : null,
        emiPaid:       s.emiPaid,
        riskScore:     s.riskScore ? Number(s.riskScore) : null,
        riskState:     s.riskState,
        savingsBalance:s.savingsBalance ? Number(s.savingsBalance) : null,
        creditUtilPct: s.creditUtilPct ? Number(s.creditUtilPct) : null,
      })),
    });
  } catch (err) {
    logger.error(`GET /customers/${id} error:`, err);
    res.status(500).json({ error: "Failed to fetch customer" });
  }
});

// GET /api/customers/:id/risk-history
customersRouter.get("/:id/risk-history", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const scores = await prisma.riskScore.findMany({
      where: { customerId: id },
      orderBy: { scoredAt: "asc" },
    });
    res.json(scores.map(rs => ({
      date:      rs.scoredAt.toISOString().split("T")[0],
      risk:      Math.round(Number(rs.probability) * 100),
      state:     rs.riskState,
      scoredAt:  rs.scoredAt,
    })));
  } catch (err) {
    logger.error(`GET /customers/${id}/risk-history error:`, err);
    res.status(500).json({ error: "Failed to fetch risk history" });
  }
});

// GET /api/customers/:id/entanglements
customersRouter.get("/:id/entanglements", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const entanglements = await prisma.entanglement.findMany({
      where: { customerId: id },
      include: { linkedCustomer: { include: { riskScores: { orderBy: { scoredAt: "desc" }, take: 1 } } } },
    });
    res.json(entanglements.map(e => ({
      id:           e.id,
      linkedName:   e.linkedName,
      relationship: e.relationship,
      linkType:     e.linkType,
      riskImpact:   `+${e.riskImpactPct}%`,
      linkedRisk:   e.linkedRiskScore ? Math.round(Number(e.linkedRiskScore) * 100) : 0,
      linkedCustomer: e.linkedCustomer ? {
        id:    e.linkedCustomer.id,
        name:  e.linkedCustomer.name,
        risk:  e.linkedCustomer.riskScores[0]
                 ? Math.round(Number(e.linkedCustomer.riskScores[0].probability) * 100)
                 : 0,
      } : null,
    })));
  } catch (err) {
    logger.error(`GET /customers/${id}/entanglements error:`, err);
    res.status(500).json({ error: "Failed to fetch entanglements" });
  }
});

// GET /api/customers/:id/timeline
customersRouter.get("/:id/timeline", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const events = await prisma.timelineEvent.findMany({
      where: { customerId: id },
      orderBy: { eventDate: "desc" },
    });
    res.json(events.map(e => ({
      id:          e.id,
      date:        e.eventDate.toISOString().split("T")[0],
      type:        e.eventType,
      severity:    e.severity,
      title:       e.title,
      description: e.description,
      riskAtEvent: e.riskAtEvent ? Math.round(Number(e.riskAtEvent) * 100) : null,
    })));
  } catch (err) {
    logger.error(`GET /customers/${id}/timeline error:`, err);
    res.status(500).json({ error: "Failed to fetch timeline" });
  }
});

// POST /api/customers/:id/refresh-risk - call ML engine, update score
customersRouter.post("/:id/refresh-risk", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const customer = await prisma.customer.findUnique({ where: { id } });
    if (!customer) {
      res.status(404).json({ error: "Customer not found" });
      return;
    }

    const features = {
      salary_delay_freq:         Number(customer.salaryDelayFreq),
      credit_utilization_ratio:  Number(customer.creditUtilization) / 100,
      emi_payment_consistency:   Number(customer.emiPaymentConsistency),
      withdrawal_spikes:         customer.withdrawalSpikes / 10,
      loan_to_income_ratio:      Number(customer.loanToIncomeRatio),
      past_intervention_success: 0,
      linked_instability_score:  0,
    };

    const mlResult = await predictRisk(features);

    const saved = await prisma.riskScore.create({
      data: {
        customerId:       id,
        probability:      mlResult.probability,
        riskState:        mlResult.risk_state,
        featureImportance: mlResult.feature_importance,
        modelVersion:     mlResult.model_version,
      },
    });

    res.json({
      risk:             Math.round(mlResult.probability * 100),
      riskState:        mlResult.risk_state,
      featureImportance:mlResult.feature_importance,
      confidenceScore:  mlResult.confidence_score,
    });
  } catch (err) {
    logger.error(`POST /customers/${id}/refresh-risk error:`, err);
    res.status(500).json({ error: "Failed to refresh risk score" });
  }
});
