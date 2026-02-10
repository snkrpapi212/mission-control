"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Search,
  Bell,
  Sun,
  Moon,
  Menu,
  X,
  Activity,
  LogOut,
} from "lucide-react";
import type { Doc } from "../../convex/_generated/dataModel";
import { useDarkMode } from "@/context/DarkModeContext";

interface TopNavProps {
  isDark?: boolean;
  onThemeToggle?: () => void;
  connectionStatus: 'connected' | 'reconnecting' | 'disconnected';
  unreadNotificationCount: number;
  onNotificationClick?: () => void;
  allTasks: Doc<"tasks">[];
  onSearch?: (query: string) => void;
  currentUser?: { name: string; avatar?: string };
  onLogout?: () => void;
  onMenuClick?: () => void;
}

export function TopNav({
  isDark,
  onThemeToggle,
  connectionStatus,
  unreadNotificationCount,
  onNotificationClick,
  allTasks,
  onSearch,
  currentUser,
  onLogout,
  onMenuClick,
}: TopNavProps) {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Doc<"tasks">[]>([]);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const actualIsDark = isDark ?? isDarkMode;

  // Handle search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const results = allTasks.filter(
      (task) =>
        task.title.toLowerCase().includes(query) ||
        (task.description?.toLowerCase().includes(query) ?? false)
    );
    setSearchResults(results.slice(0, 5));
  }, [searchQuery, allTasks]);

  const handleSearchClick = useCallback(() => {
    setSearchOpen(true);
    setTimeout(() => searchInputRef.current?.focus(), 0);
  }, []);

  const handleSearchClose = useCallback(() => {
    setSearchOpen(false);
    setSearchQuery("");
  }, []);

  // Connection status colors and text
  const getConnectionStatus = () => {
    switch (connectionStatus) {
      case 'connected':
        return { color: 'status-active', text: 'Connected', icon: '🟢' };
      case 'reconnecting':
        return { color: 'status-warning', text: 'Reconnecting...', icon: '⚠️' };
      case 'disconnected':
        return { color: 'status-error', text: 'Disconnected', icon: '🔴' };
    }
  };

  const connStatus = getConnectionStatus();

  return (
    <nav className={`h-topnav ${actualIsDark ? 'bg-mc-bg border-mc-border' : 'bg-white border-gray-200'} border-b sticky top-0 z-50 flex items-center justify-between px-6`}>
      {/* Left: Logo + Title */}
      <div className="flex items-center gap-4 flex-1 md:flex-none">
        <button
          type="button"
          onClick={onMenuClick}
          className={`md:hidden p-2 rounded-lg transition-colors ${
            actualIsDark
              ? 'hover:bg-mc-surface-hover text-mc-text'
              : 'hover:bg-gray-100 text-gray-900'
          }`}
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex-1 md:flex-none">
          <h1 className={`text-2xl font-bold ${
            actualIsDark ? 'text-mc-text' : 'text-gray-900'
          }`}>
            🎯 Mission Control
          </h1>
        </div>
      </div>

      {/* Center: Search */}
      <div className="flex-1 max-w-md hidden md:block mx-6">
        {searchOpen ? (
          <div className={`relative ${
            actualIsDark
              ? 'bg-mc-surface border-mc-border'
              : 'bg-gray-50 border-gray-200'
          } rounded-lg border overflow-hidden`}>
            <div className="flex items-center">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`flex-1 px-3 py-2 text-sm outline-none ${
                  actualIsDark
                    ? 'bg-mc-surface text-mc-text placeholder-mc-text-muted'
                    : 'bg-gray-50 placeholder-gray-500 text-gray-900'
                }`}
              />
              <button
                type="button"
                onClick={handleSearchClose}
                className={`p-2 ${
                  actualIsDark
                    ? 'hover:bg-mc-surface-hover text-mc-text'
                    : 'hover:bg-gray-100'
                }`}
                aria-label="Close search"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className={`absolute top-full left-0 right-0 mt-1 rounded-lg border ${
                actualIsDark
                  ? 'border-mc-border bg-mc-surface'
                  : 'border-gray-200 bg-white'
              } shadow-lg max-h-96 overflow-y-auto`}>
                <ul className="divide-y">
                  {searchResults.map((task) => (
                    <li
                      key={task._id}
                      className={`px-3 py-2 text-sm cursor-pointer transition-colors ${
                        actualIsDark
                          ? 'hover:bg-mc-surface-hover border-mc-border'
                          : 'hover:bg-gray-50 border-gray-100'
                      }`}
                    >
                      <div className={`font-medium ${
                        actualIsDark ? 'text-mc-text' : 'text-gray-900'
                      }`}>
                        {task.title}
                      </div>
                      <div className={`text-xs mt-1 ${
                        actualIsDark ? 'text-mc-text-muted' : 'text-gray-500'
                      }`}>
                        {task.status}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={handleSearchClick}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
              actualIsDark
                ? 'border-mc-border bg-mc-surface text-mc-text-muted hover:text-mc-text'
                : 'border-gray-200 bg-gray-50 text-gray-500 hover:text-gray-700'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Search tasks...</span>
          </button>
        )}
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-3">
        {/* Connection Status */}
        <div className={`hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded text-xs font-medium ${
          connectionStatus === 'connected'
            ? actualIsDark
              ? 'bg-status-active bg-opacity-20 text-status-active'
              : 'bg-green-50 text-green-700'
            : connectionStatus === 'reconnecting'
            ? actualIsDark
              ? 'bg-status-warning bg-opacity-20 text-status-warning'
              : 'bg-amber-50 text-amber-700'
            : actualIsDark
            ? 'bg-status-error bg-opacity-20 text-status-error'
            : 'bg-red-50 text-red-700'
        }`}>
          <Activity className="w-3 h-3" />
          <span>{connStatus.text}</span>
        </div>

        {/* Notification Bell */}
        <button
          type="button"
          onClick={onNotificationClick}
          className={`relative p-2 rounded-lg transition-colors ${
            actualIsDark
              ? 'hover:bg-mc-surface-hover text-mc-text-muted hover:text-mc-text'
              : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
          }`}
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadNotificationCount > 0 && (
            <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-priority-p0 text-xs font-semibold text-white">
              {unreadNotificationCount > 9 ? "9+" : unreadNotificationCount}
            </span>
          )}
        </button>

        {/* Dark Mode Toggle */}
        <button
          type="button"
          onClick={onThemeToggle || toggleDarkMode}
          className={`p-2 rounded-lg transition-colors ${
            actualIsDark
              ? 'hover:bg-mc-surface-hover text-mc-text-muted hover:text-mc-text'
              : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
          }`}
          aria-label="Toggle dark mode"
        >
          {actualIsDark ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </button>

        {/* User Menu */}
        {currentUser && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className={`flex items-center gap-2 px-2 py-1 rounded-lg transition-colors ${
                actualIsDark
                  ? 'hover:bg-mc-surface-hover'
                  : 'hover:bg-gray-100'
              }`}
              aria-label="User menu"
            >
              <div className={`w-8 h-8 rounded-full ${
                actualIsDark ? 'bg-accent-primary' : 'bg-blue-500'
              } flex items-center justify-center text-white text-xs font-bold`}>
                {currentUser.avatar || currentUser.name.charAt(0).toUpperCase()}
              </div>
            </button>

            {userMenuOpen && (
              <div className={`absolute top-full right-0 mt-2 w-48 rounded-lg border shadow-lg ${
                actualIsDark
                  ? 'bg-mc-surface border-mc-border'
                  : 'bg-white border-gray-200'
              }`}>
                <div className={`px-4 py-3 border-b ${
                  actualIsDark ? 'border-mc-border' : 'border-gray-200'
                }`}>
                  <p className={`text-sm font-medium ${
                    actualIsDark ? 'text-mc-text' : 'text-gray-900'
                  }`}>
                    {currentUser.name}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onLogout}
                  className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${
                    actualIsDark
                      ? 'text-priority-p0 hover:bg-mc-surface-hover'
                      : 'text-red-600 hover:bg-gray-50'
                  }`}
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
