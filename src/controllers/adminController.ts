import type { Request, Response } from "express";
import { getAllUsers } from "../services/adminService.js";

export const getUsers = async (_req: Request, res: Response) => {
  try {
    const users = await getAllUsers();

    return res.status(200).json({
      data: users,
    });
  } catch (error) {
    console.error("Get users error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
};
