import { Badge } from "./Badge";

const statusLabels: Record<string, string> = {
  assigned: "Entregue",
  available: "Disponivel",
  maintenance: "Manutencao",
  retired: "Baixado",
  lost: "Extraviado",
  active: "Ativo",
  inactive: "Inativo"
};

export function StatusBadge({ status }: { status: string }) {
  const tone: "default" | "success" | "warning" | "info" =
    status === "available" || status === "active"
      ? "success"
      : status === "maintenance"
        ? "warning"
        : status === "assigned"
          ? "info"
          : "default";

  return <Badge tone={tone}>{statusLabels[status] ?? status}</Badge>;
}
