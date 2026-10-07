import type { Request, Response } from "express";

import { registerSchema } from "../schemas/authSchema.js";
import { registerUser } from "../services/authService.js";

export const register = async (req: Request, res: Response) => {
  const result = registerSchema.safeParse(req.body);

  if (!result.success)
    return res.status(400).json({
      error: "Invalid request data",
      details: result.error.flatten(),
    });

  try {
    const user = await registerUser(result.data);

    return res.status(201).json({
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "User with this email already exists"
    ) {
      return res.status(409).json({
        error: error.message,
      });
    }

    return res.status(500).json({
      error: "Internal server error",
    });
  }
};
