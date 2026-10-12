import { beforeAll, afterAll, describe, expect, it } from "vitest";
import request from "supertest";
import { randomUUID } from "node:crypto";

import { app } from "../app.js";
import { prisma } from "../config/prisma.js";
import { hashRefreshToken } from "../services/refreshTokenService.js";

const email = `refresh-${randomUUID()}@example.com`;
const password = "StrongPassword123";

let userId: number;

const login = async () => {
  const response = await request(app)
    .post("/auth/login")
    .send({ email, password });

  expect(response.status).toBe(200);

  return response.body as {
    accessToken: string;
    refreshToken: string;
  };
};

beforeAll(async () => {
  const response = await request(app)
    .post("/auth/register")
    .send({ email, password, name: "Refrest Test User" });

  expect(response.status).toBe(201);
  userId = response.body.user.id;
});

afterAll(async () => {
  await prisma.user.deleteMany({
    where: { email },
  });

  await prisma.$disconnect;
});

describe("Refresh Token Integration Tests", () => {
  it("should rotate refresh token successfully", async () => {
    const tokens = await login();

    const response = await request(app)
      .post("/auth/refresh")
      .send({ refreshToken: tokens.refreshToken });

    expect(response.status).toBe(200);
    expect(response.body.accessToken).toEqual(expect.any(String));
    expect(response.body.refreshToken).toHaveLength(64);
    expect(response.body.refreshToken).not.toBe(tokens.refreshToken);
  });

  it("should reject reuse of an old refresh token", async () => {
    const tokens = await login();

    const firstResponse = await request(app)
      .post("/auth/refresh")
      .send({ refreshToken: tokens.refreshToken });

    expect(firstResponse.status).toBe(200);

    const secondResponse = await request(app)
      .post("/auth/refresh")
      .send({ refreshToken: tokens.refreshToken });

    expect(secondResponse.status).toBe(401);
    expect(secondResponse.body.error).toBe("Invalid or expired refresh token");
  });

  it("should reject invalid refresh token format", async () => {
    const response = await request(app)
      .post("/auth/refresh")
      .send({ refreshToken: "invalid-token" });

    expect(response.status).toBe(400);
  });

  it("should reject expired refresh token", async () => {
    const tokens = await login();

    await prisma.refreshToken.update({
      where: {
        tokenHash: hashRefreshToken(tokens.refreshToken),
      },
      data: {
        expiresAt: new Date(Date.now() - 60_000),
      },
    });

    const response = await request(app)
      .post("/auth/refresh")
      .send({ refreshToken: tokens.refreshToken });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe("Invalid or expired refresh token");
  });

  it("should reject refresh token after logout", async () => {
    const tokens = await login();

    const logoutResponse = await request(app)
      .post("/auth/logout")
      .send({ refreshToken: tokens.refreshToken });

    expect(logoutResponse.status).toBe(200);

    const refrestResponse = await request(app)
      .post("/auth/refresh")
      .send({ refreshToken: tokens.refreshToken });

    expect(refrestResponse.status).toBe(401);
  });
});
