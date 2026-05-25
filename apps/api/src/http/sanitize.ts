import type { NextFunction, Request, Response } from "express";

export function sanitizeRequest(request: Request, _response: Response, next: NextFunction) {
  if (request.body && typeof request.body === "object" && !Buffer.isBuffer(request.body)) {
    request.body = sanitizeValue(request.body);
  }

  if (request.query && typeof request.query === "object") {
    request.query = sanitizeValue(request.query) as Request["query"];
  }

  next();
}

function sanitizeValue(value: unknown): unknown {
  if (typeof value === "string") {
    return value.trim().replace(/[<>]/g, "");
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, sanitizeValue(entry)]));
  }

  return value;
}
