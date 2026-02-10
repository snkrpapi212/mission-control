"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Doc } from "../../convex/_generated/dataModel";
import { PanelHeader, Chip } from "@/components/MissionControlPrimitives";
import { AgentDetailModal } from "@/components/AgentDetailModal";

function roleBadge(level: Doc<"agents">["level"]) {
  if (level === "lead") return "LEAD";
  if (level === "intern") return "INT";
  return "SPC";
}

function workStatusClass(status: Doc<"agents">["status"]) {
  if (status === "working") return "bg-[var(--mc-green)]";
  if (status === "blocked") return "bg-[var(--mc-red)]";
  return "bg-[var(--mc-amber)]";
}

function isOnline(lastHeartbeat: number) {
  // consider online if heartbeat seen in the last 2 minutes
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

interface AgentListProps {
  agents: Doc<"agents">[];
  taskTitles: Map<string, string>;
  loading?: boolean;
}

export function AgentSidebar({ agents, taskTitles, loading }: AgentListProps) {
  const [selectedAgent, setSelectedAgent] = useState<Doc<"agents"> | null>(null);
  const [expandedAgentId, setExpandedAgentId] = useState<string | null>(null);

  const selectedAgentTaskTitle = useMemo(() => {
    if (!selectedAgent?.currentTaskId) return undefined;
    return taskTitles.get(selectedAgent.currentTaskId);
  }, [selectedAgent, taskTitles]);

  return (
    <>
      <aside className="hidden xl:flex min-h-[calc(100vh-var(--h-topbar))] flex-col border-r border-[var(--mc-line)] bg-[var(--mc-panel)]">
        <PanelHeader title="Agents" count={agents.length} />

        <ul className="overflow-y-auto">
          {loading
            ? Array.from({ length: 7 }).map((_, idx) => (
                <motion.li
                  key={`skeleton-${idx}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="border-b border-[var(--mc-line)] p-4"
                >
                  <div className="mc-card h-20 animate-pulse" />
                </motion.li>
              ))
            : agents.map((agent) => {
                const currentTask = agent.currentTaskId
                  ? taskTitles.get(agent.currentTaskId)
                  : undefined;
                const isExpanded = expandedAgentId === agent._id;

                return (
                  <motion.li
                    key={agent._id}
                    layout
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-b border-[var(--mc-line)]"
                  >
                    <motion.button
                      onClick={() => setExpandedAgentId(isExpanded ? null : agent._id)}
                      className="w-full px-4 py-3 text-left hover:bg-[var(--mc-panel-soft)] transition-colors"
                      whileHover={{ backgroundColor: "var(--mc-panel-soft)" }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="grid h-10 w-10 place-items-center rounded-[var(--r-tile)] border border-[var(--mc-line)] bg-[var(--mc-panel-soft)] text-[16px]">
                            {agent.emoji || "🤖"}
                          </div>
                          {/* Presence + work pulse */}
                          <span
                            className={`absolute -bottom-1 -right-1 inline-block h-3 w-3 rounded-full border-2 border-[var(--mc-panel)] ${
                              isOnline(agent.lastHeartbeat)
                                ? "bg-[var(--mc-green)]"
                                : "bg-[var(--mc-text-soft)]"
                            }`}
                            aria-label={isOnline(agent.lastHeartbeat) ? "Online" : "Offline"}
                          />
                          {agent.status === "working" && isOnline(agent.lastHeartbeat) && (
                            <motion.div
                              className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-[var(--mc-green)]"
                              animate={{ scale: [1, 1.45, 1] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                              aria-hidden="true"
                            />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-[15px] font-semibold leading-tight text-[var(--mc-text)]">
                              {agent.name}
                            </p>
                            <Chip>{roleBadge(agent.level)}</Chip>
                          </div>
                          <p className="truncate text-[13px] text-[var(--mc-text-muted)]">
                            {agent.role}
                          </p>
                        </div>

                        <motion.div
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                          className="text-[var(--mc-text-muted)]"
                        >
                          ▼
                        </motion.div>
                      </div>

                      <div className="mt-2 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.12em] text-[var(--mc-text-muted)]">
                          <span
                            className={`inline-block h-2.5 w-2.5 rounded-full ${workStatusClass(
                              agent.status
                            )}`}
                          />
                          {agent.status}
                          <span className="text-[11px] tracking-[0.06em] text-[var(--mc-text-soft)]">
                            • {isOnline(agent.lastHeartbeat) ? "online" : `offline (${lastSeenLabel(agent.lastHeartbeat)})`}
                          </span>
                        </div>
                        <p className="truncate text-[13px] text-[var(--mc-text-soft)]">
                          {currentTask || "No active task"}
                        </p>
                      </div>
                    </motion.button>

                    {/* Expanded detail section */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden border-t border-[var(--mc-line)]"
                        >
                          <div className="px-4 py-3 space-y-3 bg-[var(--mc-panel-soft)]">
                            {/* Performance sparkline placeholder */}
                            <div>
                              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--mc-text-muted)] mb-1.5">
                                This week
                              </p>
                              <div className="h-8 rounded bg-[var(--mc-line)] flex items-end gap-0.5 p-1">
                                {[3, 5, 2, 6, 4, 8, 5].map((value, i) => (
                                  <motion.div
                                    key={i}
                                    className="flex-1 bg-[var(--mc-green)] rounded-t"
                                    initial={{ height: 0 }}
                                    animate={{ height: `${(value / 8) * 100}%` }}
                                    transition={{ duration: 0.3, delay: i * 0.05 }}
                                  />
                                ))}
                              </div>
                            </div>

                            {/* Detail modal trigger */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedAgent(agent);
                              }}
                              className="w-full rounded px-3 py-2 text-[13px] font-semibold text-[var(--mc-text)] bg-[var(--mc-button-bg)] hover:bg-[var(--mc-button-hover)] transition-colors"
                            >
                              View Full Profile
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.li>
                );
              })}
        </ul>
      </aside>

      {/* Agent detail modal */}
      <AgentDetailModal
        agent={selectedAgent}
        currentTaskTitle={selectedAgentTaskTitle}
        onClose={() => setSelectedAgent(null)}
      />
    </>
  );
}
