import { z } from "zod";

export const resourceCategorySchema = z.enum([
  "software",
  "license",
  "account",
  "peripheral",
  "other"
]);

export const resourceSchema = z.object({
  name: z.string().min(2).max(140),
  category: resourceCategorySchema,
  totalQuantity: z.coerce.number().int().nonnegative(),
  availableQuantity: z.coerce.number().int().nonnegative(),
  notes: z.string().max(2000).optional()
});

export type ResourceInput = z.infer<typeof resourceSchema>;
