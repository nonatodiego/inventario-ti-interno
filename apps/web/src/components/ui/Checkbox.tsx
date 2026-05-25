import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: ReactNode;
};

export function Checkbox({ className, label, id, ...props }: CheckboxProps) {
  const inputId = id ?? props.name;

  return (
    <label className="flex items-center gap-2 text-sm text-foreground" htmlFor={inputId}>
      <input
        id={inputId}
        type="checkbox"
        className={cn("h-4 w-4 rounded border-border text-primary focus:ring-primary", className)}
        {...props}
      />
      {label}
    </label>
  );
}
