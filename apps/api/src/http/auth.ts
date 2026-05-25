import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import type { Role } from "@inventario-ti/shared";
import { env } from "../config/env";
import { parseCookies } from "./cookies";
import { AppError } from "./errors";

const SESSION_COOKIE = "inventario_ti_session";
const CSRF_COOKIE = "inventario_ti_csrf";
const SESSION_TTL_SECONDS = 60 * 60 * 8;

type SessionPayload = {
  id: string;
  name: string;
  email: string;
  role: Role;
  exp: number;
};

export { CSRF_COOKIE, SESSION_COOKIE, SESSION_TTL_SECONDS };

export function createSessionToken(payload: Omit<SessionPayload, "exp">) {
  const session: SessionPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS
  };
  const body = Buffer.from(JSON.stringify(session), "utf8").toString("base64url");
  const signature = sign(body);

  return `${body}.${signature}`;
}

export function createCsrfToken() {
  return randomBytes(32).toString("base64url");
}

export function verifySessionToken(token: string): SessionPayload | null {
  const [body, signature] = token.split(".");

  if (!body || !signature || !safeEqual(signature, sign(body))) {
    return null;
  }

  let payload: SessionPayload;

  try {
    payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SessionPayload;
  } catch {
    return null;
  }

  if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
    return null;
  }

  return payload;
}

export function requireAuth(request: Request, _response: Response, next: NextFunction) {
  const token = parseCookies(request)[SESSION_COOKIE];

  if (!token) {
    next(new AppError(401, "unauthenticated", "Autenticacao obrigatoria."));
    return;
  }

  const payload = verifySessionToken(token);

  if (!payload) {
    next(new AppError(401, "invalid_session", "Sessao invalida ou expirada."));
    return;
  }

  request.user = {
    id: payload.id,
    name: payload.name,
    email: payload.email,
    role: payload.role
  };

  next();
}

export function requireRole(...roles: Role[]) {
  return (request: Request, _response: Response, next: NextFunction) => {
    if (!request.user) {
      next(new AppError(401, "unauthenticated", "Autenticacao obrigatoria."));
      return;
    }

    if (!roles.includes(request.user.role)) {
      next(new AppError(403, "forbidden", "Permissao insuficiente."));
      return;
    }

    next();
  };
}

export function requireCsrf(request: Request, _response: Response, next: NextFunction) {
  if (["GET", "HEAD", "OPTIONS"].includes(request.method)) {
    next();
    return;
  }

  const csrfCookie = parseCookies(request)[CSRF_COOKIE];
  const csrfHeader = request.header("x-csrf-token");

  if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
    next(new AppError(403, "csrf_validation_failed", "Token CSRF invalido."));
    return;
  }

  next();
}

export function canViewSensitive(role: Role) {
  return role === "admin" || role === "ti";
}

function sign(value: string) {
  return createHmac("sha256", env.AUTH_SECRET).update(value).digest("base64url");
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);

  return left.length === right.length && timingSafeEqual(left, right);
}
