import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import express from "express";
import { Router } from "express";
import { createInventoryRecordSchema, updateInventoryRecordSchema } from "@inventario-ti/shared";
import { desc, eq, like, or } from "drizzle-orm";
import { db } from "../../db/client";
import { desktopDetails, inventoryRecords, notebookDetails, phoneDetails } from "../../db/schema";
import { env } from "../../config/env";
import { asyncHandler } from "../../http/async-handler";
import { requireRole } from "../../http/auth";
import { AppError } from "../../http/errors";
import { rateLimit } from "../../http/rate-limit";
import { idParamSchema, listQuerySchema } from "../../http/schemas";
import { validateBody, validateParams, validateQuery } from "../../http/validate";
import { writeAuditLog } from "../../services/audit";
import { anonymizeName, maskSensitiveInventory } from "../../services/lgpd";

export const inventoryRouter = Router();

async function findInventoryRecord(id: string) {
  const record = await db.select().from(inventoryRecords).where(eq(inventoryRecords.id, id)).get();

  if (!record) {
    return null;
  }

  const [notebook, desktop, phone] = await Promise.all([
    db.select().from(notebookDetails).where(eq(notebookDetails.inventoryRecordId, id)).get(),
    db.select().from(desktopDetails).where(eq(desktopDetails.inventoryRecordId, id)).get(),
    db.select().from(phoneDetails).where(eq(phoneDetails.inventoryRecordId, id)).get()
  ]);

  return {
    ...record,
    notebookDetails: notebook ?? null,
    desktopDetails: desktop ?? null,
    phoneDetails: phone ?? null
  };
}

inventoryRouter.get(
  "/",
  validateQuery(listQuerySchema),
  asyncHandler(async (request, response) => {
    const { search, page, limit } = request.query as unknown as { search?: string; page: number; limit: number };
    const offset = (page - 1) * limit;

    const where = search
      ? or(
          like(inventoryRecords.userName, `%${search}%`),
          like(inventoryRecords.userRole, `%${search}%`),
          like(inventoryRecords.location, `%${search}%`),
          like(inventoryRecords.manager, `%${search}%`)
        )
      : undefined;

    const rows = await db
      .select()
      .from(inventoryRecords)
      .where(where)
      .orderBy(desc(inventoryRecords.createdAt))
      .limit(limit)
      .offset(offset);

    await writeAuditLog(request, {
      userId: request.user?.id,
      action: "view_list",
      entity: "inventory_records",
      details: { search, page, limit }
    });

    response.json({ data: rows, meta: { page, limit, total: rows.length } });
  })
);

inventoryRouter.post(
  "/:id/term",
  requireRole("admin", "ti"),
  rateLimit({ windowMs: 15 * 60 * 1000, max: 20 }),
  validateParams(idParamSchema),
  express.raw({ type: "application/pdf", limit: `${env.MAX_UPLOAD_MB}mb` }),
  asyncHandler(async (request, response) => {
    const current = await db.select().from(inventoryRecords).where(eq(inventoryRecords.id, request.params.id)).get();

    if (!current) {
      throw new AppError(404, "inventory_record_not_found", "Registro de inventario nao encontrado.");
    }

    if (!Buffer.isBuffer(request.body) || request.body.length === 0) {
      throw new AppError(400, "invalid_upload", "Arquivo PDF obrigatorio.");
    }

    if (request.header("content-type") !== "application/pdf" || !request.body.subarray(0, 4).equals(Buffer.from("%PDF"))) {
      throw new AppError(400, "invalid_file_type", "Apenas arquivos PDF sao permitidos.");
    }

    const rawFileName = request.header("x-file-name") ?? `termo-${request.params.id}.pdf`;
    const fileName = sanitizeFileName(rawFileName);
    const uploadDir = path.resolve(env.UPLOAD_DIR, "terms");
    const filePath = path.join(uploadDir, `${request.params.id}-${Date.now()}-${fileName}`);

    await mkdir(uploadDir, { recursive: true });
    await writeFile(filePath, request.body);

    const [updated] = await db
      .update(inventoryRecords)
      .set({
        termAttached: true,
        termFileName: fileName,
        termFilePath: filePath,
        updatedAt: new Date().toISOString()
      })
      .where(eq(inventoryRecords.id, request.params.id))
      .returning();

    await writeAuditLog(request, {
      userId: request.user?.id,
      action: "upload_term",
      entity: "inventory_records",
      entityId: request.params.id,
      details: { fileName, size: request.body.length }
    });

    response.json({ data: updated });
  })
);

inventoryRouter.post(
  "/",
  requireRole("admin", "ti"),
  validateBody(createInventoryRecordSchema),
  asyncHandler(async (request, response) => {
    const id = randomUUID();
    const { notebookDetails: notebook, desktopDetails: desktop, phoneDetails: phone, ...recordInput } = request.body;

    await db.transaction(async (tx) => {
      await tx.insert(inventoryRecords).values({
        id,
        ...recordInput,
        regDate: recordInput.regDate ?? new Date().toISOString().slice(0, 10)
      });

      if (recordInput.hasNotebook || notebook) {
        await tx.insert(notebookDetails).values({
          id: randomUUID(),
          inventoryRecordId: id,
          serialNumber: notebook?.serialNumber ?? null,
          hostname: notebook?.hostname ?? null
        });
      }

      if (recordInput.hasDesktop || desktop) {
        await tx.insert(desktopDetails).values({
          id: randomUUID(),
          inventoryRecordId: id,
          serialNumber: desktop?.serialNumber ?? null,
          hostname: desktop?.hostname ?? null
        });
      }

      if (recordInput.hasPhone || phone) {
        await tx.insert(phoneDetails).values({
          id: randomUUID(),
          inventoryRecordId: id,
          chipNumber: phone?.chipNumber ?? null,
          imei: phone?.imei ?? null,
          pulsusId: phone?.pulsusId ?? null
        });
      }
    });

    await writeAuditLog(request, {
      userId: request.user?.id,
      action: "create",
      entity: "inventory_records",
      entityId: id,
      details: { userName: recordInput.userName, location: recordInput.location }
    });

    const created = await findInventoryRecord(id);
    response.status(201).json({ data: created });
  })
);

