import type { LucideIcon } from "lucide-react";
import { Boxes, ChartNoAxesCombined, History, LayoutDashboard, MonitorSmartphone } from "lucide-react";

export type AppRoute = "dashboard" | "inventory" | "resources" | "history" | "reports";

export type NavItem = {
  id: AppRoute;
  label: string;
  icon: LucideIcon;
};

export const navItems: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "inventory", label: "Inventário", icon: MonitorSmartphone },
  { id: "resources", label: "Recursos", icon: Boxes },
  { id: "history", label: "Histórico", icon: History },
  { id: "reports", label: "Relatórios", icon: ChartNoAxesCombined }
];
