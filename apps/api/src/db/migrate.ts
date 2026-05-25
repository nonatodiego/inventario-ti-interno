import { readFile } from "node:fs/promises";
import { sqlite } from "./client";

const migrationUrl = new URL("../../drizzle/0000_initial_inventory_ti.sql", import.meta.url);
const sql = await readFile(migrationUrl, "utf8");

await sqlite.executeMultiple(sql);

console.log("Banco de dados inicializado com sucesso.");
