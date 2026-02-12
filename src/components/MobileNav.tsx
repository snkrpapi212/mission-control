"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
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
            <div
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] lg:hidden"
              aria-hidden="true"
            />

            {/* Drawer */}
            <div
              className="fixed left-0 top-0 bottom-0 z-50 w-full max-w-[280px] bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-y-auto lg:hidden"
            >
              {/* Drawer Header */}
              <div className="px-5 py-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-zinc-900 dark:text-zinc-100">
                    <Settings size={16} />
                  </div>
                  <h2 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                    Menu
                  </h2>
                </div>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="h-8 w-8 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center text-zinc-400 transition-colors"
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
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onTabChange(item.id);
                        setMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? "bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 shadow-sm"
                          : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                      }`}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <Icon size={18} />
                      {item.label}
                    </button>
                  );
                })}

                <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3 mt-3 space-y-1">
                  <button
                    onClick={() => {
                      onTabChange("more");
                      setMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                  >
                    <Plus size={18} className="text-zinc-400" />
                    Create Task
                  </button>
                  <button
                    onClick={() => {
                      onSettingsClick();
                      setMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                  >
                    <Settings size={18} className="text-zinc-400" />
                    Settings
                  </button>
                </div>
              </nav>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom Tab Navigation (visible on mobile only) */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl lg:hidden safe-area-pb"
        role="tablist"
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-around h-16 px-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.id === "more") {
                    setMenuOpen(true);
                  } else {
                    onTabChange(tab.id);
                  }
                }}
                className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all ${
                  isActive
                    ? "text-zinc-900 dark:text-zinc-50"
                    : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                }`}
                role="tab"
                aria-selected={isActive}
                aria-label={tab.label}
              >
                <div className={`p-1.5 rounded-md transition-colors ${isActive ? "bg-zinc-100 dark:bg-zinc-800" : ""}`}>
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={`text-[10px] font-bold tracking-tight ${isActive ? "opacity-100" : "opacity-70"}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom safe area spacer */}
      <div className="h-16 lg:hidden" />
    </>
  );
}
