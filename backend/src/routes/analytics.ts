import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { logger } from "../utils/logger";

export const analyticsRouter = Router();

// GET /api/analytics/summary - portfolio overview
analyticsRouter.get("/summary", async (_req: Request, res: Response): Promise<void> => {
  try {
    const [totalCustomers, latestRisks, interventions] = await Promise.all([
      prisma.customer.count(),
      // Get latest risk for each customer
      prisma.$queryRaw<{ customer_id: string; probability: number; risk_state: string }[]>`
        SELECT DISTINCT ON (customer_id) customer_id, probability::float, risk_state
        FROM risk_scores
        ORDER BY customer_id, scored_at DESC
      `,
      prisma.intervention.findMany({
        where: { status: { in: ["applied", "succeeded", "failed"] } },
        select: { status: true, preProbability: true, projectedProbability: true },
      }),
    ]);

    const probabilities = latestRisks.map(r => r.probability);
    const avgRisk = probabilities.length > 0
      ? Math.round(probabilities.reduce((a, b) => a + b, 0) / probabilities.length * 100)
      : 0;

    const riskStateCount = latestRisks.reduce((acc, r) => {
      acc[r.risk_state] = (acc[r.risk_state] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const appliedInterventions = interventions.length;
    const succeededInterventions = interventions.filter(i =>
      Number(i.projectedProbability) < Number(i.preProbability)
    ).length;
    const interventionSuccessRate = appliedInterventions > 0
      ? Math.round((succeededInterventions / appliedInterventions) * 100)
      : 0;

    const avgRiskReduction = appliedInterventions > 0
      ? interventions.reduce((sum, i) => {
          const reduction = (Number(i.preProbability) - Number(i.projectedProbability)) / Number(i.preProbability) * 100;
          return sum + Math.max(0, reduction);
        }, 0) / appliedInterventions
      : 0;

    res.json({
      totalCustomers,
      avgRiskScore: avgRisk,
      interventionSuccessRate,
      avgRiskReduction: Math.round(avgRiskReduction),
      riskStateDistribution: {
        Healthy:          riskStateCount["Healthy"] || 0,
        Watchlist:        riskStateCount["Watchlist"] || 0,
        "At Risk":        riskStateCount["At Risk"] || 0,
        "Imminent Default": riskStateCount["Imminent Default"] || 0,
      },
    });
  } catch (err) {
    logger.error("GET /analytics/summary error:", err);
    res.status(500).json({ error: "Failed to fetch summary" });
  }
});

// GET /api/analytics/personas - persona distribution with risk
analyticsRouter.get("/personas", async (_req: Request, res: Response): Promise<void> => {
  try {
    const personas = await prisma.persona.findMany({
      include: {
        customers: {
          include: {
            riskScores: {
              orderBy: { scoredAt: "desc" },
              take: 1,
            },
          },
        },
      },
    });

    const result = personas.map(p => {
      const count = p.customers.length;
      const risks = p.customers
        .map(c => c.riskScores[0] ? Number(c.riskScores[0].probability) : 0)
        .filter(r => r > 0);
      const avgRisk = risks.length > 0
        ? Math.round(risks.reduce((a, b) => a + b, 0) / risks.length * 100)
        : p.avgRisk;

      return {
        id:      p.name.toLowerCase().replace(/\W+/g, "-"),
        name:    p.name,
        value:   count,
        count,
        color:   p.color,
        emoji:   p.emoji,
        avgRisk,
        additionalInfo: `Avg Risk: ${avgRisk}%`,
      };
    });

    res.json(result);
  } catch (err) {
    logger.error("GET /analytics/personas error:", err);
    res.status(500).json({ error: "Failed to fetch personas" });
  }
});

// GET /api/analytics/risk-migration - risk state trend over time
analyticsRouter.get("/risk-migration", async (_req: Request, res: Response): Promise<void> => {
  try {
    const weeks = [];
    for (let i = 4; i >= 0; i--) {
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - (i + 1) * 7);
      const toDate = new Date();
      toDate.setDate(toDate.getDate() - i * 7);

      const scores = await prisma.$queryRaw<{ risk_state: string; count: string }[]>`
        SELECT risk_state, COUNT(*) as count
        FROM (
          SELECT DISTINCT ON (customer_id) customer_id, risk_state
          FROM risk_scores
          WHERE scored_at BETWEEN ${fromDate} AND ${toDate}
          ORDER BY customer_id, scored_at DESC
        ) latest
        GROUP BY risk_state
      `;

      const weekLabel = `Week ${5 - i}`;
      const entry: Record<string, string | number> = { week: weekLabel };
      scores.forEach(s => { entry[s.risk_state] = parseInt(s.count); });
      weeks.push(entry);
    }

    res.json(weeks);
  } catch (err) {
    logger.error("GET /analytics/risk-migration error:", err);
    res.status(500).json({ error: "Failed to fetch risk migration" });
  }
});

// GET /api/analytics/intervention-success - success by action type
analyticsRouter.get("/intervention-success", async (_req: Request, res: Response): Promise<void> => {
  try {
    const interventions = await prisma.intervention.groupBy({
      by: ["actionType"],
      _count: { id: true },
      _avg:   { riskReductionPct: true, confidenceScore: true },
    });

    const result = interventions.map(i => ({
      actionType:       i.actionType,
      count:            i._count.id,
      avgRiskReduction: Math.round(Number(i._avg.riskReductionPct) || 0),
      avgConfidence:    Math.round(Number(i._avg.confidenceScore) * 100 || 70),
    }));

    res.json(result);
  } catch (err) {
    logger.error("GET /analytics/intervention-success error:", err);
    res.status(500).json({ error: "Failed to fetch intervention success" });
  }
});

// GET /api/analytics/behavioral-triggers - top triggers across portfolio
analyticsRouter.get("/behavioral-triggers", async (_req: Request, res: Response): Promise<void> => {
  try {
    const events = await prisma.timelineEvent.groupBy({
      by: ["eventType", "severity"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    });

    const result = events.map(e => ({
      trigger:  e.eventType.replace(/_/g, " ").toUpperCase(),
      severity: e.severity,
      count:    e._count.id,
    }));

    res.json(result);
  } catch (err) {
    logger.error("GET /analytics/behavioral-triggers error:", err);
    res.status(500).json({ error: "Failed to fetch behavioral triggers" });
  }
});
