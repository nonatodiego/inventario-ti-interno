import type { ReactNode } from "react";

type StatCardProps = {
  title: string;
  value: string;
  detail: string;
  icon: ReactNode;
};

export function StatCard({ title, value, detail, icon }: StatCardProps) {
  return (
    <section className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <strong className="mt-2 block text-2xl font-semibold">{value}</strong>
        </div>
        <div className="grid h-10 w-10 place-items-center rounded-md bg-muted text-primary">{icon}</div>
      </div>
      <p className="mt-4 text-sm text-muted-foreground">{detail}</p>
    </section>
  );
}
