import { Router, Response } from "express";
import { authenticate, authorizeRole, AuthRequest } from "../../middleware/auth";
import { prisma } from "../../lib/prisma";
import { logger } from "../../utils/logger";

export const customerRouter = Router();

// All customer routes require CUSTOMER role
customerRouter.use(authenticate, authorizeRole(["CUSTOMER"]));

// Helper to get Customer ID reliably securely linked to User
async function getCustomerByUserId(userId: string) {
  return prisma.customer.findUnique({ where: { userId } });
}

// 1. GET /api/customer/me
customerRouter.get("/me", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customer = await getCustomerByUserId(req.user!.userId);
    if (!customer) { res.status(404).json({ error: "Customer not found" }); return; }
    
    const profile = await prisma.customer.findUnique({
      where: { id: customer.id },
      include: {
        persona: true,
        user: { select: { name: true, email: true } }
      }
    });

    const latestRisk = await prisma.riskScore.findFirst({
      where: { customerId: customer.id },
      orderBy: { scoredAt: "desc" }
    });

    res.json({
      id: profile?.id,
      name: profile?.user?.name || profile?.name,
      email: profile?.user?.email || profile?.email,
      persona: profile?.persona,
      risk_state: latestRisk?.riskState || "Stable",
      current_probability: latestRisk?.probability || 0
    });
  } catch (error) {
    logger.error("GET /api/customer/me - ", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// 2. GET /api/customer/risk
customerRouter.get("/risk", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customer = await getCustomerByUserId(req.user!.userId);
    if (!customer) { res.status(404).json({ error: "Customer not found" }); return; }

    const latestRisk = await prisma.riskScore.findFirst({
      where: { customerId: customer.id },
      orderBy: { scoredAt: "desc" }
    });

    if (!latestRisk) {
      res.json({ probability: 0, risk_state: "Stable", last_updated: new Date(), feature_importance: {}, top_drivers: [] });
      return;
    }

    const featureImp = latestRisk.featureImportance as Record<string, number> | null;
    const topDrivers = featureImp 
      ? Object.entries(featureImp).sort((a, b) => Math.abs(b[1]) - Math.abs(a[1])).slice(0, 3).map(e => ({ feature: e[0], impact: e[1] }))
      : [];

    res.json({
      probability: latestRisk.probability,
      risk_state: latestRisk.riskState,
      last_updated: latestRisk.scoredAt,
      feature_importance: featureImp || {},
      top_drivers: topDrivers
    });
  } catch (error) {
    logger.error("GET /api/customer/risk - ", error);
    res.status(500).json({ error: "Failed to fetch risk" });
  }
});

// 3. GET /api/customer/risk-trend
customerRouter.get("/risk-trend", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const range = parseInt(req.query.range as string) || 90;
    const customer = await getCustomerByUserId(req.user!.userId);
    if (!customer) { res.status(404).json({ error: "Customer not found" }); return; }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - range);

    const scores = await prisma.riskScore.findMany({
      where: { customerId: customer.id, scoredAt: { gte: cutoffDate } },
      orderBy: { scoredAt: "asc" }
    });

    res.json(scores.map(s => ({
      date: s.scoredAt,
      probability: s.probability,
      risk_state: s.riskState
    })));
  } catch (error) {
    logger.error("GET /api/customer/risk-trend - ", error);
    res.status(500).json({ error: "Failed to fetch risk trend" });
  }
});

// 4. GET /api/customer/snapshot
customerRouter.get("/snapshot", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customer = await getCustomerByUserId(req.user!.userId);
    if (!customer) { res.status(404).json({ error: "Customer not found" }); return; }

    const loans = await prisma.loan.findMany({ where: { customerId: customer.id } });
    const activeLoans = loans.filter(l => l.status === "active");
    
    const totalLoans = activeLoans.length;
    const totalEmi = activeLoans.reduce((sum, loan) => sum + Number(loan.emiAmount), 0);
    
    res.json({
      total_loans: totalLoans,
      active_emis: totalEmi,
      next_emi_due: customer.emiDueDays,
      credit_utilization_ratio: customer.creditUtilization,
      loan_to_income_ratio: customer.loanToIncomeRatio,
      emi_consistency_score: customer.emiPaymentConsistency,
      salary_delay_frequency: customer.salaryDelayFreq
    });
  } catch (error) {
    logger.error("GET /api/customer/snapshot - ", error);
    res.status(500).json({ error: "Failed to fetch snapshot" });
  }
});

// 5. GET /api/customer/interventions
customerRouter.get("/interventions", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customer = await getCustomerByUserId(req.user!.userId);
    if (!customer) { res.status(404).json({ error: "Customer not found" }); return; }

    const interventions = await prisma.intervention.findMany({
      where: { customerId: customer.id, status: "simulated" }
    });

    res.json(interventions.map(i => ({
      id: i.id,
      type: i.actionType,
      projected_probability: i.projectedProbability,
      projected_risk_state: Number(i.projectedProbability) < 0.3 ? "Stable" : Number(i.projectedProbability) < 0.7 ? "Warning" : "Critical",
      confidence_score: i.confidenceScore,
      risk_reduction: i.riskReductionPct
    })));
  } catch (error) {
    logger.error("GET /api/customer/interventions - ", error);
    res.status(500).json({ error: "Failed to fetch interventions" });
  }
});

