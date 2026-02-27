import { mutation } from "./_generated/server";

/**
 * Seed OpenClaw agents - 7 model-based agents that match OpenClaw configuration
 */
export const seedOpenClawAgents = mutation({
  handler: async (ctx) => {
    // Clear existing agents
    const existingAgents = await ctx.db.query("agents").collect();
    for (const agent of existingAgents) {
      await ctx.db.delete(agent._id);
    }

    // OpenClaw's 7 agents
    const agents = [
      {
        agentId: "jarvis",
        name: "Jarvis",
        role: "Squad Lead",
        level: "lead" as const,
        emoji: "🤖",
        sessionKey: "agent:jarvis:main",
        status: "idle" as const,
        lastHeartbeat: Date.now(),
      },
      {
        agentId: "minimax",
        name: "Minimax",
        role: "MiniMax M2.5",
        level: "specialist" as const,
        emoji: "🪄",
        sessionKey: "agent:minimax:main",
        status: "idle" as const,
        lastHeartbeat: Date.now(),
      },
      {
        agentId: "claude",
        name: "Claude",
        role: "Claude Opus",
        level: "specialist" as const,
        emoji: "🧶",
        sessionKey: "agent:claude:main",
        status: "idle" as const,
        lastHeartbeat: Date.now(),
      },
      {
        agentId: "codex",
        name: "Codex",
        role: "GPT-5.3 Codex",
        level: "specialist" as const,
        emoji: "🧬",
        sessionKey: "agent:codex:main",
        status: "idle" as const,
        lastHeartbeat: Date.now(),
      },
      {
        agentId: "kimi",
        name: "Kimi",
        role: "Kimi K2.5",
        level: "specialist" as const,
        emoji: "🐇",
        sessionKey: "agent:kimi:main",
        status: "idle" as const,
        lastHeartbeat: Date.now(),
      },
      {
        agentId: "zai",
        name: "Zai",
        role: "GLM-4.7",
        level: "specialist" as const,
        emoji: "👾",
        sessionKey: "agent:zai:main",
        status: "idle" as const,
        lastHeartbeat: Date.now(),
      },
      {
        agentId: "antigravity",
        name: "Antigravity",
        role: "Antigravity",
        level: "specialist" as const,
        emoji: "🚀",
        sessionKey: "agent:antigravity:main",
        status: "idle" as const,
        lastHeartbeat: Date.now(),
      },
    ];

    // Insert new agents
    for (const agent of agents) {
      await ctx.db.insert("agents", agent);
    }

    return `Seeded ${agents.length} OpenClaw agents`;
  },
});

// Keep old seed for backward compatibility
export const seedFull = mutation({
  handler: async (ctx) => {
    return "Use seedOpenClawAgents instead";
  },
});
