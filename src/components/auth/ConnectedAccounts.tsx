"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

interface ConnectedAccount {
  _id: string;
  provider: string;
  metadata?: {
    email?: string;
    name?: string;
    image?: string;
  };
  updatedAt: number;
}

export default function ConnectedAccounts() {
  const tokens = useQuery(api.oauth.getUserTokens) as ConnectedAccount[] | undefined;
  const disconnect = useMutation(api.oauth.disconnectProvider);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);

  const handleDisconnect = async (provider: string) => {
    setDisconnecting(provider);
    try {
      await disconnect({ provider });
    } catch (err) {
      console.error("Failed to disconnect:", err);
    } finally {
      setDisconnecting(null);
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case "minimax":
        return "🪄";
      case "google":
        return "🔍";
      case "github":
        return "🐙";
      default:
        return "🔐";
    }
  };

  const getProviderName = (provider: string) => {
    switch (provider) {
      case "minimax":
        return "MiniMax";
      case "google":
        return "Google";
      case "github":
        return "GitHub";
      default:
        return provider.charAt(0).toUpperCase() + provider.slice(1);
    }
  };

  if (!tokens) {
    return (
      <div className="rounded-md border border-[var(--mc-line)] bg-[var(--mc-panel)] p-4">
        <p className="text-sm text-[var(--mc-text-muted)]">Loading connected accounts... </p>
      </div>
    );
  }

  if (tokens.length === 0) {
    return (
      <div className="rounded-md border border-[var(--mc-line)] bg-[var(--mc-panel)] p-4">
        <p className="text-sm text-[var(--mc-text-muted)]">
          No connected accounts. Sign in with an OAuth provider to link your account.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-[var(--mc-text)]">Connected Accounts</h3>
      
      <div className="space-y-2">
        {tokens.map((token) => (
          <div
            key={token._id}
            className="flex items-center justify-between rounded-md border border-[var(--mc-line)] bg-[var(--mc-card)] p-3"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">{getProviderIcon(token.provider)}</span>
              <div>
                <p className="text-sm font-medium text-[var(--mc-text)]">
                  {getProviderName(token.provider)}
                </p>
                {token.metadata?.email && (
                  <p className="text-xs text-[var(--mc-text-muted)]">
                    {token.metadata.email}
                  </p>
                )}
              </div>
            </div>
            
            <button
              onClick={() => handleDisconnect(token.provider)}
              disabled={disconnecting === token.provider}
              className="rounded px-2 py-1 text-xs text-[var(--mc-red)] hover:bg-[var(--mc-red-soft)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {disconnecting === token.provider ? "Disconnecting..." : "Disconnect"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
