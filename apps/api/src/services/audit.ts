import { randomUUID } from "node:crypto";
import type { Request } from "express";
import { db } from "../db/client";
import { auditLogs } from "../db/schema";

type AuditInput = {
  userId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  details?: unknown;
};

export async function writeAuditLog(request: Request, input: AuditInput) {
  await db.insert(auditLogs).values({
    id: randomUUID(),
    userId: input.userId ?? null,
    action: input.action,
    entity: input.entity,
    entityId: input.entityId ?? null,
    ip: request.ip,
    details: input.details ?? null
  });
}
