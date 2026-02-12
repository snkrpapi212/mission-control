"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutGrid, Users, Bell, MoreHorizontal, X, Settings, Plus, Sparkles } from "lucide-react";

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
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              aria-hidden="true"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-full max-w-[300px] bg-[var(--mc-panel)]/95 backdrop-blur-xl border-r border-[var(--mc-line)] shadow-2xl overflow-y-auto lg:hidden"
            >
              {/* Drawer Header */}
              <div className="px-5 py-4 border-b border-[var(--mc-line)] flex items-center justify-between bg-[var(--mc-panel-soft)]/50">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[var(--mc-amber)] to-[var(--mc-amber)]/70 text-white shadow-sm flex items-center justify-center">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h2 className="text-[16px] font-bold tracking-tight text-[var(--mc-text)]">
                      Mission Control
                    </h2>
                    <p className="text-[11px] text-[var(--mc-text-soft)]">Live Operations</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setMenuOpen(false)}
                  className="h-9 w-9 rounded-xl hover:bg-[var(--mc-line)] flex items-center justify-center text-[var(--mc-text-muted)] transition-colors"
                  aria-label="Close menu"
                >
                  <X size={20} />
                </motion.button>
              </div>

              {/* Drawer Content */}
              <nav className="p-3 space-y-1" aria-label="Mobile navigation">
                <p className="px-3 py-2 text-[11px] uppercase tracking-wider text-[var(--mc-text-soft)] font-semibold">
                  Navigation
                </p>
                
                {[
                  { id: "board" as const, label: "Task Board", icon: LayoutGrid },
                  { id: "agents" as const, label: "Agents", icon: Users },
                  { id: "feed" as const, label: "Activity Feed", icon: Bell },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <motion.button
                      key={item.id}
                      onClick={() => {
                        onTabChange(item.id);
                        setMenuOpen(false);
                      }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-[14px] font-medium transition-all ${
                        isActive
                          ? "bg-[var(--mc-accent-green)] text-white shadow-md"
                          : "text-[var(--mc-text)] hover:bg-[var(--mc-panel-soft)]"
                      }`}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <div className={`p-1.5 rounded-lg ${isActive ? "bg-white/20" : ""}`}>
                        <Icon size={18} />
                      </div>
                      {item.label}
                      {isActive && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="ml-auto h-2 w-2 rounded-full bg-white"
                        />
                      )}
                    </motion.button>
                  );
                })}

                <div className="border-t border-[var(--mc-line)] pt-3 mt-3 space-y-1">
                  <p className="px-3 py-2 text-[11px] uppercase tracking-wider text-[var(--mc-text-soft)] font-semibold">
                    Actions
                  </p>
                  
                  <motion.button
                    onClick={() => {
                      onTabChange("more");
                      setMenuOpen(false);
                    }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-[14px] font-medium text-[var(--mc-text)] hover:bg-[var(--mc-panel-soft)] transition-colors"
                  >
                      <div className="p-1.5 rounded-lg bg-[var(--mc-green-soft)] text-[var(--mc-green)]">
                      <Plus size={18} />
                      </div>
                      Create Task
                    </motion.button>
                  
                  <motion.button
                    onClick={() => {
                      onSettingsClick();
                      setMenuOpen(false);
                    }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-[14px] font-medium text-[var(--mc-text)] hover:bg-[var(--mc-panel-soft)] transition-colors"
                  >
                    <div className="p-1.5 rounded-lg bg-[var(--mc-panel-soft)] text-[var(--mc-text-muted)]">
                      <Settings size={18} />
                    </div>
                    Settings
                  </motion.button>
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
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--mc-line)] bg-[var(--mc-panel)]/90 backdrop-blur-xl lg:hidden safe-area-pb shadow-[0_-4px_20px_rgba(0,0,0,0.05)]"
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
                whileTap={{ scale: 0.9 }}
                className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors relative ${
                  isActive
                    ? "text-[var(--mc-accent-green)]"
                    : "text-[var(--mc-text-muted)]"
                }`}
                role="tab"
                aria-selected={isActive}
                aria-label={tab.label}
              >
                <motion.div
                  animate={{
                    backgroundColor: isActive ? "var(--mc-accent-green-soft)" : "transparent",
                    scale: isActive ? 1 : 1,
                  }}
                  className={`p-2 rounded-xl transition-colors`}
                >
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                </motion.div>
                <span className="text-[10px] font-semibold uppercase tracking-[0.08em]">
                  {tab.label}
                </span>
                
                {isActive && (
                  <motion.div
                    layoutId="mobileTabIndicator"
                    className="absolute -top-[1px] left-1/2 -translate-x-1/2 w-8 h-[2px] bg-[var(--mc-accent-green)] rounded-full"
                  />
                )}
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
