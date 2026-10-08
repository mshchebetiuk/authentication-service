import { Router, type Router as ExpressRouter } from "express";

import { authMiddleware } from "../middlewares/authMiddleware.js";
import { getMe } from "../controllers/userController.js";

export const userRouter: ExpressRouter = Router();

userRouter.get("/me", authMiddleware, getMe);
