"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Moon,
  Plus,
  Search,
  Sun,
  LogOut,
  Settings,
  Monitor,
  Crosshair,
  Activity,
  Zap,
  Inbox,
  User,
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
  /** Extra per-status counts for the metrics bar */
  tasksByStatus?: Record<string, number>;
}

/** Live UTC clock — updates every second */
function LiveClock() {
  const [time, setTime] = useState(() => {
    const now = new Date();
    return now.toUTCString().split(" ").slice(4, 5).join("").slice(0, 8);
  });

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const h = String(now.getUTCHours()).padStart(2, "0");
      const m = String(now.getUTCMinutes()).padStart(2, "0");
      const s = String(now.getUTCSeconds()).padStart(2, "0");
      setTime(`${h}:${m}:${s}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="tabular-nums font-mono text-[11px]" style={{ color: "var(--mc-text-subtle)" }}>
      {time} UTC
    </span>
  );
}

/** A compact stat chip for the metrics bar */
function MetricChip({
  icon: Icon,
  value,
  label,
  accent,
}: {
  icon: React.ElementType;
  value: number;
  label: string;
  accent: string;
}) {
  return (
    <div
      className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
      style={{
        background: "var(--mc-panel-2)",
        border: "1px solid var(--mc-line)",
      }}
    >
      <Icon size={11} style={{ color: accent }} strokeWidth={2.5} />
      <span className="tabular-nums font-semibold" style={{ color: accent }}>
        {value}
      </span>
      <span style={{ color: "var(--mc-text-muted)" }}>{label}</span>
    </div>
  );
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
  tasksByStatus,
}: HeaderProps) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const inFlight = tasksByStatus?.["in_progress"] ?? 0;
  const queued = tasksByStatus?.["inbox"] ?? 0;

  return (
    <header
      className="sticky top-0 z-40 w-full"
      role="banner"
      style={{
        height: "var(--h-topbar)",
        background: "color-mix(in srgb, var(--mc-panel) 90%, transparent)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid var(--mc-line)",
      }}
    >
      <div className="mx-auto flex h-full max-w-[1920px] items-center gap-3 px-4 lg:px-5">

        {/* ── Brand mark ─────────────────────────────────────────────── */}
        <div className="flex shrink-0 items-center gap-2.5">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{
              background: "linear-gradient(135deg, var(--mc-cyan) 0%, var(--mc-purple) 100%)",
            }}
          >
            <Crosshair size={16} color="#fff" strokeWidth={2} />
          </div>
          <div className="hidden flex-col sm:flex">
            <span
              className="text-[11px] font-bold uppercase tracking-[0.18em]"
              style={{ color: "var(--mc-text)", letterSpacing: "0.18em" }}
            >
              Mission Control
            </span>
            <LiveClock />
          </div>
        </div>

        {/* ── Separator ──────────────────────────────────────────────── */}
        <div className="hidden h-6 w-px shrink-0 lg:block" style={{ background: "var(--mc-line)" }} />

        {/* ── Live metrics bar ───────────────────────────────────────── */}
        <div className="hidden items-center gap-2 lg:flex">
          <MetricChip
            icon={Activity}
            value={activeAgentCount}
            label="Online"
            accent="var(--mc-green)"
          />
          <MetricChip
            icon={Zap}
            value={inFlight}
            label="In Flight"
            accent="var(--mc-cyan)"
          />
          <MetricChip
            icon={Inbox}
            value={queued}
            label="Queued"
            accent="var(--mc-amber)"
          />
        </div>

        {/* ── Spacer ─────────────────────────────────────────────────── */}
        <div className="flex-1" />

        {/* ── Search / Command ───────────────────────────────────────── */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={onSearchClick}
          className="group flex items-center gap-2 rounded-md px-3 py-1.5 text-left transition-all duration-150"
          style={{
            background: "var(--mc-panel-2)",
            border: "1px solid var(--mc-line)",
            minWidth: 200,
          }}
          aria-label="Open command palette"
        >
          <Search size={13} style={{ color: "var(--mc-text-subtle)" }} />
          <span
            className="hidden flex-1 text-[12px] sm:block"
            style={{ color: "var(--mc-text-subtle)" }}
          >
            Search or command…
          </span>
          <div
            className="hidden items-center gap-0.5 rounded px-1 py-0.5 sm:flex"
            style={{
              background: "var(--mc-panel-3)",
              border: "1px solid var(--mc-line)",
            }}
          >
            <span className="text-[10px] font-medium" style={{ color: "var(--mc-text-subtle)" }}>⌘K</span>
          </div>
        </motion.button>

        {/* ── New Task ───────────────────────────────────────────────── */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onNewTask}
          className="hidden items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-semibold text-white shadow-sm sm:flex"
          style={{
            background: "linear-gradient(135deg, var(--mc-cyan) 0%, var(--mc-purple) 120%)",
          }}
        >
          <Plus size={14} strokeWidth={2.5} />
          New Task
        </motion.button>

        {/* ── Divider ────────────────────────────────────────────────── */}
        <div className="h-5 w-px shrink-0" style={{ background: "var(--mc-line)" }} />

        {/* ── Theme toggle ───────────────────────────────────────────── */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.93 }}
          onClick={onToggleTheme}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors"
          style={{
            background: "var(--mc-panel-2)",
            border: "1px solid var(--mc-line)",
            color: "var(--mc-text-muted)",
          }}
          aria-label="Toggle theme"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={theme}
              initial={{ rotate: -30, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 30, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {theme === "light" ? <Moon size={15} /> : <Sun size={15} />}
            </motion.div>
          </AnimatePresence>
        </motion.button>

        {/* ── Connection ─────────────────────────────────────────────── */}
        <div className="hidden xl:block">
          <ConnectionStatus />
        </div>

        {/* ── Avatar / menu ──────────────────────────────────────────── */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => setIsUserMenuOpen((v) => !v)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
            style={{
              background: "linear-gradient(135deg, var(--mc-purple-glow) 0%, var(--mc-cyan-glow) 100%)",
              border: "1px solid var(--mc-line)",
              color: "var(--mc-text-muted)",
            }}
            aria-label="Open user menu"
          >
            <User size={15} />
          </motion.button>

          <AnimatePresence>
            {isUserMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsUserMenuOpen(false)}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 8 }}
                  transition={{ duration: 0.14 }}
                  className="absolute right-0 z-20 mt-2 w-52 origin-top-right rounded-lg p-1.5"
                  style={{
                    background: "var(--mc-panel)",
                    border: "1px solid var(--mc-line)",
                    boxShadow: "var(--sh-dropdown)",
                  }}
                >
                  <div
                    className="px-3 py-2 mb-1"
                    style={{ borderBottom: "1px solid var(--mc-line)" }}
                  >
                    <p className="text-[12px] font-bold" style={{ color: "var(--mc-text)" }}>
                      Admin
                    </p>
                    <p className="text-[10px]" style={{ color: "var(--mc-text-subtle)" }}>
                      {taskCount} tasks tracked
                    </p>
                  </div>

                  <button
                    className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-left text-[12px] transition-colors"
                    style={{ color: "var(--mc-text)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--mc-panel-2)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                  >
                    <Settings size={13} style={{ color: "var(--mc-text-muted)" }} />
                    Settings
                  </button>

                  <DashboardCustomization
                    prefs={customizationPrefs}
                    onPrefsChange={onPrefsChange}
                    trigger={
                      <button
                        className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-left text-[12px] transition-colors"
                        style={{ color: "var(--mc-text)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--mc-panel-2)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                      >
                        <Monitor size={13} style={{ color: "var(--mc-text-muted)" }} />
                        Display Prefs
                      </button>
                    }
                  />

                  <div className="my-1 h-px" style={{ background: "var(--mc-line)" }} />

                  <button
                    onClick={onLogout}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-left text-[12px] font-medium transition-colors"
                    style={{ color: "var(--mc-red)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--mc-red-glow)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                  >
                    <LogOut size={13} />
                    Log out
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
