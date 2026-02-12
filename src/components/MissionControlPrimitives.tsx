import type { ReactNode } from "react";
import { motion } from "framer-motion";

export function Chip({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span className={`mc-chip inline-flex items-center gap-1 ${className}`.trim()}>
      {children}
    </span>
  );
}

export function PanelHeader({
  dotClass,
  title,
  count,
  icon,
}: {
  dotClass?: string;
  title: string;
  count?: number;
  icon?: ReactNode;
}) {
  return (
    <div className="flex h-[var(--h-section)] items-center justify-between border-b border-[var(--mc-line)] bg-[var(--mc-panel)]/60 backdrop-blur-sm px-4 sticky top-0 z-10">
      <h2 className="text-[15px] font-semibold tracking-[0.01em] text-[var(--mc-text)] flex items-center gap-2">
        {icon ? (
          <span className="text-[var(--mc-text-soft)]">{icon}</span>
        ) : (
          <span className={`inline-flex h-2 w-2 rounded-full ${dotClass ?? "bg-[var(--mc-green)]"}`} />
        )}
        {title}
      </h2>
      {typeof count === "number" ? (
        <motion.div
          key={count}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <Chip>{count}</Chip>
        </motion.div>
      ) : null}
    </div>
  );
}
