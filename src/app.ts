import express, { type Express } from "express";
export const app: Express = express();

app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Authentication Service is running",
  });
});
