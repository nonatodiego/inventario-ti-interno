import { CheckCircle2, Info, TriangleAlert, XCircle } from "lucide-react";
import { cn } from "../../lib/cn";

type ToastProps = {
  title: string;
  description?: string;
  tone?: "success" | "info" | "warning" | "danger";
};

const icons = {
  success: CheckCircle2,
  info: Info,
  warning: TriangleAlert,
  danger: XCircle
};

export function Toast({ title, description, tone = "info" }: ToastProps) {
  const Icon = icons[tone];

  return (
    <div className="flex max-w-sm items-start gap-3 rounded-lg border border-border bg-card p-4 shadow-lg">
      <Icon
        className={cn(
          "mt-0.5 h-5 w-5",
          tone === "success" && "text-success",
          tone === "info" && "text-primary",
          tone === "warning" && "text-warning",
          tone === "danger" && "text-destructive"
        )}
      />
      <div>
        <p className="text-sm font-semibold">{title}</p>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      </div>
    </div>
  );
}
