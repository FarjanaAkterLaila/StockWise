import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/appError";

export type ValidationRule<T = Record<string, unknown>> = (
  data: T,
) => string | null | undefined;

export interface RequestValidationSchema {
  body?: ValidationRule[];
  query?: ValidationRule[];
  params?: ValidationRule[];
}

export const validateRequest = (schema: RequestValidationSchema) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const errors: string[] = [];

    if (schema.body && req.body) {
      for (const rule of schema.body) {
        const error = rule(req.body);
        if (error) errors.push(error);
      }
    }

    if (schema.query && req.query) {
      for (const rule of schema.query) {
        const error = rule(req.query as Record<string, unknown>);
        if (error) errors.push(error);
      }
    }

    if (schema.params && req.params) {
      for (const rule of schema.params) {
        const error = rule(req.params as Record<string, unknown>);
        if (error) errors.push(error);
      }
    }

    if (errors.length > 0) {
      next(
        AppError.badRequest("Validation failed for the request payload.", errors),
      );
      return;
    }

    next();
  };
};
