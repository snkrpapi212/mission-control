"use client";

import { motion } from "framer-motion";
import { Users, ClipboardList, Activity, Search, Plus, UserPlus, SlidersHorizontal } from "lucide-react";
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick?: () => void;
    disabled?: boolean;
    note?: string;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl border-2 border-dashed border-[var(--mc-line)] bg-[var(--mc-card)]/30 p-6 sm:p-10 text-center flex flex-col items-center justify-center backdrop-blur-[2px] min-h-[200px] sm:min-h-[300px]"
    >
      <div className="mb-4 sm:mb-5 flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-[var(--mc-panel-soft)] text-[var(--mc-text-soft)]/40 shadow-inner">
        {icon}
      </div>

      <h3 className="mb-2 text-[16px] sm:text-[18px] font-bold tracking-tight text-[var(--mc-text)]">{title}</h3>

      <p className="mb-4 sm:mb-6 text-[12px] sm:text-[14px] leading-relaxed text-[var(--mc-text-muted)] max-w-[240px] sm:max-w-[280px] mx-auto font-medium">{description}</p>

      {action && (
        <div className="flex flex-col items-center gap-3">
          <motion.button
            onClick={action.onClick}
            disabled={action.disabled}
            whileHover={action.disabled ? undefined : { scale: 1.02, y: -1 }}
            whileTap={action.disabled ? undefined : { scale: 0.98 }}
            className="group flex items-center gap-2 rounded-xl bg-[var(--mc-text)] px-6 py-2.5 text-[13px] font-bold text-white transition-all hover:bg-[var(--mc-green)] disabled:cursor-not-allowed disabled:opacity-20 disabled:hover:bg-[var(--mc-text)]"
          >
            {action.label}
          </motion.button>
          {action.note && (
            <div className="rounded-lg bg-[var(--mc-panel-soft)] px-3 py-1 border border-[var(--mc-line)]">
              <p className="text-[11px] font-bold text-[var(--mc-text-muted)] uppercase tracking-wider">{action.note}</p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

export function EmptyAgentList() {
  return (
    <EmptyState
      icon={<Users size={32} strokeWidth={1.5} />}
      title="No agents yet"
      description="Assemble your squad to get started. They'll appear here once they're online."
      action={{
        label: "Invite Team Members",
        disabled: true,
        note: "Invite flow coming soon",
      }}
    />
  );
}

export function EmptyTaskBoard() {
  return (
    <EmptyState
      icon={<ClipboardList size={32} strokeWidth={1.5} />}
      title="Board is empty"
      description="Your queue is clear! High-performance teams start with a single task."
      action={{
        label: "Create First Task",
        disabled: true,
        note: "Shortcut coming soon",
      }}
    />
  );
}

export function EmptyActivityFeed() {
  return (
    <EmptyState
      icon={<Activity size={32} strokeWidth={1.5} />}
      title="No activity yet"
      description="The live feed is waiting for your team's first move. Updates appear in real-time."
    />
  );
}

export function EmptySearchResults() {
  return (
    <EmptyState
      icon={<Search size={32} strokeWidth={1.5} />}
      title="No results found"
      description="We couldn't find any tasks matching your current filter criteria."
      action={{
        label: "Reset All Filters",
        disabled: true,
        note: "Action coming soon",
      }}
    />
  );
}

