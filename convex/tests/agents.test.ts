import { describe, it, expect } from 'vitest';
import { convexTest } from 'convex-test';
import schema from '../schema';
import { api } from '../_generated/api';

describe('Agents', () => {
  it('should register an agent with correct initial status', async () => {
    const t = convexTest(schema);
    const agentId = await t.mutation(api.agents.register, {
      agentId: 'main',
      name: 'Jarvis',
      role: 'Squad Lead',
      level: 'lead',
      emoji: '🤖',
      sessionKey: 'agent:main:main',
    });

    expect(agentId).toBeDefined();

    const agents = await t.query(api.agents.getAll, {});
    expect(agents).toHaveLength(1);
    expect(agents[0].name).toBe('Jarvis');
    expect(agents[0].status).toBe('idle');
    expect(agents[0].level).toBe('lead');
  });

  it('should not duplicate agent on second registration', async () => {
    const t = convexTest(schema);
    const id1 = await t.mutation(api.agents.register, {
      agentId: 'developer',
      name: 'Friday',
      role: 'Developer',
      level: 'specialist',
      emoji: '💻',
      sessionKey: 'agent:developer:main',
    });

    const id2 = await t.mutation(api.agents.register, {
      agentId: 'developer',
      name: 'Friday',
      role: 'Developer',
      level: 'specialist',
      emoji: '💻',
      sessionKey: 'agent:developer:main',
    });

    expect(id1).toEqual(id2);

    const agents = await t.query(api.agents.getAll, {});
    expect(agents).toHaveLength(1);
  });

  it('should update agent status', async () => {
    const t = convexTest(schema);
    await t.mutation(api.agents.register, {
      agentId: 'seo-analyst',
      name: 'Vision',
      role: 'SEO Analyst',
      level: 'specialist',
      emoji: '📊',
      sessionKey: 'agent:seo-analyst:main',
    });

    await t.mutation(api.agents.updateStatus, {
      agentId: 'seo-analyst',
      status: 'working',
    });

    const agents = await t.query(api.agents.getAll, {});
    expect(agents[0].status).toBe('working');
  });

  it('should retrieve agent by agentId', async () => {
    const t = convexTest(schema);
    await t.mutation(api.agents.register, {
      agentId: 'designer',
      name: 'Wanda',
      role: 'Designer',
      level: 'specialist',
      emoji: '🎨',
      sessionKey: 'agent:designer:main',
    });

    const agent = await t.query(api.agents.getById, { agentId: 'designer' });
    expect(agent).toBeDefined();
    expect(agent?.name).toBe('Wanda');
    expect(agent?.role).toBe('Designer');
  });

  it('should return all agents', async () => {
    const t = convexTest(schema);
    const agents_list = [
      {
        agentId: 'main',
        name: 'Jarvis',
        role: 'Squad Lead',
        level: 'lead' as const,
        emoji: '🤖',
        sessionKey: 'agent:main:main',
      },
      {
        agentId: 'product-analyst',
        name: 'Shuri',
        role: 'Product Analyst',
        level: 'specialist' as const,
        emoji: '🔍',
        sessionKey: 'agent:product-analyst:main',
      },
    ];

    for (const agent of agents_list) {
      await t.mutation(api.agents.register, agent);
    }

    const agents = await t.query(api.agents.getAll, {});
    expect(agents).toHaveLength(2);
    expect(agents.map((a) => a.name)).toContain('Jarvis');
    expect(agents.map((a) => a.name)).toContain('Shuri');
  });

  it('should update heartbeat on status update', async () => {
    const t = convexTest(schema);
    await t.mutation(api.agents.register, {
      agentId: 'test-agent',
      name: 'TestAgent',
      role: 'Test',
      level: 'intern',
      emoji: '🧪',
      sessionKey: 'agent:test-agent:main',
    });

    const before = await t.query(api.agents.getById, { agentId: 'test-agent' });
    const beforeHeartbeat = before?.lastHeartbeat || 0;

    // Small delay to ensure time difference
    await new Promise((resolve) => setTimeout(resolve, 10));

    await t.mutation(api.agents.updateStatus, {
      agentId: 'test-agent',
      status: 'working',
    });

    const after = await t.query(api.agents.getById, { agentId: 'test-agent' });
    expect(after?.lastHeartbeat).toBeGreaterThan(beforeHeartbeat);
  });
});
