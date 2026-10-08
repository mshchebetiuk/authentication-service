import { Router, type Router as ExpressRouter } from "express";

import {
  login,
  register,
  refresh,
  logout,
} from "../controllers/authController.js";

export const authRouter: ExpressRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/refresh", refresh);
authRouter.post("/logout", logout);
