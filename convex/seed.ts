import { mutation } from "./_generated/server";

export const seedAgents = mutation({
  handler: async (ctx) => {
    const agents = [
      {
        agentId: "main",
        name: "Jarvis",
        role: "Squad Lead",
        level: "lead" as const,
        emoji: "🤖",
        sessionKey: "agent:main:main",
      },
      {
        agentId: "product-analyst",
        name: "Shuri",
        role: "Product Analyst",
        level: "specialist" as const,
        emoji: "🔍",
        sessionKey: "agent:product-analyst:main",
      },
      {
        agentId: "customer-researcher",
        name: "Fury",
        role: "Customer Researcher",
        level: "specialist" as const,
        emoji: "🕵️",
        sessionKey: "agent:customer-researcher:main",
      },
      {
        agentId: "seo-analyst",
        name: "Vision",
        role: "SEO Analyst",
        level: "specialist" as const,
        emoji: "📊",
        sessionKey: "agent:seo-analyst:main",
      },
      {
        agentId: "content-writer",
        name: "Loki",
        role: "Content Writer",
        level: "specialist" as const,
        emoji: "✍️",
        sessionKey: "agent:content-writer:main",
      },
      {
        agentId: "social-media",
        name: "Quill",
        role: "Social Media Manager",
        level: "intern" as const,
        emoji: "📱",
        sessionKey: "agent:social-media:main",
      },
      {
        agentId: "designer",
        name: "Wanda",
        role: "Designer",
        level: "specialist" as const,
        emoji: "🎨",
        sessionKey: "agent:designer:main",
      },
      {
        agentId: "email-marketing",
        name: "Pepper",
        role: "Email Marketing",
        level: "intern" as const,
        emoji: "📧",
        sessionKey: "agent:email-marketing:main",
      },
      {
        agentId: "developer",
        name: "Friday",
        role: "Developer",
        level: "specialist" as const,
        emoji: "💻",
        sessionKey: "agent:developer:main",
      },
      {
        agentId: "documentation",
        name: "Wong",
        role: "Documentation",
        level: "specialist" as const,
        emoji: "📚",
        sessionKey: "agent:documentation:main",
      },
    ];

    for (const agent of agents) {
      const existing = await ctx.db
        .query("agents")
        .withIndex("by_agentId", (q) => q.eq("agentId", agent.agentId))
        .first();

      if (!existing) {
        await ctx.db.insert("agents", {
          ...agent,
          status: "idle",
          lastHeartbeat: Date.now(),
        });
      }
    }

    return `Seeded ${agents.length} agents`;
  },
});
