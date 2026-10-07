import { Router, type Router as ExpressRouter } from "express";

import { login, register } from "../controllers/authController.js";

export const authRouter: ExpressRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
