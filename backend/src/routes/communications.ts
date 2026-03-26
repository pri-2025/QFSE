import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { logger } from "../utils/logger";

export const communicationsRouter = Router();

/**
 * GET /api/communications/:customerId
 * Returns all communication logs for a customer
 */
communicationsRouter.get("/:customerId", async (req: Request, res: Response): Promise<void> => {
  const { customerId } = req.params;
  try {
    const logs = await prisma.communicationLog.findMany({
      where:   { customerId },
      orderBy: { sentAt: "desc" },
      take:    50,
    });
    res.json(logs.map(l => ({
      id:            l.id,
      type:          l.type,
      channel:       l.channel,
      subject:       l.subject,
      message:       l.message,
      outcome:       l.outcome,
      responseScore: l.responseScore,
      sentAt:        l.sentAt,
      respondedAt:   l.respondedAt,
    })));
  } catch (err) {
    logger.error(`GET /communications/${customerId} error:`, err);
    res.status(500).json({ error: "Failed to fetch communication logs" });
  }
});

/**
 * POST /api/communications/log
 * Creates a new communication log entry
 */
communicationsRouter.post("/log", async (req: Request, res: Response): Promise<void> => {
  const {
    customerId,
    type,
    channel,
    subject,
    message,
    outcome,
    responseScore,
  } = req.body;

  const VALID_TYPES    = ["sms_reminder", "email_nudge", "call", "push_notification", "behavioral_alert"];
  const VALID_CHANNELS = ["sms", "email", "phone", "app", "system"];

  if (!customerId || !type || !channel) {
    res.status(400).json({ error: "customerId, type, and channel are required" });
    return;
  }
  if (!VALID_TYPES.includes(type)) {
    res.status(400).json({ error: `Invalid type. Must be one of: ${VALID_TYPES.join(", ")}` });
    return;
  }
  if (!VALID_CHANNELS.includes(channel)) {
    res.status(400).json({ error: `Invalid channel. Must be one of: ${VALID_CHANNELS.join(", ")}` });
    return;
  }

  try {
    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) {
      res.status(404).json({ error: "Customer not found" });
      return;
    }

    const log = await prisma.communicationLog.create({
      data: {
        customerId,
        type,
        channel,
        subject:       subject || null,
        message:       message || null,
        outcome:       outcome || "sent",
        responseScore: responseScore ?? null,
      },
    });

    res.status(201).json(log);
  } catch (err) {
    logger.error("POST /communications/log error:", err);
    res.status(500).json({ error: "Failed to log communication" });
  }
});

/**
 * PATCH /api/communications/:id/outcome
 * Update the outcome of a communication (e.g. customer responded)
 */
communicationsRouter.patch("/:id/outcome", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { outcome, responseScore } = req.body;

  try {
    const updated = await prisma.communicationLog.update({
      where: { id },
      data:  {
        outcome,
        responseScore: responseScore ?? undefined,
        respondedAt:   new Date(),
      },
    });
    res.json(updated);
  } catch (err) {
    logger.error(`PATCH /communications/${id}/outcome error:`, err);
    res.status(500).json({ error: "Failed to update communication outcome" });
  }
});
