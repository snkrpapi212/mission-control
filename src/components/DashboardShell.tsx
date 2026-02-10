"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AgentSidebar } from "@/components/AgentSidebar";
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
import { Bell, Moon, Plus, Search, Sparkles, Sun } from "lucide-react";
import type { TaskStatus } from "@/types";

export function DashboardShell() {
  const agentsRaw = useAgentsLive();
  const tasksByStatus = useTasksByStatusLive();
  const activitiesRaw = useActivitiesLive(24);

  const agents = useMemo(() => agentsRaw || [], [agentsRaw]);
  const activities = useMemo(() => activitiesRaw || [], [activitiesRaw]);
  const loading = agentsRaw === undefined || activitiesRaw === undefined;

  const [selectedTask, setSelectedTask] = useState<import("../../convex/_generated/dataModel").Doc<"tasks"> | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [mobileTab, setMobileTab] = useState<"board" | "agents" | "feed" | "filters" | "more">("board");
  const [theme, setTheme] = useState<"light" | "dark">("light");
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
    theme: "light",
  });
  const { moveTask } = useOptimisticUI();

  useEffect(() => {
    const saved = (localStorage.getItem("mc-theme") as "light" | "dark" | null) || "light";
    setTheme(saved);
    document.documentElement.setAttribute("data-theme", saved);
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("mc-theme", next);
    document.documentElement.setAttribute("data-theme", next);
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

      <header 
        className="sticky top-0 z-30 border-b border-[var(--mc-line)] bg-[color:color-mix(in_srgb,var(--mc-panel)_92%,white_8%)]" 
        style={{ backdropFilter: "blur(10px)" }}
        role="banner"
      >
        <div className="mx-auto flex h-[72px] max-w-[1800px] items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <div className="grid h-8 w-8 place-items-center rounded-lg border border-[var(--mc-line)] bg-[var(--mc-card)] text-[var(--mc-amber)]">
              <Sparkles size={14} />
            </div>
            <h1 className="text-[16px] font-semibold tracking-[0.08em]">Mission Control</h1>
            <span className="mc-chip px-2 py-0.5 text-[11px]">Live Ops</span>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-10 text-center">
              <div>
                <div className="text-[24px] leading-none font-semibold">{activeAgentCount}</div>
                <div className="mc-subtle mt-1 text-[10px] uppercase tracking-[0.2em]">Agents Active</div>
              </div>
              <div>
                <div className="text-[24px] leading-none font-semibold">{taskCount}</div>
                <div className="mc-subtle mt-1 text-[10px] uppercase tracking-[0.2em]">Tasks In Queue</div>
              </div>
            </div>
            <div className="relative">
              <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--mc-text-soft)]" />
              <input placeholder="Search tasks, agents..." className="mc-input h-9 w-[260px] rounded-md pl-9 pr-3 text-xs" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="mc-input hidden sm:inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs">Docs</button>
            <button className="mc-input relative inline-flex h-9 w-9 items-center justify-center rounded-md text-xs" aria-label="Notifications">
              <Bell size={14} />
              <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] text-white" style={{ background: "var(--mc-accent-red)" }}>3</span>
            </button>
            <button onClick={toggleTheme} className="mc-input inline-flex h-9 w-9 items-center justify-center rounded-md text-xs" aria-label="Toggle theme">
              {theme === "light" ? <Moon size={14} /> : <Sun size={14} />}
            </button>
            <DashboardCustomization
              prefs={customizationPrefs}
              onPrefsChange={setCustomizationPrefs}
            />
            <div className="hidden md:block">
              <ConnectionStatus />
            </div>
            <button type="button" onClick={() => setShowCreateModal(true)} className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-semibold" style={{ borderColor: "var(--mc-border)", background: "var(--mc-text)", color: "var(--mc-bg)" }}>
              <Plus size={13} />
              New Task
            </button>
          </div>
        </div>
      </header>

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
            <div className="mb-3 flex items-center justify-between xl:hidden">
              <div className="inline-flex rounded-lg border p-0.5 text-xs" style={{ borderColor: "var(--mc-border)", background: "var(--mc-card)" }}>
                <button className={`rounded-md px-3 py-1.5 ${mobileTab === "board" ? "font-semibold" : "mc-muted"}`} onClick={() => setMobileTab("board")}>Board</button>
                <button className={`rounded-md px-3 py-1.5 ${mobileTab === "agents" ? "font-semibold" : "mc-muted"}`} onClick={() => setMobileTab("agents")}>Agents</button>
                <button className={`rounded-md px-3 py-1.5 ${mobileTab === "feed" ? "font-semibold" : "mc-muted"}`} onClick={() => setMobileTab("feed")}>Feed</button>
              </div>
              <div className="text-xs mc-subtle">Updated {timeAgoString}</div>
            </div>

            {mobileTab === "board" ? (
              <div>
                <div className="mb-3 flex items-center justify-between text-xs mc-subtle">
                  <span>Updated {timeAgoString}</span>
                </div>
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
              <div className="xl:hidden space-y-2">
                {agents.map((agent) => {
                  const taskTitle = agent.currentTaskId ? currentTaskById.get(agent.currentTaskId) : undefined;
                  const online = Date.now() - agent.lastHeartbeat < 2 * 60 * 1000;
                  return (
                    <button
                      key={agent._id}
                      onClick={() => {
                        const t = flattenedTasks.find((x) => x._id === agent.currentTaskId);
                        if (t) setSelectedTask(t);
                      }}
                      className="w-full rounded-[var(--r-card)] border border-[var(--mc-line)] bg-[var(--mc-card)] px-3 py-3 text-left"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[16px]">{agent.emoji}</span>
                          <span className="text-[14px] font-semibold text-[var(--mc-text)]">{agent.name}</span>
                        </div>
                        <span className={`inline-block h-2.5 w-2.5 rounded-full ${online ? "bg-[var(--mc-green)]" : "bg-[var(--mc-text-soft)]"}`} />
                      </div>
                      <p className="mt-1 text-[12px] text-[var(--mc-text-soft)]">{agent.status.toUpperCase()} • {online ? "ONLINE" : "OFFLINE"}</p>
                      <p className="mt-1 truncate text-[12px] text-[var(--mc-text-muted)]">{taskTitle || "No active task"}</p>
                    </button>
                  );
                })}
              </div>
            ) : null}
            {mobileTab === "feed" ? <div className="xl:hidden"><ActivityFeed activities={activities} loading={loading} compact /></div> : null}
            {mobileTab === "filters" ? (
              <div className="xl:hidden">
                <SmartFilters agents={agents} onFiltersChange={setFilters} />
              </div>
            ) : null}
            {mobileTab === "more" ? (
              <div className="xl:hidden p-6 space-y-4">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="w-full px-4 py-3 rounded bg-[var(--mc-accent-green)] text-white font-semibold text-[13px]"
                >
                  + Create Task
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
      {showCreateModal ? <CreateTaskModal agents={agents} onClose={() => setShowCreateModal(false)} /> : null}
      
      <CommandPalette
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
