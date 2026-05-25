import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { env } from "../config/env";
import * as schema from "./schema";

export const sqlite = createClient({
  url: env.DATABASE_URL
});

export const db = drizzle(sqlite, { schema });
