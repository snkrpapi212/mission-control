"use client";

import { useMemo, useState } from "react";
import { User, ChevronDown, ChevronRight, Activity, Zap, Shield, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import type { Doc } from "../../convex/_generated/dataModel";
import { PanelHeader, Chip } from "@/components/MissionControlPrimitives";
import { AgentDetailModal } from "@/components/AgentDetailModal";

function RoleBadge({ level }: { level: Doc<"agents">["level"] }) {
  const config = {
    lead: { label: "LEAD", icon: Shield, class: "text-[var(--mc-amber)] bg-[var(--mc-amber-soft)] border-[var(--mc-amber)]/20" },
    intern: { label: "INT", icon: HelpCircle, class: "text-[var(--mc-text-soft)] bg-[var(--mc-panel-soft)] border-[var(--mc-line)]" },
    specialist: { label: "SPC", icon: Zap, class: "text-[var(--mc-green)] bg-[var(--mc-green-soft)] border-[var(--mc-green)]/20" },
  };

  const { label, icon: Icon, class: className } = config[level] || config.specialist;

  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold border ${className}`}>
      <Icon size={10} strokeWidth={3} />
      {label}
    </span>
  );
}

function workStatusConfig(status: Doc<"agents">["status"]) {
  if (status === "working") return { label: "Working", color: "var(--mc-green)", bg: "var(--mc-green-soft)" };
  if (status === "blocked") return { label: "Blocked", color: "var(--mc-red)", bg: "var(--mc-red-soft)" };
  return { label: "Idle", color: "var(--mc-amber)", bg: "var(--mc-amber-soft)" };
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
      <aside className="hidden xl:flex min-h-[calc(100vh-var(--h-topbar))] flex-col border-r border-[var(--mc-line)] bg-[var(--mc-panel)]">
        <PanelHeader title="Agents" count={agents.length} />

        <ul className="overflow-y-auto">
          {loading
            ? Array.from({ length: 7 }).map((_, idx) => (
                <li
                  key={`skeleton-${idx}`}
                  className="border-b border-[var(--mc-line)] p-4"
                >
                  <div className="mc-card h-20 animate-pulse" />
                </li>
              ))
            : agents.map((agent) => {
                const currentTask = agent.currentTaskId
                  ? taskTitles.get(agent.currentTaskId)
                  : undefined;
                const isExpanded = expandedAgentId === agent._id;
                const status = workStatusConfig(agent.status);

                return (
                  <li
                    key={agent._id}
                    className="border-b border-[var(--mc-line)] last:border-b-0"
                  >
                    <button
                      onClick={() => setExpandedAgentId(isExpanded ? null : agent._id)}
                      className={`group w-full px-4 py-4 text-left transition-all duration-200 ${
                        isExpanded ? "bg-[var(--mc-panel-soft)]" : "hover:bg-[var(--mc-panel-soft)]/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className={`grid h-10 w-10 place-items-center rounded-xl border transition-all duration-200 ${
                            isExpanded 
                              ? "border-[var(--mc-green)] bg-[var(--mc-green-soft)] text-[var(--mc-green)]" 
                              : "border-[var(--mc-line)] bg-[var(--mc-panel-soft)] text-[var(--mc-text-soft)] group-hover:border-[var(--mc-line-strong)]"
                          }`}>
                            <User size={20} strokeWidth={isExpanded ? 2.5 : 2} />
                          </div>
                          
                          {/* Presence Indicator */}
                          <span
                            className={`absolute -bottom-0.5 -right-0.5 inline-block h-3.5 w-3.5 rounded-full border-2 border-[var(--mc-panel)] ${
                              isOnline(agent.lastHeartbeat)
                                ? "bg-[var(--mc-green)]"
                                : "bg-[var(--mc-text-soft)]"
                            }`}
                          />
                          
                          {/* Working Pulse Effect */}
                          {agent.status === "working" && isOnline(agent.lastHeartbeat) && (
                            <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-[var(--mc-green)] animate-ping opacity-75" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="truncate text-[14px] font-bold tracking-tight text-[var(--mc-text)]">
                              {agent.name}
                            </p>
                            <RoleBadge level={agent.level} />
                          </div>
                          <p className="truncate text-[12px] font-medium text-[var(--mc-text-muted)]">
                            {agent.role}
                          </p>
                        </div>

                        <div className={`transition-transform duration-200 ${isExpanded ? "rotate-180 text-[var(--mc-green)]" : "text-[var(--mc-text-soft)]"}`}>
                          <ChevronDown size={16} />
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span 
                            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold border"
                            style={{ 
                              color: status.color, 
                              backgroundColor: status.bg, 
                              borderColor: `${status.color}33` 
                            }}
                          >
                            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: status.color }} />
                            {status.label}
                          </span>
                          
                          <span className="text-[11px] font-medium text-[var(--mc-text-soft)]">
                            {isOnline(agent.lastHeartbeat) ? (
                              <span className="flex items-center gap-1 text-[var(--mc-green)]">
                                <Activity size={10} /> Online
                              </span>
                            ) : lastSeenLabel(agent.lastHeartbeat)}
                          </span>
                        </div>
                      </div>
                      
                      {currentTask && (
                        <div className="mt-2.5 flex items-start gap-1.5 rounded-lg bg-[var(--mc-card)]/50 border border-[var(--mc-line)]/50 p-2 group-hover:border-[var(--mc-line)] transition-colors">
                          <div className="mt-0.5 text-[var(--mc-green)]">
                            <Zap size={10} fill="currentColor" />
                          </div>
                          <p className="text-[11px] leading-relaxed font-medium text-[var(--mc-text-soft)] line-clamp-1">
                            {currentTask}
                          </p>
                        </div>
                      )}
                    </button>

                    {/* Expanded detail section */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden bg-[var(--mc-panel-soft)]/30"
                        >
                          <div className="px-4 pb-4 pt-1 space-y-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedAgent(agent);
                              }}
                              className="w-full rounded-xl border border-[var(--mc-line)] px-3 py-2 text-[12px] font-bold text-[var(--mc-text)] bg-[var(--mc-card)] hover:bg-[var(--mc-panel)] hover:border-[var(--mc-line-strong)] hover:shadow-sm transition-all"
                            >
                              View Full Profile
                            </button>
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
