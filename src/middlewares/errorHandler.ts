import type { Request, Response, NextFunction } from "express";

import { Prisma } from "../generated/prisma/client.js";
import { AppError } from "../errors/AppError.js";

export const errorHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      error: error.message,
    });
  }

  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    return res.status(409).json({
      error: "Resource already exists",
    });
  }

  console.error("Unhandled error:", error);

  return res.status(500).json({
    error: "Internal server error",
  });
};
