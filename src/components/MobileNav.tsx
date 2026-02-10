"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface MobileNavProps {
  activeTab: "board" | "feed" | "filters" | "more";
  onTabChange: (tab: "board" | "feed" | "filters" | "more") => void;
  onSettingsClick: () => void;
}

export function MobileNav({
  activeTab,
  onTabChange,
  onSettingsClick,
}: MobileNavProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const tabs = [
    { id: "board", label: "Board", icon: "📋" },
    { id: "feed", label: "Feed", icon: "📭" },
    { id: "filters", label: "Filters", icon: "🔍" },
    { id: "more", label: "More", icon: "⋯" },
  ] as const;

  return (
    <>
      {/* Hamburger Menu (visible on mobile) */}
      <motion.button
        onClick={() => setMenuOpen(!menuOpen)}
        className="lg:hidden fixed left-4 top-4 z-40 p-2 rounded hover:bg-[var(--mc-panel-soft)] transition-colors"
        aria-label="Open menu"
        aria-expanded={menuOpen}
      >
        <motion.div
          animate={{ rotate: menuOpen ? 90 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-[20px]"
        >
          ☰
        </motion.div>
      </motion.button>

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
              className="lg:hidden fixed inset-0 z-30 bg-black/40"
              aria-hidden="true"
            />

            {/* Drawer */}
            <motion.div
              initial={{ opacity: 0, x: -320 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -320 }}
              transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 30 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 z-40 w-full max-w-xs bg-[var(--mc-panel)] shadow-lg overflow-y-auto"
            >
              {/* Drawer Header */}
              <div className="p-6 border-b border-[var(--mc-line)] flex items-center justify-between">
                <h2 className="text-[18px] font-semibold text-[var(--mc-text)]">
                  Menu
                </h2>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="p-1 rounded hover:bg-[var(--mc-panel-soft)] text-[var(--mc-text-muted)]"
                  aria-label="Close menu"
                >
                  ✕
                </button>
              </div>

              {/* Drawer Content */}
              <div className="p-4 space-y-2">
                <button
                  onClick={() => {
                    onTabChange("board");
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 rounded hover:bg-[var(--mc-panel-soft)] transition-colors text-[13px] font-semibold text-[var(--mc-text)]"
                  aria-current={activeTab === "board" ? "page" : undefined}
                >
                  📋 Task Board
                </button>
                <button
                  onClick={() => {
                    onTabChange("feed");
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 rounded hover:bg-[var(--mc-panel-soft)] transition-colors text-[13px] font-semibold text-[var(--mc-text)]"
                  aria-current={activeTab === "feed" ? "page" : undefined}
                >
                  📭 Activity Feed
                </button>
                <button
                  onClick={() => {
                    onTabChange("filters");
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 rounded hover:bg-[var(--mc-panel-soft)] transition-colors text-[13px] font-semibold text-[var(--mc-text)]"
                  aria-current={activeTab === "filters" ? "page" : undefined}
                >
                  🔍 Filters
                </button>

                <div className="border-t border-[var(--mc-line)] pt-4 mt-4">
                  <button
                    onClick={() => {
                      onSettingsClick();
                      setMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 rounded hover:bg-[var(--mc-panel-soft)] transition-colors text-[13px] font-semibold text-[var(--mc-accent-green)]"
                  >
                    ⚙️ Settings
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom Tab Navigation (visible on mobile) */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="lg:hidden fixed bottom-0 left-0 right-0 z-30 border-t border-[var(--mc-line)] bg-[var(--mc-panel)] flex items-center justify-around h-16"
        role="tablist"
        aria-label="Main navigation"
      >
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 h-full flex flex-col items-center justify-center gap-1 transition-colors ${
              activeTab === tab.id
                ? "bg-[var(--mc-accent-green-soft)] text-[var(--mc-accent-green)]"
                : "text-[var(--mc-text-muted)] hover:text-[var(--mc-text)]"
            }`}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-label={tab.label}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-[20px]">{tab.icon}</span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.05em]">
              {tab.label}
            </span>
          </motion.button>
        ))}
      </motion.div>

      {/* Bottom padding on body to account for bottom nav */}
      <div className="lg:hidden h-16" />
    </>
  );
}
