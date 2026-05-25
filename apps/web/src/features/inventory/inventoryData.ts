import { exportCsv } from "../../lib/exportCsv";
import type { InventoryRecord } from "./inventoryTypes";

export const initialInventoryRecords: InventoryRecord[] = [];

export function exportInventoryCsv(records: InventoryRecord[]) {
  exportCsv(
    "inventario-ti.csv",
    ["Colaborador", "Cargo", "Localidade", "Gestor", "Licença", "Equipamentos", "Termo de uso", "Data de cadastro"],
    records.map((record) => [
      record.collaborator,
      record.role,
      record.location,
      record.manager,
      record.license,
      record.equipment.map((item) => item.type).join(", "),
      record.termAttached ? "Termo anexado" : "Termo pendente",
      formatDate(record.regDate)
    ])
  );
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(new Date(date));
}
