import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

/**
 * Middleware factory — validates req.body against a Zod schema.
 * On failure, returns 400 with structured validation errors.
 */
export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = (result.error as ZodError).errors.map(e => ({
        field:   e.path.join("."),
        message: e.message,
      }));
      res.status(400).json({
        error:  "Validation failed",
        errors,
      });
      return;
    }
    req.body = result.data;
    next();
  };
}

/**
 * Middleware factory — validates req.query against a Zod schema.
 */
export function validateQuery<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      const errors = (result.error as ZodError).errors.map(e => ({
        field:   e.path.join("."),
        message: e.message,
      }));
      res.status(400).json({ error: "Invalid query parameters", errors });
      return;
    }
    req.query = result.data as typeof req.query;
    next();
  };
}
