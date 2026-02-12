"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import type { Doc } from "../../convex/_generated/dataModel";
import { AgentDetailModal } from "@/components/AgentDetailModal";

function isOnline(lastHeartbeat: number) {
  return Date.now() - lastHeartbeat < 2 * 60 * 1000;
}

export function AgentAvatar({ name, lastHeartbeat, emoji }: { name: string, lastHeartbeat: number, emoji?: string }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const online = isOnline(lastHeartbeat);

  return (
    <div className="relative shrink-0">
      <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 ring-1 ring-zinc-950/5 dark:ring-white/10 shadow-sm`}>
        {emoji ? (
          <span className="text-lg">{emoji}</span>
        ) : (
          <span className="text-[11px] font-bold tracking-tight">{initials}</span>
        )}
      </div>
      
      {/* Presence Indicator - Static 8px dot (directive says precise 6px/8px) */}
      <span
        className={`absolute -bottom-0.5 -right-0.5 inline-block h-2 w-2 rounded-full ring-2 ring-white dark:ring-zinc-900 ${
          online
            ? "bg-emerald-500"
            : "bg-zinc-300 dark:bg-zinc-700"
        }`}
      />
    </div>
  );
}

export function RoleBadge({ role, level }: { role: string, level?: string }) {
  // Map levels to colors
  const levelColors: Record<string, string> = {
    lead: "bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-500/10 dark:text-violet-400 dark:ring-violet-500/20",
    intern: "bg-orange-50 text-orange-700 ring-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:ring-orange-500/20",
    specialist: "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/20",
  };

  const colorClass = levelColors[level?.toLowerCase() || ""] || "bg-zinc-50 text-zinc-600 ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:ring-zinc-700";

  return (
    <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ring-1 ring-inset ${colorClass}`}>
      {role}
    </span>
  );
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
      <aside className="hidden xl:flex min-h-[calc(100vh-var(--h-topbar))] flex-col border-r border-zinc-200 dark:border-zinc-800">
        <div className="px-4 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Agents</h2>
        </div>

        <ul className="flex-1 overflow-y-auto p-2 space-y-1">
          {loading
            ? Array.from({ length: 7 }).map((_, idx) => (
                <li key={`skeleton-${idx}`}>
                  <div className="h-12 w-full animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800/50" />
                </li>
              ))
            : agents.map((agent) => {
                const currentTask = agent.currentTaskId
                  ? taskTitles.get(agent.currentTaskId)
                  : undefined;
                const isExpanded = expandedAgentId === agent._id;
                const online = isOnline(agent.lastHeartbeat);
                
                return (
                  <li key={agent._id}>
                    <div
                      className={`group w-full rounded-lg px-2 py-2 text-left transition-all duration-200 cursor-pointer ${
                        isExpanded 
                          ? "bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-zinc-950/5 dark:ring-white/10" 
                          : "hover:bg-zinc-100/50 dark:hover:bg-zinc-900/50"
                      }`}
                      onClick={() => setExpandedAgentId(isExpanded ? null : agent._id)}
                    >
                      <div className="flex items-center gap-3">
                        <AgentAvatar 
                          name={agent.name} 
                          lastHeartbeat={agent.lastHeartbeat}
                          emoji={agent.emoji}
                        />

                        <div className="min-w-0 flex-1">
                          <p className={`truncate text-sm font-semibold tracking-tight ${isExpanded ? "text-zinc-900 dark:text-zinc-50" : "text-zinc-700 dark:text-zinc-300"}`}>
                            {agent.name}
                          </p>
                          <div className="mt-0.5">
                            <RoleBadge role={agent.role} level={agent.level} />
                          </div>
                        </div>

                        {online && agent.status === "working" && (
                          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        )}
                      </div>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="mt-3 space-y-3 overflow-hidden"
                          >
                            {currentTask && (
                              <div className="rounded-md border border-zinc-100 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50 p-2">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Active Task</p>
                                <p className="mt-1 text-[12px] leading-snug text-zinc-600 dark:text-zinc-400 font-medium line-clamp-2">
                                  {currentTask}
                                </p>
                              </div>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedAgent(agent);
                              }}
                              className="w-full rounded-md bg-zinc-900 dark:bg-zinc-50 py-1.5 text-[11px] font-semibold text-white dark:text-zinc-900 hover:opacity-90 transition-opacity shadow-sm"
                            >
                              View Profile
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
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
