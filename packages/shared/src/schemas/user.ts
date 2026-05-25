import { z } from "zod";

export const userRoleSchema = z.enum(["admin", "ti", "consulta"]);

export const createUserSchema = z.object({
  name: z.string().min(2).max(160),
  email: z.string().email().max(180),
  role: userRoleSchema.default("consulta")
});

export const updateUserSchema = createUserSchema.partial();

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
