import { Router, Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { logger } from "../../utils/logger";
import { z } from "zod";
import { validateBody } from "../../middleware/validation";

export const communicationsRouter = Router();

// ── Zod schemas ───────────────────────────────────────────────
const LogSchema = z.object({
  customerId:    z.string().min(1),
  type:          z.enum(["sms_reminder", "email_nudge", "call", "push_notification", "behavioral_alert"]),
  channel:       z.enum(["sms", "email", "phone", "app", "system"]),
  subject:       z.string().optional(),
  message:       z.string().optional(),
  outcome:       z.enum(["sent", "delivered", "read", "responded", "failed"]).optional(),
  responseScore: z.number().min(0).max(1).optional(),
});

const OutcomeSchema = z.object({
  outcome:       z.enum(["sent", "delivered", "read", "responded", "failed"]),
  responseScore: z.number().min(0).max(1).optional(),
});

/**
 * Risk adjustment applied per communication type.
 * A logged communication slightly reduces default probability
 * to reflect positive behavioral intervention.
 */
const RISK_ADJUSTMENT: Record<string, number> = {
  call:              -0.02,
  sms_reminder:      -0.01,
  email_nudge:       -0.01,
  push_notification: -0.005,
  behavioral_alert:  -0.015,
};

// ── GET /api/communications/:customerId ───────────────────────
communicationsRouter.get(
  "/:customerId",
  async (req: Request, res: Response): Promise<void> => {
    const customerId = req.params.customerId as string;
    const { type, channel, limit = "50" } = req.query as Record<string, string>;

    try {
      const logs = await prisma.communicationLog.findMany({
        where: {
          customerId,
          ...(type    ? { type }    : {}),
          ...(channel ? { channel } : {}),
        },
        orderBy: { sentAt: "desc" },
        take:    Math.min(parseInt(limit, 10) || 50, 200),
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
  }
);

// ── POST /api/communications/log ──────────────────────────────
communicationsRouter.post(
  "/log",
  validateBody(LogSchema),
  async (req: Request, res: Response): Promise<void> => {
    const body = req.body as z.infer<typeof LogSchema>;

    try {
      const customer = await prisma.customer.findUnique({ where: { id: body.customerId } });
      if (!customer) {
        res.status(404).json({ error: "Customer not found" });
        return;
      }

      // 1. Save communication log
      const log = await prisma.communicationLog.create({
        data: {
          customerId:    body.customerId,
          type:          body.type,
          channel:       body.channel,
          subject:       body.subject ?? null,
          message:       body.message ?? null,
          outcome:       body.outcome ?? "sent",
          responseScore: body.responseScore ?? null,
        },
      });

      // 2. Slightly adjust latest risk score to reflect behavioral impact
      const latestScore = await prisma.riskScore.findFirst({
        where:   { customerId: body.customerId },
        orderBy: { scoredAt: "desc" },
      });

      if (latestScore) {
        const adjustment = RISK_ADJUSTMENT[body.type] ?? -0.01;
        const newProb    = Math.max(0, Math.min(1, Number(latestScore.probability) + adjustment));
        const newState   = getRiskState(newProb);

        await prisma.riskScore.update({
          where: { id: latestScore.id },
          data:  { probability: newProb, riskState: newState },
        });

        logger.info(
          `[Communications] Risk adjusted for ${body.customerId}: ` +
          `${(Number(latestScore.probability) * 100).toFixed(1)}% → ${(newProb * 100).toFixed(1)}% ` +
          `(${body.type} via ${body.channel})`
        );
      }

      res.status(201).json({ log, riskAdjusted: !!latestScore });
    } catch (err) {
      logger.error("POST /communications/log error:", err);
      res.status(500).json({ error: "Failed to log communication" });
    }
  }
);

// ── PATCH /api/communications/:id/outcome ─────────────────────
communicationsRouter.patch(
  "/:id/outcome",
  validateBody(OutcomeSchema),
  async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const body = req.body as z.infer<typeof OutcomeSchema>;

    try {
      const updated = await prisma.communicationLog.update({
        where: { id },
        data:  {
          outcome:       body.outcome,
          responseScore: body.responseScore ?? undefined,
          respondedAt:   new Date(),
        },
      });

      // Boost on positive response
      if (body.outcome === "responded" && body.responseScore && body.responseScore > 0.7) {
        const log = await prisma.communicationLog.findUnique({ where: { id } });
        if (log) {
          const latest = await prisma.riskScore.findFirst({
            where:   { customerId: log.customerId },
            orderBy: { scoredAt: "desc" },
          });
          if (latest) {
            const newProb  = Math.max(0, Number(latest.probability) - 0.03);
            const newState = getRiskState(newProb);
            await prisma.riskScore.update({
              where: { id: latest.id },
              data:  { probability: newProb, riskState: newState },
            });
          }
        }
      }

      res.json(updated);
    } catch (err) {
      logger.error(`PATCH /communications/${id}/outcome error:`, err);
      res.status(500).json({ error: "Failed to update communication outcome" });
    }
  }
);

function getRiskState(prob: number): string {
  if (prob < 0.30) return "Healthy";
  if (prob < 0.50) return "Watchlist";
  if (prob < 0.75) return "At Risk";
  return "Imminent Default";
}
