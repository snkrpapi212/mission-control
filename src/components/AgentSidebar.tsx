"use client";

import { useMemo, useState } from "react";
import type { Doc } from "../../convex/_generated/dataModel";
import { timeAgo } from "@/lib/time";

const ONLINE_THRESHOLD_MS = 10 * 60 * 1000;
const ACTIVE_THRESHOLD_MS = 2 * 60 * 1000;

type GroupKey = "active" | "idle" | "offline";

function getPresence(agent: Doc<"agents">): GroupKey {
  const online = Date.now() - agent.lastHeartbeat < ONLINE_THRESHOLD_MS;
  if (!online) return "offline";
  if (agent.status === "working") return "active";
  return "idle";
}

function levelBadge(level: Doc<"agents">["level"]) {
  if (level === "lead") return "LEAD";
  if (level === "intern") return "INT";
  return "SPC";
}

function subtitle(agent: Doc<"agents">) {
  if (agent.status === "working") return "WORKING";
  if (agent.status === "blocked") return "BLOCKED";
  return "IDLE";
}

export function AgentSidebar({ agents, taskTitles, loading }: { agents: Doc<"agents">[]; taskTitles: Map<string, string>; loading?: boolean }) {
  const [selectedAgent, setSelectedAgent] = useState<Doc<"agents"> | null>(null);

  const grouped = useMemo(() => {
    const map: Record<GroupKey, Doc<"agents">[]> = { active: [], idle: [], offline: [] };
    agents.forEach((agent) => map[getPresence(agent)].push(agent));
    return map;
  }, [agents]);

  const renderRow = (a: Doc<"agents">) => {
    const group = getPresence(a);
    const isActiveNow = Date.now() - a.lastHeartbeat < ACTIVE_THRESHOLD_MS && group === "active";
    const currentTask = a.currentTaskId ? taskTitles.get(a.currentTaskId) : undefined;

    return (
      <button type="button" key={a._id} onClick={() => setSelectedAgent(a)} className="group flex w-full items-center gap-3 border-b px-3 py-3 text-left hover:opacity-95" style={{ borderColor: "var(--mc-border-soft)" }}>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border text-lg" style={{ borderColor: "var(--mc-border)", background: "var(--mc-card)" }}>{a.emoji || "🤖"}</div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-[14px] font-semibold">{a.name}</span>
            <span className="mc-chip rounded-md px-1.5 py-0.5 text-[10px] font-semibold">{levelBadge(a.level)}</span>
          </div>
          <div className="mt-0.5 truncate text-[12px] mc-muted">{a.role}</div>
          <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-semibold" style={{ color: group === "active" ? "var(--mc-accent-green)" : "var(--mc-text-subtle)" }}>
            <span className={`inline-block h-2.5 w-2.5 rounded-full ${group === "offline" ? "bg-gray-400" : group === "idle" ? "bg-amber-400" : "bg-green-500"} ${isActiveNow ? "animate-pulse" : ""}`} />
            {subtitle(a)}
          </div>
          <div className="mt-1 truncate text-[11px] mc-subtle">{currentTask || `Last heartbeat ${timeAgo(a.lastHeartbeat)}`}</div>
        </div>
      </button>
    );
  };

  const section = (title: string, items: Doc<"agents">[]) => (
    <div>
      <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] mc-subtle">{title}</div>
      {items.length === 0 ? <div className="px-3 pb-3 text-[11px] mc-subtle">No agents</div> : items.map(renderRow)}
    </div>
  );

  return (
    <aside className="border-r mc-panel" style={{ borderColor: "var(--mc-border)" }}>
      <div className="flex h-[50px] items-center justify-between border-b px-3" style={{ borderColor: "var(--mc-border)" }}>
        <div className="flex items-center gap-2 text-[14px] font-semibold tracking-[0.12em]"><span style={{ color: "var(--mc-accent-green)" }}>•</span> AGENTS</div>
        <span className="mc-chip rounded-md px-2 py-0.5 text-[11px]">{agents.length}</span>
      </div>

      {loading ? (
        <div className="space-y-3 p-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg border mc-card p-2">
              <div className="h-9 w-9 animate-pulse rounded-xl" style={{ background: "var(--mc-border-soft)" }} />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-20 animate-pulse rounded" style={{ background: "var(--mc-border-soft)" }} />
                <div className="h-2.5 w-28 animate-pulse rounded" style={{ background: "var(--mc-border-soft)" }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="max-h-[calc(100vh-122px)] overflow-y-auto">
          {section("Active", grouped.active)}
          {section("Idle", grouped.idle)}
          {section("Offline", grouped.offline)}
        </div>
      )}

      {selectedAgent ? (
        <div className="fixed inset-0 z-40 bg-black/20" onClick={() => setSelectedAgent(null)}>
          <aside className="absolute left-[280px] top-[72px] h-[calc(100vh-72px)] w-[320px] border-l p-4 shadow-xl mc-panel" style={{ borderColor: "var(--mc-border)" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-[0.12em]">Agent Profile</h3>
              <button onClick={() => setSelectedAgent(null)} className="text-xs mc-subtle">Close</button>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border text-2xl" style={{ borderColor: "var(--mc-border)", background: "var(--mc-card)" }}>{selectedAgent.emoji}</div>
              <div>
                <div className="text-base font-semibold">{selectedAgent.name}</div>
                <div className="text-xs mc-muted">{selectedAgent.role}</div>
              </div>
            </div>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="rounded-lg border mc-card px-3 py-2"><dt className="text-[11px] uppercase tracking-wide mc-subtle">Current Task</dt><dd className="mt-1 text-sm">{selectedAgent.currentTaskId ? taskTitles.get(selectedAgent.currentTaskId) || selectedAgent.currentTaskId : "No active task"}</dd></div>
              <div className="rounded-lg border mc-card px-3 py-2"><dt className="text-[11px] uppercase tracking-wide mc-subtle">Recent Activity</dt><dd className="mt-1 text-sm">Heartbeat {timeAgo(selectedAgent.lastHeartbeat)}</dd></div>
              <div className="rounded-lg border mc-card px-3 py-2"><dt className="text-[11px] uppercase tracking-wide mc-subtle">Performance</dt><dd className="mt-1 text-sm">Status: {selectedAgent.status}</dd></div>
            </dl>
          </aside>
        </div>
      ) : null}
    </aside>
  );
}
