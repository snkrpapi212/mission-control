"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import type { Doc } from "../../convex/_generated/dataModel";
import { AgentDetailModal } from "@/components/AgentDetailModal";

function isOnline(lastHeartbeat: number) {
  return Date.now() - lastHeartbeat < 2 * 60 * 1000;
}

function AgentAvatar({ name, lastHeartbeat }: { name: string, lastHeartbeat: number }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const online = isOnline(lastHeartbeat);

  return (
    <div className="relative shrink-0">
      <div className={`flex h-8 w-8 items-center justify-center rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700`}>
        <span className="text-[11px] font-medium">{initials}</span>
      </div>
      
      {/* Presence Indicator - Static dot */}
      <span
        className={`absolute -bottom-0.5 -right-0.5 inline-block h-2 w-2 rounded-full ring-2 ring-white dark:ring-zinc-950 ${
          online
            ? "bg-emerald-500"
            : "bg-zinc-300 dark:bg-zinc-700"
        }`}
      />
    </div>
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
      <aside className="hidden xl:flex min-h-[calc(100vh-var(--h-topbar))] flex-col">
        <div className="px-4 py-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Agents</h2>
        </div>

        <ul className="flex-1 overflow-y-auto">
          {loading
            ? Array.from({ length: 7 }).map((_, idx) => (
                <li key={`skeleton-${idx}`} className="px-2 py-1">
                  <div className="h-10 w-full animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
                </li>
              ))
            : agents.map((agent) => {
                const currentTask = agent.currentTaskId
                  ? taskTitles.get(agent.currentTaskId)
                  : undefined;
                const isExpanded = expandedAgentId === agent._id;
                const online = isOnline(agent.lastHeartbeat);
                
                return (
                  <li key={agent._id} className="px-2 py-0.5">
                    <button
                      onClick={() => setExpandedAgentId(isExpanded ? null : agent._id)}
                      className={`group w-full rounded px-2 py-1.5 text-left transition-colors ${
                        isExpanded 
                          ? "bg-white dark:bg-zinc-800 shadow-sm ring-1 ring-black/5 dark:ring-white/10" 
                          : "hover:bg-zinc-100 dark:hover:bg-zinc-800/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <AgentAvatar 
                          name={agent.name} 
                          lastHeartbeat={agent.lastHeartbeat} 
                        />

                        <div className="min-w-0 flex-1">
                          <p className={`truncate text-sm font-medium tracking-tight ${isExpanded ? "text-zinc-900 dark:text-zinc-50" : "text-zinc-600 dark:text-zinc-400"}`}>
                            {agent.name}
                          </p>
                          <p className="truncate text-[11px] text-zinc-500">
                            {agent.role}
                          </p>
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
                            className="mt-2 space-y-2 overflow-hidden"
                          >
                            {currentTask && (
                              <div className="rounded border border-zinc-100 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-2 py-1.5">
                                <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">Current Task</p>
                                <p className="mt-0.5 text-[12px] leading-tight text-zinc-700 dark:text-zinc-300 line-clamp-2">
                                  {currentTask}
                                </p>
                              </div>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedAgent(agent);
                              }}
                              className="w-full rounded bg-zinc-900 dark:bg-zinc-50 py-1 text-[11px] font-medium text-white dark:text-zinc-900 hover:opacity-90 transition-opacity"
                            >
                              View Profile
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </button>
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
