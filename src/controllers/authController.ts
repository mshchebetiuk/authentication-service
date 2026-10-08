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
    if (
      error instanceof Error &&
      error.message === "Invalid email or password"
    ) {
      return res.status(401).json({
        error: error.message,
      });
    }

    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const refresh = async (req: Request, res: Response) => {
  const result = refreshSchema.safeParse(req.body);

  if (!result.success)
    return res.status(400).json({
      error: "Invalid request data",
      details: result.error.flatten(),
    });

  try {
    const tokens = await rotateRefreshToken(result.data.refreshToken);

    return res.status(200).json({
      message: "Tokens refreshed successfully",
      ...tokens,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Invalid or expired refresh token"
    ) {
      return res.status(401).json({
        error: error.message,
      });
    }

    console.error("Refresh token error:", error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  const result = refreshSchema.safeParse(req.body);

  if (!result.success)
    return res.status(400).json({
      error: "Invalid request data",
      details: result.error.flatten(),
    });

  try {
    await revokeRefreshToken(result.data.refreshToken);

    return res.status(200).json({
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
};
