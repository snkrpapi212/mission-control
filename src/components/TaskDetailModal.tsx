"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Doc } from "../../convex/_generated/dataModel";
import { TaskMessages } from "@/components/TaskMessages";
import { TaskDocuments } from "@/components/TaskDocuments";
import { TaskActivity } from "@/components/TaskActivity";
import { MessageSquare, FileText, Activity, X, User, Calendar, Flag, CircleDot } from "lucide-react";
import { useOptimisticUI } from "@/hooks/useOptimisticUI";
import type { TaskStatus } from "@/types";

interface TaskDetailModalProps {
  task: Doc<"tasks"> | null;
  agents: Doc<"agents">[];
  onClose: () => void;
}

type TabType = "messages" | "docs" | "activity";

const TABS: Array<{ id: TabType; label: string; icon: React.ReactNode }> = [
  { id: "messages", label: "Messages", icon: <MessageSquare size={16} /> },
  { id: "docs", label: "Documents", icon: <FileText size={16} /> },
  { id: "activity", label: "Activity", icon: <Activity size={16} /> },
];

export function TaskDetailModal({ task, agents, onClose }: TaskDetailModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("messages");
  const { moveTask } = useOptimisticUI();

  if (!task) return null;

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!task) return;
    const newStatus = e.target.value as TaskStatus;
    moveTask(task, newStatus);
  };

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
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Modal - Mobile: full screen slide up, Desktop: side panel */}
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            transition={{ duration: 0.25, type: "spring", stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full sm:max-w-xl bg-[var(--mc-panel)] shadow-2xl overflow-hidden flex flex-col border-l border-[var(--mc-line)]"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 border-b border-[var(--mc-line)] bg-[var(--mc-panel)] px-4 sm:px-5 py-4 flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <h2 className="text-[18px] sm:text-[20px] font-semibold text-[var(--mc-text)] leading-tight">
                  {task.title}
                </h2>
                <p className="text-[12px] sm:text-[13px] text-[var(--mc-text-soft)] mt-1.5 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1">
                    <CircleDot size={12} />
                    {task.status}
                  </span>
                  <span className="text-[var(--mc-line-strong)]">·</span>
                  <span>{task.priority}</span>
                </p>
              </div>
              <button
                onClick={onClose}
                className="ml-4 p-2 rounded-lg hover:bg-[var(--mc-line)] transition-colors text-[var(--mc-text-muted)]"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Metadata Row */}
            <div className="border-b border-[var(--mc-line)] px-4 sm:px-5 py-4 bg-[var(--mc-panel-soft)] grid grid-cols-2 gap-3 text-[13px]">
              <div>
                <p className="text-[var(--mc-text-soft)] tracking-[0.02em] font-medium text-[11px] mb-1.5 flex items-center gap-1.5">
                  <User size={12} />
                  Assigned to
                </p>
                {assignee ? (
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-md bg-[var(--mc-line)] flex items-center justify-center text-[var(--mc-text)]">
                      <User size={14} />
                    </div>
                    <span className="text-[var(--mc-text)] font-medium">{assignee.name}</span>
                  </div>
                ) : (
                  <span className="text-[var(--mc-text-muted)]">Unassigned</span>
                )}
              </div>
              <div>
                <p className="text-[var(--mc-text-soft)] tracking-[0.02em] font-medium text-[11px] mb-1.5 flex items-center gap-1.5">
                  <Calendar size={12} />
                  Created
                </p>
                <span className="text-[var(--mc-text)]">{new Date(task.createdAt).toLocaleDateString()}</span>
              </div>
              <div>
                <p className="text-[var(--mc-text-soft)] tracking-[0.02em] font-medium text-[11px] mb-1.5 flex items-center gap-1.5">
                  <Flag size={12} />
                  Priority
                </p>
                <span
                  className="inline-block px-2.5 py-1 rounded-md text-[11px] font-semibold"
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
                  {task.priority}
                </span>
              </div>
              <div>
                <p className="text-[var(--mc-text-soft)] tracking-[0.02em] font-medium text-[11px] mb-1.5 flex items-center gap-1.5">
                  <CircleDot size={12} />
                  Status
                </p>
                <select
                  value={task.status}
                  onChange={handleStatusChange}
                  className="px-2.5 py-1.5 rounded-md border border-[var(--mc-line)] bg-[var(--mc-card)] text-[13px] text-[var(--mc-text)] focus:outline-none focus:ring-2 focus:ring-[var(--mc-accent-green)]"
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
            <div className="border-b border-[var(--mc-line)] px-4 sm:px-6 bg-[var(--mc-panel)]">
              <div className="flex gap-1 -mb-px">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-3 py-3 text-[13px] font-medium border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? "border-[var(--mc-accent-green)] text-[var(--mc-text)]"
                        : "border-transparent text-[var(--mc-text-muted)] hover:text-[var(--mc-text)] hover:bg-[var(--mc-panel-soft)]"
                    }`}
                  >
                    {tab.icon}
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                ))}
              </div>
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
