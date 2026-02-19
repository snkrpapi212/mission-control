"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Doc } from "../../convex/_generated/dataModel";
import { AgentDetailModal } from "@/components/AgentDetailModal";

const TWO_MINUTES = 2 * 60 * 1000;

function isOnline(lastHeartbeat: number) {
  return Date.now() - lastHeartbeat < TWO_MINUTES;
}

/** Derive gradient from model name for visual identity */
function modelGradient(model?: string) {
  const m = (model || "").toLowerCase();
  if (m.includes("claude") || m.includes("anthropic")) {
    return "linear-gradient(135deg, #BC8CFF 0%, #7C3AED 100%)";
  }
  if (m.includes("gpt") || m.includes("openai") || m.includes("codex")) {
    return "linear-gradient(135deg, #79C0FF 0%, #0969DA 100%)";
  }
  if (m.includes("gemini") || m.includes("google") || m.includes("glm") || m.includes("zai")) {
    return "linear-gradient(135deg, #FFA657 0%, #BF7F00 100%)";
  }
  if (m.includes("kimi") || m.includes("minimax") || m.includes("deepseek")) {
    return "linear-gradient(135deg, #56D364 0%, #1A7F37 100%)";
  }
  // default — muted blue-gray
  return "linear-gradient(135deg, #8B949E 0%, #484F58 100%)";
}

/** The agent avatar circle with status pulse */
export function AgentAvatar({
  name,
  lastHeartbeat,
  emoji,
  model,
  size = "md",
}: {
  name: string;
  lastHeartbeat: number;
  emoji?: string;
  model?: string;
  size?: "sm" | "md" | "lg";
}) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const online = isOnline(lastHeartbeat);
  const gradient = modelGradient(model);

  const sizeMap = {
    sm: { outer: "h-7 w-7", text: "text-[9px]", dot: "h-1.5 w-1.5" },
    md: { outer: "h-9 w-9", text: "text-[11px]", dot: "h-2 w-2" },
    lg: { outer: "h-11 w-11", text: "text-[13px]", dot: "h-2.5 w-2.5" },
  }[size];

  return (
    <div className="relative shrink-0">
      <div
        className={`flex ${sizeMap.outer} items-center justify-center rounded-full font-bold text-white shadow-sm`}
        style={{ background: gradient }}
      >
        {emoji ? (
          <span className="leading-none" style={{ fontSize: size === "sm" ? 12 : size === "md" ? 16 : 20 }}>
            {emoji}
          </span>
        ) : (
          <span className={sizeMap.text}>{initials}</span>
        )}
      </div>

      {/* Status dot */}
      <span
        className={`absolute -bottom-px -right-px ${sizeMap.dot} rounded-full ring-[2px]`}
        style={{
          background: online ? "var(--status-online)" : "var(--status-offline)",
          ringColor: "var(--mc-panel)",
          boxShadow: online
            ? `0 0 0 2px var(--mc-panel), 0 0 0 4px var(--status-online)`
            : `0 0 0 2px var(--mc-panel)`,
          ...(online ? { animation: "status-pulse 2.5s ease-in-out infinite" } : {}),
        }}
      />
    </div>
  );
}

