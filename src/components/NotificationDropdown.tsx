"use client";

import { useRef, useEffect } from "react";
import { Trash2, Check, Clock } from "lucide-react";
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
  onMarkAsRead?: (_id: string) => void;
  onMarkAllAsRead?: () => void;
  onClearAll?: () => void;
}

const typeLabelStyles = {
  info: "bg-blue-100 text-blue-700",
  warning: "bg-amber-100 text-amber-700",
  success: "bg-green-100 text-green-700",
  error: "bg-red-100 text-red-700",
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

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (isOpen && containerRef.current && !containerRef.current.contains(e.target as Node)) {
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
      className="absolute top-full right-0 mt-2 w-96 rounded-lg border border-[var(--mc-line)] bg-[var(--mc-card)] shadow-lg max-h-96 overflow-hidden flex flex-col z-50"
    >
      <div className="flex items-center justify-between border-b border-[var(--mc-line)] px-4 py-3 bg-[var(--mc-panel-soft)]/50">
        <div>
          <h3 className="text-sm font-semibold text-[var(--mc-text)]">Notifications</h3>
          {unreadCount > 0 && <p className="text-xs mt-1 text-[var(--mc-text-soft)]">{unreadCount} unread</p>}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={onMarkAllAsRead}
              title="Mark all as read"
              className="p-1 rounded transition-colors hover:bg-[var(--mc-line)] text-[var(--mc-text-soft)] hover:text-[var(--mc-text)]"
            >
              <Check className="w-4 h-4" />
            </button>
          )}
          {notifications.length > 0 && (
            <button
              type="button"
              onClick={onClearAll}
              title="Clear all notifications"
              className="p-1 rounded transition-colors hover:bg-[var(--mc-line)] text-[var(--mc-text-soft)] hover:text-[var(--mc-text)]"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <ul className="overflow-y-auto flex-1 divide-y divide-[var(--mc-line)]">
        {notifications.length === 0 ? (
          <li className="px-4 py-6 text-center text-sm text-[var(--mc-text-soft)]">No notifications yet</li>
        ) : (
          notifications.map((notif) => (
            <li
              key={notif._id}
              className={`px-4 py-3 transition-colors hover:bg-[var(--mc-panel-soft)]/50 cursor-pointer ${
                notif.isRead ? "" : "bg-[var(--mc-accent-soft)]/30"
              }`}
              onClick={() => onMarkAsRead?.(notif._id)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ring-1 ring-inset ${
                      notif.type === 'info' ? 'bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/20' :
                      notif.type === 'warning' ? 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20' :
                      notif.type === 'success' ? 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20' :
                      'bg-red-50 text-red-700 ring-red-200 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20'
                    }`}>
                      {notif.type}
                    </span>
                    {!notif.isRead && <span className="h-2 w-2 rounded-full bg-[var(--mc-accent)]" />}
                  </div>
                  <h4 className="text-sm font-semibold mt-1.5 text-[var(--mc-text)] leading-tight">{notif.title}</h4>
                  <p className="text-[12px] mt-1 text-[var(--mc-text-muted)] leading-relaxed">{notif.message}</p>
                  <div className="text-[10px] mt-2.5 flex items-center gap-2 text-[var(--mc-text-soft)] font-medium">
                    <span className="flex items-center gap-1"><Clock size={10} /> {timeAgo(notif.createdAt)}</span>
                    {notif.agentId && <span>· {notif.agentId}</span>}
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
