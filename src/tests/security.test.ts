import { describe, expect, it } from "vitest";
import request from "supertest";
import express from "express";

import { app } from "../app.js";
import { authLimiter } from "../middlewares/rateLimiter.js";

describe("Security Middleware Integration Tests", () => {
  it("shuold include Helmet security headers", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.headers["x-content-type-options"]).toBe("nosniff");
    expect(response.headers["x-frame-options"]).toBe("SAMEORIGIN");
    expect(response.headers).toHaveProperty("content-security-policy");
  });

  it("should return 429 after exceeding rate limit", async () => {
    const testApp = express();

    testApp.use(authLimiter);
    testApp.get("/test", (_req, res) => {
      res.status(200).json({ message: "OK" });
    });

    for (let i = 0; i < 10; i++) {
      const response = await request(testApp).get("/test");
      expect(response.status).toBe(200);
    }

    const response = await request(testApp).get("/test");
    expect(response.status).toBe(429);
  });

  it("should return correct rate limit error message", async () => {
    const testApp = express();

    testApp.use(authLimiter);
    testApp.get("/test", (_req, res) => {
      res.status(200).json({ message: "OK" });
    });

    for (let i = 0; i < 10; i++) {
      await request(testApp).get("/test");
    }

    const response = await request(testApp).get("/test");

    expect(response.status).toBe(429);
    expect(response.body.error).toBe(
      "Too many authentication requests. Try again later.",
    );
  });

  it("should allow health endpoint without authentication", async () => {
    const response = await request(app).get("/health");
    expect(response.status).toBe(200);
  });

  it("should reject malformed JSON", async () => {
    const response = await request(app)
      .post("/auth/login")
      .set("Content-Type", "application/json")
      .send('{"email":');

    expect(response.status).toBe(400);
  });
});
