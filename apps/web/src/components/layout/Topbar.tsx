import { Bell, Search, ShieldCheck } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

export function Topbar() {
  return (
    <header className="flex min-h-16 items-center justify-between gap-3 border-b border-border bg-white px-4 lg:px-6">
      <div className="relative max-w-md flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="h-10 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          placeholder="Buscar colaborador, equipamento ou recurso"
        />
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" aria-label="Notificacoes">
          <Bell className="h-4 w-4" />
        </Button>
        <div className="hidden items-center gap-2 rounded-md border border-border px-3 py-2 text-sm md:flex">
          <ShieldCheck className="h-4 w-4 text-primary" />
          Admin
        </div>
      </div>
    </header>
  );
}
