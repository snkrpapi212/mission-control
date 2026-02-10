"use client";

import { useMemo, useState } from "react";
import { AgentSidebar } from "@/components/AgentSidebar";
import { ActivityFeed } from "@/components/ActivityFeed";
import { KanbanBoard } from "@/components/KanbanBoard";
import { TaskDetailDrawer } from "@/components/TaskDetailDrawer";
import { CreateTaskModal } from "@/components/CreateTaskModal";
import {
  useActivitiesLive,
  useAgentsLive,
  useTasksByStatusLive,
} from "@/hooks/useConvexData";

export function DashboardShell() {
  const agentsRaw = useAgentsLive();
  const tasksByStatus = useTasksByStatusLive();
  const activitiesRaw = useActivitiesLive(24);

  const agents = useMemo(() => agentsRaw || [], [agentsRaw]);
  const activities = useMemo(() => activitiesRaw || [], [activitiesRaw]);
  const loading = agentsRaw === undefined || activitiesRaw === undefined;

  const [selectedTask, setSelectedTask] = useState<import("../../convex/_generated/dataModel").Doc<"tasks"> | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [mobileTab, setMobileTab] = useState<"board" | "feed">("board");

  const flattenedTasks = useMemo(
    () => Object.values(tasksByStatus).flat(),
    [tasksByStatus]
  );

  const taskCount = flattenedTasks.length;
  const activeAgentCount = agents.filter((a) => a.status === "working").length;

  const currentTaskById = useMemo(() => {
    const map = new Map<string, string>();
    for (const t of flattenedTasks) map.set(t._id, t.title);
    return map;
  }, [flattenedTasks]);

  return (
    <div className="min-h-screen bg-[#f7f7f5] text-[#262524]">
      <header className="sticky top-0 z-30 border-b border-[#deded9] bg-[#fbfbf9]/95 backdrop-blur">
        <div className="mx-auto flex h-[72px] max-w-[1680px] items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <div className="text-[20px] text-[#c2a876]">◇</div>
            <div>
              <h1 className="text-[19px] font-semibold tracking-[0.18em] text-[#1f1f1d]">MISSION CONTROL</h1>
            </div>
            <span className="ml-2 rounded-md border border-[#e4e3dc] bg-[#f2f1ec] px-2 py-0.5 text-[11px] text-[#7d7b72]">
              SiteGPT
            </span>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-10 text-center">
              <div>
                <div className="text-[34px] leading-none font-semibold text-[#171717]">{activeAgentCount}</div>
                <div className="mt-1 text-[10px] uppercase tracking-[0.2em] text-[#8d8a82]">Agents Active</div>
              </div>
              <div>
                <div className="text-[34px] leading-none font-semibold text-[#171717]">{taskCount}</div>
                <div className="mt-1 text-[10px] uppercase tracking-[0.2em] text-[#8d8a82]">Tasks In Queue</div>
              </div>
            </div>
            <input
              placeholder="Search tasks, agents..."
              className="h-9 w-[240px] rounded-md border border-[#e2dfd6] bg-white px-3 text-xs text-[#46433d] placeholder:text-[#9f9b91]"
            />
          </div>

          <div className="flex items-center gap-3">
            <button className="hidden sm:inline-flex rounded-md border border-[#e1e0d8] bg-white px-3 py-1.5 text-xs font-medium text-[#6d6a63] hover:bg-[#f5f4ef]">
              🗂 Docs
            </button>
            <button className="relative inline-flex h-9 w-9 items-center justify-center rounded-md border border-[#e1e0d8] bg-white text-[#6d6a63] hover:bg-[#f5f4ef]">
              🔔
              <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ca6a5c] px-1 text-[10px] text-white">3</span>
            </button>
            <button className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[#e1e0d8] bg-white text-[#6d6a63] hover:bg-[#f5f4ef]">
              ◐
            </button>
            <div className="hidden md:block text-right">
              <div className="font-mono text-lg leading-none text-[#232321]">
                {new Date().toLocaleTimeString("en-US", { hour12: false })}
              </div>
              <div className="mt-1 text-[10px] uppercase tracking-[0.2em] text-[#9b988f]">
                {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
              </div>
            </div>
            <span className="inline-flex items-center gap-2 rounded-md border border-[#e0ede4] bg-[#edf7ef] px-3 py-1.5 text-xs font-semibold text-[#3a7d4d]">
              <span className="h-2 w-2 rounded-full bg-[#7fb68d]" /> ONLINE
            </span>
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="rounded-md border border-[#1f1f1d] bg-[#222220] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#30302d]"
            >
              + New Task
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1680px]">
        <div className="grid grid-cols-1 xl:grid-cols-[258px_minmax(0,1fr)_334px]">
          <AgentSidebar
            agents={agents}
            taskTitles={currentTaskById}
            loading={loading}
          />

          <main className="border-x border-[#dfded8] bg-[#f8f8f6] px-3 py-3 md:px-4 md:py-4">
            <div className="mb-3 flex items-center justify-between xl:hidden">
              <div className="inline-flex rounded-lg border border-[#dfded8] bg-white p-0.5 text-xs">
                <button
                  className={`rounded-md px-3 py-1.5 ${mobileTab === "board" ? "bg-[#f4f3ed] text-[#222]" : "text-[#77736a]"}`}
                  onClick={() => setMobileTab("board")}
                >
                  Board
                </button>
                <button
                  className={`rounded-md px-3 py-1.5 ${mobileTab === "feed" ? "bg-[#f4f3ed] text-[#222]" : "text-[#77736a]"}`}
                  onClick={() => setMobileTab("feed")}
                >
                  Feed
                </button>
              </div>
            </div>

            {mobileTab === "board" ? (
              <KanbanBoard
                tasksByStatus={tasksByStatus}
                agents={agents}
                loading={loading}
                onSelectTask={(t) => setSelectedTask(t)}
              />
            ) : null}
            {mobileTab === "feed" ? (
              <div className="xl:hidden">
                <ActivityFeed activities={activities} loading={loading} compact />
              </div>
            ) : null}
          </main>

          <div className="hidden xl:block">
            <ActivityFeed activities={activities} loading={loading} />
          </div>
        </div>
      </div>

      {selectedTask ? (
        <TaskDetailDrawer
          task={selectedTask}
          agents={agents}
          onClose={() => setSelectedTask(null)}
        />
      ) : null}

      {showCreateModal ? (
        <CreateTaskModal
          agents={agents}
          onClose={() => setShowCreateModal(false)}
        />
      ) : null}
    </div>
  );
}
