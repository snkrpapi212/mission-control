import type { ReactNode } from "react";

export function Chip({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span className={`mc-chip inline-flex items-center gap-[var(--sp-1)] ${className}`.trim()}>{children}</span>;
}

export function PanelHeader({
  dotClass,
  title,
  count,
}: {
  dotClass?: string;
  title: string;
  count?: number;
}) {
  return (
    <div className="flex h-[var(--h-section)] items-center justify-between border-b border-[var(--mc-line)] px-[var(--sp-4)]">
      <h2 className="text-[18px] font-semibold uppercase tracking-[0.12em] text-[var(--mc-text)]">
        <span className={`mr-[var(--sp-2)] text-[var(--mc-green)] ${dotClass ?? ""}`}>•</span>
        {title}
      </h2>
      {typeof count === "number" ? <Chip>{count}</Chip> : null}
    </div>
  );
}
