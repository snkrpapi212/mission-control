"use client";

import { useEffect, useMemo, useState } from "react";
import { AgentSidebar } from "@/components/AgentSidebar";
import { ActivityFeed } from "@/components/ActivityFeed";
import { KanbanBoard } from "@/components/KanbanBoard";
import { TaskDetailDrawer } from "@/components/TaskDetailDrawer";
import { CreateTaskModal } from "@/components/CreateTaskModal";
import { Chip } from "@/components/MissionControlPrimitives";
import { useActivitiesLive, useAgentsLive, useTasksByStatusLive } from "@/hooks/useConvexData";

export function DashboardShell() {
  const agents = useAgentsLive();
  const tasksByStatus = useTasksByStatusLive();
  const activities = useActivitiesLive(30);
  const loading = false;

  const [selectedTask, setSelectedTask] = useState<import("../../convex/_generated/dataModel").Doc<"tasks"> | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [mobileTab, setMobileTab] = useState<"board" | "feed">("board");
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const flattenedTasks = useMemo(() => Object.values(tasksByStatus).flat(), [tasksByStatus]);
  const currentTaskById = useMemo(() => {
    const map = new Map<string, string>();
    for (const task of flattenedTasks) map.set(task._id, task.title);
    return map;
  }, [flattenedTasks]);

  const activeAgentCount = agents.filter((a) => a.status === "working").length;

  return (
    <div className="min-h-screen bg-[var(--mc-bg)] text-[var(--mc-text)]">
      <header className="sticky top-0 z-30 border-b border-[var(--mc-line-strong)] bg-[var(--mc-panel)]">
        <div className="grid h-[var(--h-topbar)] grid-cols-[1fr_auto_1fr] items-center px-4">
          <div className="flex items-center gap-3">
            <span className="text-[20px] text-[var(--mc-amber)]">◇</span>
            <h1 className="text-[31px] font-semibold tracking-[0.08em]">MISSION CONTROL</h1>
            <Chip>SiteGPT</Chip>
          </div>

          <div className="flex items-center gap-10 text-center">
            <div>
              <p className="text-[50px] font-semibold leading-none">{activeAgentCount}</p>
              <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--mc-text-soft)]">Agents Active</p>
            </div>
            <div>
              <p className="text-[50px] font-semibold leading-none">{flattenedTasks.length}</p>
              <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--mc-text-soft)]">Tasks In Queue</p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2">
            <button className="mc-focus rounded-[12px] border border-[var(--mc-line)] bg-[var(--mc-card)] px-3 py-1.5 text-[12px]">Docs</button>
            <button
              onClick={() => setDarkMode((v) => !v)}
              className="mc-focus rounded-[12px] border border-[var(--mc-line)] bg-[var(--mc-card)] px-3 py-1.5 text-[12px]"
            >
              {darkMode ? "Light" : "Dark"}
            </button>
            <div className="text-right">
              <p className="font-mono text-[28px] leading-none">
                {new Date().toLocaleTimeString("en-US", { hour12: false })}
              </p>
              <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--mc-text-soft)]">
                {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
              </p>
            </div>
            <Chip className="border-[var(--mc-green)] bg-[var(--mc-green-soft)] text-[var(--mc-green)]">Online</Chip>
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="mc-focus rounded-[12px] border border-[var(--mc-text)] bg-[var(--mc-text)] px-3 py-1.5 text-[12px] font-semibold text-[var(--mc-panel)]"
            >
              + New Task
            </button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-[var(--w-left)_minmax(0,1fr)_var(--w-right)]">
        <AgentSidebar agents={agents} taskTitles={currentTaskById} loading={loading} />

        <main className="border-x border-[var(--mc-line)] bg-[var(--mc-panel-soft)]">
          <div className="mb-3 flex items-center justify-between border-b border-[var(--mc-line)] px-3 py-2 xl:hidden">
            <div className="inline-flex rounded-[12px] border border-[var(--mc-line)] bg-[var(--mc-card)] p-1 text-[12px]">
              <button className={`rounded-[10px] px-3 py-1 ${mobileTab === "board" ? "bg-[var(--mc-panel-soft)]" : ""}`} onClick={() => setMobileTab("board")}>
                Board
              </button>
              <button className={`rounded-[10px] px-3 py-1 ${mobileTab === "feed" ? "bg-[var(--mc-panel-soft)]" : ""}`} onClick={() => setMobileTab("feed")}>
                Feed
              </button>
            </div>
          </div>

          {mobileTab === "board" ? (
            <KanbanBoard tasksByStatus={tasksByStatus} agents={agents} loading={loading} onSelectTask={(task) => setSelectedTask(task)} />
          ) : null}
          {mobileTab === "feed" ? (
            <div className="p-3 xl:hidden">
              <ActivityFeed activities={activities} loading={loading} compact />
            </div>
          ) : null}
        </main>

        <div className="hidden xl:block">
          <ActivityFeed activities={activities} loading={loading} />
        </div>
      </div>

      {selectedTask ? <TaskDetailDrawer task={selectedTask} agents={agents} onClose={() => setSelectedTask(null)} /> : null}

      {showCreateModal ? <CreateTaskModal agents={agents} onClose={() => setShowCreateModal(false)} /> : null}
    </div>
  );
}
