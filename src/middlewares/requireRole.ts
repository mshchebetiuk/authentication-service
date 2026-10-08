import type { Request, Response, NextFunction } from "express";
import { Role } from "../generated/prisma/client.js";
import { prisma } from "../config/prisma.js";

export const requireRole = (...allowedRoles: Role[]) => {
  return async (_req: Request, res: Response, next: NextFunction) => {
    const userId = res.locals.userId as number | undefined;

    if (!userId)
      return res.status(401).json({
        error: "Unauthorized",
      });

    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });

      if (!user)
        return res.status(401).json({
          error: "Unauthorized",
        });

      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({
          error: "Forbidden: insufficient permissions",
        });
      }

      next();
    } catch (error) {
      console.error("Role verification error:", error);

      return res.status(500).json({
        error: "Internal server error",
      });
    }
  };
};
