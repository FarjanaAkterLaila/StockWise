import type { Request, Response } from "express";
import { getHealthStatus } from "../services/health.service";

export const getHealth = (_req: Request, res: Response): void => {
  const health = getHealthStatus();
  res.status(200).json({
    success: true,
    message: "StockWise API is running!",
    data: health,
  });
};
