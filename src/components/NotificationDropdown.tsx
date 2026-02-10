"use client";

import { useState, useRef, useEffect } from "react";
import { Trash2, Check } from "lucide-react";
import { timeAgo } from "@/lib/time";
import { useDarkMode } from "@/context/DarkModeContext";

export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  isRead: boolean;
  createdAt: number;
  taskId?: string;
  agentId?: string;
}

interface NotificationDropdownProps {
  notifications: Notification[];
  isOpen: boolean;
  onClose: () => void;
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onClearAll?: () => void;
}

const typeStyles = {
  info: "border-blue-200 bg-blue-50 text-blue-900",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
  success: "border-green-200 bg-green-50 text-green-900",
  error: "border-red-200 bg-red-50 text-red-900",
};

const typeLabelStyles = {
  info: "bg-blue-100 text-blue-700",
  warning: "bg-amber-100 text-amber-700",
  success: "bg-green-100 text-green-700",
  error: "bg-red-100 text-red-700",
};

const typeDarkStyles = {
  info: "border-blue-900 bg-blue-950 text-blue-100",
  warning: "border-amber-900 bg-amber-950 text-amber-100",
  success: "border-green-900 bg-green-950 text-green-100",
  error: "border-red-900 bg-red-950 text-red-100",
};

const typeLabelDarkStyles = {
  info: "bg-blue-900 text-blue-200",
  warning: "bg-amber-900 text-amber-200",
  success: "bg-green-900 text-green-200",
  error: "bg-red-900 text-red-200",
};

export function NotificationDropdown({
  notifications,
  isOpen,
  onClose,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
}: NotificationDropdownProps) {
  const { isDarkMode } = useDarkMode();
  const containerRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        isOpen &&
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={containerRef}
      className={`absolute top-full right-0 mt-2 w-96 rounded-lg border shadow-lg max-h-96 overflow-hidden flex flex-col ${
        isDarkMode
          ? "border-gray-700 bg-gray-800"
          : "border-gray-200 bg-white"
      }`}
    >
      {/* Header */}
      <div className={`flex items-center justify-between border-b px-4 py-3 ${
        isDarkMode ? "border-gray-700" : "border-gray-200"
      }`}>
        <div>
          <h3 className={`text-sm font-semibold ${
            isDarkMode ? "text-white" : "text-gray-900"
          }`}>
            Notifications
          </h3>
          {unreadCount > 0 && (
            <p className={`text-xs mt-1 ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            }`}>
              {unreadCount} unread
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={onMarkAllAsRead}
              title="Mark all as read"
              className={`p-1 rounded transition-colors ${
                isDarkMode
                  ? "hover:bg-gray-700 text-gray-400 hover:text-white"
                  : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
              }`}
            >
              <Check className="w-4 h-4" />
            </button>
          )}
          {notifications.length > 0 && (
            <button
              type="button"
              onClick={onClearAll}
              title="Clear all notifications"
              className={`p-1 rounded transition-colors ${
                isDarkMode
                  ? "hover:bg-gray-700 text-gray-400 hover:text-white"
                  : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
              }`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <ul className={`overflow-y-auto flex-1 divide-y ${
        isDarkMode ? "divide-gray-700" : "divide-gray-200"
      }`}>
        {notifications.length === 0 ? (
          <li className={`px-4 py-6 text-center text-sm ${
            isDarkMode ? "text-gray-400" : "text-gray-500"
          }`}>
            No notifications yet
          </li>
        ) : (
          notifications.map((notif) => (
            <li
              key={notif._id}
              className={`px-4 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
                notif.isRead
                  ? isDarkMode
                    ? "bg-gray-800"
                    : "bg-white"
                  : isDarkMode
                    ? "bg-gray-750"
                    : "bg-blue-50"
              }`}
              onClick={() => onMarkAsRead?.(notif._id)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${
                      isDarkMode
                        ? typeLabelDarkStyles[notif.type]
                        : typeLabelStyles[notif.type]
                    }`}>
                      {notif.type.charAt(0).toUpperCase() + notif.type.slice(1)}
                    </span>
                    {!notif.isRead && (
                      <span className="h-2 w-2 rounded-full bg-blue-500" />
                    )}
                  </div>
                  <h4 className={`text-sm font-medium mt-1 ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}>
                    {notif.title}
                  </h4>
                  <p className={`text-sm mt-1 ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}>
                    {notif.message}
                  </p>
                  <div className={`text-xs mt-2 flex gap-2 ${
                    isDarkMode ? "text-gray-500" : "text-gray-500"
                  }`}>
                    <span>{timeAgo(notif.createdAt)}</span>
                    {notif.agentId && <span>· by {notif.agentId}</span>}
                  </div>
                </div>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
