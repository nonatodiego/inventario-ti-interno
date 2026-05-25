import type { ReactNode } from "react";
import type { AppRoute } from "../../app/routes";
import { Sidebar } from "./Sidebar";

type AppShellProps = {
  activeRoute: AppRoute;
  children: ReactNode;
  onRouteChange: (route: AppRoute) => void;
};

export function AppShell({ activeRoute, children, onRouteChange }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar activeRoute={activeRoute} onRouteChange={onRouteChange} />
      <div className="min-w-0 flex-1">
        <main className="mx-auto w-full max-w-7xl p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
