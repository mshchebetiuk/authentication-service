import { Router, type Router as ExpressRouter } from "express";

import { Role } from "../generated/prisma/enums.js";
import { getUsers } from "../controllers/adminController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { requireRole } from "../middlewares/requireRole.js";

export const adminRouter: ExpressRouter = Router();

adminRouter.get("/users", authMiddleware, requireRole(Role.ADMIN), getUsers);
