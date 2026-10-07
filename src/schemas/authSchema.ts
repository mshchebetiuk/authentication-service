import { z } from "zod";

export const registerSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(72),
  name: z.string().min(2).max(50).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
