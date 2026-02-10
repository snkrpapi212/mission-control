"use client";

import { useState, useRef, useEffect } from "react";
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

const dropdownVariants = {
  hidden: { opacity: 0, y: -6 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
};

export function SmartFilters({ agents, onFiltersChange }: SmartFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    statuses: [],
    agentIds: [],
    priorities: [],
  });

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [pressedDropdown, setPressedDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
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
  const [presetNameError, setPresetNameError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const savePreset = async () => {
    setPresetNameError("");
    
    if (!presetName.trim()) {
      setPresetNameError("Preset name is required");
      return;
    }
    
    if (presets.some(p => p.name.toLowerCase() === presetName.trim().toLowerCase())) {
      setPresetNameError("A preset with this name already exists");
      return;
    }

    setIsSaving(true);
    
    // Simulate async save
    await new Promise(resolve => setTimeout(resolve, 150));
    
    const newPreset: Preset = {
      id: `preset-${Date.now()}`,
      name: presetName.trim(),
      filters,
    };
    setPresets([...presets, newPreset]);
    setPresetName("");
    setSavePresetOpen(false);
    setIsSaving(false);
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

  const FilterButton = ({ 
    id, 
    label, 
    count 
  }: { 
    id: string; 
    label: string; 
    count: number;
  }) => (
    <button
      onClick={() => setOpenDropdown(openDropdown === id ? null : id)}
      onMouseDown={() => setPressedDropdown(id)}
      onMouseUp={() => setPressedDropdown(null)}
      onMouseLeave={() => setPressedDropdown(null)}
      onTouchStart={() => setPressedDropdown(id)}
      onTouchEnd={() => setPressedDropdown(null)}
      aria-expanded={openDropdown === id}
      aria-haspopup="listbox"
      className={`mc-btn ${openDropdown === id ? 'bg-[var(--mc-panel-soft)] border-[var(--mc-line-strong)]' : ''} ${pressedDropdown === id ? 'scale-[0.97]' : ''}`}
    >
      <span>{label}</span>
      {count > 0 && (
        <span className="bg-[var(--mc-green)] text-white rounded-full px-1.5 min-w-[20px] text-[11px] font-bold flex items-center justify-center">
          {count}
        </span>
      )}
      <svg 
        className={`w-3 h-3 text-[var(--mc-text-soft)] transition-transform duration-150 ${openDropdown === id ? 'rotate-180' : ''}`} 
        fill="currentColor" 
        viewBox="0 0 12 12"
        aria-hidden="true"
      >
        <path d="M6 8L1 3h10z" />
      </svg>
    </button>
  );

  return (
    <div ref={dropdownRef} className="border-b border-[var(--mc-line)] bg-[var(--mc-panel)] px-4 py-3 sticky top-[calc(var(--h-topbar)+var(--h-panelheader))] z-20">
      {/* Filter Bar */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Status Filter */}
        <div className="relative">
          <FilterButton id="status" label="Status" count={filters.statuses.length} />

          {/* Status Dropdown */}
          <AnimatePresence>
            {openDropdown === "status" && (
              <motion.div
                variants={dropdownVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.14, ease: [0.25, 0.1, 0.25, 1] }}
                className="absolute top-full left-0 mt-2 border border-[var(--mc-line)] rounded-lg bg-[var(--mc-panel)] shadow-lg z-30 min-w-[200px] overflow-hidden"
                role="listbox"
                aria-label="Status filter options"
              >
                <div className="p-2 space-y-0.5 max-h-[300px] overflow-y-auto">
                  {STATUSES.map((status) => (
                    <label
                      key={status}
                      className="flex items-center gap-3 cursor-pointer text-[13px] text-[var(--mc-text)] hover:bg-[var(--mc-panel-soft)] px-3 py-2 rounded-md transition-colors duration-120"
                    >
                      <input
                        type="checkbox"
                        checked={filters.statuses.includes(status)}
                        onChange={() => handleStatusToggle(status)}
                        className="mc-checkbox"
                        aria-checked={filters.statuses.includes(status)}
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
          <FilterButton id="agent" label="Agent" count={filters.agentIds.length} />

          {/* Agent Dropdown */}
          <AnimatePresence>
            {openDropdown === "agent" && (
              <motion.div
                variants={dropdownVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.14, ease: [0.25, 0.1, 0.25, 1] }}
                className="absolute top-full left-0 mt-2 border border-[var(--mc-line)] rounded-lg bg-[var(--mc-panel)] shadow-lg z-30 min-w-[220px] overflow-hidden"
                role="listbox"
                aria-label="Agent filter options"
              >
                <div className="p-2 space-y-0.5 max-h-[300px] overflow-y-auto">
                  {agents.length === 0 ? (
                    <p className="text-[13px] text-[var(--mc-text-soft)] px-3 py-2">No agents available</p>
                  ) : (
                    agents.map((agent) => (
                      <label
                        key={agent._id}
                        className="flex items-center gap-3 cursor-pointer text-[13px] text-[var(--mc-text)] hover:bg-[var(--mc-panel-soft)] px-3 py-2 rounded-md transition-colors duration-120"
                      >
                        <input
                          type="checkbox"
                          checked={filters.agentIds.includes(agent.agentId)}
                          onChange={() => handleAgentToggle(agent.agentId)}
                          className="mc-checkbox"
                          aria-checked={filters.agentIds.includes(agent.agentId)}
                        />
                        <span className="text-[16px]" aria-hidden="true">{agent.emoji}</span>
                        <span>{agent.name}</span>
                      </label>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Priority Filter */}
        <div className="relative">
          <FilterButton id="priority" label="Priority" count={filters.priorities.length} />

          {/* Priority Dropdown */}
          <AnimatePresence>
            {openDropdown === "priority" && (
              <motion.div
                variants={dropdownVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.14, ease: [0.25, 0.1, 0.25, 1] }}
                className="absolute top-full left-0 mt-2 border border-[var(--mc-line)] rounded-lg bg-[var(--mc-panel)] shadow-lg z-30 min-w-[160px] overflow-hidden"
                role="listbox"
                aria-label="Priority filter options"
              >
                <div className="p-2 space-y-0.5">
                  {PRIORITIES.map((priority) => (
                    <label
                      key={priority}
                      className="flex items-center gap-3 cursor-pointer text-[13px] text-[var(--mc-text)] hover:bg-[var(--mc-panel-soft)] px-3 py-2 rounded-md transition-colors duration-120"
                    >
                      <input
                        type="checkbox"
                        checked={filters.priorities.includes(priority)}
                        onChange={() => handlePriorityToggle(priority)}
                        className="mc-checkbox"
                        aria-checked={filters.priorities.includes(priority)}
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
            onClick={() => setOpenDropdown(openDropdown === "presets" ? null : "presets")}
            onMouseDown={() => setPressedDropdown("presets")}
            onMouseUp={() => setPressedDropdown(null)}
            onMouseLeave={() => setPressedDropdown(null)}
            aria-expanded={openDropdown === "presets"}
            aria-haspopup="listbox"
            className={`mc-btn mc-btn-ghost ${pressedDropdown === "presets" ? 'scale-[0.97]' : ''}`}
          >
            <span>Presets</span>
            <svg 
              className={`w-3 h-3 text-[var(--mc-text-soft)] transition-transform duration-150 ${openDropdown === "presets" ? 'rotate-180' : ''}`} 
              fill="currentColor" 
              viewBox="0 0 12 12"
              aria-hidden="true"
            >
              <path d="M6 8L1 3h10z" />
            </svg>
          </button>

          <AnimatePresence>
            {openDropdown === "presets" && (
              <motion.div
                variants={dropdownVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.14, ease: [0.25, 0.1, 0.25, 1] }}
                className="absolute top-full right-0 mt-2 border border-[var(--mc-line)] rounded-lg bg-[var(--mc-panel)] shadow-lg z-30 min-w-[180px] overflow-hidden"
                role="listbox"
                aria-label="Filter presets"
              >
                <div className="p-1.5 space-y-0.5 max-h-[300px] overflow-y-auto">
                  {presets.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => loadPreset(preset)}
                      className="w-full text-left px-3 py-2 rounded-md text-[13px] text-[var(--mc-text)] hover:bg-[var(--mc-panel-soft)] transition-colors duration-120"
                    >
                      {preset.name}
                    </button>
                  ))}
                  <div className="border-t border-[var(--mc-line)] pt-1.5 mt-1.5">
                    <button
                      onClick={() => setSavePresetOpen(true)}
                      className="w-full text-left px-3 py-2 rounded-md text-[13px] text-[var(--mc-green)] hover:bg-[var(--mc-panel-soft)] transition-colors duration-120 font-semibold flex items-center gap-2"
                    >
                      <span>+</span> Save Current as Preset
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
            className="mc-btn mc-btn-ghost text-[var(--mc-text-soft)] hover:text-[var(--mc-text)]"
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
            transition={{ duration: 0.14 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            onClick={() => !isSaving && setSavePresetOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="save-preset-title"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.14, ease: [0.25, 0.1, 0.25, 1] }}
              className="bg-[var(--mc-panel)] rounded-lg border border-[var(--mc-line)] p-6 min-w-[320px] max-w-[90vw] shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 
                id="save-preset-title"
                className="text-[16px] font-semibold text-[var(--mc-text)] mb-4"
              >
                Save Preset
              </h3>
              
              <div className="mb-4">
                <label htmlFor="preset-name" className="mc-label">
                  Preset Name
                </label>
                <input
                  id="preset-name"
                  type="text"
                  value={presetName}
                  onChange={(e) => {
                    setPresetName(e.target.value);
                    setPresetNameError("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !isSaving) {
                      savePreset();
                    }
                    if (e.key === "Escape") {
                      setSavePresetOpen(false);
                    }
                  }}
                  placeholder="e.g., Q1 Priority Tasks"
                  className={`mc-input ${presetNameError ? 'mc-error' : ''}`}
                  disabled={isSaving}
                  aria-invalid={presetNameError ? "true" : "false"}
                  aria-describedby={presetNameError ? "preset-error" : undefined}
                  autoFocus
                />
                {presetNameError && (
                  <p id="preset-error" className="mc-error-text">
                    <span aria-hidden="true">⚠</span> {presetNameError}
                  </p>
                )}
              </div>
              
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setSavePresetOpen(false)}
                  disabled={isSaving}
                  className="mc-btn mc-btn-ghost"
                >
                  Cancel
                </button>
                <button
                  onClick={savePreset}
                  disabled={!presetName.trim() || isSaving}
                  className="mc-btn mc-btn-primary min-w-[80px]"
                >
                  {isSaving ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Saving...
                    </span>
                  ) : "Save"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
