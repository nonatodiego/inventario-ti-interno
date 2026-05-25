import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { env } from "../config/env";

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
  }
}

export function notFoundHandler(_request: Request, _response: Response, next: NextFunction) {
  next(new AppError(404, "not_found", "Recurso nao encontrado."));
}

export function errorHandler(error: unknown, _request: Request, response: Response, _next: NextFunction) {
  if (error instanceof ZodError) {
    return response.status(400).json({
      error: {
        code: "validation_error",
        message: "Dados invalidos.",
        details: error.flatten()
      }
    });
  }

  if (error instanceof AppError) {
    return response.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
        details: error.details
      }
    });
  }

  return response.status(500).json({
    error: {
      code: "internal_error",
      message: "Erro interno no servidor.",
      details: env.NODE_ENV === "development" ? String(error) : undefined
    }
  });
}
