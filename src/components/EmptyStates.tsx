"use client";

import { motion } from "framer-motion";

interface EmptyStateProps {
  icon: string;
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-[14px] border border-dashed border-[var(--mc-line-strong)] bg-[var(--mc-card)] p-8 text-center"
    >
      <motion.div
        className="mb-4 text-[48px]"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {icon}
      </motion.div>

      <h3 className="mb-2 text-[18px] font-semibold text-[var(--mc-text)]">{title}</h3>

      <p className="mb-4 text-[14px] text-[var(--mc-text-soft)]">{description}</p>

      {action && (
        <div className="space-y-2">
          <motion.button
            onClick={action.onClick}
            disabled={action.disabled}
            whileHover={action.disabled ? undefined : { scale: 1.05 }}
            whileTap={action.disabled ? undefined : { scale: 0.95 }}
            className="rounded-[8px] bg-[var(--mc-button-bg)] px-4 py-2 text-[13px] font-semibold text-[var(--mc-text)] transition-colors hover:bg-[var(--mc-button-hover)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {action.label}
          </motion.button>
          {action.note && <p className="text-xs text-[var(--mc-text-soft)]">{action.note}</p>}
        </div>
      )}
    </motion.div>
  );
}

export function EmptyAgentList() {
  return (
    <EmptyState
      icon="👥"
      title="No agents yet"
      description="Invite team members to get started. They'll appear here once they're online."
      action={{
        label: "Invite Team Members",
        disabled: true,
        note: "Invite flow coming soon.",
      }}
    />
  );
}

export function EmptyTaskBoard() {
  return (
    <EmptyState
      icon="📋"
      title="No tasks in Inbox"
      description="Your queue is clear! Create your first task to get started."
      action={{
        label: "+ Create Task",
        disabled: true,
        note: "Task creation shortcut is being wired.",
      }}
    />
  );
}

export function EmptyActivityFeed() {
  return (
    <EmptyState
      icon="📭"
      title="No activity yet"
      description="Updates from your team will appear here in real-time."
    />
  );
}

export function EmptySearchResults() {
  return (
    <EmptyState
      icon="🔍"
      title="No tasks match"
      description="Try adjusting your filters or search terms."
      action={{
        label: "Clear Filters",
        disabled: true,
        note: "Filter reset action coming soon.",
      }}
    />
  );
}
