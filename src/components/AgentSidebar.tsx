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

export function AgentSidebar({
  agents,
  taskTitles,
  loading,
}: {
  agents: Doc<"agents">[];
  taskTitles: Map<string, string>;
  loading?: boolean;
}) {
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
      <button
        type="button"
        key={a._id}
        onClick={() => setSelectedAgent(a)}
        className="group flex w-full items-center gap-3 border-b border-[#ecebe5] px-3 py-3 text-left hover:bg-[#f7f6f2]"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e2dfd2] bg-[#f4f2eb] text-lg text-[#6e674e]">
          {a.emoji || "🤖"}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-[22px]/[1] tracking-tight font-semibold text-[#272521]">{a.name}</span>
            <span className="rounded-md border border-[#ebe6d8] bg-[#f6f3e8] px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-[#9b8457]">
              {levelBadge(a.level)}
            </span>
          </div>
          <div className="mt-0.5 truncate text-[20px] leading-[1] text-[#6f6b61]">{a.role}</div>
          <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-[#4f8b66]">
            <span className={`inline-block h-2.5 w-2.5 rounded-full ${group === "offline" ? "bg-[#bdbab0]" : group === "idle" ? "bg-[#c6b06d]" : "bg-[#55a46f]"} ${isActiveNow ? "animate-pulse" : ""}`} />
            {subtitle(a)}
          </div>
          <div className="mt-1 truncate text-[11px] text-[#918e83]">
            {currentTask || `Last heartbeat ${timeAgo(a.lastHeartbeat)}`}
          </div>
        </div>
      </button>
    );
  };

  const section = (title: string, items: Doc<"agents">[]) => (
    <div>
      <div className="px-3 py-2 text-[12px] font-semibold uppercase tracking-[0.2em] text-[#79756c]">{title}</div>
      {items.length === 0 ? (
        <div className="px-3 pb-3 text-[11px] text-[#a8a49b]">No agents</div>
      ) : (
        items.map(renderRow)
      )}
    </div>
  );

  return (
    <aside className="border-r border-[#dfded8] bg-[#fbfaf7]">
      <div className="flex h-[50px] items-center justify-between border-b border-[#dfded8] px-3">
        <div className="flex items-center gap-2 text-[22px]/[1] font-semibold tracking-[0.12em] text-[#23221f]">
          <span className="text-[#4ea56a]">•</span> AGENTS
        </div>
        <span className="rounded-md border border-[#e7e5db] bg-[#f1f0ea] px-2 py-0.5 text-[11px] text-[#8c897f]">
          {agents.length}
        </span>
      </div>

      {loading ? (
        <div className="space-y-3 p-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg border border-[#ecebe5] bg-white p-2">
              <div className="h-9 w-9 animate-pulse rounded-xl bg-[#ece9de]" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-20 animate-pulse rounded bg-[#ece9de]" />
                <div className="h-2.5 w-28 animate-pulse rounded bg-[#f0ede4]" />
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
          <aside
            className="absolute left-[258px] top-[72px] h-[calc(100vh-72px)] w-[320px] border-l border-[#dedcd4] bg-[#fcfbf8] p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#58554e]">Agent Profile</h3>
              <button onClick={() => setSelectedAgent(null)} className="text-xs text-[#7f7a70]">Close</button>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#e1ddd0] bg-[#f3efe4] text-2xl">
                {selectedAgent.emoji}
              </div>
              <div>
                <div className="text-lg font-semibold text-[#282622]">{selectedAgent.name}</div>
                <div className="text-xs text-[#817d74]">{selectedAgent.role}</div>
              </div>
            </div>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="rounded-lg border border-[#ece9dd] bg-white px-3 py-2">
                <dt className="text-[11px] uppercase tracking-wide text-[#8a857b]">Current Task</dt>
                <dd className="mt-1 text-[#2e2c28]">{selectedAgent.currentTaskId ? taskTitles.get(selectedAgent.currentTaskId) || selectedAgent.currentTaskId : "No active task"}</dd>
              </div>
              <div className="rounded-lg border border-[#ece9dd] bg-white px-3 py-2">
                <dt className="text-[11px] uppercase tracking-wide text-[#8a857b]">Recent Activity</dt>
                <dd className="mt-1 text-[#2e2c28]">Heartbeat {timeAgo(selectedAgent.lastHeartbeat)}</dd>
              </div>
              <div className="rounded-lg border border-[#ece9dd] bg-white px-3 py-2">
                <dt className="text-[11px] uppercase tracking-wide text-[#8a857b]">Performance</dt>
                <dd className="mt-1 text-[#2e2c28]">Status: {selectedAgent.status}</dd>
              </div>
            </dl>
          </aside>
        </div>
      ) : null}
    </aside>
  );
}
