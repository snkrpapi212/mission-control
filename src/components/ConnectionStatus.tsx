"use client";

import { useEffect, useState } from "react";

type Status = "connected" | "reconnecting" | "offline";

export function ConnectionStatus() {
  const [status, setStatus] = useState<Status>("connected");
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    const handleOnline = () => setStatus("connected");
    const handleOffline = () => setStatus("offline");

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Simulate reconnection logic (in real app, tie to Convex subscription status)
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 30000); // Update timestamp every 30s

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, []);

  const statusConfig = {
    connected: {
      icon: "🟢",
      text: "Connected",
      color: "#4ea56a",
    },
    reconnecting: {
      icon: "🔄",
      text: "Reconnecting...",
      color: "#c89a46",
    },
    offline: {
      icon: "🔴",
      text: "Offline",
      color: "#b44c4c",
    },
  };

  const config = statusConfig[status];

  const lastUpdateText = (() => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastUpdate.getTime()) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  })();

  return (
    <div
      className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold"
      style={{ color: config.color }}
      title={`Last updated: ${lastUpdateText}`}
    >
      <span className={status === "reconnecting" ? "animate-spin" : ""}>{config.icon}</span>
      <span>{config.text}</span>
    </div>
  );
}