// 6. POST /api/customer/accept-intervention
customerRouter.post("/accept-intervention", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { interventionId } = req.body;
    const customer = await getCustomerByUserId(req.user!.userId);
    if (!customer) { res.status(404).json({ error: "Customer not found" }); return; }

    const intervention = await prisma.intervention.findFirst({
      where: { id: interventionId, customerId: customer.id }
    });

    if (!intervention) {
      res.status(404).json({ error: "Intervention not found or unauthorized" });
      return;
    }

    const updated = await prisma.intervention.update({
      where: { id: interventionId },
      data: { status: "applied", appliedAt: new Date() }
    });

    // Insert timeline event
    await prisma.timelineEvent.create({
      data: {
        customerId: customer.id,
        eventDate: new Date(),
        eventType: "Intervention Accepted",
        title: `Accepted Intervention: ${intervention.actionType}`,
        severity: "info",
        riskAtEvent: updated.projectedProbability
      }
    });

    // Insert new RiskScore entry
    await prisma.riskScore.create({
      data: {
        customerId: customer.id,
        probability: updated.projectedProbability,
        riskState: Number(updated.projectedProbability) < 0.3 ? "Stable" : Number(updated.projectedProbability) < 0.7 ? "Warning" : "Critical",
        modelVersion: "v1_intervention"
      }
    });

    // Insert notification
    await prisma.notification.create({
      data: {
        customerId: customer.id,
        message: `Your intervention "${intervention.actionType}" was successfully applied.`
      }
    });

    res.json({
      success: true,
      updated_probability: updated.projectedProbability,
      new_risk_state: "Stabilizing"
    });
  } catch (error) {
    logger.error("POST /api/customer/accept-intervention - ", error);
    res.status(500).json({ error: "Failed to accept intervention" });
  }
});

// 7. GET /api/customer/repayment-plan
customerRouter.get("/repayment-plan", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customer = await getCustomerByUserId(req.user!.userId);
    if (!customer) { res.status(404).json({ error: "Customer not found" }); return; }

    const loans = await prisma.loan.findMany({
      where: { customerId: customer.id, status: "active" }
    });

    const schedule = loans.map(loan => ({
      loanId: loan.id,
      amount: loan.emiAmount,
      due_date: new Date(Date.now() + customer.emiDueDays * 24 * 60 * 60 * 1000),
      status: "pending"
    }));

    res.json({ schedule });
  } catch (error) {
    logger.error("GET /api/customer/repayment-plan - ", error);
    res.status(500).json({ error: "Failed to fetch repayment plan" });
  }
});

// 8. GET /api/customer/timeline
customerRouter.get("/timeline", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customer = await getCustomerByUserId(req.user!.userId);
    if (!customer) { res.status(404).json({ error: "Customer not found" }); return; }

    const events = await prisma.timelineEvent.findMany({
      where: { customerId: customer.id },
      orderBy: { eventDate: "desc" },
      take: 50
    });

    res.json(events.map(e => ({
      date: e.eventDate,
      type: e.eventType,
      description: e.title
    })));
  } catch (error) {
    logger.error("GET /api/customer/timeline - ", error);
    res.status(500).json({ error: "Failed to fetch timeline" });
  }
});

// 9. GET /api/customer/notifications & POST
customerRouter.get("/notifications", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customer = await getCustomerByUserId(req.user!.userId);
    if (!customer) { res.status(404).json({ error: "Customer not found" }); return; }

    const notifications = await prisma.notification.findMany({
      where: { customerId: customer.id },
      orderBy: { createdAt: "desc" },
      take: 20
    });

    res.json(notifications);
  } catch (error) {
    logger.error("GET /api/customer/notifications - ", error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

customerRouter.post("/notifications/:id/read", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customer = await getCustomerByUserId(req.user!.userId);
    if (!customer) { res.status(404).json({ error: "Customer not found" }); return; }

    const notif = await prisma.notification.findFirst({
      where: { id: req.params.id as string, customerId: customer.id }
    });

    if (!notif) { res.status(404).json({ error: "Notification not found" }); return; }

    await prisma.notification.update({
      where: { id: notif.id },
      data: { isRead: true }
    });

    res.json({ success: true });
  } catch (error) {
    logger.error("POST /api/customer/notifications/read - ", error);
    res.status(500).json({ error: "Failed to mark notification as read" });
  }
});

// 10. GET /api/customer/entanglement-summary
customerRouter.get("/entanglement-summary", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customer = await getCustomerByUserId(req.user!.userId);
    if (!customer) { res.status(404).json({ error: "Customer not found" }); return; }

    const entanglements = await prisma.entanglement.findMany({
      where: { customerId: customer.id }
    });

    const linked_accounts_count = entanglements.length;
    const instability_score = entanglements.reduce((sum, e) => sum + Number(e.riskImpactPct), 0);
    const impact_level = instability_score > 30 ? "High" : instability_score > 10 ? "Medium" : "Low";

    res.json({
      linked_accounts_count,
      instability_score,
      impact_level
    });
  } catch (error) {
    logger.error("GET /api/customer/entanglement-summary - ", error);
    res.status(500).json({ error: "Failed to fetch entanglement summary" });
  }
});
