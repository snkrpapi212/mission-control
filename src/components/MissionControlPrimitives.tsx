import type { ReactNode } from "react";

export function Chip({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span className={`mc-chip inline-flex items-center gap-1 ${className}`.trim()}>{children}</span>;
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
    <div className="flex h-[var(--h-section)] items-center justify-between border-b border-[var(--mc-border)] px-4">
      {/* H1 typography: 20px per design system */}
      <h2 className="text-[length:var(--mc-font-h1)] font-semibold uppercase tracking-[0.12em] text-[var(--mc-text)]">
        <span className={`mr-2 text-[var(--mc-accent)] ${dotClass ?? ""}`}>•</span>
        {title}
      </h2>
      {typeof count === "number" ? <Chip>{count}</Chip> : null}
    </div>
  );
}
