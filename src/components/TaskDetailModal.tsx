"use client";

import { useState } from "react";
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

export function TaskDetailModal({ task, agents, onClose }: TaskDetailModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("messages");

  if (!task) return null;

  const assignee = agents.find((a) =>
    task.assigneeIds.includes(a.agentId)
  );

  return (
    <AnimatePresence>
      {task && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40"
            style={{ backdropFilter: "blur(4px)" }}
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            transition={{ duration: 0.25, type: "spring", stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-2xl bg-[var(--mc-panel)] shadow-lg overflow-hidden flex flex-col"
          >
            {/* Header - sticky */}
            <div className="sticky top-0 z-10 border-b border-[var(--mc-line)] bg-[var(--mc-panel-soft)] px-6 py-4 flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <h2 className="text-[20px] font-semibold text-[var(--mc-text)] line-clamp-2">
                  {task.title}
                </h2>
                <p className="text-[13px] text-[var(--mc-text-soft)] mt-1">
                  {task.status} • {task.priority.toUpperCase()}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded hover:bg-[var(--mc-line)] transition-colors text-[var(--mc-text-muted)]"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Metadata Row */}
            <div className="border-b border-[var(--mc-line)] px-6 py-3 bg-[var(--mc-panel)] grid grid-cols-2 gap-4 text-[13px]">
              <div>
                <p className="text-[var(--mc-text-soft)] uppercase tracking-[0.08em] font-semibold mb-1">
                  Assigned to
                </p>
                {assignee ? (
                  <p className="text-[var(--mc-text)] flex items-center gap-2">
                    <span>{assignee.emoji}</span>
                    {assignee.name}
                  </p>
                ) : (
                  <p className="text-[var(--mc-text-soft)]">Unassigned</p>
                )}
              </div>
              <div>
                <p className="text-[var(--mc-text-soft)] uppercase tracking-[0.08em] font-semibold mb-1">
                  Created
                </p>
                <p className="text-[var(--mc-text)]">
                  {new Date(task.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-[var(--mc-text-soft)] uppercase tracking-[0.08em] font-semibold mb-1">
                  Priority
                </p>
                <span
                  className="inline-block px-2 py-1 rounded text-[12px] font-semibold"
                  style={{
                    backgroundColor:
                      task.priority === "urgent"
                        ? "var(--mc-red-soft)"
                        : task.priority === "high"
                        ? "var(--mc-amber-soft)"
                        : "var(--mc-green-soft)",
                    color:
                      task.priority === "urgent"
                        ? "var(--mc-red)"
                        : task.priority === "high"
                        ? "var(--mc-amber)"
                        : "var(--mc-green)",
                  }}
                >
                  {task.priority.toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-[var(--mc-text-soft)] uppercase tracking-[0.08em] font-semibold mb-1">
                  Status
                </p>
                <select
                  defaultValue={task.status}
                  className="px-2 py-1 rounded border border-[var(--mc-line)] bg-[var(--mc-card)] text-[13px] text-[var(--mc-text)]"
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
            <div className="border-b border-[var(--mc-line)] px-6 py-0 flex gap-6 bg-[var(--mc-panel)]">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-3 text-[13px] font-semibold uppercase tracking-[0.1em] border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-[var(--mc-accent-green)] text-[var(--mc-text)]"
                      : "border-transparent text-[var(--mc-text-muted)] hover:text-[var(--mc-text)]"
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content - scrollable */}
            <div className="flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">
                {activeTab === "messages" && (
                  <motion.div
                    key="messages"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <TaskMessages task={task} agents={agents} />
                  </motion.div>
                )}

                {activeTab === "docs" && (
                  <motion.div
                    key="docs"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <TaskDocuments task={task} />
                  </motion.div>
                )}

                {activeTab === "activity" && (
                  <motion.div
                    key="activity"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <TaskActivity task={task} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
