import { randomUUID } from "node:crypto";
import { Router } from "express";
import { createUserSchema, updateUserSchema } from "@inventario-ti/shared";
import { desc, eq, like, or } from "drizzle-orm";
import { db } from "../../db/client";
import { users } from "../../db/schema";
import { asyncHandler } from "../../http/async-handler";
import { requireRole } from "../../http/auth";
import { AppError } from "../../http/errors";
import { idParamSchema, listQuerySchema } from "../../http/schemas";
import { validateBody, validateParams, validateQuery } from "../../http/validate";
import { writeAuditLog } from "../../services/audit";

export const usersRouter = Router();

usersRouter.use(requireRole("admin"));

usersRouter.get(
  "/",
  validateQuery(listQuerySchema),
  asyncHandler(async (request, response) => {
    const { search, page, limit } = request.query as unknown as { search?: string; page: number; limit: number };
    const offset = (page - 1) * limit;

    const where = search ? or(like(users.name, `%${search}%`), like(users.email, `%${search}%`)) : undefined;
    const rows = await db.select().from(users).where(where).orderBy(desc(users.createdAt)).limit(limit).offset(offset);

    await writeAuditLog(request, {
      userId: request.user?.id,
      action: "view_list",
      entity: "users",
      details: { search, page, limit }
    });

    response.json({ data: rows, meta: { page, limit, total: rows.length } });
  })
);

usersRouter.post(
  "/",
  validateBody(createUserSchema),
  asyncHandler(async (request, response) => {
    const id = randomUUID();
    const [created] = await db
      .insert(users)
      .values({
        id,
        ...request.body
      })
      .returning();

    await writeAuditLog(request, {
      userId: request.user?.id,
      action: "create",
      entity: "users",
      entityId: id,
      details: { email: request.body.email, role: request.body.role }
    });

    response.status(201).json({ data: created });
  })
);

usersRouter.get(
  "/:id",
  validateParams(idParamSchema),
  asyncHandler(async (request, response) => {
    const row = await db.select().from(users).where(eq(users.id, request.params.id)).get();

    if (!row) {
      throw new AppError(404, "user_not_found", "Usuario nao encontrado.");
    }

    await writeAuditLog(request, {
      userId: request.user?.id,
      action: "view",
      entity: "users",
      entityId: request.params.id
    });

    response.json({ data: row });
  })
);

usersRouter.patch(
  "/:id",
  validateParams(idParamSchema),
  validateBody(updateUserSchema),
  asyncHandler(async (request, response) => {
    const [updated] = await db
      .update(users)
      .set({
        ...request.body,
        updatedAt: new Date().toISOString()
      })
      .where(eq(users.id, request.params.id))
      .returning();

    if (!updated) {
      throw new AppError(404, "user_not_found", "Usuario nao encontrado.");
    }

    await writeAuditLog(request, {
      userId: request.user?.id,
      action: "update",
      entity: "users",
      entityId: request.params.id,
      details: request.body
    });

    response.json({ data: updated });
  })
);

usersRouter.delete(
  "/:id",
  validateParams(idParamSchema),
  asyncHandler(async (request, response) => {
    const [deleted] = await db.delete(users).where(eq(users.id, request.params.id)).returning();

    if (!deleted) {
      throw new AppError(404, "user_not_found", "Usuario nao encontrado.");
    }

    await writeAuditLog(request, {
      userId: request.user?.id,
      action: "delete",
      entity: "users",
      entityId: request.params.id,
      details: { email: deleted.email }
    });

    response.status(204).send();
  })
);
