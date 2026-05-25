import { z } from "zod";

export const emailLicenseSchema = z.enum(["E1", "E3"]);

export const notebookDetailsSchema = z.object({
  serialNumber: z.string().max(120).optional().default(""),
  hostname: z.string().max(120).optional().default("")
});

export const desktopDetailsSchema = notebookDetailsSchema;

export const phoneDetailsSchema = z.object({
  chipNumber: z.string().max(120).optional().default(""),
  imei: z.string().max(120).optional().default(""),
  pulsusId: z.string().max(120).optional().default("")
});

export const createInventoryRecordSchema = z.object({
  userName: z.string().min(2).max(160),
  userRole: z.string().min(2).max(120),
  location: z.string().min(2).max(160),
  manager: z.string().min(2).max(160),
  emailLicense: emailLicenseSchema,
  hasNotebook: z.boolean().default(false),
  hasDesktop: z.boolean().default(false),
  hasPhone: z.boolean().default(false),
  hasMonitor: z.boolean().default(false),
  hasMouse: z.boolean().default(false),
  hasKeyboard: z.boolean().default(false),
  hasHeadset: z.boolean().default(false),
  hasNotebookStand: z.boolean().default(false),
  termAttached: z.boolean().default(false),
  termFileName: z.string().max(255).optional(),
  termFilePath: z.string().max(500).optional(),
  regDate: z.string().date().optional(),
  notebookDetails: notebookDetailsSchema.optional(),
  desktopDetails: desktopDetailsSchema.optional(),
  phoneDetails: phoneDetailsSchema.optional()
});

export const updateInventoryRecordSchema = createInventoryRecordSchema.partial();

export type CreateInventoryRecordInput = z.infer<typeof createInventoryRecordSchema>;
export type UpdateInventoryRecordInput = z.infer<typeof updateInventoryRecordSchema>;
