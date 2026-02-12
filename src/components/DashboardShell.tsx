"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AgentSidebar } from "@/components/AgentSidebar";
import { AgentDetailModal } from "@/components/AgentDetailModal";
import { ActivityFeed } from "@/components/ActivityFeed";
import { KanbanBoard } from "@/components/KanbanBoard";
import { TaskDetailModal } from "@/components/TaskDetailModal";
import { CreateTaskModal } from "@/components/CreateTaskModal";
import { ToastContainer } from "@/components/Toast";
import { ConnectionStatus } from "@/components/ConnectionStatus";
import { CommandPalette } from "@/components/CommandPalette";
import {
  useActivitiesLive,
  useAgentsLive,
  useTasksByStatusLive,
} from "@/hooks/useConvexData";
import { useOptimisticUI } from "@/hooks/useOptimisticUI";
import { SmartFilters, type FilterState } from "@/components/SmartFilters";
import { DashboardCustomization, type CustomizationPrefs } from "@/components/DashboardCustomization";
import { MobileNav } from "@/components/MobileNav";
import { Header } from "@/components/Header";
import type { TaskStatus } from "@/types";

export function DashboardShell() {
  const agentsRaw = useAgentsLive();
  const tasksByStatus = useTasksByStatusLive();
  const activitiesRaw = useActivitiesLive(24);

  const agents = useMemo(() => agentsRaw || [], [agentsRaw]);
  const activities = useMemo(() => activitiesRaw || [], [activitiesRaw]);
  const loading = agentsRaw === undefined || activitiesRaw === undefined;

  const [selectedTask, setSelectedTask] = useState<import("../../convex/_generated/dataModel").Doc<"tasks"> | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<import("../../convex/_generated/dataModel").Doc<"agents"> | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [mobileTab, setMobileTab] = useState<"board" | "agents" | "feed" | "more">("board");
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof document === "undefined") return "light";
    return (document.documentElement.getAttribute("data-theme") as "light" | "dark") || "light";
  });
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [filters, setFilters] = useState<FilterState>({
    statuses: [],
    agentIds: [],
    priorities: [],
  });
  const [customizationPrefs, setCustomizationPrefs] = useState<CustomizationPrefs>({
    density: "normal",
    showAgentsSidebar: true,
    showActivityFeed: true,
    showNotifications: true,
    columnOrder: ["inbox", "assigned", "in_progress", "review", "done", "blocked"],
    theme,
  });
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const { moveTask } = useOptimisticUI();

  const applyTheme = (next: "light" | "dark") => {
    setTheme(next);
    setCustomizationPrefs((prev) => ({ ...prev, theme: next }));
    localStorage.setItem("mc-theme", next);
    document.documentElement.setAttribute("data-theme", next);
  };

  useEffect(() => {
    const saved = localStorage.getItem("mc-theme");
    if (saved === "light" || saved === "dark") {
      setTheme(saved);
      setCustomizationPrefs((prev) => ({ ...prev, theme: saved }));
      document.documentElement.setAttribute("data-theme", saved);
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    applyTheme(next);
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  // Update timestamp on data changes
  useEffect(() => {
    setLastUpdated(new Date());
  }, [tasksByStatus, agentsRaw]);

  const flattenedTasks = useMemo(() => Object.values(tasksByStatus).flat(), [tasksByStatus]);
  const taskCount = flattenedTasks.length;
  const activeAgentCount = agents.filter((a) => a.status === "working").length;

  const currentTaskById = useMemo(() => {
    const map = new Map<string, string>();
    for (const t of flattenedTasks) map.set(t._id, t.title);
    return map;
  }, [flattenedTasks]);

  const timeAgoString = (() => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastUpdated.getTime()) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  })();

  const handleTaskMove = useCallback(
    (taskId: string, newStatus: TaskStatus) => {
      const task = flattenedTasks.find((t) => t._id === taskId);
      if (task) {
        moveTask(task, newStatus, {
          successMessage: `Moved to ${newStatus} ✓`,
        });
      }
    },
    [flattenedTasks, moveTask]
  );

  // Apply filters to tasks
  const filteredTasksByStatus = useMemo(() => {
    const filtered = { ...tasksByStatus };

    Object.keys(filtered).forEach((status) => {
      filtered[status as TaskStatus] = filtered[status as TaskStatus].filter((task) => {
        // Filter by status
        if (filters.statuses.length > 0 && !filters.statuses.includes(task.status as TaskStatus)) {
          return false;
        }

        // Filter by agent
        if (filters.agentIds.length > 0 && !filters.agentIds.some((id) => task.assigneeIds.includes(id))) {
          return false;
        }

        // Filter by priority
        if (filters.priorities.length > 0 && !filters.priorities.includes(task.priority)) {
          return false;
        }

        return true;
      });
    });

    return filtered;
  }, [tasksByStatus, filters]);

  return (
    <div className="min-h-screen" style={{ background: "var(--mc-bg)", color: "var(--mc-text)" }}>
      {/* Accessibility: Skip to main content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-0 focus:left-0 focus:z-50 focus:bg-[var(--mc-accent-green)] focus:text-white focus:p-2 focus:rounded"
      >
        Skip to main content
      </a>

      <Header
        activeAgentCount={activeAgentCount}
        taskCount={taskCount}
        theme={theme}
        onToggleTheme={toggleTheme}
        onLogout={handleLogout}
        onNewTask={() => setShowCreateModal(true)}
        onSearchClick={() => setIsCommandPaletteOpen(true)}
        customizationPrefs={customizationPrefs}
        onPrefsChange={(next) => {
          setCustomizationPrefs(next);
          if (next.theme !== theme) applyTheme(next.theme);
        }}
      />

      <div className="mx-auto max-w-[1800px]">
        <div className="grid grid-cols-1 xl:grid-cols-[280px_minmax(0,1fr)_360px]">
          {customizationPrefs.showAgentsSidebar && (
            <AgentSidebar agents={agents} taskTitles={currentTaskById} loading={loading} />
          )}

          <main 
            id="main-content"
            className="border-x px-3 py-3 md:px-4 md:py-4" 
            style={{ borderColor: "var(--mc-border)", background: "var(--mc-panel-2)" }}
            role="main"
          >

            {/* Mobile Sub-nav - shows Board/Feed options when in board view */}
            {mobileTab === "board" ? (
              <div key="board-view" className="mb-3">
                <div className="mb-2 px-1 text-[11px] text-[var(--mc-text-soft)]">Updated {timeAgoString}</div>
                <SmartFilters agents={agents} onFiltersChange={setFilters} />
                <KanbanBoard
                  tasksByStatus={filteredTasksByStatus}
                  agents={agents}
                  loading={loading}
                  onSelectTask={(t) => setSelectedTask(t)}
                  onTaskMove={handleTaskMove}
                />
              </div>
            ) : null}
            {mobileTab === "agents" ? (
              <div className="xl:hidden space-y-3">
                {/* Mobile Agents Header */}
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-[15px] font-semibold text-[var(--mc-text)]">Active Agents</h2>
                  <span className="text-[12px] text-[var(--mc-text-soft)]">{agents.length} total</span>
                </div>
                
                {agents.map((agent) => {
                  const taskTitle = agent.currentTaskId ? currentTaskById.get(agent.currentTaskId) : undefined;
                  const online = Date.now() - agent.lastHeartbeat < 2 * 60 * 1000;
                  const lastSeen = (() => {
                    const diff = Date.now() - agent.lastHeartbeat;
                    const min = Math.floor(diff / 60000);
                    if (min < 60) return `${min}m ago`;
                    const hr = Math.floor(min / 60);
                    if (hr < 24) return `${hr}h ago`;
                    return `${Math.floor(hr / 24)}d ago`;
                  })();
                  
                  const statusLabel = agent.status === "working" ? "Working" : agent.status === "blocked" ? "Blocked" : "Idle";
                  const statusColor = agent.status === "working" ? "bg-[var(--mc-green)]" : agent.status === "blocked" ? "bg-[var(--mc-red)]" : "bg-[var(--mc-amber)]";
                  
                  return (
                    <motion.button
                      key={agent._id}
                      onClick={() => setSelectedAgent(agent)}
                      className="w-full rounded-xl border border-[var(--mc-line)] bg-[var(--mc-card)] px-4 py-3.5 text-left active:bg-[var(--mc-panel-soft)] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="relative shrink-0">
                          <div className="h-10 w-10 rounded-lg border border-[var(--mc-line)] bg-[var(--mc-panel-soft)] flex items-center justify-center text-[var(--mc-text)]">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="8" r="4"/>
                              <path d="M4 20c0-4 4-6 8-6s8 2 8 6"/>
                            </svg>
                          </div>
                          <span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[var(--mc-card)] ${online ? "bg-[var(--mc-green)]" : "bg-[var(--mc-text-soft)]"}`} />
                        </div>
                        
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[15px] font-semibold text-[var(--mc-text)] truncate">{agent.name}</span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[var(--mc-line)] text-[var(--mc-text-soft)]">
                              {agent.level === "lead" ? "LEAD" : agent.level === "intern" ? "INT" : "SPC"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`inline-block h-2 w-2 rounded-full ${statusColor}`} />
                            <span className="text-[13px] text-[var(--mc-text)]">{statusLabel}</span>
                            <span className="text-[var(--mc-text-soft)]">·</span>
                            <span className={`text-[13px] ${online ? "text-[var(--mc-green)]" : "text-[var(--mc-text-soft)]"}`}>
                              {online ? "Online" : lastSeen}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Current Task */}
                      <div className="mt-3 pt-3 border-t border-[var(--mc-line)]">
                        <p className="text-[12px] text-[var(--mc-text-muted)] uppercase tracking-wide">Current Task</p>
                        <p className="text-[13px] text-[var(--mc-text)] truncate mt-0.5">{taskTitle || "No active task"}</p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            ) : null}
            {mobileTab === "feed" ? <div className="xl:hidden"><ActivityFeed activities={activities} loading={loading} compact /></div> : null}
            {mobileTab === "more" ? (
              <div className="xl:hidden p-6 space-y-3">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="w-full px-4 py-3 rounded bg-[var(--mc-accent-green)] text-white font-semibold text-[13px]"
                >
                  + Create Task
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full rounded border border-[var(--mc-line)] px-4 py-3 text-[13px] font-medium text-[var(--mc-text)]"
                >
                  Logout
                </button>
              </div>
            ) : null}
          </main>

          {customizationPrefs.showActivityFeed && (
            <div className="hidden xl:block">
              <ActivityFeed activities={activities} loading={loading} />
            </div>
          )}
        </div>
      </div>

      {selectedTask && <TaskDetailModal task={selectedTask} agents={agents} onClose={() => setSelectedTask(null)} />}
      {selectedAgent && (
        <AgentDetailModal
          agent={selectedAgent}
          currentTaskTitle={selectedAgent.currentTaskId ? currentTaskById.get(selectedAgent.currentTaskId) : undefined}
          onClose={() => setSelectedAgent(null)}
        />
      )}
      {showCreateModal ? <CreateTaskModal agents={agents} onClose={() => setShowCreateModal(false)} /> : null}
      
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onOpenChange={setIsCommandPaletteOpen}
        tasks={flattenedTasks}
        agents={agents}
        onSelectTask={(t) => setSelectedTask(t)}
        onSelectAgent={() => {
          /* TODO: implement agent jump */
        }}
        onCreateTask={() => setShowCreateModal(true)}
      />

      {/* Mobile Navigation */}
      <MobileNav
        activeTab={mobileTab}
        onTabChange={setMobileTab}
        onSettingsClick={() => {
          /* MobileNav will handle settings via DashboardCustomization */
        }}
      />
      
      <ToastContainer />
    </div>
  );
}
