"use client";

import { useEffect, useState } from "react";

export type ToastType = "success" | "error" | "info";

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

const TOAST_CONTAINER_ID = "toast-container";

export function useToast() {
  const createToast = (message: string, type: ToastType = "info", duration = 4000) => {
    const id = Math.random().toString(36).slice(2);
    const event = new CustomEvent("toast:add", {
      detail: { id, message, type, duration },
    });
    window.dispatchEvent(event);
    return id;
  };

  return {
    success: (msg: string) => createToast(msg, "success"),
    error: (msg: string) => createToast(msg, "error"),
    info: (msg: string) => createToast(msg, "info"),
  };
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handleAdd = (e: Event) => {
      const evt = e as CustomEvent<ToastMessage>;
      const toast = { ...evt.detail, duration: evt.detail.duration || 4000 };
      setToasts((prev) => [...prev, toast]);

      if (toast.duration > 0) {
        const timer = setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== toast.id));
        }, toast.duration);

        return () => clearTimeout(timer);
      }
    };

    window.addEventListener("toast:add", handleAdd);
    return () => window.removeEventListener("toast:add", handleAdd);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const getColors = (type: ToastType) => {
    switch (type) {
      case "success":
        return { bg: "#10B981", text: "#FFFFFF", icon: "✓" };
      case "error":
        return { bg: "#EF4444", text: "#FFFFFF", icon: "⚠" };
      case "info":
      default:
        return { bg: "#3B82F6", text: "#FFFFFF", icon: "ℹ" };
    }
  };

  return (
    <div
      id={TOAST_CONTAINER_ID}
      className="fixed right-4 top-24 z-50 flex flex-col gap-2 pointer-events-none"
    >
      {toasts.map((toast) => {
        const colors = getColors(toast.type);
        return (
          <div
            key={toast.id}
            className="rounded-lg shadow-lg px-4 py-3 flex items-center gap-3 pointer-events-auto animate-in fade-in slide-in-from-right-4 duration-200"
            style={{ background: colors.bg, color: colors.text }}
            role="alert"
          >
            <span className="text-lg">{colors.icon}</span>
            <span className="text-sm font-medium">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-auto text-lg opacity-70 hover:opacity-100"
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}
