import bcrypt from "bcrypt";

import { prisma } from "../config/prisma.js";
import type { RegisterInput } from "../schemas/authSchema.js";

export const registerUser = async (input: RegisterInput) => {
  const { email, password, name } = input;

  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) throw new Error("User with this email already exists");

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
