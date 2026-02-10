"use client";

import type { Doc } from "../../convex/_generated/dataModel";
import { PanelHeader, Chip } from "@/components/MissionControlPrimitives";

function roleBadge(level: Doc<"agents">["level"]) {
  if (level === "lead") return "LEAD";
  if (level === "intern") return "INT";
  return "SPC";
}

function statusClass(status: Doc<"agents">["status"]) {
  if (status === "working") return "bg-[var(--mc-green)]";
  if (status === "blocked") return "bg-[var(--mc-red)]";
  return "bg-[var(--mc-amber)]";
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
  return (
    <aside className="hidden xl:flex min-h-[calc(100vh-var(--h-topbar))] flex-col border-r border-[var(--mc-line)] bg-[var(--mc-panel)]">
      <PanelHeader title="Agents" count={agents.length} />

      <ul className="overflow-y-auto">
        {loading
          ? Array.from({ length: 7 }).map((_, idx) => (
              <li key={idx} className="border-b border-[var(--mc-line)] p-4">
                <div className="mc-card h-20 animate-pulse" />
              </li>
            ))
          : agents.map((agent) => {
              const currentTask = agent.currentTaskId ? taskTitles.get(agent.currentTaskId) : undefined;
              return (
                <li key={agent._id} className="border-b border-[var(--mc-line)] px-4 py-3 hover:bg-[var(--mc-panel-soft)]">
                  <div className="flex items-center gap-3">
                    <div className="grid h-12 w-12 place-items-center rounded-[var(--r-tile)] border border-[var(--mc-line)] bg-[var(--mc-panel-soft)] text-[20px]">
                      {agent.emoji || "🤖"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-[24px] font-semibold leading-none text-[var(--mc-text)]">{agent.name}</p>
                        <Chip>{roleBadge(agent.level)}</Chip>
                      </div>
                      <p className="truncate text-[20px] text-[var(--mc-text-muted)]">{agent.role}</p>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.12em] text-[var(--mc-text-muted)]">
                      <span className={`inline-block h-2.5 w-2.5 rounded-full ${statusClass(agent.status)}`} />
                      {agent.status}
                    </div>
                    <p className="truncate text-[13px] text-[var(--mc-text-soft)]">{currentTask || "No active task"}</p>
                  </div>
                </li>
              );
            })}
      </ul>
    </aside>
  );
}
