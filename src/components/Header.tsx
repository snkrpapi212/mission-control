"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Moon,
  Plus,
  Search,
  Sparkles,
  Sun,
  LogOut,
  User,
  Settings,
  Monitor,
} from "lucide-react";
import { ConnectionStatus } from "./ConnectionStatus";
import { DashboardCustomization, type CustomizationPrefs } from "./DashboardCustomization";

interface HeaderProps {
  activeAgentCount: number;
  taskCount: number;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  onLogout: () => void;
  onNewTask: () => void;
  onSearchClick: () => void;
  customizationPrefs: CustomizationPrefs;
  // eslint-disable-next-line no-unused-vars
  onPrefsChange: (next: CustomizationPrefs) => void;
}

export function Header({
  activeAgentCount,
  taskCount,
  theme,
  onToggleTheme,
  onLogout,
  onNewTask,
  onSearchClick,
  customizationPrefs,
  onPrefsChange,
}: HeaderProps) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <header 
      className="sticky top-0 z-40 w-full border-b border-[var(--mc-line)] bg-[var(--mc-panel)]/80 backdrop-blur-md"
      role="banner"
    >
      <div className="mx-auto flex h-16 max-w-[1800px] items-center justify-between px-4 lg:px-6">
        {/* Left Area: Logo & Brand */}
        <div className="flex items-center gap-4">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2.5"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--mc-amber)] to-[var(--mc-amber)]/70 text-white shadow-sm ring-1 ring-[var(--mc-line)]">
              <Sparkles size={18} />
            </div>
            <div className="hidden flex-col sm:flex">
              <h1 className="text-[15px] font-bold tracking-tight text-[var(--mc-text)]">
                Mission Control
              </h1>
              <div className="flex items-center gap-1.5">
                <span className="flex h-1.5 w-1.5 rounded-full bg-[var(--mc-green)] animate-pulse" />
                <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--mc-text-soft)]">
                  Live Operations
                </span>
              </div>
            </div>
          </motion.div>

          {/* Stats (Desktop) */}
          <div className="ml-4 hidden items-center gap-6 border-l border-[var(--mc-line)] pl-6 lg:flex">
            <div className="flex flex-col">
              <span className="text-[13px] font-semibold text-[var(--mc-text)]">{activeAgentCount}</span>
              <span className="text-[10px] font-medium text-[var(--mc-text-soft)] uppercase tracking-wider">Agents</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-semibold text-[var(--mc-text)]">{taskCount}</span>
              <span className="text-[10px] font-medium text-[var(--mc-text-soft)] uppercase tracking-wider">Tasks</span>
            </div>
          </div>
        </div>

        {/* Center Area: Search / Command Palette */}
        <div className="flex flex-1 items-center justify-center px-4 md:px-8">
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={onSearchClick}
            className="group relative flex w-full max-w-md items-center gap-3 rounded-full border border-[var(--mc-line)] bg-[var(--mc-card)] px-4 py-2 transition-all hover:border-[var(--mc-text-soft)]/30 hover:shadow-sm"
          >
            <Search size={14} className="text-[var(--mc-text-soft)] transition-colors group-hover:text-[var(--mc-text)]" />
            <span className="flex-1 text-left text-xs text-[var(--mc-text-soft)] group-hover:text-[var(--mc-text-muted)]">
              Search agents, tasks, or commands...
            </span>
            <div className="flex items-center gap-1 rounded border border-[var(--mc-line)] bg-[var(--mc-panel-soft)] px-1.5 py-0.5">
              <span className="text-[10px] font-medium text-[var(--mc-text-soft)]">⌘</span>
              <span className="text-[10px] font-medium text-[var(--mc-text-soft)]">K</span>
            </div>
          </motion.button>
        </div>

        {/* Right Area: Actions & User */}
        <div className="flex items-center gap-2 lg:gap-3">
          {/* Quick Action: New Task */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onNewTask}
            className="hidden h-9 items-center gap-1.5 rounded-full bg-[var(--mc-text)] px-4 text-xs font-semibold text-[var(--mc-bg)] shadow-sm transition-all hover:opacity-90 sm:flex"
          >
            <Plus size={14} />
            <span>New Task</span>
          </motion.button>

          <div className="h-6 w-[1px] bg-[var(--mc-line)] mx-1 hidden sm:block" />

          {/* Theme Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--mc-line)] bg-[var(--mc-card)] text-[var(--mc-text-soft)] transition-colors hover:text-[var(--mc-text)]"
            aria-label="Toggle theme"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={theme}
                initial={{ y: 10, opacity: 0, rotate: -45 }}
                animate={{ y: 0, opacity: 1, rotate: 0 }}
                exit={{ y: -10, opacity: 0, rotate: 45 }}
                transition={{ duration: 0.2 }}
              >
                {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
              </motion.div>
            </AnimatePresence>
          </motion.button>

          {/* Notifications */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--mc-line)] bg-[var(--mc-card)] text-[var(--mc-text-soft)] transition-colors hover:text-[var(--mc-text)]"
              aria-label="Notifications"
            >
              <Bell size={16} />
              <span className="absolute right-0.5 top-0.5 flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--mc-red)] opacity-75"></span>
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[var(--mc-red)]"></span>
              </span>
            </motion.button>
          </div>

          <div className="hidden lg:block">
            <ConnectionStatus />
          </div>

          {/* User Menu */}
          <div className="relative ml-1">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-[var(--mc-line)] bg-[var(--mc-panel-soft)] transition-all hover:ring-2 hover:ring-[var(--mc-line)]"
            >
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[var(--mc-text-soft)]/20 to-[var(--mc-text-soft)]/10 text-[var(--mc-text)]">
                <User size={18} />
              </div>
            </motion.button>

            <AnimatePresence>
              {isUserMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setIsUserMenuOpen(false)} 
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl border border-[var(--mc-line)] bg-[var(--mc-card)] p-1.5 shadow-xl z-20"
                  >
                    <div className="px-3 py-2 border-b border-[var(--mc-line)] mb-1">
                      <p className="text-xs font-bold text-[var(--mc-text)]">Admin User</p>
                      <p className="text-[10px] text-[var(--mc-text-soft)] truncate">admin@missioncontrol.ai</p>
                    </div>
                    
                    <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs transition-colors hover:bg-[var(--mc-panel-soft)] text-[var(--mc-text)]">
                      <Settings size={14} className="text-[var(--mc-text-soft)]" />
                      Settings
                    </button>
                    
                    <DashboardCustomization
                      prefs={customizationPrefs}
                      onPrefsChange={onPrefsChange}
                      trigger={
                        <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs transition-colors hover:bg-[var(--mc-panel-soft)] text-[var(--mc-text)]">
                          <Monitor size={14} className="text-[var(--mc-text-soft)]" />
                          Display Prefs
                        </button>
                      }
                    />

                    <div className="my-1 h-[1px] bg-[var(--mc-line)]" />
                    
                    <button 
                      onClick={onLogout}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-[var(--mc-red)] transition-colors hover:bg-[var(--mc-red-soft)]"
                    >
                      <LogOut size={14} />
                      Logout
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
