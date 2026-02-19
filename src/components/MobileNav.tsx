"use client";

import { LayoutGrid, Users, Bell, MoreHorizontal } from "lucide-react";

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
  const tabs = [
    { id: "board" as const, label: "Board", icon: LayoutGrid },
    { id: "agents" as const, label: "Agents", icon: Users },
    { id: "feed" as const, label: "Feed", icon: Bell },
    { id: "more" as const, label: "More", icon: MoreHorizontal },
  ] as const;

  return (
    <>
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
                onClick={() => onTabChange(tab.id)}
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
