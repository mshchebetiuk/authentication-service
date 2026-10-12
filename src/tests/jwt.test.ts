import { beforeAll, afterAll, describe, expect, it } from "vitest";
import request from "supertest";
import { randomUUID } from "node:crypto";
import jwt from "jsonwebtoken";

import { app } from "../app.js";
import { prisma } from "../config/prisma.js";

const email = `jwt-test-${randomUUID()}@example.com`;
const password = "StrongPassword123";

let accessToken: string;

beforeAll(async () => {
  const registerResponse = await request(app).post("/auth/register").send({
    email,
    password,
    name: "JWT Test User",
  });

  if (registerResponse.status !== 201) {
    throw new Error("Failed to create JWT test user");
  }

  const loginResponse = await request(app)
    .post("/auth/login")
    .send({ email, password });

  if (loginResponse.status !== 200) {
    throw new Error("Failed to login JWT test user");
  }

  accessToken = loginResponse.body.accessToken;
});

afterAll(async () => {
  await prisma.user.deleteMany({
    where: { email },
  });
});

describe("GET /users/me - JWT Authentication", () => {
  it("should return user profile with valid JWT", async () => {
    const response = await request(app)
      .get("/users/me")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.user.email).toBe(email);
    expect(response.body.user).not.toHaveProperty("passwordHash");
  });

  it("should reject missing Authorization header", async () => {
    const response = await request(app).get("/users/me");

    expect(response.status).toBe(401);
    expect(response.body.error).toBe("Authorization header is missing");
  });

  it("should reject invalid Authorization format", async () => {
    const response = await request(app)
      .get("/users/me")
      .set("Authorization", `Token ${accessToken}`);

    expect(response.status).toBe(401);
    expect(response.body.error).toBe("Invalid authorization format");
  });

  it("should reject invalid JWT", async () => {
    const response = await request(app)
      .get("/users/me")
      .set("Authorization", "Bearer invalid.jwt.token");

    expect(response.status).toBe(401);
    expect(response.body.error).toBe("Invalid or expired token");
  });

  it("should reject expired JWT", async () => {
    const secret = process.env.JWT_ACCESS_SECRET;

    if (!secret) throw new Error("JWT_ACCESS_SECRET is missing");

    const expiredToken = jwt.sign({ sub: 1 }, secret, { expiresIn: -10 });

    const response = await request(app)
      .get("/users/me")
      .set("Authorization", `Bearer ${expiredToken}`);

    expect(response.status).toBe(401);
    expect(response.body.error).toBe("Invalid or expired token");
  });
});
