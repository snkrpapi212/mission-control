"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Command } from "cmdk";
import { motion, AnimatePresence } from "framer-motion";
import type { Doc } from "../../convex/_generated/dataModel";

interface CommandPaletteProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  // eslint-disable-next-line no-unused-vars
  tasks: Doc<"tasks">[];
  agents: Doc<"agents">[];
  // eslint-disable-next-line no-unused-vars
  onSelectTask?: (task: Doc<"tasks">) => void;
  // eslint-disable-next-line no-unused-vars
  onSelectAgent?: (agent: Doc<"agents">) => void;
  onCreateTask?: () => void;
}

const ACTIONS = [
  {
    id: "create-task",
    title: "Create task",
    icon: "➕",
    shortcut: "⌘+Shift+N",
    enabled: true,
  },
  {
    id: "mark-done",
    title: "Mark complete",
    icon: "✓",
    shortcut: "⌘+Enter",
    enabled: false,
  },
  { id: "archive", title: "Archive", icon: "📦", shortcut: "⌘+⌫", enabled: false },
  { id: "share", title: "Share", icon: "🔗", shortcut: "⌘+Shift+S", enabled: false },
] as const;

export function CommandPalette({
  isOpen,
  onOpenChange,
  tasks,
  agents,
  onSelectTask,
  onSelectAgent,
  onCreateTask,
}: CommandPaletteProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = isOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const [search, setSearch] = useState("");

  // Cmd+K / Ctrl+K to open
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(!open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, setOpen]);

  const handleSelectTask = (task: Doc<"tasks">) => {
    onSelectTask?.(task);
    setOpen(false);
    setSearch("");
  };

  const handleSelectAgent = (agent: Doc<"agents">) => {
    onSelectAgent?.(agent);
    setOpen(false);
    setSearch("");
  };

  const handleCreateTask = () => {
    onCreateTask?.();
    setOpen(false);
    setSearch("");
  };

  const handleAction = (actionId: string) => {
    switch (actionId) {
      case "create-task":
        handleCreateTask();
        break;
      default:
        // Intentionally disabled until handlers exist (avoid dead-end CTAs)
        break;
    }
  };

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-50 bg-black/40"
            style={{ backdropFilter: "blur(4px)" }}
            aria-hidden="true"
          />

          {/* Command Palette Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, type: "spring", stiffness: 400, damping: 30 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2"
          >
            <Command
              className="rounded-lg border border-[var(--mc-line)] bg-[var(--mc-panel)] shadow-lg"
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setOpen(false);
                }
              }}
            >
              {/* Search Input */}
              <div className="flex items-center border-b border-[var(--mc-line)] px-4 py-3">
                <span className="text-[20px] text-[var(--mc-text-muted)] mr-3">
                  🔍
                </span>
                <Command.Input
                  placeholder="Search tasks, agents, actions..."
                  value={search}
                  onValueChange={setSearch}
                  className="h-12 flex-1 bg-transparent text-[16px] text-[var(--mc-text)] placeholder:text-[var(--mc-text-muted)] outline-none"
                />
                <span className="text-[12px] text-[var(--mc-text-soft)]">
                  ESC to close
                </span>
              </div>

              {/* Results List */}
              <Command.List className="max-h-[60vh] overflow-y-auto">
                {/* "Create Task" Action (always visible) */}
                <Command.Item
                  value="create-task"
                  onSelect={() => handleCreateTask()}
                  className="px-4 py-3 text-[14px] cursor-pointer hover:bg-[var(--mc-panel-soft)] transition-colors flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-[18px]">➕</span>
                    <span className="text-[var(--mc-text)]">Create task</span>
                  </span>
                  <span className="text-[12px] text-[var(--mc-text-soft)]">
                    ⌘+Shift+N
                  </span>
                </Command.Item>

                {/* Search Results: Tasks */}
                {search && tasks.length > 0 && (
                  <>
                    <Command.Separator className="bg-[var(--mc-line)]" />
                    <Command.Group heading="Tasks" className="overflow-hidden px-2 py-1.5">
                      {tasks
                        .filter(
                          (task) =>
                            task.title.toLowerCase().includes(search.toLowerCase()) ||
                            task.description.toLowerCase().includes(search.toLowerCase())
                        )
                        .map((task) => (
                          <motion.div
                            key={task._id}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.15 }}
                          >
                            <Command.Item
                              value={task._id}
                              onSelect={() => handleSelectTask(task)}
                              className="px-2 py-2 text-[14px] cursor-pointer rounded hover:bg-[var(--mc-panel-soft)] transition-colors flex items-center gap-2"
                            >
                              <span className="text-[16px]">📋</span>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-[var(--mc-text)]">
                                  {task.title}
                                </p>
                                <p className="text-[12px] text-[var(--mc-text-soft)] truncate">
                                  {task.status} •{" "}
                                  {task.priority === "urgent"
                                    ? "🔴 URGENT"
                                    : task.priority === "high"
                                    ? "🟠 HIGH"
                                    : "🟢 " + task.priority.toUpperCase()}
                                </p>
                              </div>
                            </Command.Item>
                          </motion.div>
                        ))}
                    </Command.Group>
                  </>
                )}

                {/* Search Results: Agents */}
                {search && agents.length > 0 && (
                  <>
                    <Command.Separator className="bg-[var(--mc-line)]" />
                    <Command.Group heading="Agents" className="overflow-hidden px-2 py-1.5">
                      {agents
                        .filter((agent) =>
                          agent.name.toLowerCase().includes(search.toLowerCase())
                        )
                        .map((agent) => (
                          <motion.div
                            key={agent._id}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.15 }}
                          >
                            <Command.Item
                              value={agent._id}
                              onSelect={() => handleSelectAgent(agent)}
                              className="px-2 py-2 text-[14px] cursor-pointer rounded hover:bg-[var(--mc-panel-soft)] transition-colors flex items-center gap-2"
                            >
                              <span className="text-[16px]">{agent.emoji}</span>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-[var(--mc-text)]">
                                  {agent.name}
                                </p>
                                <p className="text-[12px] text-[var(--mc-text-soft)]">
                                  {agent.role}
                                </p>
                              </div>
                            </Command.Item>
                          </motion.div>
                        ))}
                    </Command.Group>
                  </>
                )}

                {/* Actions Section */}
                {!search && (
                  <>
                    <Command.Separator className="bg-[var(--mc-line)]" />
                    <Command.Group heading="Actions" className="overflow-hidden px-2 py-1.5">
                      {ACTIONS.map((action) => {
                        const base = "px-2 py-2 text-[14px] rounded transition-colors flex items-center justify-between";
                        const enabledClass = action.enabled
                          ? "cursor-pointer hover:bg-[var(--mc-panel-soft)]"
                          : "cursor-not-allowed opacity-60";

                        return (
                          <Command.Item
                            key={action.id}
                            value={action.id}
                            onSelect={() => action.enabled && handleAction(action.id)}
                            className={`${base} ${enabledClass}`}
                            aria-disabled={!action.enabled}
                          >
                            <span className="flex items-center gap-2">
                              <span className="text-[16px]">{action.icon}</span>
                              <span className="text-[var(--mc-text)]">
                                {action.title}
                                {!action.enabled && " (Coming soon)"}
                              </span>
                            </span>
                            <span className="text-[12px] text-[var(--mc-text-soft)]">
                              {action.shortcut}
                            </span>
                          </Command.Item>
                        );
                      })}
                    </Command.Group>
                  </>
                )}

                {/* Empty State */}
                <Command.Empty className="px-4 py-8 text-center text-[14px] text-[var(--mc-text-soft)]">
                  No results found.
                </Command.Empty>
              </Command.List>
            </Command>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
