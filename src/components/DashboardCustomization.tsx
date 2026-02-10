"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface CustomizationPrefs {
  density: "compact" | "normal" | "spacious";
  showAgentsSidebar: boolean;
  showActivityFeed: boolean;
  showNotifications: boolean;
  columnOrder: string[];
  theme: "light" | "dark";
}

interface DashboardCustomizationProps {
  prefs: CustomizationPrefs;
  onPrefsChange: (_prefs: CustomizationPrefs) => void;
}

const DENSITY_LEVELS: Array<{
  id: "compact" | "normal" | "spacious";
  label: string;
  description: string;
}> = [
  { id: "compact", label: "Compact", description: "Minimal spacing" },
  { id: "normal", label: "Normal", description: "Default spacing" },
  { id: "spacious", label: "Spacious", description: "Extra breathing room" },
];

export function DashboardCustomization({
  prefs,
  onPrefsChange,
}: DashboardCustomizationProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleDensityChange = (density: "compact" | "normal" | "spacious") => {
    onPrefsChange({ ...prefs, density });
  };

  const handlePanelToggle = (
    panel: "showAgentsSidebar" | "showActivityFeed" | "showNotifications"
  ) => {
    onPrefsChange({
      ...prefs,
      [panel]: !prefs[panel],
    });
  };

  const handleThemeToggle = () => {
    const newTheme = prefs.theme === "light" ? "dark" : "light";
    onPrefsChange({ ...prefs, theme: newTheme });
  };

  return (
    <>
      {/* Settings Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 rounded hover:bg-[var(--mc-panel-soft)] transition-colors text-[18px]"
        title="Customization settings"
      >
        ⚙️
      </button>

      {/* Customization Panel - Slide-out from right */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40 bg-black/40"
              aria-hidden="true"
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, x: 400 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 400 }}
              transition={{
                duration: 0.3,
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
              className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm bg-[var(--mc-panel)] shadow-lg overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 z-10 border-b border-[var(--mc-line)] bg-[var(--mc-panel-soft)] px-6 py-4 flex items-center justify-between">
                <h2 className="text-[18px] font-semibold text-[var(--mc-text)]">
                  Settings
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded hover:bg-[var(--mc-line)] transition-colors text-[var(--mc-text-muted)]"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Theme Section */}
                <div>
                  <p className="text-[13px] font-semibold uppercase tracking-[0.1em] text-[var(--mc-text-muted)] mb-3">
                    Theme
                  </p>
                  <button
                    onClick={handleThemeToggle}
                    className="w-full px-4 py-3 rounded border border-[var(--mc-line)] bg-[var(--mc-card)] hover:bg-[var(--mc-panel-soft)] transition-colors flex items-center justify-between text-[13px] font-semibold text-[var(--mc-text)]"
                  >
                    <span>{prefs.theme === "light" ? "☀️ Light" : "🌙 Dark"}</span>
                    <span>Switch</span>
                  </button>
                </div>

                {/* Density Section */}
                <div>
                  <p className="text-[13px] font-semibold uppercase tracking-[0.1em] text-[var(--mc-text-muted)] mb-3">
                    Card Density
                  </p>
                  <div className="space-y-2">
                    {DENSITY_LEVELS.map((level) => (
                      <motion.button
                        key={level.id}
                        onClick={() => handleDensityChange(level.id)}
                        className={`w-full px-4 py-3 rounded border-2 transition-all text-left ${
                          prefs.density === level.id
                            ? "border-[var(--mc-accent-green)] bg-[var(--mc-accent-green-soft)]"
                            : "border-[var(--mc-line)] bg-[var(--mc-card)] hover:bg-[var(--mc-panel-soft)]"
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <p className="text-[13px] font-semibold text-[var(--mc-text)]">
                          {level.label}
                        </p>
                        <p className="text-[11px] text-[var(--mc-text-soft)] mt-1">
                          {level.description}
                        </p>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Panel Visibility Section */}
                <div>
                  <p className="text-[13px] font-semibold uppercase tracking-[0.1em] text-[var(--mc-text-muted)] mb-3">
                    Panel Visibility
                  </p>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-3 rounded hover:bg-[var(--mc-panel-soft)] cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={prefs.showAgentsSidebar}
                        onChange={() => handlePanelToggle("showAgentsSidebar")}
                        className="w-4 h-4 rounded cursor-pointer"
                      />
                      <span className="text-[13px] text-[var(--mc-text)]">
                        👥 Agents Sidebar
                      </span>
                    </label>

                    <label className="flex items-center gap-3 p-3 rounded hover:bg-[var(--mc-panel-soft)] cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={prefs.showActivityFeed}
                        onChange={() => handlePanelToggle("showActivityFeed")}
                        className="w-4 h-4 rounded cursor-pointer"
                      />
                      <span className="text-[13px] text-[var(--mc-text)]">
                        📊 Activity Feed
                      </span>
                    </label>

                    <label className="flex items-center gap-3 p-3 rounded hover:bg-[var(--mc-panel-soft)] cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={prefs.showNotifications}
                        onChange={() => handlePanelToggle("showNotifications")}
                        className="w-4 h-4 rounded cursor-pointer"
                      />
                      <span className="text-[13px] text-[var(--mc-text)]">
                        🔔 Notifications
                      </span>
                    </label>
                  </div>
                </div>

                {/* About Section */}
                <div>
                  <p className="text-[13px] font-semibold uppercase tracking-[0.1em] text-[var(--mc-text-muted)] mb-3">
                    About
                  </p>
                  <div className="space-y-2 text-[12px] text-[var(--mc-text-soft)]">
                    <p>
                      <strong>Version:</strong> 2.0.0-beta
                    </p>
                    <p>
                      <strong>Keyboard Shortcuts:</strong>
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Cmd+K - Command Palette</li>
                      <li>Cmd+Enter - Submit</li>
                      <li>Esc - Close</li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
