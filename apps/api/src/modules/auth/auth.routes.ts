import { Router } from "express";
import { loginSchema } from "@inventario-ti/shared";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { env } from "../../config/env";
import { db } from "../../db/client";
import { users } from "../../db/schema";
import { asyncHandler } from "../../http/async-handler";
import { createCsrfToken, createSessionToken, CSRF_COOKIE, requireAuth, requireCsrf, SESSION_COOKIE, SESSION_TTL_SECONDS } from "../../http/auth";
import { clearCookie, setHttpOnlyCookie, setReadableCookie } from "../../http/cookies";
import { AppError } from "../../http/errors";
import { rateLimit } from "../../http/rate-limit";
import { validateBody } from "../../http/validate";
import { writeAuditLog } from "../../services/audit";

export const authRouter = Router();

authRouter.post(
  "/login",
  rateLimit({ windowMs: 15 * 60 * 1000, max: 10 }),
  validateBody(loginSchema),
  asyncHandler(async (request, response) => {
    const { email, password } = request.body;
    const passwordMatches = env.ADMIN_PASSWORD_HASH
      ? await bcrypt.compare(password, env.ADMIN_PASSWORD_HASH)
      : password === env.ADMIN_PASSWORD;

    if (email !== env.ADMIN_EMAIL || !passwordMatches) {
      await writeAuditLog(request, {
        action: "login_failed",
        entity: "auth",
        details: { email }
      });
      throw new AppError(401, "invalid_credentials", "Credenciais invalidas.");
    }

    const existingUser = await db.select().from(users).where(eq(users.email, email)).get();
    const user =
      existingUser ??
      (
        await db
          .insert(users)
          .values({
            id: randomUUID(),
            name: "Administrador",
            email,
            role: "admin",
            lastLogin: new Date().toISOString()
          })
          .returning()
      )[0];

    if (existingUser) {
      await db.update(users).set({ lastLogin: new Date().toISOString() }).where(eq(users.id, existingUser.id));
    }

    const sessionToken = createSessionToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    });
    const csrfToken = createCsrfToken();

    setHttpOnlyCookie(response, SESSION_COOKIE, sessionToken, SESSION_TTL_SECONDS);
    setReadableCookie(response, CSRF_COOKIE, csrfToken, SESSION_TTL_SECONDS);

    await writeAuditLog(request, {
      userId: user.id,
      action: "login",
      entity: "auth",
      details: { email: user.email, role: user.role }
    });

    response.json({
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        csrfToken
      }
    });
  })
);

authRouter.post(
  "/logout",
  requireAuth,
  requireCsrf,
  asyncHandler(async (request, response) => {
    clearCookie(response, SESSION_COOKIE);
    clearCookie(response, CSRF_COOKIE);

    await writeAuditLog(request, {
      userId: request.user?.id,
      action: "logout",
      entity: "auth"
    });

    response.status(204).send();
  })
);

authRouter.get("/me", requireAuth, (request, response) => {
  response.json({ data: request.user });
});
