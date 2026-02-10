"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Doc } from "../../convex/_generated/dataModel";
import { TaskMessages } from "@/components/TaskMessages";
import { TaskDocuments } from "@/components/TaskDocuments";
import { TaskActivity } from "@/components/TaskActivity";

interface TaskDetailModalProps {
  task: Doc<"tasks"> | null;
  agents: Doc<"agents">[];
  onClose: () => void;
}

type TabType = "messages" | "docs" | "activity";

const TABS: Array<{ id: TabType; label: string; icon: string }> = [
  { id: "messages", label: "Messages", icon: "💬" },
  { id: "docs", label: "Documents", icon: "📄" },
  { id: "activity", label: "Activity", icon: "📊" },
];

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const panelVariants = {
  hidden: { opacity: 0, x: 100 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 100 },
};

const contentVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

export function TaskDetailModal({ task, agents, onClose }: TaskDetailModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("messages");
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    // Small delay to allow animation to complete
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 150);
  }, [onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleClose();
    }
  };

  if (!task) return null;

  const assignee = agents.find((a) => task.assigneeIds.includes(a.agentId));

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case "urgent":
        return { bg: "var(--mc-red-soft)", color: "var(--mc-red)" };
      case "high":
        return { bg: "var(--mc-amber-soft)", color: "var(--mc-amber)" };
      default:
        return { bg: "var(--mc-green-soft)", color: "var(--mc-green)" };
    }
  };

  const priorityStyles = getPriorityStyles(task.priority);

  return (
    <AnimatePresence mode="wait">
      {task && !isClosing && (
        <div 
          className="fixed inset-0 z-40"
          onClick={handleBackdropClick}
          onKeyDown={handleKeyDown}
          role="dialog"
          aria-modal="true"
          aria-labelledby="task-detail-title"
        >
          {/* Backdrop */}
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.14 }}
            className="absolute inset-0 bg-black/40"
            style={{ backdropFilter: "blur(4px)" }}
            aria-hidden="true"
          />

          {/* Modal Panel */}
          <motion.div
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.16, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-2xl bg-[var(--mc-panel)] shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header - sticky */}
            <div className="sticky top-0 z-10 border-b border-[var(--mc-line)] bg-[var(--mc-panel-soft)] px-6 py-4 flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h2 
                  id="task-detail-title"
                  className="text-[18px] font-semibold text-[var(--mc-text)] line-clamp-2 leading-tight"
                >
                  {task.title}
                </h2>
                <p className="text-[13px] text-[var(--mc-text-soft)] mt-1 flex items-center gap-2">
                  <span className="capitalize">{task.status.replace("_", " ")}</span>
                  <span aria-hidden="true">•</span>
                  <span className="uppercase">{task.priority}</span>
                </p>
              </div>
              <button
                onClick={handleClose}
                className="flex-shrink-0 p-2 rounded-lg text-[var(--mc-text-muted)] hover:bg-[var(--mc-line)] hover:text-[var(--mc-text)] transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[var(--mc-green)] focus:ring-offset-1"
                aria-label="Close task details"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Metadata Row */}
            <div className="border-b border-[var(--mc-line)] px-6 py-4 bg-[var(--mc-panel)] grid grid-cols-2 gap-4 text-[13px]">
              <div>
                <p className="text-[var(--mc-text-soft)] uppercase tracking-[0.06em] font-semibold text-[11px] mb-1.5">
                  Assigned to
                </p>
                {assignee ? (
                  <p className="text-[var(--mc-text)] flex items-center gap-2">
                    <span className="text-[18px]" aria-hidden="true">{assignee.emoji}</span>
                    <span className="font-medium">{assignee.name}</span>
                  </p>
                ) : (
                  <p className="text-[var(--mc-text-soft)] italic">Unassigned</p>
                )}
              </div>
              <div>
                <p className="text-[var(--mc-text-soft)] uppercase tracking-[0.06em] font-semibold text-[11px] mb-1.5">
                  Created
                </p>
                <p className="text-[var(--mc-text)] font-medium">
                  {new Date(task.createdAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <p className="text-[var(--mc-text-soft)] uppercase tracking-[0.06em] font-semibold text-[11px] mb-1.5">
                  Priority
                </p>
                <span
                  className="inline-flex items-center px-2.5 py-1 rounded-md text-[12px] font-semibold uppercase tracking-wide"
                  style={{
                    backgroundColor: priorityStyles.bg,
                    color: priorityStyles.color,
                  }}
                >
                  {task.priority}
                </span>
              </div>
              <div>
                <p className="text-[var(--mc-text-soft)] uppercase tracking-[0.06em] font-semibold text-[11px] mb-1.5">
                  Status
                </p>
                <select
                  defaultValue={task.status}
                  className="mc-input mc-select py-1.5 px-2 text-[12px] min-w-[140px]"
                  aria-label="Change task status"
                >
                  <option value="inbox">Inbox</option>
                  <option value="assigned">Assigned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="done">Done</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-[var(--mc-line)] px-6 bg-[var(--mc-panel)]">
              <div className="flex gap-1" role="tablist" aria-label="Task detail tabs">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    aria-controls={`tabpanel-${tab.id}`}
                    className={`relative py-3 px-4 text-[13px] font-semibold tracking-wide transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mc-green)] focus-visible:ring-offset-1 rounded-t-lg ${
                      activeTab === tab.id
                        ? "text-[var(--mc-text)]"
                        : "text-[var(--mc-text-muted)] hover:text-[var(--mc-text)]"
                    }`}
                  >
                    <span className="mr-2" aria-hidden="true">{tab.icon}</span>
                    {tab.label}
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="activeTabIndicator"
                        className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--mc-green)]"
                        transition={{ duration: 0.14, ease: [0.25, 0.1, 0.25, 1] }}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content - scrollable */}
            <div className="flex-1 overflow-y-auto bg-[var(--mc-bg)]">
              <AnimatePresence mode="wait">
                {activeTab === "messages" && (
                  <motion.div
                    key="messages"
                    variants={contentVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{ duration: 0.12 }}
                    role="tabpanel"
                    id="tabpanel-messages"
                    aria-labelledby="tab-messages"
                  >
                    <TaskMessages task={task} agents={agents} />
                  </motion.div>
                )}

                {activeTab === "docs" && (
                  <motion.div
                    key="docs"
                    variants={contentVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{ duration: 0.12 }}
                    role="tabpanel"
                    id="tabpanel-docs"
                    aria-labelledby="tab-docs"
                  >
                    <TaskDocuments task={task} />
                  </motion.div>
                )}

                {activeTab === "activity" && (
                  <motion.div
                    key="activity"
                    variants={contentVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{ duration: 0.12 }}
                    role="tabpanel"
                    id="tabpanel-activity"
                    aria-labelledby="tab-activity"
                  >
                    <TaskActivity task={task} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
