"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, ChevronDown, Activity, Bot } from "lucide-react";

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

function workStatusLabel(status: Doc<"agents">["status"]) {
  if (status === "working") return "Working";
  if (status === "blocked") return "Blocked";
  return "Idle";
}

function isOnline(lastHeartbeat: number) {
  // Consider online if heartbeat seen in the last 2 minutes
  return Date.now() - lastHeartbeat < 2 * 60 * 1000;
}

function lastSeenLabel(lastHeartbeat: number): string {
  const diffMs = Date.now() - lastHeartbeat;
  const sec = Math.floor(diffMs / 1000);
  if (sec < 60) return "Just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const days = Math.floor(hr / 24);
  return `${days}d ago`;
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
      <aside className="hidden xl:flex min-h-[calc(100vh-var(--h-topbar))] flex-col border-r border-[var(--mc-line)] bg-[var(--mc-panel)]/80 backdrop-blur-sm">
        <PanelHeader 
          title="Agents" 
          count={agents.length} 
          icon={<Bot size={16} />}
        />

        <ul className="overflow-y-auto flex-1">
          {loading
            ? Array.from({ length: 7 }).map((_, idx) => (
                <li
                  key={`skeleton-${idx}`}
                  className="border-b border-[var(--mc-line)] p-4"
                >
                  <div className="h-20 rounded-xl bg-[var(--mc-panel-soft)] animate-pulse" />
                </li>
              ))
            : agents.map((agent, index) => {
                const currentTask = agent.currentTaskId
                  ? taskTitles.get(agent.currentTaskId)
                  : undefined;
                const isExpanded = expandedAgentId === agent._id;
                const online = isOnline(agent.lastHeartbeat);

                return (
                  <li
                    key={agent._id}
                    className="border-b border-[var(--mc-line)] last:border-b-0"
                  >
                    <motion.button
                      onClick={() => setExpandedAgentId(isExpanded ? null : agent._id)}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      whileHover={{ backgroundColor: "var(--mc-panel-soft)" }}
                      className="w-full px-4 py-3.5 text-left transition-all duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative shrink-0">
                          <motion.div 
                            whileHover={{ scale: 1.05 }}
                            className="grid h-10 w-10 place-items-center rounded-xl border border-[var(--mc-line)] bg-[var(--mc-card)] text-[var(--mc-text-muted)] shadow-sm"
                          >
                            <User size={18} />
                          </motion.div>
                          {/* Presence indicator */}
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className={`absolute -bottom-0.5 -right-0.5 inline-block h-3 w-3 rounded-full border-2 border-[var(--mc-panel)] ${
                              online
                                ? "bg-[var(--mc-green)]"
                                : "bg-[var(--mc-text-soft)]"
                            }`}
                            aria-label={online ? "Online" : "Offline"}
                          
                          >
                            {agent.status === "working" && online && (
                              <span className="absolute inset-0 rounded-full bg-[var(--mc-green)] animate-ping opacity-75" />
                            )}
                          </motion.span>
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-[15px] font-semibold leading-tight text-[var(--mc-text)]">
                              {agent.name}
                            </p>
                            <Chip className="bg-[var(--mc-panel-soft)] border-[var(--mc-line)]">{roleBadge(agent.level)}</Chip>
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
                          <ChevronDown size={16} />
                        </motion.div>
                      </div>

                      <div className="mt-2.5 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-[13px] font-medium">
                          <span
                            className={`inline-block h-2 w-2 rounded-full ${workStatusClass(
                              agent.status
                            )}`}
                          />
                          <span className="text-[var(--mc-text)]">{workStatusLabel(agent.status)}</span>
                          <span className="text-[var(--mc-text-soft)]">·</span>
                          <span className={online ? "text-[var(--mc-green)]" : "text-[var(--mc-text-soft)]"}>
                            {online ? "Online" : lastSeenLabel(agent.lastHeartbeat)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-2">
                        <p className="truncate text-[12px] text-[var(--mc-text-muted)] flex items-center gap-1">
                          <Activity size={12} />
                          {currentTask ? currentTask : "No active task"}
                        </p>
                      </div>
                    </motion.button>

                    {/* Expanded detail section */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden border-t border-[var(--mc-line)] bg-[var(--mc-panel-soft)]/50"
                        >
                          <div className="px-4 py-3 space-y-3">
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedAgent(agent);
                              }}
                              className="w-full rounded-xl border border-[var(--mc-line)] px-3 py-2.5 text-[13px] font-medium text-[var(--mc-text)] bg-[var(--mc-card)] hover:bg-[var(--mc-panel)] hover:border-[var(--mc-line-strong)] hover:shadow-sm transition-all duration-200"
                            >
                              View Full Profile
                            </motion.button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </li>
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
