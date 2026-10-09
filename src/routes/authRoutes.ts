import { Router, type Router as ExpressRouter } from "express";

import {
  login,
  register,
  refresh,
  logout,
} from "../controllers/authController.js";

import { authLimiter } from "../middlewares/rateLimiter.js";

export const authRouter: ExpressRouter = Router();

authRouter.post("/register", authLimiter, register);
authRouter.post("/login", authLimiter, login);
authRouter.post("/refresh", refresh);
authRouter.post("/logout", logout);
