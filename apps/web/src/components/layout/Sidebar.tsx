import type { AppRoute } from "../../app/routes";
import { navItems } from "../../app/routes";
import { cn } from "../../lib/cn";

type SidebarProps = {
  activeRoute: AppRoute;
  onRouteChange: (route: AppRoute) => void;
};

export function Sidebar({ activeRoute, onRouteChange }: SidebarProps) {
  return (
    <aside className="hidden w-64 border-r border-border bg-navy text-white lg:block">
      <div className="flex h-16 items-center border-b border-border px-5">
        <div>
          <strong className="block text-lg">Inventário TI</strong>
          <span className="text-xs text-slate-300">Controle interno</span>
        </div>
      </div>
      <nav className="space-y-1 p-3">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onRouteChange(item.id)}
            className={cn(
              "flex h-10 w-full items-center gap-3 rounded-md px-3 text-left text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white",
              activeRoute === item.id && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
