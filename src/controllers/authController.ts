import type { Request, Response } from "express";

import {
  loginSchema,
  registerSchema,
  refreshSchema,
} from "../schemas/authSchema.js";
import { loginUser, registerUser } from "../services/authService.js";
import {
  rotateRefreshToken,
  revokeRefreshToken,
} from "../services/refreshTokenService.js";
import { AppError } from "../errors/AppError.js";

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
    if (error instanceof AppError) {
      throw error;
    }

    throw error;
  }
};

export const login = async (req: Request, res: Response) => {
  const result = loginSchema.safeParse(req.body);

  if (!result.success)
    return res.status(400).json({
      error: "Invalid request data",
      details: result.error.flatten(),
    });

  try {
    const { user, accessToken, refreshToken } = await loginUser(result.data);

    return res.status(200).json({
      message: "Login successful",
      user,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw error;
  }
};

export const refresh = async (req: Request, res: Response) => {
  const result = refreshSchema.safeParse(req.body);

  if (!result.success)
    return res.status(400).json({
      error: "Invalid request data",
      details: result.error.flatten(),
    });

  const tokens = await rotateRefreshToken(result.data.refreshToken);

  return res.status(200).json({
    message: "Tokens refreshed successfully",
    ...tokens,
  });
};

export const logout = async (req: Request, res: Response) => {
  const result = refreshSchema.safeParse(req.body);

  if (!result.success)
    return res.status(400).json({
      error: "Invalid request data",
      details: result.error.flatten(),
    });

  await revokeRefreshToken(result.data.refreshToken);

  return res.status(200).json({
    message: "Logged out successfully",
  });
};
