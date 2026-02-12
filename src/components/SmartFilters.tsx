"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import type { TaskStatus } from "@/types";
import type { Doc } from "../../convex/_generated/dataModel";

interface SmartFiltersProps {
  agents: Doc<"agents">[];
  onFiltersChange: (_filters: FilterState) => void;
}

export interface FilterState {
  statuses: TaskStatus[];
  agentIds: string[];
  priorities: string[];
  presetName?: string;
}

interface Preset {
  id: string;
  name: string;
  filters: FilterState;
}

const STATUSES: TaskStatus[] = ["inbox", "assigned", "in_progress", "review", "done", "blocked"];
const PRIORITIES = ["urgent", "high", "medium", "low"];

export function SmartFilters({ agents, onFiltersChange }: SmartFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    statuses: [],
    agentIds: [],
    priorities: [],
  });

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [presets, setPresets] = useState<Preset[]>([
    {
      id: "my-tasks",
      name: "My Tasks",
      filters: {
        statuses: ["assigned", "in_progress"],
        agentIds: [],
        priorities: [],
      },
    },
    {
      id: "urgent",
      name: "Urgent",
      filters: {
        statuses: ["inbox", "assigned", "in_progress"],
        agentIds: [],
        priorities: ["urgent"],
      },
    },
    {
      id: "blocked",
      name: "Blocked",
      filters: {
        statuses: ["blocked"],
        agentIds: [],
        priorities: [],
      },
    },
  ]);

  const [savePresetOpen, setSavePresetOpen] = useState(false);
  const [presetName, setPresetName] = useState("");

  const handleStatusToggle = (status: TaskStatus) => {
    const newStatuses = filters.statuses.includes(status)
      ? filters.statuses.filter((s) => s !== status)
      : [...filters.statuses, status];
    updateFilters({ ...filters, statuses: newStatuses });
  };

  const handleAgentToggle = (agentId: string) => {
    const newAgentIds = filters.agentIds.includes(agentId)
      ? filters.agentIds.filter((id) => id !== agentId)
      : [...filters.agentIds, agentId];
    updateFilters({ ...filters, agentIds: newAgentIds });
  };

  const handlePriorityToggle = (priority: string) => {
    const newPriorities = filters.priorities.includes(priority)
      ? filters.priorities.filter((p) => p !== priority)
      : [...filters.priorities, priority];
    updateFilters({ ...filters, priorities: newPriorities });
  };

  const updateFilters = (newFilters: FilterState) => {
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const loadPreset = (preset: Preset) => {
    updateFilters(preset.filters);
    setOpenDropdown(null);
  };

  const savePreset = () => {
    if (presetName.trim()) {
      const newPreset: Preset = {
        id: `preset-${Date.now()}`,
        name: presetName,
        filters,
      };
      setPresets([...presets, newPreset]);
      setPresetName("");
      setSavePresetOpen(false);
    }
  };

  const clearAllFilters = () => {
    updateFilters({
      statuses: [],
      agentIds: [],
      priorities: [],
    });
  };

  const hasActiveFilters =
    filters.statuses.length > 0 ||
    filters.agentIds.length > 0 ||
    filters.priorities.length > 0;

  return (
    <div className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2 sticky top-[calc(var(--h-topbar)+var(--h-panelheader))] z-20">
      {/* Filter Bar */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Status Filter */}
        <div className="relative">
          <button
            onClick={() =>
              setOpenDropdown(openDropdown === "status" ? null : "status")
            }
            className={`h-7 px-2.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors flex items-center gap-1.5 shadow-sm ${
              openDropdown === "status" || filters.statuses.length > 0 ? "bg-zinc-100 dark:bg-zinc-800" : ""
            }`}
          >
            Status
            {filters.statuses.length > 0 && (
              <span className="bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded px-1 text-[10px] font-bold">
                {filters.statuses.length}
              </span>
            )}
            <ChevronDown size={12} className={`text-zinc-400 transition-transform ${openDropdown === "status" ? "rotate-180" : ""}`} />
          </button>

          {/* Status Dropdown */}
          <AnimatePresence>
            {openDropdown === "status" && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                className="absolute top-full left-0 mt-1 border border-zinc-200 dark:border-zinc-800 rounded-md bg-white dark:bg-zinc-900 shadow-lg z-30 min-w-[180px] overflow-hidden"
              >
                <div className="p-1 space-y-0.5 max-h-[300px] overflow-y-auto">
                  {STATUSES.map((status) => (
                    <div
                      key={status}
                      onClick={() => handleStatusToggle(status)}
                      className="flex items-center justify-between px-2 py-1.5 cursor-pointer text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-sm transition-colors"
                    >
                      <span className="capitalize">{status.replace("_", " ")}</span>
                      {filters.statuses.includes(status) && (
                        <Check size={14} className="text-zinc-900 dark:text-zinc-50" />
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Agent Filter */}
        <div className="relative">
          <button
            onClick={() =>
              setOpenDropdown(openDropdown === "agent" ? null : "agent")
            }
            className={`h-7 px-2.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors flex items-center gap-1.5 shadow-sm ${
              openDropdown === "agent" || filters.agentIds.length > 0 ? "bg-zinc-100 dark:bg-zinc-800" : ""
            }`}
          >
            Agent
            {filters.agentIds.length > 0 && (
              <span className="bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded px-1 text-[10px] font-bold">
                {filters.agentIds.length}
              </span>
            )}
            <ChevronDown size={12} className={`text-zinc-400 transition-transform ${openDropdown === "agent" ? "rotate-180" : ""}`} />
          </button>

          {/* Agent Dropdown */}
          <AnimatePresence>
            {openDropdown === "agent" && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                className="absolute top-full left-0 mt-1 border border-zinc-200 dark:border-zinc-800 rounded-md bg-white dark:bg-zinc-900 shadow-lg z-30 min-w-[200px] overflow-hidden"
              >
                <div className="p-1 space-y-0.5 max-h-[300px] overflow-y-auto">
                  {agents.map((agent) => (
                    <div
                      key={agent._id}
                      onClick={() => handleAgentToggle(agent.agentId)}
                      className="flex items-center justify-between px-2 py-1.5 cursor-pointer text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-sm transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[14px]">{agent.emoji}</span>
                        <span>{agent.name}</span>
                      </div>
                      {filters.agentIds.includes(agent.agentId) && (
                        <Check size={14} className="text-zinc-900 dark:text-zinc-50" />
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Priority Filter */}
        <div className="relative">
          <button
            onClick={() =>
              setOpenDropdown(openDropdown === "priority" ? null : "priority")
            }
            className={`h-7 px-2.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors flex items-center gap-1.5 shadow-sm ${
              openDropdown === "priority" || filters.priorities.length > 0 ? "bg-zinc-100 dark:bg-zinc-800" : ""
            }`}
          >
            Priority
            {filters.priorities.length > 0 && (
              <span className="bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded px-1 text-[10px] font-bold">
                {filters.priorities.length}
              </span>
            )}
            <ChevronDown size={12} className={`text-zinc-400 transition-transform ${openDropdown === "priority" ? "rotate-180" : ""}`} />
          </button>

          {/* Priority Dropdown */}
          <AnimatePresence>
            {openDropdown === "priority" && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                className="absolute top-full left-0 mt-1 border border-zinc-200 dark:border-zinc-800 rounded-md bg-white dark:bg-zinc-900 shadow-lg z-30 min-w-[150px] overflow-hidden"
              >
                <div className="p-1 space-y-0.5">
                  {PRIORITIES.map((priority) => (
                    <div
                      key={priority}
                      onClick={() => handlePriorityToggle(priority)}
                      className="flex items-center justify-between px-2 py-1.5 cursor-pointer text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-sm transition-colors"
                    >
                      <span className="capitalize">{priority}</span>
                      {filters.priorities.includes(priority) && (
                        <Check size={14} className="text-zinc-900 dark:text-zinc-50" />
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Presets Dropdown */}
        <div className="relative ml-auto">
          <button
            onClick={() =>
              setOpenDropdown(openDropdown === "presets" ? null : "presets")
            }
            className={`h-7 px-2.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors flex items-center gap-1.5 shadow-sm ${
              openDropdown === "presets" ? "bg-zinc-100 dark:bg-zinc-800" : ""
            }`}
          >
            Presets
            <ChevronDown size={12} className={`text-zinc-400 transition-transform ${openDropdown === "presets" ? "rotate-180" : ""}`} />
          </button>

          <AnimatePresence>
            {openDropdown === "presets" && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                className="absolute top-full right-0 mt-1 border border-zinc-200 dark:border-zinc-800 rounded-md bg-white dark:bg-zinc-900 shadow-lg z-30 min-w-[180px] overflow-hidden"
              >
                <div className="p-1 space-y-0.5 max-h-[300px] overflow-y-auto">
                  {presets.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => loadPreset(preset)}
                      className="w-full text-left px-2 py-1.5 rounded-sm text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                      {preset.name}
                    </button>
                  ))}
                  <div className="border-t border-zinc-100 dark:border-zinc-800 mt-1 pt-1">
                    <button
                      onClick={() => setSavePresetOpen(true)}
                      className="w-full text-left px-2 py-1.5 rounded-sm text-xs text-zinc-900 dark:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors font-medium"
                    >
                      + Save Current as Preset
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Clear All */}
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="h-7 px-2 rounded-md text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Save Preset Modal */}
      <AnimatePresence>
        {savePresetOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            onClick={() => setSavePresetOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-[var(--mc-panel)] rounded border border-[var(--mc-line)] p-6 min-w-[320px]"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-[16px] font-semibold text-[var(--mc-text)] mb-4">
                Save Preset
              </h3>
              <input
                type="text"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                placeholder="Preset name (e.g., Q1 Priority Tasks)"
                className="w-full px-3 py-2 rounded border border-[var(--mc-line)] bg-[var(--mc-card)] text-[13px] text-[var(--mc-text)] placeholder:text-[var(--mc-text-soft)] outline-none focus:border-[var(--mc-accent-green)] mb-4"
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setSavePresetOpen(false)}
                  className="px-4 py-2 rounded text-[13px] text-[var(--mc-text)] hover:bg-[var(--mc-panel-soft)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={savePreset}
                  disabled={!presetName.trim()}
                  className="px-4 py-2 rounded bg-[var(--mc-accent-green)] text-white text-[13px] font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity"
                >
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
