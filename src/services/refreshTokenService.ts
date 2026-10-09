import { createHash, randomBytes } from "node:crypto";

import { prisma } from "../config/prisma.js";
import { createAccessToken } from "../utils/jwt.js";
import { AppError } from "../errors/AppError.js";

const REFRESH_TOKEN_DAYS = 7;

export const hashRefreshToken = (token: string): string => {
  return createHash("sha256").update(token).digest("hex");
};

export const createRefreshToken = async (userId: number) => {
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashRefreshToken(token);
  const expiresAt = new Date();

  expiresAt.setUTCDate(expiresAt.getUTCDate() + REFRESH_TOKEN_DAYS);

  await prisma.refreshToken.create({
    data: {
      tokenHash,
      userId,
      expiresAt,
    },
  });

  return token;
};

export const rotateRefreshToken = async (token: string) => {
  const tokenHash = hashRefreshToken(token);

  return prisma.$transaction(async (tx) => {
    const storedToken = await tx.refreshToken.findUnique({
      where: { tokenHash },
    });

    if (!storedToken || storedToken.expiresAt <= new Date()) {
      throw new AppError(401, "Invalid or expired refresh token");
    }

    const deleted = await tx.refreshToken.deleteMany({
      where: {
        id: storedToken.id,
        tokenHash,
      },
    });

    if (deleted.count !== 1) {
      throw new AppError(401, "Invalid or expired refresh token");
    }

    const newRefreshToken = randomBytes(32).toString("hex");

    const expiresAt = new Date();
    expiresAt.setUTCDate(expiresAt.getUTCDate() + REFRESH_TOKEN_DAYS);

    await tx.refreshToken.create({
      data: {
        userId: storedToken.userId,
        tokenHash: hashRefreshToken(newRefreshToken),
        expiresAt,
      },
    });

    return {
      accessToken: createAccessToken(storedToken.userId),
      refreshToken: newRefreshToken,
    };
  });
};

export const revokeRefreshToken = async (token: string) => {
  const tokenHash = hashRefreshToken(token);

  const result = await prisma.refreshToken.deleteMany({
    where: {
      tokenHash,
    },
  });

  return result.count > 0;
};
