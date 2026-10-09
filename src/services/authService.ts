import bcrypt from "bcrypt";

import { prisma } from "../config/prisma.js";
import type { LoginInput, RegisterInput } from "../schemas/authSchema.js";
import { createAccessToken } from "../utils/jwt.js";
import { createRefreshToken } from "./refreshTokenService.js";
import { AppError } from "../errors/AppError.js";

export const registerUser = async (input: RegisterInput) => {
  const { email, password, name } = input;

  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUser)
    throw new AppError(409, "User with this email already exists");

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      ...(name !== undefined && { name }),
    },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
    },
  });

  return user;
};

export const loginUser = async (input: LoginInput) => {
  const { email, password } = input;

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) throw new AppError(401, "Invalid email or password");

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) throw new AppError(401, "Invalid email or password");

  const accessToken = createAccessToken(user.id);
  const refreshToken = await createRefreshToken(user.id);

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    accessToken,
    refreshToken,
  };
};
