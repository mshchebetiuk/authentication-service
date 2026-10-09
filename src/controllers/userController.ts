import type { Request, Response } from "express";

import { AppError } from "../errors/AppError.js";
import { getUserById } from "../services/userService.js";

export const getMe = async (_req: Request, res: Response) => {
  const userId = res.locals.userId as number;
  const user = await getUserById(userId);

  if (!user) throw new AppError(404, "User not found");

  return res.status(200).json({
    user,
  });
};
