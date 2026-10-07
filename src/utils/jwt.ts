import "dotenv/config";
import jwt from "jsonwebtoken";

const accessTokenSecret = process.env.JWT_ACCESS_SECRET;

if (!accessTokenSecret) throw new Error("JWT_ACCESS_SECRET is not defined");

export const createAccessToken = (userId: number) => {
  return jwt.sign(
    {
      sub: userId,
    },
    accessTokenSecret,
    {
      expiresIn: "15m",
    },
  );
};
