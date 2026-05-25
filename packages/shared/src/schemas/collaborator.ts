import { z } from "zod";

export const collaboratorStatusSchema = z.enum(["active", "inactive", "on_leave"]);

export const collaboratorSchema = z.object({
  fullName: z.string().min(2).max(160),
  email: z.string().email().max(180),
  department: z.string().min(2).max(120),
  jobTitle: z.string().min(2).max(120),
  document: z.string().max(32).optional(),
  status: collaboratorStatusSchema.default("active")
});

export type CollaboratorInput = z.infer<typeof collaboratorSchema>;
