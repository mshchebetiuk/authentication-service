import type { Request, Response } from "express";
import { getAllUsers } from "../services/adminService.js";

export const getUsers = async (_req: Request, res: Response) => {
  const users = await getAllUsers();

  return res.status(200).json({
    data: users,
  });
};
