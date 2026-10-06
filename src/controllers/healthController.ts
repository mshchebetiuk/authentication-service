import type { Request, Response } from "express";
import { getHealthStatus } from "../services/healthService.js";

export const getHealth = (_req: Request, res: Response) => {
  const health = getHealthStatus();
  res.status(200).json(health);
};
