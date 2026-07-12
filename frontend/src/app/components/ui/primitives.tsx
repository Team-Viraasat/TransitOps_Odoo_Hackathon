import React from "react";

/* ---------------- Status Badge ---------------- */
const STATUS_STYLES: Record<string, string> = {
  Available: "bg-to-green/15 text-to-green border-to-green/30",
  "On Trip": "bg-to-blue/15 text-to-blue border-to-blue/30",
  "In Shop": "bg-to-amber/15 text-to-amber border-to-amber/30",
  Retired: "bg-to-red/15 text-to-red border-to-red/30",
  Draft: "bg-to-gray/15 text-to-muted border-to-gray/30",
  Dispatched: "bg-to-blue/15 text-to-blue border-to-blue/30",
  Completed: "bg-to-green/15 text-to-green border-to-green/30",
  Cancelled: "bg-to-red/15 text-to-red border-to-red/30",
  Suspended: "bg-to-red/15 text-to-red border-to-red/30",
  "Off Duty": "bg-to-gray/15 text-to-muted border-to-gray/30",
  Active: "bg-to-amber/15 text-to-amber border-to-amber/30",
};

export function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? "bg-to-gray/15 text-to-muted border-to-gray/30";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs whitespace-nowrap ${style}`}>
      <span className="size-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

/* ---------------- Button ---------------- */
type Variant = "primary" | "secondary" | "ghost" | "danger";
const VARIANTS: Record<Variant, string> = {
  primary: "bg-to-orange text-black hover:bg-to-orange/90 border-transparent",
  secondary: "bg-to-panel2 text-to-text hover:bg-to-panel2/70 border-to-border",
  ghost: "bg-transparent text-to-muted hover:text-to-text hover:bg-to-panel2 border-transparent",
  danger: "bg-to-red/90 text-white hover:bg-to-red border-transparent",
};

export function Button({
  variant = "secondary",
  className = "",
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg border px-3.5 py-2 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

/* ---------------- Inputs ---------------- */
const fieldBase =
  "w-full rounded-lg border border-to-border bg-to-bg px-3 py-2 text-sm text-to-text placeholder:text-to-muted/60 outline-none focus:border-to-blue transition-colors";

export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs text-to-muted">{label}</span>
      {children}
      {hint && <span className="text-xs text-to-muted/70">{hint}</span>}
    </label>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${fieldBase} ${props.className ?? ""}`} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${fieldBase} ${props.className ?? ""}`} />;
}

/* ---------------- Panel / Card ---------------- */
export function Panel({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <div className={`rounded-xl border border-to-border bg-to-panel ${className}`}>{children}</div>;
}

/* ---------------- Modal ---------------- */
export function Modal({
  open,
  onClose,
  title,
  children,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm">
      <div className={`mt-16 w-full ${wide ? "max-w-2xl" : "max-w-md"} rounded-xl border border-to-border bg-to-panel shadow-2xl`}>
        <div className="flex items-center justify-between border-b border-to-border px-5 py-3.5">
          <h3>{title}</h3>
          <button onClick={onClose} className="text-to-muted hover:text-to-text">✕</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

/* ---------------- KPI Card ---------------- */
export function KpiCard({
  label,
  value,
  sub,
  accent = "text-to-text",
  icon,
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
  accent?: string;
  icon?: React.ReactNode;
}) {
  return (
    <Panel className="p-4">
      <div className="flex items-start justify-between">
        <span className="text-xs text-to-muted">{label}</span>
        {icon && <span className="text-to-muted">{icon}</span>}
      </div>
      <div className={`mt-2 text-2xl ${accent}`}>{value}</div>
      {sub && <div className="mt-1 text-xs text-to-muted">{sub}</div>}
    </Panel>
  );
}

/* ---------------- Empty State ---------------- */
export function EmptyState({ message }: { message: string }) {
  return <div className="py-10 text-center text-sm text-to-muted">{message}</div>;
}

/* ---------------- Page Header ---------------- */
export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1>{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-to-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
