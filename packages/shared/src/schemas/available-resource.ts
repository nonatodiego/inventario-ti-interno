import { z } from "zod";

export const createAvailableResourceSchema = z.object({
  resourceType: z.string().min(2).max(120),
  quantity: z.coerce.number().int().nonnegative(),
  minimumStock: z.coerce.number().int().nonnegative().default(0)
});

export const updateAvailableResourceSchema = createAvailableResourceSchema.partial();

export type CreateAvailableResourceInput = z.infer<typeof createAvailableResourceSchema>;
export type UpdateAvailableResourceInput = z.infer<typeof updateAvailableResourceSchema>;
