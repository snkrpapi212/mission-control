"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { Doc } from "../../convex/_generated/dataModel";
import { X, User, Circle, Clock, Briefcase, FileText, Activity } from "lucide-react";
import { useActivitiesLive } from "@/hooks/useConvexData";
import { timeAgo } from "@/lib/time";

interface AgentDetailModalProps {
  agent: Doc<"agents"> | null;
  currentTaskTitle?: string;
  onClose: () => void;
}

function isOnline(lastHeartbeat: number) {
  return Date.now() - lastHeartbeat < 2 * 60 * 1000;
}

function lastSeenLabel(lastHeartbeat: number) {
  const diffMs = Date.now() - lastHeartbeat;
  const sec = Math.floor(diffMs / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  return `${hr}h ago`;
}

export function AgentDetailModal({ agent, currentTaskTitle, onClose }: AgentDetailModalProps) {
  const activities = useActivitiesLive(80);
  if (!agent) return null;

  const statusColor = agent.status === "working" ? "bg-[var(--mc-green)]" : agent.status === "blocked" ? "bg-[var(--mc-red)]" : "bg-[var(--mc-amber)]";
  const statusLabel = agent.status === "working" ? "Working" : agent.status === "blocked" ? "Blocked" : "Idle";

  const recentOutput = activities
    .filter((a) => a.agentId === agent.agentId && a.type !== "heartbeat")
    .slice(0, 6);

  return (
    <AnimatePresence>
      {agent && (
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

          {/* Modal - Mobile optimized */}
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            transition={{ duration: 0.25, type: "spring", stiffness: 300, damping: 28 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full sm:max-w-md bg-[var(--mc-panel)] shadow-2xl overflow-y-auto border-l border-[var(--mc-line)]"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 border-b border-[var(--mc-line)] bg-[var(--mc-panel)] p-4 sm:p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-[var(--r-card)] bg-[var(--mc-panel-soft)] border border-[var(--mc-line)] flex items-center justify-center text-[var(--mc-text)]">
                  <User size={24} />
                </div>
                <div>
                  <h2 className="text-[18px] font-semibold text-[var(--mc-text)] leading-tight">
                    {agent.name}
                  </h2>
                  <p className="text-[13px] text-[var(--mc-text-muted)]">{agent.role}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-[var(--mc-line)] transition-colors text-[var(--mc-text-muted)]"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-5 space-y-5">
              {/* Status Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-[var(--r-card)] border border-[var(--mc-line)] bg-[var(--mc-card)] p-4">
                  <div className="flex items-center gap-2 text-[var(--mc-text-soft)] mb-2">
                    <Circle size={14} />
                    <span className="text-[11px] font-medium uppercase tracking-[0.02em]">Presence</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-block h-2.5 w-2.5 rounded-full ${isOnline(agent.lastHeartbeat) ? "bg-[var(--mc-green)]" : "bg-[var(--mc-text-soft)]"}`} />
                    <span className="text-[15px] font-medium text-[var(--mc-text)]">
                      {isOnline(agent.lastHeartbeat) ? "Online" : "Offline"}
                    </span>
                  </div>
                  {!isOnline(agent.lastHeartbeat) && (
                    <p className="text-[12px] text-[var(--mc-text-muted)] mt-1">
                      Last seen {lastSeenLabel(agent.lastHeartbeat)}
                    </p>
                  )}
                </div>

                <div className="rounded-[var(--r-card)] border border-[var(--mc-line)] bg-[var(--mc-card)] p-4">
                  <div className="flex items-center gap-2 text-[var(--mc-text-soft)] mb-2">
                    <Briefcase size={14} />
                    <span className="text-[11px] font-medium uppercase tracking-[0.02em]">Work State</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-block h-2.5 w-2.5 rounded-full ${statusColor}`} />
                    <span className="text-[15px] font-medium text-[var(--mc-text)]">{statusLabel}</span>
                  </div>
                </div>
              </div>

              {/* Current Task */}
              <div className="rounded-[var(--r-card)] border border-[var(--mc-line)] bg-[var(--mc-card)] p-4">
                <div className="flex items-center gap-2 text-[var(--mc-text-soft)] mb-3">
                  <FileText size={14} />
                  <span className="text-[11px] font-medium uppercase tracking-[0.02em]">Current Task</span>
                </div>
                <p className="text-[15px] text-[var(--mc-text)]">
                  {currentTaskTitle || "No active task"}
                </p>
              </div>

              {/* Session Info */}
              {agent.sessionKey && (
                <div className="rounded-[var(--r-card)] border border-[var(--mc-line)] bg-[var(--mc-card)] p-4">
                  <div className="flex items-center gap-2 text-[var(--mc-text-soft)] mb-3">
                    <Activity size={14} />
                    <span className="text-[11px] font-medium uppercase tracking-[0.02em]">Session</span>
                  </div>
                  <code className="block text-[12px] text-[var(--mc-text-muted)] bg-[var(--mc-panel-soft)] rounded-lg p-3 break-all font-mono">
                    {agent.sessionKey}
                  </code>
                </div>
              )}

              {/* Recent Output / Feedback */}
              <div className="rounded-[var(--r-card)] border border-[var(--mc-line)] bg-[var(--mc-card)] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-[13px] font-semibold text-[var(--mc-text)]">Recent output</p>
                  <span className="text-[11px] text-[var(--mc-text-soft)]">{recentOutput.length} items</span>
                </div>

                {recentOutput.length === 0 ? (
                  <p className="text-[13px] text-[var(--mc-text-soft)]">No recent output yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {recentOutput.map((item) => (
                      <li key={item._id} className="rounded-[var(--r-tile)] border border-[var(--mc-line)] bg-[var(--mc-panel-soft)] px-3 py-2">
                        <div className="mb-1 flex items-center justify-between gap-2">
                          <span className="text-[11px] text-[var(--mc-text-soft)]">{item.type}</span>
                          <span className="text-[11px] text-[var(--mc-text-soft)]">{timeAgo(item.createdAt)}</span>
                        </div>
                        <p className="line-clamp-3 text-[13px] text-[var(--mc-text)]">{item.message}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Metadata */}
              <div className="space-y-3 pt-1">
                {agent.lastHeartbeat && (
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="text-[var(--mc-text-soft)] flex items-center gap-1.5">
                      <Clock size={14} />
                      Last Heartbeat
                    </span>
                    <span className="text-[var(--mc-text)]">
                      {lastSeenLabel(agent.lastHeartbeat)}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-[var(--mc-text-soft)]">Agent ID</span>
                  <code className="text-[var(--mc-text)] font-mono">{agent.agentId}</code>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
