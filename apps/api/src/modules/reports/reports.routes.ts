import { Router } from "express";
import { desc } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../db/client";
import { inventoryRecords } from "../../db/schema";
import { asyncHandler } from "../../http/async-handler";
import { requireRole } from "../../http/auth";
import { AppError } from "../../http/errors";
import { rateLimit } from "../../http/rate-limit";
import { validateQuery } from "../../http/validate";
import { writeAuditLog } from "../../services/audit";

export const reportsRouter = Router();

const exportQuerySchema = z.object({
  confirm: z.enum(["true"]).optional()
});

reportsRouter.get(
  "/inventory",
  asyncHandler(async (request, response) => {
    const rows = await db
      .select({
        id: inventoryRecords.id,
        userName: inventoryRecords.userName,
        userRole: inventoryRecords.userRole,
        location: inventoryRecords.location,
        manager: inventoryRecords.manager,
        emailLicense: inventoryRecords.emailLicense,
        regDate: inventoryRecords.regDate,
        termAttached: inventoryRecords.termAttached
      })
      .from(inventoryRecords)
      .orderBy(desc(inventoryRecords.createdAt))
      .limit(100);

    await writeAuditLog(request, {
      userId: request.user?.id,
      action: "view_report",
      entity: "inventory_records",
      details: { report: "inventory" }
    });

    response.json({ data: rows });
  })
);

reportsRouter.get(
  "/inventory.csv",
  requireRole("admin", "ti"),
  rateLimit({ windowMs: 15 * 60 * 1000, max: 20 }),
  validateQuery(exportQuerySchema),
  asyncHandler(async (request, response) => {
    if (request.query.confirm !== "true") {
      throw new AppError(400, "export_confirmation_required", "Confirme a exportacao antes de gerar o relatorio.");
    }

    const rows = await db
      .select({
        userName: inventoryRecords.userName,
        userRole: inventoryRecords.userRole,
        location: inventoryRecords.location,
        manager: inventoryRecords.manager,
        emailLicense: inventoryRecords.emailLicense,
        regDate: inventoryRecords.regDate,
        termAttached: inventoryRecords.termAttached
      })
      .from(inventoryRecords)
      .orderBy(desc(inventoryRecords.createdAt));

    await writeAuditLog(request, {
      userId: request.user?.id,
      action: "export",
      entity: "inventory_records",
      details: { format: "csv", total: rows.length }
    });

    response.header("Content-Type", "text/csv; charset=utf-8");
    response.attachment("inventario.csv");
    response.send(toCsv(rows));
  })
);

function toCsv(rows: Array<Record<string, unknown>>) {
  const headers = ["userName", "userRole", "location", "manager", "emailLicense", "regDate", "termAttached"];
  const body = rows.map((row) => headers.map((header) => escapeCsv(row[header])).join(","));

  return `${headers.join(",")}\n${body.join("\n")}\n`;
}

function escapeCsv(value: unknown) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}
