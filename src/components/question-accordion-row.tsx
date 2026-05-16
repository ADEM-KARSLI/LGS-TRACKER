"use client";

type AccordionRowProps = {
  label: string;
  count: number;
  open: boolean;
  onToggle: () => void;
  level: number;
  badgeVariant?: "pending" | "critical";
  children?: React.ReactNode;
};

const BADGE = {
  pending:
    "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
  critical:
    "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200",
};

export function QuestionAccordionRow({
  label,
  count,
  open,
  onToggle,
  level,
  badgeVariant = "pending",
  children,
}: AccordionRowProps) {
  const padding = { 0: "pl-0", 1: "pl-4", 2: "pl-8", 3: "pl-12" }[level] ?? "pl-12";

  return (
    <div className={padding}>
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 text-left transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
      >
        <span className="flex items-center gap-2 font-medium text-slate-900 dark:text-white">
          <span className="text-slate-400">{open ? "▼" : "▶"}</span>
          {label}
        </span>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${BADGE[badgeVariant]}`}
        >
          {count} soru
        </span>
      </button>
      {open && children && <div className="mt-2 space-y-2">{children}</div>}
    </div>
  );
}
