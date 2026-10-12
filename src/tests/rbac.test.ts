import { beforeAll, afterAll, describe, expect, it } from "vitest";
import request from "supertest";
import { randomUUID } from "node:crypto";
import { hash } from "bcrypt";

import { app } from "../app.js";
import { prisma } from "../config/prisma.js";
import { Role } from "../generated/prisma/enums.js";
import { createAccessToken } from "../utils/jwt.js";

const userEmail = `rbac-user-${randomUUID()}@example.com`;
const adminEmail = `rbac-admin-${randomUUID()}@example.com`;

let userId: number;
let adminId: number;
let userToken: string;
let adminToken: string;

beforeAll(async () => {
  const passwordHash = await hash("StrongPassword123", 12);

  const user = await prisma.user.create({
    data: {
      email: userEmail,
      passwordHash,
      role: Role.USER,
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      passwordHash,
      role: Role.ADMIN,
    },
  });

  userId = user.id;
  adminId = admin.id;

  userToken = createAccessToken(userId);
  adminToken = createAccessToken(adminId);
});

afterAll(async () => {
  await prisma.user.deleteMany({
    where: {
      email: {
        in: [userEmail, adminEmail],
      },
    },
  });

  await prisma.$disconnect();
});

describe("GET /admin/users - RBAC", () => {
  it("should reject requests without JWT", async () => {
    const response = await request(app).get("/admin/users");
    expect(response.status).toBe(401);
  });

  it("should reject USER role", async () => {
    const response = await request(app)
      .get("/admin/users")
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.status).toBe(403);
    expect(response.body.error).toBe("Forbidden: insufficient permissions");
  });

  it("should allow ADMIN role", async () => {
    const response = await request(app)
      .get("/admin/users")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual(expect.any(Array));
  });

  it("should not expost password hashes", async () => {
    const response = await request(app)
      .get("/admin/users")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).toBe(200);

    for (const user of response.body.data) {
      expect(user).not.toHaveProperty("passwordHash");
    }
  });

  it("should revoke ADMIN access after role downgrade", async () => {
    await prisma.user.update({
      where: { id: adminId },
      data: { role: Role.USER },
    });

    const response = await request(app)
      .get("/admin/users")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).toBe(403);
  });
});
