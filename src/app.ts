import express, { type Express } from "express";

import { authRouter } from "./routes/authRoutes.js";
import { healthRouter } from "./routes/healthRoutes.js";
import { userRouter } from "./routes/userRoutes.js";
import { adminRouter } from "./routes/adminRoutes.js";

export const app: Express = express();

app.use(express.json());

app.use("/health", healthRouter);
app.use("/auth", authRouter);
app.use("/users", userRouter);
app.use("/admin", adminRouter);
