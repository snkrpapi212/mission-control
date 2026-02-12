"use client";

import { useMemo, useState } from "react";
import { User, ChevronDown, ChevronRight, Activity, Zap, Shield, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import type { Doc } from "../../convex/_generated/dataModel";
import { PanelHeader, Chip } from "@/components/MissionControlPrimitives";
import { AgentDetailModal } from "@/components/AgentDetailModal";

function RoleBadge({ level }: { level: Doc<"agents">["level"] }) {
  const config = {
    lead: { label: "LEAD", icon: Shield, class: "text-[var(--mc-amber)] bg-[var(--mc-amber-soft)] border-[var(--mc-amber)]/30 shadow-[0_2px_10px_-3px_rgba(199,151,70,0.3)]" },
    intern: { label: "INT", icon: HelpCircle, class: "text-[var(--mc-text-soft)] bg-[var(--mc-panel-soft)] border-[var(--mc-line)]" },
    specialist: { label: "SPC", icon: Zap, class: "text-[var(--mc-green)] bg-[var(--mc-green-soft)] border-[var(--mc-green)]/30" },
  };

  const { label, icon: Icon, class: className } = config[level] || config.specialist;

  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-black tracking-tighter border ${className}`}>
      <Icon size={9} strokeWidth={3} />
      {label}
    </span>
  );
}

function AgentAvatar({ name, emoji, status, lastHeartbeat }: { name: string, emoji: string, status: string, lastHeartbeat: number }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const colors = [
    "from-blue-500 to-indigo-600",
    "from-purple-500 to-pink-600",
    "from-emerald-500 to-teal-600",
    "from-orange-500 to-red-600",
    "from-pink-500 to-rose-600",
    "from-violet-500 to-purple-600",
    "from-cyan-500 to-blue-600",
  ];
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const gradient = colors[Math.abs(hash) % colors.length];
  const online = isOnline(lastHeartbeat);

  return (
    <div className="relative shrink-0">
      <div className={`flex h-12 w-12 items-center justify-center rounded-[14px] bg-gradient-to-br ${gradient} text-white shadow-sm ring-2 ring-white dark:ring-[var(--mc-panel)] transition-transform duration-300`}>
        <span className="text-[13px] font-black tracking-tight drop-shadow-sm">{initials}</span>
        <span className="absolute -top-1.5 -right-1.5 text-[14px] drop-shadow-md">{emoji}</span>
      </div>
      
      {/* Presence Indicator */}
      <span
        className={`absolute -bottom-0.5 -right-0.5 inline-block h-3.5 w-3.5 rounded-full border-2 border-[var(--mc-panel)] ${
          online
            ? "bg-[var(--mc-green)]"
            : "bg-[var(--mc-text-soft)]"
        }`}
      />
      
      {/* Working Pulse Effect */}
      {status === "working" && online && (
        <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-[var(--mc-green)] animate-ping opacity-75" />
      )}
    </div>
  );
}

function workStatusConfig(status: Doc<"agents">["status"]) {
  if (status === "working") return { label: "Working", color: "var(--mc-green)", bg: "var(--mc-green-soft)" };
  if (status === "blocked") return { label: "Blocked", color: "var(--mc-red)", bg: "var(--mc-red-soft)" };
  return { label: "Idle", color: "var(--mc-text-muted)", bg: "var(--mc-panel-soft)" };
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
                const isActive = agent.status === "working" && isOnline(agent.lastHeartbeat);
                
                const roleBorders: Record<Doc<"agents">["level"], string> = {
                  lead: "border-l-[3px] border-l-[var(--mc-amber)]",
                  specialist: "border-l-[3px] border-l-[var(--mc-green)]",
                  intern: "border-l-[3px] border-l-[var(--mc-text-soft)]/20",
                };

                return (
                  <li
                    key={agent._id}
                    className={`border-b border-[var(--mc-line)] last:border-b-0 transition-opacity duration-300 ${!isActive && !isExpanded ? "opacity-75 hover:opacity-100" : "opacity-100"}`}
                  >
                    <button
                      onClick={() => setExpandedAgentId(isExpanded ? null : agent._id)}
                      className={`group w-full px-5 py-6 text-left transition-all duration-200 ${
                        isExpanded ? "bg-[var(--mc-panel-soft)]" : "hover:bg-[var(--mc-panel-soft)]/50"
                      } ${roleBorders[agent.level]}`}
                    >
                      <div className="flex items-center gap-4">
                        <AgentAvatar 
                          name={agent.name} 
                          emoji={agent.emoji} 
                          status={agent.status} 
                          lastHeartbeat={agent.lastHeartbeat} 
                        />

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="truncate text-[15px] font-bold tracking-tight text-[var(--mc-text)]">
                              {agent.name}
                            </p>
                            <RoleBadge level={agent.level} />
                          </div>
                          <p className="truncate text-[12px] font-semibold text-[var(--mc-text-muted)] opacity-80 uppercase tracking-wide">
                            {agent.role}
                          </p>
                        </div>

                        <div className={`transition-transform duration-300 ${isExpanded ? "rotate-180 text-[var(--mc-green)]" : "text-[var(--mc-text-soft)]"}`}>
                          <ChevronDown size={18} />
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span 
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-sm transition-all ${isActive ? "scale-105" : ""}`}
                            style={{ 
                              color: status.color, 
                              backgroundColor: status.bg, 
                              borderColor: `${status.color}33` 
                            }}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "animate-pulse" : ""}`} style={{ backgroundColor: status.color }} />
                            {status.label}
                          </span>
                          
                          <span className="text-[11px] font-bold text-[var(--mc-text-soft)] uppercase tracking-tighter">
                            {isOnline(agent.lastHeartbeat) ? (
                              <span className="flex items-center gap-1 text-[var(--mc-green)]">
                                <Activity size={10} /> Live
                              </span>
                            ) : lastSeenLabel(agent.lastHeartbeat)}
                          </span>
                        </div>
                      </div>
                      
                      {currentTask && (
                        <div className={`mt-3 flex items-start gap-2 rounded-xl bg-[var(--mc-card)] p-3 border shadow-sm group-hover:border-[var(--mc-line-strong)] transition-all ${isActive ? "border-[var(--mc-green)]/30" : "border-[var(--mc-line)]"}`}>
                          <div className={`${isActive ? "text-[var(--mc-green)]" : "text-[var(--mc-amber)]"} mt-0.5`}>
                            <Zap size={12} fill="currentColor" />
                          </div>
                          <p className="text-[12px] leading-tight font-bold text-[var(--mc-text-soft)] line-clamp-1">
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
