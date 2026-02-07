"use client";

import type { Agent } from "@/types";
import { timeAgo } from "@/lib/time";

function statusDot(status: Agent["status"]) {
  switch (status) {
    case "idle":
      return "bg-gray-400";
    case "working":
      return "bg-green-500";
    case "blocked":
      return "bg-red-500";
  }
}

export function AgentSidebar({ agents }: { agents: Agent[] }) {
  return (
    <aside className="w-full md:w-72 shrink-0 border-b md:border-b-0 md:border-r border-gray-200 bg-white">
      <div className="p-4">
        <h2 className="text-sm font-semibold text-gray-900">Agents</h2>
        <p className="text-xs text-gray-500 mt-1">Squad status & heartbeats</p>
      </div>
      <ul className="px-2 pb-4 space-y-1">
        {agents.map((a) => (
          <li
            key={a._id}
            className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-gray-50"
          >
            <div className="text-lg" aria-hidden>
              {a.emoji}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <div className="truncate">
                  <span className="text-sm font-medium text-gray-900">{a.name}</span>
                  <span className="text-xs text-gray-500">{" "}· {a.role}</span>
                </div>
                <span
                  className={`inline-block h-2.5 w-2.5 rounded-full ${statusDot(a.status)}`}
                  aria-label={`status-${a.status}`}
                />
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                heartbeat {timeAgo(a.lastHeartbeat)}
                {a.currentTaskId ? (
                  <span className="text-gray-400"> · on {a.currentTaskId}</span>
                ) : null}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
}
