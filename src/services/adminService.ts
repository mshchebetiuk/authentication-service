import { prisma } from "../config/prisma.js";

export const getAllUsers = async () => {
  return prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },

    orderBy: {
      createdAt: "desc",
    },
  });
};
