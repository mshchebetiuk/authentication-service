import { Router, type Router as ExpressRouter } from "express";

import { register } from "../controllers/authController.js";

export const authRouter: ExpressRouter = Router();

authRouter.post("/resigter", register);
