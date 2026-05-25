import { randomUUID } from "node:crypto";
import { Router } from "express";
import { createAvailableResourceSchema, updateAvailableResourceSchema } from "@inventario-ti/shared";
import { desc, eq, like } from "drizzle-orm";
import { db } from "../../db/client";
import { availableResources } from "../../db/schema";
import { asyncHandler } from "../../http/async-handler";
import { requireRole } from "../../http/auth";
import { AppError } from "../../http/errors";
import { idParamSchema, listQuerySchema } from "../../http/schemas";
import { validateBody, validateParams, validateQuery } from "../../http/validate";
import { writeAuditLog } from "../../services/audit";

export const availableResourcesRouter = Router();

availableResourcesRouter.get(
  "/",
  validateQuery(listQuerySchema),
  asyncHandler(async (request, response) => {
    const { search, page, limit } = request.query as unknown as { search?: string; page: number; limit: number };
    const offset = (page - 1) * limit;

    const rows = await db
      .select()
      .from(availableResources)
      .where(search ? like(availableResources.resourceType, `%${search}%`) : undefined)
      .orderBy(desc(availableResources.createdAt))
      .limit(limit)
      .offset(offset);

    await writeAuditLog(request, {
      userId: request.user?.id,
      action: "view_list",
      entity: "available_resources",
      details: { search, page, limit }
    });

    response.json({ data: rows, meta: { page, limit, total: rows.length } });
  })
);

availableResourcesRouter.post(
  "/",
  requireRole("admin", "ti"),
  validateBody(createAvailableResourceSchema),
  asyncHandler(async (request, response) => {
    const id = randomUUID();
    const [created] = await db
      .insert(availableResources)
      .values({
        id,
        ...request.body
      })
      .returning();

    await writeAuditLog(request, {
      userId: request.user?.id,
      action: "create",
      entity: "available_resources",
      entityId: id,
      details: request.body
    });

    response.status(201).json({ data: created });
  })
);

availableResourcesRouter.get(
  "/:id",
  validateParams(idParamSchema),
  asyncHandler(async (request, response) => {
    const row = await db.select().from(availableResources).where(eq(availableResources.id, request.params.id)).get();

    if (!row) {
      throw new AppError(404, "resource_not_found", "Recurso nao encontrado.");
    }

    await writeAuditLog(request, {
      userId: request.user?.id,
      action: "view",
      entity: "available_resources",
      entityId: request.params.id
    });

    response.json({ data: row });
  })
);

availableResourcesRouter.patch(
  "/:id",
  requireRole("admin", "ti"),
  validateParams(idParamSchema),
  validateBody(updateAvailableResourceSchema),
  asyncHandler(async (request, response) => {
    const [updated] = await db
      .update(availableResources)
      .set({
        ...request.body,
        updatedAt: new Date().toISOString()
      })
      .where(eq(availableResources.id, request.params.id))
      .returning();

    if (!updated) {
      throw new AppError(404, "resource_not_found", "Recurso nao encontrado.");
    }

    await writeAuditLog(request, {
      userId: request.user?.id,
      action: "update",
      entity: "available_resources",
      entityId: request.params.id,
      details: request.body
    });

    response.json({ data: updated });
  })
);

availableResourcesRouter.delete(
  "/:id",
  requireRole("admin"),
  validateParams(idParamSchema),
  asyncHandler(async (request, response) => {
    const [deleted] = await db.delete(availableResources).where(eq(availableResources.id, request.params.id)).returning();

    if (!deleted) {
      throw new AppError(404, "resource_not_found", "Recurso nao encontrado.");
    }

    await writeAuditLog(request, {
      userId: request.user?.id,
      action: "delete",
      entity: "available_resources",
      entityId: request.params.id,
      details: { resourceType: deleted.resourceType }
    });

    response.status(204).send();
  })
);
