import express, { type Express } from "express";

import { authRouter } from "./routes/authRoutes.js";
import { healthRouter } from "./routes/healthRoutes.js";

export const app: Express = express();

app.use(express.json());

app.use("/health", healthRouter);
app.use("/auth", authRouter);