/** Role badge */
export function RoleBadge({ role, level }: { role: string; level?: string }) {
  const lvl = level?.toLowerCase() ?? "";
  let color = "var(--mc-text-muted)";
  let bg = "var(--mc-panel-2)";
  let border = "var(--mc-line)";

  if (lvl === "lead") {
    color = "var(--mc-purple)";
    bg = "var(--mc-purple-glow)";
    border = "var(--mc-purple-border)";
  } else if (lvl === "specialist") {
    color = "var(--mc-cyan)";
    bg = "var(--mc-cyan-glow)";
    border = "var(--mc-cyan-border)";
  } else if (lvl === "intern") {
    color = "var(--mc-amber)";
    bg = "var(--mc-amber-glow)";
    border = "var(--mc-amber-border)";
  }

  return (
    <span
      className="inline-flex items-center rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider"
      style={{ color, background: bg, border: `1px solid ${border}` }}
    >
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

  const onlineCount = agents.filter((a) => isOnline(a.lastHeartbeat)).length;

  return (
    <>
      <aside
        className="hidden xl:flex flex-col"
        style={{
          width: "var(--w-left)",
          minWidth: "var(--w-left)",
          minHeight: "calc(100vh - var(--h-topbar))",
          background: "var(--mc-panel)",
          borderRight: "1px solid var(--mc-line)",
        }}
      >
        {/* Section header */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ borderBottom: "1px solid var(--mc-line)" }}
        >
          <span
            className="text-[10px] font-bold uppercase tracking-[0.15em]"
            style={{ color: "var(--mc-text-subtle)" }}
          >
            Squad
          </span>
          <div className="flex items-center gap-1.5">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{
                background: "var(--status-online)",
                boxShadow: "0 0 0 2px var(--mc-green-glow)",
                animation: "status-pulse 2.5s ease-in-out infinite",
              }}
            />
            <span
              className="text-[10px] font-semibold tabular-nums"
              style={{ color: "var(--mc-green)" }}
            >
              {onlineCount} online
            </span>
          </div>
        </div>

        {/* Agent list */}
        <ul className="flex-1 overflow-y-auto py-2">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <li key={i} className="px-3 py-2">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-9 w-9 shrink-0 rounded-full skeleton-shimmer"
                    />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-2.5 w-24 rounded skeleton-shimmer" />
                      <div className="h-2 w-16 rounded skeleton-shimmer" />
                    </div>
                  </div>
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
                    <motion.div
                      className="mx-2 rounded-lg overflow-hidden"
                      style={{
                        marginBottom: 2,
                        border: isExpanded
                          ? "1px solid var(--mc-cyan-border)"
                          : "1px solid transparent",
                        background: isExpanded ? "var(--mc-panel-2)" : "transparent",
                      }}
                      animate={{ borderColor: isExpanded ? "var(--mc-cyan-border)" : "transparent" }}
                      transition={{ duration: 0.15 }}
                    >
                      <button
                        type="button"
                        className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors duration-100"
                        style={{
                          background: "transparent",
                        }}
                        onMouseEnter={(e) => {
                          if (!isExpanded)
                            e.currentTarget.style.background = "var(--mc-panel-2)";
                        }}
                        onMouseLeave={(e) => {
                          if (!isExpanded) e.currentTarget.style.background = "";
                        }}
                        onClick={() =>
                          setExpandedAgentId(isExpanded ? null : agent._id)
                        }
                        aria-expanded={isExpanded}
                      >
                        <AgentAvatar
                          name={agent.name}
                          lastHeartbeat={agent.lastHeartbeat}
                          emoji={agent.emoji}
                          model={agent.model}
                        />

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <p
                              className="truncate text-[12px] font-semibold leading-tight"
                              style={{ color: "var(--mc-text)" }}
                            >
                              {agent.name}
                            </p>
                            {online && agent.status === "working" && (
                              <span
                                className="shrink-0 text-[9px] font-bold uppercase tracking-wider"
                                style={{ color: "var(--mc-green)" }}
                              >
                                ●
                              </span>
                            )}
                          </div>
                          <div className="mt-1">
                            <RoleBadge role={agent.role} level={agent.level} />
                          </div>
                        </div>
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.18, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <div className="px-3 pb-3 space-y-2.5">
                              {/* Active task */}
                              {currentTask ? (
                                <div
                                  className="rounded-md p-2.5"
                                  style={{
                                    background: "var(--mc-panel-3)",
                                    border: "1px solid var(--mc-line)",
                                  }}
                                >
                                  <p
                                    className="text-[9px] font-bold uppercase tracking-widest mb-1"
                                    style={{ color: "var(--mc-text-subtle)" }}
                                  >
                                    Active Task
                                  </p>
                                  <p
                                    className="text-[11px] font-medium leading-snug line-clamp-2"
                                    style={{ color: "var(--mc-text-muted)" }}
                                  >
                                    {currentTask}
                                  </p>
                                </div>
                              ) : (
                                <p
                                  className="text-[11px] italic"
                                  style={{ color: "var(--mc-text-subtle)" }}
                                >
                                  No active task
                                </p>
                              )}

                              {/* Model label */}
                              {agent.model && (
                                <p
                                  className="text-[10px] truncate"
                                  style={{ color: "var(--mc-text-subtle)" }}
                                >
                                  <span style={{ color: "var(--mc-text-muted)" }}>
                                    Model:{" "}
                                  </span>
                                  {agent.model}
                                </p>
                              )}

                              {/* View profile button */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedAgent(agent);
                                }}
                                className="w-full rounded-md py-1.5 text-[11px] font-semibold text-white transition-opacity hover:opacity-90"
                                style={{
                                  background:
                                    "linear-gradient(135deg, var(--mc-cyan) 0%, var(--mc-purple) 120%)",
                                }}
                              >
                                View Profile
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
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
