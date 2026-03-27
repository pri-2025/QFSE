import { Response, NextFunction } from "express";
import { logger } from "../utils/logger";
import { AuthRequest } from "./auth";

export function requestLogger(req: AuthRequest, _res: Response, next: NextFunction): void {
  const userId = req.user?.userId || "anonymous";
  const role = req.user?.role || "none";
  logger.info(`[${new Date().toISOString()}] User: ${userId} | Role: ${role} | ${req.method} ${req.path}`);
  next();
}
