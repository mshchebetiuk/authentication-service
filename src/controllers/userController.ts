import type { Request, Response } from "express";
import { getUserById } from "../services/userService.js";

export const getMe = async (req: Request, res: Response) => {
  const userId = res.locals.userId as number;

  try {
    const user = await getUserById(userId);

    if (!user)
      return res.status(404).json({
        error: "User not found",
      });

    return res.status(200).json({
      user,
    });
  } catch {
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};
