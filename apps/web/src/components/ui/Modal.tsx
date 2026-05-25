import { type ReactNode, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "./Button";

type ModalProps = {
  open: boolean;
  title: string;
  children: ReactNode;
  size?: "md" | "lg" | "xl";
  onClose: () => void;
};

export function Modal({ open, title, children, size = "md", onClose }: ModalProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-navy/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="app-modal-title"
        className={
          size === "xl"
            ? "max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-lg border border-border bg-card shadow-xl"
            : size === "lg"
              ? "max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-lg border border-border bg-card shadow-xl"
              : "w-full max-w-lg rounded-lg border border-border bg-card shadow-xl"
        }
      >
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 id="app-modal-title" className="text-base font-semibold">{title}</h2>
          <Button variant="ghost" aria-label="Fechar" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
