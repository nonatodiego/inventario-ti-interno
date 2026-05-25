import { z } from "zod";

export const equipmentStatusSchema = z.enum([
  "available",
  "assigned",
  "maintenance",
  "retired",
  "lost"
]);

export const equipmentTypeSchema = z.enum([
  "notebook",
  "desktop",
  "monitor",
  "phone",
  "accessory",
  "other"
]);

export const equipmentSchema = z.object({
  type: equipmentTypeSchema,
  brand: z.string().max(100).optional(),
  model: z.string().max(120).optional(),
  serialNumber: z.string().max(120).optional(),
  status: equipmentStatusSchema.default("available"),
  purchaseDate: z.string().date().optional(),
  notes: z.string().max(2000).optional()
});

export type EquipmentInput = z.infer<typeof equipmentSchema>;
