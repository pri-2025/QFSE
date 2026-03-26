import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { logger } from "../utils/logger";

export const snapshotsRouter = Router();

// GET /api/snapshots/:customerId - monthly snapshots
snapshotsRouter.get("/:customerId", async (req: Request, res: Response): Promise<void> => {
  const { customerId } = req.params;
  try {
    const snapshots = await prisma.snapshot.findMany({
      where: { customerId },
      orderBy: { snapshotMonth: "desc" },
      take: 12,
    });

    res.json(snapshots.map(s => ({
      month:         s.snapshotMonth.toISOString().split("T")[0].substring(0, 7),
      avgBalance:    s.avgBalance ? Number(s.avgBalance) : 0,
      totalCredits:  s.totalCredits ? Number(s.totalCredits) : 0,
      totalDebits:   s.totalDebits ? Number(s.totalDebits) : 0,
      emiPaid:       s.emiPaid,
      riskScore:     s.riskScore ? Math.round(Number(s.riskScore) * 100) : 0,
      riskState:     s.riskState || "Unknown",
      savingsBalance:s.savingsBalance ? Number(s.savingsBalance) : 0,
      creditUtilPct: s.creditUtilPct ? Number(s.creditUtilPct) : 0,
    })));
  } catch (err) {
    logger.error(`GET /snapshots/${customerId} error:`, err);
    res.status(500).json({ error: "Failed to fetch snapshots" });
  }
});

// GET /api/quarterly/:customerId - quarterly summaries
snapshotsRouter.get("/quarterly/:customerId", async (req: Request, res: Response): Promise<void> => {
  const { customerId } = req.params;
  try {
    const quarters = await prisma.quarterlySummary.findMany({
      where: { customerId },
      orderBy: { quarterStart: "desc" },
      take: 8,
    });

    res.json(quarters.map(q => ({
      quarterLabel:            q.quarterLabel,
      quarterStart:            q.quarterStart.toISOString().split("T")[0],
      avgRiskScore:            q.avgRiskScore ? Math.round(Number(q.avgRiskScore) * 100) : 0,
      riskTrend:               q.riskTrend || "stable",
      interventionsCount:      q.interventionsCount,
      successfulInterventions: q.successfulInterventions,
      totalEmiPaid:            q.totalEmiPaid ? Number(q.totalEmiPaid) : 0,
      missedPayments:          q.missedPayments,
      portfolioShiftNotes:     q.portfolioShiftNotes,
    })));
  } catch (err) {
    logger.error(`GET /quarterly/${customerId} error:`, err);
    res.status(500).json({ error: "Failed to fetch quarterly summaries" });
  }
});
