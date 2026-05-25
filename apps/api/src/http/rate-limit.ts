import type { NextFunction, Request, Response } from "express";
import { AppError } from "./errors";

type RateLimitOptions = {
  windowMs: number;
  max: number;
};

const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit({ windowMs, max }: RateLimitOptions) {
  return (request: Request, _response: Response, next: NextFunction) => {
    const userPart = request.user?.id ?? request.ip;
    const key = `${userPart}:${request.method}:${request.originalUrl.split("?")[0]}`;
    const now = Date.now();
    const bucket = buckets.get(key);

    if (!bucket || bucket.resetAt < now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    bucket.count += 1;

    if (bucket.count > max) {
      next(new AppError(429, "rate_limited", "Muitas tentativas. Aguarde alguns minutos."));
      return;
    }

    next();
  };
}
