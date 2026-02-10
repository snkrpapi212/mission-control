"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutGrid, Users, Bell, MoreHorizontal, X, Settings, Plus } from "lucide-react";

interface MobileNavProps {
  activeTab: "board" | "agents" | "feed" | "more";
  onTabChange: (_tab: "board" | "agents" | "feed" | "more") => void;
  onSettingsClick: () => void;
}

export function MobileNav({
  activeTab,
  onTabChange,
  onSettingsClick,
}: MobileNavProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const tabs = [
    { id: "board" as const, label: "Board", icon: LayoutGrid },
    { id: "agents" as const, label: "Agents", icon: Users },
    { id: "feed" as const, label: "Feed", icon: Bell },
    { id: "more" as const, label: "More", icon: MoreHorizontal },
  ] as const;

  return (
    <>
      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              aria-hidden="true"
            />

            {/* Drawer */}
            <motion.div
              initial={{ opacity: 0, x: -320 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -320 }}
              transition={{ duration: 0.25, type: "spring", stiffness: 320, damping: 28 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-full max-w-[280px] bg-[var(--mc-panel)] border-r border-[var(--mc-line)] shadow-xl overflow-y-auto lg:hidden"
            >
              {/* Drawer Header */}
              <div className="px-5 py-4 border-b border-[var(--mc-line)] flex items-center justify-between bg-[var(--mc-panel-soft)]">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg border border-[var(--mc-line)] bg-[var(--mc-card)] flex items-center justify-center text-[var(--mc-accent-green)]">
                    <Settings size={16} />
                  </div>
                  <h2 className="text-[15px] font-semibold tracking-tight text-[var(--mc-text)]">
                    Menu
                  </h2>
                </div>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="h-8 w-8 rounded-md hover:bg-[var(--mc-line)] flex items-center justify-center text-[var(--mc-text-muted)] transition-colors"
                  aria-label="Close menu"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Drawer Content */}
              <nav className="p-3 space-y-1" aria-label="Mobile navigation">
                {[
                  { id: "board" as const, label: "Task Board", icon: LayoutGrid },
                  { id: "agents" as const, label: "Agents", icon: Users },
                  { id: "feed" as const, label: "Activity Feed", icon: Bell },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onTabChange(item.id);
                        setMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-[14px] font-medium transition-colors ${
                        activeTab === item.id
                          ? "bg-[var(--mc-accent-green-soft)] text-[var(--mc-accent-green)]"
                          : "text-[var(--mc-text)] hover:bg-[var(--mc-panel-soft)]"
                      }`}
                      aria-current={activeTab === item.id ? "page" : undefined}
                    >
                      <Icon size={18} />
                      {item.label}
                    </button>
                  );
                })}

                <div className="border-t border-[var(--mc-line)] pt-3 mt-3 space-y-1">
                  <button
                    onClick={() => {
                      onTabChange("more");
                      setMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-[14px] font-medium text-[var(--mc-text)] hover:bg-[var(--mc-panel-soft)] transition-colors"
                  >
                    <Plus size={18} className="text-[var(--mc-accent-green)]" />
                    Create Task
                  </button>
                  <button
                    onClick={() => {
                      onSettingsClick();
                      setMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-[14px] font-medium text-[var(--mc-text)] hover:bg-[var(--mc-panel-soft)] transition-colors"
                  >
                    <Settings size={18} className="text-[var(--mc-accent-green)]" />
                    Settings
                  </button>
                </div>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom Tab Navigation (visible on mobile only) */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--mc-line)] bg-[var(--mc-panel)]/95 backdrop-blur-md lg:hidden safe-area-pb"
        role="tablist"
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-around h-16">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <motion.button
                key={tab.id}
                onClick={() => {
                  if (tab.id === "more") {
                    setMenuOpen(true);
                  } else {
                    onTabChange(tab.id);
                  }
                }}
                className={`flex flex-col items-center justify-center gap-1.5 flex-1 h-full transition-colors ${
                  isActive
                    ? "text-[var(--mc-accent-green)]"
                    : "text-[var(--mc-text-muted)]"
                }`}
                role="tab"
                aria-selected={isActive}
                aria-label={tab.label}
                whileTap={{ scale: 0.95 }}
              >
                <div className={`p-1.5 rounded-lg transition-colors ${isActive ? "bg-[var(--mc-accent-green-soft)]" : ""}`}>
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-[0.08em]">
                  {tab.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Bottom safe area spacer */}
      <div className="h-16 lg:hidden" />
    </>
  );
}
