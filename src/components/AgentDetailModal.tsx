"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { Doc } from "../../convex/_generated/dataModel";

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
  if (!agent) return null;

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
            className="fixed inset-0 z-40 bg-black/40"
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-[var(--mc-panel)] shadow-lg overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 border-b border-[var(--mc-line)] bg-[var(--mc-panel-soft)] p-4 flex items-center justify-between">
              <h2 className="text-[24px] font-semibold text-[var(--mc-text)]">
                {agent.emoji} {agent.name}
              </h2>
              <button
                onClick={onClose}
                className="p-1 rounded hover:bg-[var(--mc-line)] transition-colors text-[var(--mc-text-muted)]"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-6">
              {/* Profile Info */}
              <div className="space-y-3">
                <div>
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--mc-text-muted)]">
                    Role
                  </p>
                  <p className="text-[16px] text-[var(--mc-text)]">{agent.role}</p>
                </div>

                <div>
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--mc-text-muted)]">
                    Presence
                  </p>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-block h-2.5 w-2.5 rounded-full ${
                        isOnline(agent.lastHeartbeat)
                          ? "bg-[var(--mc-green)]"
                          : "bg-[var(--mc-text-soft)]"
                      }`}
                    />
                    <span className="text-[16px] text-[var(--mc-text)] capitalize">
                      {isOnline(agent.lastHeartbeat) ? "online" : "offline"}
                    </span>
                    {!isOnline(agent.lastHeartbeat) && (
                      <span className="text-[13px] text-[var(--mc-text-soft)]">({lastSeenLabel(agent.lastHeartbeat)})</span>
                    )}
                  </div>
                </div>

                <div>
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--mc-text-muted)]">
                    Work state
                  </p>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-block h-2.5 w-2.5 rounded-full ${
                        agent.status === "working"
                          ? "bg-[var(--mc-green)]"
                          : agent.status === "blocked"
                          ? "bg-[var(--mc-red)]"
                          : "bg-[var(--mc-amber)]"
                      }`}
                    />
                    <span className="text-[16px] text-[var(--mc-text)] capitalize">
                      {agent.status}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--mc-text-muted)]">
                    Current task
                  </p>
                  <p className="text-[14px] text-[var(--mc-text)]">{currentTaskTitle || "No active task"}</p>
                </div>
              </div>

              {/* Session Info */}
              {agent.sessionKey && (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--mc-text-muted)] mb-2">
                    Session
                  </p>
                  <code className="block text-[13px] text-[var(--mc-text-soft)] bg-[var(--mc-line)] rounded p-2 break-all font-mono">
                    {agent.sessionKey}
                  </code>
                </div>
              )}

              {/* Last Heartbeat */}
              {agent.lastHeartbeat && (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--mc-text-muted)] mb-1">
                    Last Heartbeat
                  </p>
                  <p className="text-[14px] text-[var(--mc-text)]">
                    {new Date(agent.lastHeartbeat).toLocaleString()} • {lastSeenLabel(agent.lastHeartbeat)}
                  </p>
                </div>
              )}

              {/* Agent ID */}
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--mc-text-muted)] mb-1">
                  Agent ID
                </p>
                <code className="text-[13px] text-[var(--mc-text-soft)] font-mono break-all">
                  {agent.agentId}
                </code>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
