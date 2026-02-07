import { mutation } from "./_generated/server";

export const seedFull = mutation({
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

    // Seed agents
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

    // Seed sample tasks
    const tasks = [
      {
        title: "Design new product landing page",
        description: "Create mockups and wireframes for the new product launch",
        status: "in_progress" as const,
        assigneeIds: ["designer"],
        subscriberIds: ["designer", "main"],
        priority: "high" as const,
        tags: [],
        createdBy: "main",
      },
      {
        title: "Analyze competitor pricing",
        description: "Research and document competitor pricing strategies",
        status: "assigned" as const,
        assigneeIds: ["product-analyst"],
        subscriberIds: ["product-analyst", "main"],
        priority: "high" as const,
        tags: [],
        createdBy: "main",
      },
      {
        title: "Write API documentation",
        description: "Document all REST endpoints with examples",
        status: "review" as const,
        assigneeIds: ["documentation"],
        subscriberIds: ["documentation", "main"],
        priority: "medium" as const,
        tags: [],
        createdBy: "main",
      },
      {
        title: "Customer interview synthesis",
        description: "Analyze and summarize key insights from customer interviews",
        status: "inbox" as const,
        assigneeIds: ["customer-researcher"],
        subscriberIds: ["customer-researcher"],
        priority: "high" as const,
        tags: [],
        createdBy: "main",
      },
      {
        title: "Q1 content calendar",
        description: "Plan and schedule content for Q1 2026",
        status: "done" as const,
        assigneeIds: ["content-writer"],
        subscriberIds: ["content-writer", "main"],
        priority: "medium" as const,
        tags: [],
        createdBy: "main",
      },
      {
        title: "Social media engagement analysis",
        description: "Review engagement metrics and create recommendations",
        status: "in_progress" as const,
        assigneeIds: ["social-media"],
        subscriberIds: ["social-media"],
        priority: "low" as const,
        tags: [],
        createdBy: "main",
      },
      {
        title: "Fix critical authentication bug",
        description: "Resolve login timeout issue affecting 5% of users",
        status: "blocked" as const,
        assigneeIds: ["developer"],
        subscriberIds: ["developer", "main"],
        priority: "high" as const,
        tags: [],
        createdBy: "main",
      },
    ];

    for (const task of tasks) {
      await ctx.db.insert("tasks", {
        ...task,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    return `Seeded ${agents.length} agents and ${tasks.length} tasks`;
  },
});
