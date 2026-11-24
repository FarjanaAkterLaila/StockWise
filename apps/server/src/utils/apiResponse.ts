import type { Response } from "express";
import type { ApiResponse } from "../types/api.types";

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message?: string,
  statusCode = 200,
  meta?: ApiResponse["meta"],
): Response => {
  const body: ApiResponse<T> = {
    success: true,
    ...(message ? { message } : {}),
    data,
    ...(meta ? { meta } : {}),
  };
  return res.status(statusCode).json(body);
};

export const sendError = (
  res: Response,
  message: string,
  statusCode = 500,
  errorCode = "INTERNAL_SERVER_ERROR",
  details?: unknown,
): Response => {
  const body: ApiResponse = {
    success: false,
    error: {
      code: errorCode,
      message,
      ...(details ? { details } : {}),
    },
  };
  return res.status(statusCode).json(body);
};
