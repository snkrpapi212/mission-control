"use client";

import { motion } from "framer-motion";
import { Bot, ClipboardList, Inbox, Search, Plus, Users, Bell } from "lucide-react";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick?: () => void;
    disabled?: boolean;
    note?: string;
  };
  variant?: "default" | "glass" | "card";
}

export function EmptyState({ icon, title, description, action, variant = "glass" }: EmptyStateProps) {
  const variants = {
    default: "bg-[var(--mc-card)] border border-dashed border-[var(--mc-line-strong)]",
    glass: "bg-[var(--mc-panel)]/60 backdrop-blur-sm border border-[var(--mc-line)]",
    card: "bg-[var(--mc-card)] border border-[var(--mc-line)] shadow-sm",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`rounded-2xl p-8 text-center ${variants[variant]}`}
    >
      <motion.div
        className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--mc-panel-soft)] border border-[var(--mc-line)] text-[var(--mc-text-muted)]"
        animate={{ 
          scale: [1, 1.05, 1],
          rotate: [0, 2, -2, 0]
        }}
        transition={{ 
          duration: 4, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {icon}
      </motion.div>

      <h3 className="mb-2 text-[18px] font-semibold text-[var(--mc-text)] tracking-tight">{title}</h3>

      <p className="mb-5 text-[14px] text-[var(--mc-text-muted)] leading-relaxed max-w-[280px] mx-auto">
        {description}
      </p>

      {action && (
        <div className="space-y-3">
          <motion.button
            onClick={action.onClick}
            disabled={action.disabled}
            whileHover={action.disabled ? undefined : { scale: 1.03 }}
            whileTap={action.disabled ? undefined : { scale: 0.97 }}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--mc-text)] px-5 py-2.5 text-[13px] font-semibold text-[var(--mc-bg)] shadow-sm transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus size={16} />
            {action.label}
          </motion.button>
          {action.note && (
            <p className="text-[12px] text-[var(--mc-text-soft)]">{action.note}</p>
          )}
        </div>
      )}
    </motion.div>
  );
}

export function EmptyAgentList() {
  return (
    <EmptyState
      icon={<Users size={28} />}
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
      icon={<ClipboardList size={28} />}
      title="No tasks in queue"
      description="Your queue is clear! Create your first task to get started with your team."
      action={{
        label: "Create Task",
        disabled: true,
        note: "Task creation shortcut is being wired.",
      }}
    />
  );
}

export function EmptyActivityFeed() {
  return (
    <div className="p-6">
      <EmptyState
        icon={<Bell size={28} />}
        title="No activity yet"
        description="Updates from your team will appear here in real-time as they work on tasks."
      />
    </div>
  );
}

export function EmptySearchResults() {
  return (
    <EmptyState
      icon={<Search size={28} />}
      title="No tasks match"
      description="Try adjusting your filters or search terms to find what you're looking for."
      action={{
        label: "Clear Filters",
        disabled: true,
        note: "Filter reset action coming soon.",
      }}
    />
  );
}

export function EmptyColumn({ title }: { title: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-xl border border-dashed border-[var(--mc-line-strong)] bg-[var(--mc-card)]/50 p-6 text-center"
    >
      <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--mc-panel-soft)] text-[var(--mc-text-muted)]">
        <Inbox size={20} />
      </div>
      <p className="text-[13px] text-[var(--mc-text-soft)]">No tasks in {title}</p>
    </motion.div>
  );
}
