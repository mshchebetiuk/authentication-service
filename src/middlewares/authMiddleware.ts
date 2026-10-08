import "dotenv/config";

import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const accessTokenSecret = process.env.JWT_ACCESS_SECRET;

if (!accessTokenSecret) throw new Error("JWT_ACCESS_SECRET is not defined");

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authorization = req.headers.authorization;

  if (!authorization) {
    return res.status(401).json({
      error: "Authorization header is missing",
    });
  }

  const [schema, token, ...extra] = authorization.split(" ");

  if (schema !== "Bearer" || !token || extra.length > 0) {
    return res.status(401).json({
      error: "Invalid authorization format",
    });
  }

  try {
    const decoded = jwt.verify(token, accessTokenSecret);

    if (
      typeof decoded === "string" ||
      typeof decoded.sub !== "number" ||
      !Number.isSafeInteger(decoded.sub) ||
      decoded.sub <= 0
    ) {
      return res.status(401).json({
        error: "Invalid token payload",
      });
    }

    res.locals.userId = decoded.sub;
    next();
  } catch {
    return res.status(401).json({
      error: "Invalid or expired token",
    });
  }
};
