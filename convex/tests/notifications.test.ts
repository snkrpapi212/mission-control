import { describe, it, expect } from 'vitest';
import { convexTest } from 'convex-test';
import schema from '../schema';
import { api } from '../_generated/api';

describe('Notifications', () => {
  it('should get undelivered notifications for an agent', async () => {
    const t = convexTest(schema);
    const taskId = await t.mutation(api.tasks.create, {
      title: 'Test Task',
      description: 'desc',
      assigneeIds: [],
      createdBy: 'main',
      priority: 'medium',
      tags: [],
    });

    await t.mutation(api.messages.create, {
      taskId,
      fromAgentId: 'main',
      content: '@Vision check this',
      mentions: ['seo-analyst'],
    });

    const undelivered = await t.query(api.notifications.getUndelivered, {
      agentId: 'seo-analyst',
    });
    expect(undelivered.length).toBeGreaterThanOrEqual(1);
    expect(undelivered.every((n) => !n.delivered)).toBe(true);
  });

  it('should mark notification as delivered', async () => {
    const t = convexTest(schema);
    const taskId = await t.mutation(api.tasks.create, {
      title: 'Test Task',
      description: 'desc',
      assigneeIds: [],
      createdBy: 'main',
      priority: 'medium',
      tags: [],
    });

    await t.mutation(api.messages.create, {
      taskId,
      fromAgentId: 'main',
      content: '@Vision check this',
      mentions: ['seo-analyst'],
    });

    const undeliveredBefore = await t.query(api.notifications.getUndelivered, {
      agentId: 'seo-analyst',
    });
    expect(undeliveredBefore.length).toBeGreaterThanOrEqual(1);

    const notifId = undeliveredBefore[0]._id;
    await t.mutation(api.notifications.markDelivered, { id: notifId });

    const undeliveredAfter = await t.query(api.notifications.getUndelivered, {
      agentId: 'seo-analyst',
    });
    expect(undeliveredAfter.length).toBeLessThan(undeliveredBefore.length);
  });

  it('should not return delivered notifications', async () => {
    const t = convexTest(schema);
    const taskId = await t.mutation(api.tasks.create, {
      title: 'Test Task',
      description: 'desc',
      assigneeIds: [],
      createdBy: 'main',
      priority: 'medium',
      tags: [],
    });

    await t.mutation(api.messages.create, {
      taskId,
      fromAgentId: 'main',
      content: '@Vision check this',
      mentions: ['seo-analyst'],
    });

    const undelivered = await t.query(api.notifications.getUndelivered, {
      agentId: 'seo-analyst',
    });
    const notifId = undelivered[0]._id;

    await t.mutation(api.notifications.markDelivered, { id: notifId });

    const stillUndelivered = await t.query(api.notifications.getUndelivered, {
      agentId: 'seo-analyst',
    });

    expect(stillUndelivered.find((n) => n._id === notifId)).toBeUndefined();
  });

  it('should create bulk notifications', async () => {
    const t = convexTest(schema);
    const taskId = await t.mutation(api.tasks.create, {
      title: 'Test Task',
      description: 'desc',
      assigneeIds: [],
      createdBy: 'main',
      priority: 'medium',
      tags: [],
    });

    const notifIds = await t.mutation(api.notifications.createBulk, {
      notifications: [
        {
          mentionedAgentId: 'seo-analyst',
          fromAgentId: 'main',
          content: 'First notification',
          taskId,
        },
        {
          mentionedAgentId: 'content-writer',
          fromAgentId: 'main',
          content: 'Second notification',
          taskId,
        },
        {
          mentionedAgentId: 'designer',
          fromAgentId: 'main',
          content: 'Third notification',
          taskId,
        },
      ],
    });

    expect(notifIds).toHaveLength(3);

    const visionUndelivered = await t.query(api.notifications.getUndelivered, {
      agentId: 'seo-analyst',
    });
    expect(visionUndelivered.length).toBeGreaterThanOrEqual(1);
    expect(visionUndelivered.some((n) => n.content === 'First notification')).toBe(true);

    const lokiUndelivered = await t.query(api.notifications.getUndelivered, {
      agentId: 'content-writer',
    });
    expect(lokiUndelivered.length).toBeGreaterThanOrEqual(1);

    const wandaUndelivered = await t.query(api.notifications.getUndelivered, {
      agentId: 'designer',
    });
    expect(wandaUndelivered.length).toBeGreaterThanOrEqual(1);
  });

  it('should return notifications with correct task reference', async () => {
    const t = convexTest(schema);
    const taskId = await t.mutation(api.tasks.create, {
      title: 'Test Task',
      description: 'desc',
      assigneeIds: [],
      createdBy: 'main',
      priority: 'medium',
      tags: [],
    });

    await t.mutation(api.messages.create, {
      taskId,
      fromAgentId: 'main',
      content: '@Vision check this',
      mentions: ['seo-analyst'],
    });

    const undelivered = await t.query(api.notifications.getUndelivered, {
      agentId: 'seo-analyst',
    });
    expect(undelivered[0].taskId).toEqual(taskId);
  });

  it('should maintain delivered flag after marking', async () => {
    const t = convexTest(schema);
    const taskId = await t.mutation(api.tasks.create, {
      title: 'Test Task',
      description: 'desc',
      assigneeIds: [],
      createdBy: 'main',
      priority: 'medium',
      tags: [],
    });

    await t.mutation(api.messages.create, {
      taskId,
      fromAgentId: 'main',
      content: '@Vision check this',
      mentions: ['seo-analyst'],
    });

    const undelivered = await t.query(api.notifications.getUndelivered, {
      agentId: 'seo-analyst',
    });
    const notifId = undelivered[0]._id;

    await t.mutation(api.notifications.markDelivered, { id: notifId });

    // Get all notifications (including delivered)
    const allNotifications = await t.run(async (ctx) => {
      return await ctx.db.query('notifications').collect();
    });

    const marked = allNotifications.find((n) => n._id === notifId);
    expect(marked?.delivered).toBe(true);
  });

  it('should handle multiple agents receiving notifications', async () => {
    const t = convexTest(schema);
    const taskId = await t.mutation(api.tasks.create, {
      title: 'Test Task',
      description: 'desc',
      assigneeIds: ['seo-analyst', 'content-writer'],
      createdBy: 'main',
      priority: 'medium',
      tags: [],
    });

    // Main creates message, both Vision and Loki should be notified
    await t.mutation(api.messages.create, {
      taskId,
      fromAgentId: 'main',
      content: 'Check this task',
    });

    const visionNotifs = await t.query(api.notifications.getUndelivered, {
      agentId: 'seo-analyst',
    });
    const lokiNotifs = await t.query(api.notifications.getUndelivered, {
      agentId: 'content-writer',
    });

    expect(visionNotifs.length).toBeGreaterThanOrEqual(1);
    expect(lokiNotifs.length).toBeGreaterThanOrEqual(1);
  });
});
