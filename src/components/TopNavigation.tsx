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
} from "lucide-react";
import type { Doc } from "../../convex/_generated/dataModel";

interface TopNavigationProps {
  isDarkMode: boolean;
  onDarkModeToggle: () => void;
  allTasks: Doc<"tasks">[];
  unreadNotificationCount: number;
  onNotificationBellClick?: () => void;
  isConnected: boolean;
  onMenuClick?: () => void;
}

export function TopNavigation({
  isDarkMode,
  onDarkModeToggle,
  allTasks,
  unreadNotificationCount,
  onNotificationBellClick,
  isConnected,
  onMenuClick,
}: TopNavigationProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Doc<"tasks">[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

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
    setSearchResults(results.slice(0, 5)); // Limit to 5 results
  }, [searchQuery, allTasks]);

  const handleSearchClick = useCallback(() => {
    setSearchOpen(true);
    setTimeout(() => searchInputRef.current?.focus(), 0);
  }, []);

  const handleSearchClose = useCallback(() => {
    setSearchOpen(false);
    setSearchQuery("");
  }, []);

  return (
    <nav
      className={`sticky top-0 z-40 border-b ${
        isDarkMode
          ? "border-gray-700 bg-gray-900"
          : "border-gray-200 bg-white"
      }`}
    >
      <div className="mx-auto max-w-[1600px] px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Logo & Title */}
          <div className="flex items-center gap-3 flex-1 md:flex-none">
            <button
              type="button"
              onClick={onMenuClick}
              className={`md:hidden p-2 rounded-lg ${
                isDarkMode
                  ? "hover:bg-gray-800"
                  : "hover:bg-gray-100"
              }`}
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex-1 md:flex-none">
              <h1 className={`text-lg font-bold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}>
                🎯 Mission Control
              </h1>
              <p className={`text-xs mt-0.5 ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}>
                Phase 4 Overhaul
              </p>
            </div>
          </div>

          {/* Center: Search */}
          <div className="flex-1 max-w-md hidden md:block mx-4">
            {searchOpen ? (
              <div className={`relative ${
                isDarkMode
                  ? "bg-gray-800"
                  : "bg-gray-50"
              } rounded-lg border ${
                isDarkMode
                  ? "border-gray-600"
                  : "border-gray-200"
              } overflow-hidden`}>
                <div className="flex items-center">
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`flex-1 px-3 py-2 text-sm outline-none ${
                      isDarkMode
                        ? "bg-gray-800 text-white placeholder-gray-500"
                        : "bg-gray-50 placeholder-gray-500"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={handleSearchClose}
                    className={`p-2 ${
                      isDarkMode
                        ? "hover:bg-gray-700"
                        : "hover:bg-gray-100"
                    }`}
                    aria-label="Close search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Search Results Dropdown */}
                {searchResults.length > 0 && (
                  <div className={`absolute top-full left-0 right-0 mt-1 rounded-lg border ${
                    isDarkMode
                      ? "border-gray-600 bg-gray-800"
                      : "border-gray-200 bg-white"
                  } shadow-lg max-h-96 overflow-y-auto`}>
                    <ul className="divide-y">
                      {searchResults.map((task) => (
                        <li
                          key={task._id}
                          className={`px-3 py-2 text-sm cursor-pointer ${
                            isDarkMode
                              ? "hover:bg-gray-700 border-gray-600"
                              : "hover:bg-gray-50 border-gray-100"
                          }`}
                        >
                          <div className={`font-medium ${
                            isDarkMode ? "text-white" : "text-gray-900"
                          }`}>
                            {task.title}
                          </div>
                          <div className={`text-xs mt-1 ${
                            isDarkMode ? "text-gray-400" : "text-gray-500"
                          }`}>
                            Status: {task.status}
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
                  isDarkMode
                    ? "border-gray-600 bg-gray-800 text-gray-400 hover:text-white hover:border-gray-500"
                    : "border-gray-200 bg-gray-50 text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Search className="w-4 h-4" />
                <span>Search tasks...</span>
              </button>
            )}
          </div>

          {/* Right: Controls */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Connection Status */}
            <div className={`hidden sm:flex items-center gap-2 px-2 py-1 rounded text-xs ${
              isConnected
                ? isDarkMode
                  ? "bg-green-900 text-green-200 border border-green-700"
                  : "bg-green-50 text-green-700 border border-green-200"
                : isDarkMode
                  ? "bg-amber-900 text-amber-200 border border-amber-700"
                  : "bg-amber-50 text-amber-700 border border-amber-200"
            }`}>
              <Activity className="w-3 h-3" />
              <span>{isConnected ? "Connected" : "Offline"}</span>
            </div>

            {/* Notification Bell */}
            <button
              type="button"
              onClick={onNotificationBellClick}
              className={`relative p-2 rounded-lg transition-colors ${
                isDarkMode
                  ? "hover:bg-gray-800 text-gray-400 hover:text-white"
                  : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
              }`}
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadNotificationCount > 0 && (
                <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-semibold text-white">
                  {unreadNotificationCount > 9 ? "9+" : unreadNotificationCount}
                </span>
              )}
            </button>

            {/* Dark Mode Toggle */}
            <button
              type="button"
              onClick={onDarkModeToggle}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode
                  ? "hover:bg-gray-800 text-gray-400 hover:text-white"
                  : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
              }`}
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
