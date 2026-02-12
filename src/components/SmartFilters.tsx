"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { TaskStatus } from "@/types";
import type { Doc } from "../../convex/_generated/dataModel";
import { Filter, Check, ChevronDown, Save, X, SlidersHorizontal } from "lucide-react";

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

const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string }> = {
  inbox: { label: "Inbox", color: "bg-[var(--mc-text-muted)]" },
  assigned: { label: "Assigned", color: "bg-[var(--mc-amber)]" },
  in_progress: { label: "In Progress", color: "bg-[var(--mc-green)]" },
  review: { label: "Review", color: "bg-[var(--mc-amber)]" },
  done: { label: "Done", color: "bg-[var(--mc-green)]" },
  blocked: { label: "Blocked", color: "bg-[var(--mc-red)]" },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  urgent: { label: "Urgent", color: "bg-[var(--mc-red)]" },
  high: { label: "High", color: "bg-[var(--mc-amber)]" },
  medium: { label: "Medium", color: "bg-[var(--mc-green)]" },
  low: { label: "Low", color: "bg-[var(--mc-text-muted)]" },
};

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

  const totalActiveFilters = filters.statuses.length + filters.agentIds.length + filters.priorities.length;

  return (
    <div className="border-b border-[var(--mc-line)] bg-[var(--mc-panel)]/80 backdrop-blur-sm px-4 py-3 sticky top-[calc(var(--h-topbar)+var(--h-panelheader))] z-20">
      {/* Filter Bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 mr-2">
          <SlidersHorizontal size={16} className="text-[var(--mc-text-soft)]" />
          <span className="text-[13px] font-medium text-[var(--mc-text)]">Filters</span>
          {totalActiveFilters > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="h-5 min-w-5 px-1.5 rounded-full bg-[var(--mc-accent-green)] text-white text-[11px] font-bold flex items-center justify-center"
            >
              {totalActiveFilters}
            </motion.span>
          )}
        </div>

        {/* Status Filter */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setOpenDropdown(openDropdown === "status" ? null : "status")}
            className={`px-3 py-2 rounded-lg border text-[13px] font-medium transition-all duration-200 flex items-center gap-2 ${
              filters.statuses.length > 0
                ? "bg-[var(--mc-green-soft)] border-[var(--mc-green)]/30 text-[var(--mc-green)]"
                : "bg-[var(--mc-card)] border-[var(--mc-line)] text-[var(--mc-text)] hover:border-[var(--mc-line-strong)]"
            }`}
          >
            <span>Status</span>
            {filters.statuses.length > 0 && (
              <span className="bg-[var(--mc-green)] text-white rounded-full px-1.5 text-[10px] font-semibold"
              >
                {filters.statuses.length}
              </span>
            )}
            <motion.span
              animate={{ rotate: openDropdown === "status" ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown size={14} />
            </motion.span>
          </motion.button>

          <AnimatePresence>
            {openDropdown === "status" && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setOpenDropdown(null)}
                />
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 mt-2 border border-[var(--mc-line)] rounded-xl bg-[var(--mc-card)] shadow-[var(--sh-dropdown)] z-30 min-w-[220px] overflow-hidden"
                >
                  <div className="p-2">
                    <p className="px-3 py-2 text-[11px] uppercase tracking-wider text-[var(--mc-text-soft)] font-semibold">
                      Filter by Status
                    </p>
                    <div className="space-y-1 max-h-[280px] overflow-y-auto">
                      {STATUSES.map((status) => (
                        <motion.button
                          key={status}
                          onClick={() => handleStatusToggle(status)}
                          whileHover={{ backgroundColor: "var(--mc-panel-soft)" }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] text-[var(--mc-text)] transition-colors"
                        >
                          <div className={`h-4 w-4 rounded border flex items-center justify-center transition-colors ${
                            filters.statuses.includes(status)
                              ? "bg-[var(--mc-accent-green)] border-[var(--mc-accent-green)]"
                              : "border-[var(--mc-line)] bg-[var(--mc-card)]"
                          }`}
                          >
                            {filters.statuses.includes(status) && <Check size={12} className="text-white" />}
                          </div>
                          <span className={`inline-block h-2 w-2 rounded-full ${STATUS_CONFIG[status].color}`} />
                          <span className="capitalize">{STATUS_CONFIG[status].label}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Agent Filter */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setOpenDropdown(openDropdown === "agent" ? null : "agent")}
            className={`px-3 py-2 rounded-lg border text-[13px] font-medium transition-all duration-200 flex items-center gap-2 ${
              filters.agentIds.length > 0
                ? "bg-[var(--mc-green-soft)] border-[var(--mc-green)]/30 text-[var(--mc-green)]"
                : "bg-[var(--mc-card)] border-[var(--mc-line)] text-[var(--mc-text)] hover:border-[var(--mc-line-strong)]"
            }`}
          >
            <span>Agent</span>
            {filters.agentIds.length > 0 && (
              <span className="bg-[var(--mc-green)] text-white rounded-full px-1.5 text-[10px] font-semibold"
              >
                {filters.agentIds.length}
              </span>
            )}
            <motion.span
              animate={{ rotate: openDropdown === "agent" ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown size={14} />
            </motion.span>
          </motion.button>

          <AnimatePresence>
            {openDropdown === "agent" && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setOpenDropdown(null)}
                />
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 mt-2 border border-[var(--mc-line)] rounded-xl bg-[var(--mc-card)] shadow-[var(--sh-dropdown)] z-30 min-w-[240px] overflow-hidden"
                >
                  <div className="p-2">
                    <p className="px-3 py-2 text-[11px] uppercase tracking-wider text-[var(--mc-text-soft)] font-semibold">
                      Filter by Agent
                    </p>
                    <div className="space-y-1 max-h-[280px] overflow-y-auto">
                      {agents.map((agent) => (
                        <motion.button
                          key={agent._id}
                          onClick={() => handleAgentToggle(agent.agentId)}
                          whileHover={{ backgroundColor: "var(--mc-panel-soft)" }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] text-[var(--mc-text)] transition-colors"
                        >
                          <div className={`h-4 w-4 rounded border flex items-center justify-center transition-colors ${
                            filters.agentIds.includes(agent.agentId)
                              ? "bg-[var(--mc-accent-green)] border-[var(--mc-accent-green)]"
                              : "border-[var(--mc-line)] bg-[var(--mc-card)]"
                          }`}
                          >
                            {filters.agentIds.includes(agent.agentId) && <Check size={12} className="text-white" />}
                          </div>
                          <span className="text-[16px]">{agent.emoji}</span>
                          <div className="flex-1 text-left">
                            <p className="font-medium">{agent.name}</p>
                            <p className="text-[11px] text-[var(--mc-text-muted)]">{agent.role}</p>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Priority Filter */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setOpenDropdown(openDropdown === "priority" ? null : "priority")}
            className={`px-3 py-2 rounded-lg border text-[13px] font-medium transition-all duration-200 flex items-center gap-2 ${
              filters.priorities.length > 0
                ? "bg-[var(--mc-green-soft)] border-[var(--mc-green)]/30 text-[var(--mc-green)]"
                : "bg-[var(--mc-card)] border-[var(--mc-line)] text-[var(--mc-text)] hover:border-[var(--mc-line-strong)]"
            }`}
          >
            <span>Priority</span>
            {filters.priorities.length > 0 && (
              <span className="bg-[var(--mc-green)] text-white rounded-full px-1.5 text-[10px] font-semibold"
              >
                {filters.priorities.length}
              </span>
            )}
            <motion.span
              animate={{ rotate: openDropdown === "priority" ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown size={14} />
            </motion.span>
          </motion.button>

          <AnimatePresence>
            {openDropdown === "priority" && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setOpenDropdown(null)}
                />
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 mt-2 border border-[var(--mc-line)] rounded-xl bg-[var(--mc-card)] shadow-[var(--sh-dropdown)] z-30 min-w-[180px] overflow-hidden"
                >
                  <div className="p-2">
                    <p className="px-3 py-2 text-[11px] uppercase tracking-wider text-[var(--mc-text-soft)] font-semibold">
                      Filter by Priority
                    </p>
                    <div className="space-y-1">
                      {PRIORITIES.map((priority) => (
                        <motion.button
                          key={priority}
                          onClick={() => handlePriorityToggle(priority)}
                          whileHover={{ backgroundColor: "var(--mc-panel-soft)" }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] text-[var(--mc-text)] transition-colors"
                        >
                          <div className={`h-4 w-4 rounded border flex items-center justify-center transition-colors ${
                            filters.priorities.includes(priority)
                              ? "bg-[var(--mc-accent-green)] border-[var(--mc-accent-green)]"
                              : "border-[var(--mc-line)] bg-[var(--mc-card)]"
                          }`}
                          >
                            {filters.priorities.includes(priority) && <Check size={12} className="text-white" />}
                          </div>
                          <span className={`inline-block h-2 w-2 rounded-full ${PRIORITY_CONFIG[priority].color}`} />
                          <span className="capitalize">{PRIORITY_CONFIG[priority].label}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Presets Dropdown */}
        <div className="relative ml-auto">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setOpenDropdown(openDropdown === "presets" ? null : "presets")}
            className="px-3 py-2 rounded-lg border border-[var(--mc-line)] bg-[var(--mc-card)] text-[13px] font-medium text-[var(--mc-text)] hover:border-[var(--mc-line-strong)] transition-all duration-200 flex items-center gap-2"
          >
            <Filter size={14} />
            <span>Presets</span>
            <motion.span
              animate={{ rotate: openDropdown === "presets" ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown size={14} />
            </motion.span>
          </motion.button>

          <AnimatePresence>
            {openDropdown === "presets" && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setOpenDropdown(null)}
                />
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full right-0 mt-2 border border-[var(--mc-line)] rounded-xl bg-[var(--mc-card)] shadow-[var(--sh-dropdown)] z-30 min-w-[200px] overflow-hidden"
                >
                  <div className="p-2">
                    <p className="px-3 py-2 text-[11px] uppercase tracking-wider text-[var(--mc-text-soft)] font-semibold">
                      Saved Presets
                    </p>
                    <div className="space-y-1 max-h-[240px] overflow-y-auto">
                      {presets.map((preset) => (
                        <motion.button
                          key={preset.id}
                          onClick={() => loadPreset(preset)}
                          whileHover={{ backgroundColor: "var(--mc-panel-soft)" }}
                          className="w-full text-left px-3 py-2.5 rounded-lg text-[13px] text-[var(--mc-text)] transition-colors flex items-center gap-2"
                        >
                          <Filter size={14} className="text-[var(--mc-text-muted)]" />
                          {preset.name}
                        </motion.button>
                      ))}
                    </div>
                    <div className="border-t border-[var(--mc-line)] pt-2 mt-2">
                      <motion.button
                        onClick={() => {
                          setSavePresetOpen(true);
                          setOpenDropdown(null);
                        }}
                        whileHover={{ backgroundColor: "var(--mc-panel-soft)" }}
                        className="w-full text-left px-3 py-2.5 rounded-lg text-[13px] text-[var(--mc-accent-green)] transition-colors flex items-center gap-2 font-medium"
                      >
                        <Save size={14} />
                        Save Current as Preset
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Clear All */}
        <AnimatePresence>
          {hasActiveFilters && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={clearAllFilters}
              className="px-3 py-2 rounded-lg text-[13px] text-[var(--mc-text-soft)] hover:text-[var(--mc-text)] hover:bg-[var(--mc-panel-soft)] transition-all duration-200 flex items-center gap-1.5"
            >
              <X size={14} />
              Clear All
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Save Preset Modal */}
      <AnimatePresence>
        {savePresetOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setSavePresetOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-[var(--mc-card)] rounded-xl border border-[var(--mc-line)] p-6 min-w-[340px] shadow-[var(--sh-modal)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="h-10 w-10 rounded-xl bg-[var(--mc-green-soft)] flex items-center justify-center">
                  <Save size={20} className="text-[var(--mc-green)]" />
                </div>
                <div>
                  <h3 className="text-[16px] font-semibold text-[var(--mc-text)]">Save Preset</h3>
                  <p className="text-[13px] text-[var(--mc-text-muted)]">Save your current filter configuration</p>
                </div>
              </div>
              
              <input
                type="text"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                placeholder="e.g., Q1 Priority Tasks"
                className="w-full px-4 py-3 rounded-xl border border-[var(--mc-line)] bg-[var(--mc-panel-soft)] text-[14px] text-[var(--mc-text)] placeholder:text-[var(--mc-text-soft)] outline-none focus:border-[var(--mc-accent-green)] focus:ring-2 focus:ring-[var(--mc-accent-green)]/20 transition-all mb-5"
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSavePresetOpen(false)}
                  className="px-4 py-2.5 rounded-lg text-[13px] text-[var(--mc-text)] hover:bg-[var(--mc-panel-soft)] transition-colors font-medium"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={savePreset}
                  disabled={!presetName.trim()}
                  className="px-4 py-2.5 rounded-lg bg-[var(--mc-accent-green)] text-white text-[13px] font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity shadow-sm"
                >
                  Save Preset
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
