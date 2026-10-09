import { afterAll, describe, expect, it } from "vitest";
import request from "supertest";
import { randomUUID } from "node:crypto";

import { app } from "../app.js";
import { prisma } from "../config/prisma.js";

const testEmail = `test-${randomUUID()}@example.com`;
const password = "StrongPassword123";

afterAll(async () => {
  await prisma.user.deleteMany({
    where: {
      email: testEmail,
    },
  });

  await prisma.$disconnect();
});

describe("POST /auth/register", () => {
  it("should register a new user", async () => {
    const response = await request(app).post("/auth/register").send({
      email: testEmail,
      password,
      name: "Test User",
    });

    expect(response.status).toBe(201);
    expect(response.body.user.email).toBe(testEmail);
    expect(response.body.user).not.toHaveProperty("passwordHash");
  });

  it("should reject an invalid email", async () => {
    const response = await request(app).post("/auth/register").send({
      email: "invalid-email",
      password,
    });

    expect(response.status).toBe(400);
  });

  it("should reject a short password", async () => {
    const response = await request(app).post("/auth/register").send({
      email: testEmail,
      password: "123",
    });

    expect(response.status).toBe(400);
  });

  it("should reject duplicate emails", async () => {
    const response = await request(app).post("/auth/register").send({
      email: testEmail,
      password,
    });

    expect(response.status).toBe(409);
  });
});

describe("POST /auth/login", () => {
  it("should login successfully", async () => {
    const response = await request(app).post("/auth/login").send({
      email: testEmail,
      password,
    });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Login successful");

    expect(response.body.user.email).toBe(testEmail);
    expect(response.body.user).not.toHaveProperty("passwordHash");

    expect(response.body.accessToken).toEqual(expect.any(String));
    expect(response.body.refreshToken).toEqual(expect.any(String));
    expect(response.body.refreshToken).toHaveLength(64);
  });

  it("should reject an incorrect password", async () => {
    const response = await request(app).post("/auth/login").send({
      email: testEmail,
      password: "WrongPassword123",
    });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe("Invalid email or password");
  });

  it("should reject a non-existing email", async () => {
    const response = await request(app)
      .post("/auth/login")
      .send({
        email: `missing-${randomUUID()}@example.com`,
        password,
      });

    expect(response.status).toBe(401);
  });

  it("should reject invalid input", async () => {
    const response = await request(app).post("/auth/login").send({
      email: "invalid-email",
      password: "",
    });

    expect(response.status).toBe(400);
  });
});
