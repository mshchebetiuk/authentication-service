import type { Request, Response, NextFunction } from "express";

import { Role } from "../generated/prisma/client.js";
import { prisma } from "../config/prisma.js";
import { AppError } from "../errors/AppError.js";

export const requireRole = (...allowedRoles: Role[]) => {
  return async (_req: Request, res: Response, next: NextFunction) => {
    const userId = res.locals.userId as number | undefined;

    if (!userId) throw new AppError(401, "Unauthorized");

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user) throw new AppError(401, "Unauthorized");

    if (!allowedRoles.includes(user.role))
      throw new AppError(403, "Forbidden: insufficient permission");

    next();
  };
};
