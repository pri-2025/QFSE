import { Router, Response } from "express";
import { authenticate, authorizeRole, AuthRequest } from "../middleware/auth";
import { prisma } from "../lib/prisma";
import { logger } from "../utils/logger";

export const customerRouter = Router();

// All customer routes require CUSTOMER role
customerRouter.use(authenticate, authorizeRole(["CUSTOMER"]));

// Helper to get Customer ID reliably securely linked to User
async function getCustomerByUserId(userId: string) {
  return prisma.customer.findUnique({ where: { userId } });
}

// GET /api/customer/me
customerRouter.get("/me", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const customer = await getCustomerByUserId(userId);
    if (!customer) {
      res.status(404).json({ error: "Customer profile not linked" });
      return;
    }
    
    // Include full profile details needed
    const profile = await prisma.customer.findUnique({
      where: { id: customer.id },
      include: {
        persona: true,
      }
    });
    
    res.json(profile);
  } catch (error) {
    logger.error("GET /api/customer/me - ", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// GET /api/customer/risk
customerRouter.get("/risk", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customer = await getCustomerByUserId(req.user!.userId);
    if (!customer) { res.status(404).json({ error: "Customer not found" }); return; }

    const riskScores = await prisma.riskScore.findMany({
      where: { customerId: customer.id },
      orderBy: { scoredAt: "desc" },
      take: 30
    });

    res.json(riskScores);
  } catch (error) {
    logger.error("GET /api/customer/risk - ", error);
    res.status(500).json({ error: "Failed to fetch risk" });
  }
});

// GET /api/customer/timeline
customerRouter.get("/timeline", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customer = await getCustomerByUserId(req.user!.userId);
    if (!customer) { res.status(404).json({ error: "Customer not found" }); return; }

    const events = await prisma.timelineEvent.findMany({
      where: { customerId: customer.id },
      orderBy: { eventDate: "desc" },
      take: 20
    });

    res.json(events);
  } catch (error) {
    logger.error("GET /api/customer/timeline - ", error);
    res.status(500).json({ error: "Failed to fetch timeline" });
  }
});

// GET /api/customer/interventions
customerRouter.get("/interventions", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customer = await getCustomerByUserId(req.user!.userId);
    if (!customer) { res.status(404).json({ error: "Customer not found" }); return; }

    const interventions = await prisma.intervention.findMany({
      where: { customerId: customer.id },
      orderBy: { createdAt: "desc" }
    });

    res.json(interventions);
  } catch (error) {
    logger.error("GET /api/customer/interventions - ", error);
    res.status(500).json({ error: "Failed to fetch interventions" });
  }
});

// GET /api/customer/snapshot
customerRouter.get("/snapshot", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customer = await getCustomerByUserId(req.user!.userId);
    if (!customer) { res.status(404).json({ error: "Customer not found" }); return; }

    const snapshots = await prisma.snapshot.findMany({
      where: { customerId: customer.id },
      orderBy: { snapshotMonth: "desc" },
      take: 6
    });

    res.json(snapshots);
  } catch (error) {
    logger.error("GET /api/customer/snapshot - ", error);
    res.status(500).json({ error: "Failed to fetch snapshots" });
  }
});

// POST /api/customer/accept-intervention
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

    res.json(updated);
  } catch (error) {
    logger.error("POST /api/customer/accept-intervention - ", error);
    res.status(500).json({ error: "Failed to accept intervention" });
  }
});
