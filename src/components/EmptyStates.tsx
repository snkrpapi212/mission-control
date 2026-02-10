"use client";

import { motion } from "framer-motion";

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
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
        className="text-[48px] mb-4"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {icon}
      </motion.div>

      <h3 className="text-[18px] font-semibold text-[var(--mc-text)] mb-2">
        {title}
      </h3>

      <p className="text-[14px] text-[var(--mc-text-soft)] mb-4">
        {description}
      </p>

      {action && (
        <motion.button
          onClick={action.onClick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="rounded-[8px] bg-[var(--mc-button-bg)] px-4 py-2 text-[13px] font-semibold text-[var(--mc-text)] hover:bg-[var(--mc-button-hover)] transition-colors"
        >
          {action.label}
        </motion.button>
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
        onClick: () => {
          /* TODO: implement invite flow */
        },
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
        onClick: () => {
          /* TODO: trigger create modal */
        },
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
        onClick: () => {
          /* TODO: clear filters */
        },
      }}
    />
  );
}