inventoryRouter.get(
  "/:id",
  validateParams(idParamSchema),
  asyncHandler(async (request, response) => {
    const record = await findInventoryRecord(request.params.id);

    if (!record) {
      throw new AppError(404, "inventory_record_not_found", "Registro de inventario nao encontrado.");
    }

    await writeAuditLog(request, {
      userId: request.user?.id,
      action: "view",
      entity: "inventory_records",
      entityId: request.params.id
    });

    response.json({ data: maskSensitiveInventory(record, request.user!.role) });
  })
);

inventoryRouter.patch(
  "/:id",
  requireRole("admin", "ti"),
  validateParams(idParamSchema),
  validateBody(updateInventoryRecordSchema),
  asyncHandler(async (request, response) => {
    const current = await db.select().from(inventoryRecords).where(eq(inventoryRecords.id, request.params.id)).get();

    if (!current) {
      throw new AppError(404, "inventory_record_not_found", "Registro de inventario nao encontrado.");
    }

    const { notebookDetails: notebook, desktopDetails: desktop, phoneDetails: phone, ...recordInput } = request.body;
    const updateData = Object.fromEntries(
      Object.entries(recordInput).filter(([, value]) => value !== undefined)
    ) as Partial<typeof inventoryRecords.$inferInsert>;

    await db.transaction(async (tx) => {
      if (Object.keys(updateData).length > 0) {
        await tx
          .update(inventoryRecords)
          .set({
            ...updateData,
            updatedAt: new Date().toISOString()
          })
          .where(eq(inventoryRecords.id, request.params.id));
      }

      if (notebook !== undefined) {
        await tx.delete(notebookDetails).where(eq(notebookDetails.inventoryRecordId, request.params.id));
        await tx.insert(notebookDetails).values({
          id: randomUUID(),
          inventoryRecordId: request.params.id,
          serialNumber: notebook.serialNumber ?? null,
          hostname: notebook.hostname ?? null
        });
      }

      if (desktop !== undefined) {
        await tx.delete(desktopDetails).where(eq(desktopDetails.inventoryRecordId, request.params.id));
        await tx.insert(desktopDetails).values({
          id: randomUUID(),
          inventoryRecordId: request.params.id,
          serialNumber: desktop.serialNumber ?? null,
          hostname: desktop.hostname ?? null
        });
      }

      if (phone !== undefined) {
        await tx.delete(phoneDetails).where(eq(phoneDetails.inventoryRecordId, request.params.id));
        await tx.insert(phoneDetails).values({
          id: randomUUID(),
          inventoryRecordId: request.params.id,
          chipNumber: phone.chipNumber ?? null,
          imei: phone.imei ?? null,
          pulsusId: phone.pulsusId ?? null
        });
      }
    });

    await writeAuditLog(request, {
      userId: request.user?.id,
      action: "update",
      entity: "inventory_records",
      entityId: request.params.id,
      details: request.body
    });

    const updated = await findInventoryRecord(request.params.id);
    response.json({ data: updated });
  })
);

inventoryRouter.delete(
  "/:id",
  requireRole("admin"),
  validateParams(idParamSchema),
  asyncHandler(async (request, response) => {
    const current = await db.select().from(inventoryRecords).where(eq(inventoryRecords.id, request.params.id)).get();

    if (!current) {
      throw new AppError(404, "inventory_record_not_found", "Registro de inventario nao encontrado.");
    }

    await db.transaction(async (tx) => {
      await tx.delete(notebookDetails).where(eq(notebookDetails.inventoryRecordId, request.params.id));
      await tx.delete(desktopDetails).where(eq(desktopDetails.inventoryRecordId, request.params.id));
      await tx.delete(phoneDetails).where(eq(phoneDetails.inventoryRecordId, request.params.id));
      await tx.delete(inventoryRecords).where(eq(inventoryRecords.id, request.params.id));
    });

    await writeAuditLog(request, {
      userId: request.user?.id,
      action: "delete",
      entity: "inventory_records",
      entityId: request.params.id,
      details: { userName: current.userName }
    });

    response.status(204).send();
  })
);

inventoryRouter.post(
  "/:id/anonymize",
  requireRole("admin"),
  validateParams(idParamSchema),
  asyncHandler(async (request, response) => {
    const current = await db.select().from(inventoryRecords).where(eq(inventoryRecords.id, request.params.id)).get();

    if (!current) {
      throw new AppError(404, "inventory_record_not_found", "Registro de inventario nao encontrado.");
    }

    const [updated] = await db
      .update(inventoryRecords)
      .set({
        userName: anonymizeName(current.userName),
        manager: "Anonimizado",
        termFileName: null,
        termFilePath: null,
        updatedAt: new Date().toISOString()
      })
      .where(eq(inventoryRecords.id, request.params.id))
      .returning();

    await writeAuditLog(request, {
      userId: request.user?.id,
      action: "anonymize",
      entity: "inventory_records",
      entityId: request.params.id,
      details: { previousUserName: current.userName }
    });

    response.json({ data: updated });
  })
);

function sanitizeFileName(fileName: string) {
  const baseName = path.basename(fileName).replace(/[^a-zA-Z0-9._-]/g, "_");
  return baseName.toLowerCase().endsWith(".pdf") ? baseName : `${baseName}.pdf`;
}
