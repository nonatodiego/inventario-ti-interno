import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  API_PORT: z.coerce.number().int().positive().default(3333),
  WEB_ORIGIN: z.string().url().default("http://localhost:5173"),
  DATABASE_URL: z.string().default("file:./dev.sqlite"),
  AUTH_SECRET: z.string().min(24).default("troque-este-segredo-em-producao"),
  ADMIN_EMAIL: z.string().email().default("admin@empresa.local"),
  ADMIN_PASSWORD: z.string().min(8).default("admin12345"),
  ADMIN_PASSWORD_HASH: z.string().optional(),
  UPLOAD_DIR: z.string().default("./uploads"),
  MAX_UPLOAD_MB: z.coerce.number().int().positive().default(10)
});

export const env = envSchema.parse(process.env);

if (env.NODE_ENV === "production" && env.AUTH_SECRET === "troque-este-segredo-em-producao") {
  throw new Error("AUTH_SECRET deve ser configurado em producao.");
}

if (env.NODE_ENV === "production" && !env.ADMIN_PASSWORD_HASH) {
  throw new Error("ADMIN_PASSWORD_HASH deve ser configurado em producao.");
}
