"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
    <div className="border-b border-[var(--mc-line)] bg-[var(--mc-panel)] px-4 py-3 sticky top-[calc(var(--h-topbar)+var(--h-panelheader))] z-20">
      {/* Filter Bar */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Status Filter */}
        <div className="relative">
          <button
            onClick={() =>
              setOpenDropdown(openDropdown === "status" ? null : "status")
            }
            className="px-3 py-2 rounded border border-[var(--mc-line)] bg-[var(--mc-card)] text-[13px] font-semibold text-[var(--mc-text)] hover:bg-[var(--mc-panel-soft)] transition-colors flex items-center gap-2"
          >
            Status
            {filters.statuses.length > 0 && (
              <span className="bg-[var(--mc-accent-green)] text-white rounded-full px-1.5 text-[11px] font-bold">
                {filters.statuses.length}
              </span>
            )}
            <span>▼</span>
          </button>

          {/* Status Dropdown */}
          <AnimatePresence>
            {openDropdown === "status" && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 mt-2 border border-[var(--mc-line)] rounded bg-[var(--mc-panel)] shadow-lg z-30 min-w-[200px]"
              >
                <div className="p-3 space-y-2 max-h-[300px] overflow-y-auto">
                  {STATUSES.map((status) => (
                    <label
                      key={status}
                      className="flex items-center gap-2 cursor-pointer text-[13px] text-[var(--mc-text)] hover:bg-[var(--mc-panel-soft)] p-2 rounded transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={filters.statuses.includes(status)}
                        onChange={() => handleStatusToggle(status)}
                        className="w-4 h-4 rounded cursor-pointer"
                      />
                      <span className="capitalize">{status.replace("_", " ")}</span>
                    </label>
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
            className="px-3 py-2 rounded border border-[var(--mc-line)] bg-[var(--mc-card)] text-[13px] font-semibold text-[var(--mc-text)] hover:bg-[var(--mc-panel-soft)] transition-colors flex items-center gap-2"
          >
            Agent
            {filters.agentIds.length > 0 && (
              <span className="bg-[var(--mc-accent-green)] text-white rounded-full px-1.5 text-[11px] font-bold">
                {filters.agentIds.length}
              </span>
            )}
            <span>▼</span>
          </button>

          {/* Agent Dropdown */}
          <AnimatePresence>
            {openDropdown === "agent" && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 mt-2 border border-[var(--mc-line)] rounded bg-[var(--mc-panel)] shadow-lg z-30 min-w-[200px]"
              >
                <div className="p-3 space-y-2 max-h-[300px] overflow-y-auto">
                  {agents.map((agent) => (
                    <label
                      key={agent._id}
                      className="flex items-center gap-2 cursor-pointer text-[13px] text-[var(--mc-text)] hover:bg-[var(--mc-panel-soft)] p-2 rounded transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={filters.agentIds.includes(agent.agentId)}
                        onChange={() => handleAgentToggle(agent.agentId)}
                        className="w-4 h-4 rounded cursor-pointer"
                      />
                      <span className="text-[16px]">{agent.emoji}</span>
                      <span>{agent.name}</span>
                    </label>
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
            className="px-3 py-2 rounded border border-[var(--mc-line)] bg-[var(--mc-card)] text-[13px] font-semibold text-[var(--mc-text)] hover:bg-[var(--mc-panel-soft)] transition-colors flex items-center gap-2"
          >
            Priority
            {filters.priorities.length > 0 && (
              <span className="bg-[var(--mc-accent-green)] text-white rounded-full px-1.5 text-[11px] font-bold">
                {filters.priorities.length}
              </span>
            )}
            <span>▼</span>
          </button>

          {/* Priority Dropdown */}
          <AnimatePresence>
            {openDropdown === "priority" && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 mt-2 border border-[var(--mc-line)] rounded bg-[var(--mc-panel)] shadow-lg z-30 min-w-[150px]"
              >
                <div className="p-3 space-y-2">
                  {PRIORITIES.map((priority) => (
                    <label
                      key={priority}
                      className="flex items-center gap-2 cursor-pointer text-[13px] text-[var(--mc-text)] hover:bg-[var(--mc-panel-soft)] p-2 rounded transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={filters.priorities.includes(priority)}
                        onChange={() => handlePriorityToggle(priority)}
                        className="w-4 h-4 rounded cursor-pointer"
                      />
                      <span className="capitalize">{priority}</span>
                    </label>
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
            className="px-3 py-2 rounded border border-[var(--mc-line)] bg-[var(--mc-card)] text-[13px] font-semibold text-[var(--mc-text)] hover:bg-[var(--mc-panel-soft)] transition-colors flex items-center gap-2"
          >
            Presets <span>▼</span>
          </button>

          <AnimatePresence>
            {openDropdown === "presets" && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full right-0 mt-2 border border-[var(--mc-line)] rounded bg-[var(--mc-panel)] shadow-lg z-30 min-w-[180px]"
              >
                <div className="p-2 space-y-1 max-h-[300px] overflow-y-auto">
                  {presets.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => loadPreset(preset)}
                      className="w-full text-left px-3 py-2 rounded text-[13px] text-[var(--mc-text)] hover:bg-[var(--mc-panel-soft)] transition-colors"
                    >
                      {preset.name}
                    </button>
                  ))}
                  <div className="border-t border-[var(--mc-line)] pt-2 mt-2">
                    <button
                      onClick={() => setSavePresetOpen(true)}
                      className="w-full text-left px-3 py-2 rounded text-[13px] text-[var(--mc-accent-green)] hover:bg-[var(--mc-panel-soft)] transition-colors font-semibold"
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
            className="px-3 py-2 rounded text-[13px] text-[var(--mc-text-soft)] hover:text-[var(--mc-text)] hover:bg-[var(--mc-panel-soft)] transition-colors"
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
