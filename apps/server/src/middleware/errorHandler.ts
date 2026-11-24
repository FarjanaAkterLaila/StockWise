import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/appError";
import { sendError } from "../utils/apiResponse";

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof AppError) {
    sendError(
      res,
      err.message,
      err.statusCode,
      err.errorCode,
      err.details,
    );
    return;
  }

  console.error("Unhandled Server Error:", err);

  sendError(
    res,
    process.env.NODE_ENV === "production"
      ? "An unexpected internal server error occurred."
      : err.message || "An unexpected internal server error occurred.",
    500,
    "INTERNAL_SERVER_ERROR",
  );
};
