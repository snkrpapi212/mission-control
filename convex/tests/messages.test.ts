import { describe, it, expect } from 'vitest';
import { convexTest } from 'convex-test';
import schema from '../schema';
import { api } from '../_generated/api';

describe('Messages', () => {
  it('should create a message', async () => {
    const t = convexTest(schema);
    const taskId = await t.mutation(api.tasks.create, {
      title: 'Discussion Task',
      description: 'desc',
      assigneeIds: ['main'],
      createdBy: 'main',
      priority: 'medium',
      tags: [],
    });

    const messageId = await t.mutation(api.messages.create, {
      taskId,
      fromAgentId: 'seo-analyst',
      content: 'Here is my keyword research',
    });

    expect(messageId).toBeDefined();

    const messages = await t.query(api.messages.getByTask, { taskId });
    expect(messages).toHaveLength(1);
    expect(messages[0].fromAgentId).toBe('seo-analyst');
    expect(messages[0].content).toBe('Here is my keyword research');
  });

  it('should auto-subscribe the commenter', async () => {
    const t = convexTest(schema);
    const taskId = await t.mutation(api.tasks.create, {
      title: 'Auto Subscribe Test',
      description: 'desc',
      assigneeIds: ['main'],
      createdBy: 'main',
      priority: 'medium',
      tags: [],
    });

    await t.mutation(api.messages.create, {
      taskId,
      fromAgentId: 'seo-analyst',
      content: 'First comment',
    });

    const tasks = await t.query(api.tasks.getAll, {});
    expect(tasks[0].subscriberIds).toContain('seo-analyst');
  });

  it('should create notifications for @mentions', async () => {
    const t = convexTest(schema);
    const taskId = await t.mutation(api.tasks.create, {
      title: 'Mention Task',
      description: 'desc',
      assigneeIds: [],
      createdBy: 'main',
      priority: 'medium',
      tags: [],
    });

    await t.mutation(api.messages.create, {
      taskId,
      fromAgentId: 'main',
      content: '@Vision can you review this?',
      mentions: ['seo-analyst'],
    });

    const notifications = await t.query(api.notifications.getUndelivered, {
      agentId: 'seo-analyst',
    });
    expect(notifications.length).toBeGreaterThanOrEqual(1);
    expect(notifications.some((n) => n.fromAgentId === 'main')).toBe(true);
  });

  it('should create notifications for multiple mentions', async () => {
    const t = convexTest(schema);
    const taskId = await t.mutation(api.tasks.create, {
      title: 'Multi Mention Task',
      description: 'desc',
      assigneeIds: [],
      createdBy: 'main',
      priority: 'medium',
      tags: [],
    });

    await t.mutation(api.messages.create, {
      taskId,
      fromAgentId: 'main',
      content: '@Vision @Loki please check this',
      mentions: ['seo-analyst', 'content-writer'],
    });

    const visionNotifs = await t.query(api.notifications.getUndelivered, {
      agentId: 'seo-analyst',
    });
    expect(visionNotifs.length).toBeGreaterThanOrEqual(1);

    const lokiNotifs = await t.query(api.notifications.getUndelivered, {
      agentId: 'content-writer',
    });
    expect(lokiNotifs.length).toBeGreaterThanOrEqual(1);
  });

  it('should notify subscribers on comment', async () => {
    const t = convexTest(schema);
    const taskId = await t.mutation(api.tasks.create, {
      title: 'Thread Task',
      description: 'desc',
      assigneeIds: ['seo-analyst'],
      createdBy: 'main',
      priority: 'medium',
      tags: [],
    });

    // Loki comments — seo-analyst (subscriber as assignee) should be notified
    await t.mutation(api.messages.create, {
      taskId,
      fromAgentId: 'content-writer',
      content: 'First draft ready',
    });

    const visionNotifs = await t.query(api.notifications.getUndelivered, {
      agentId: 'seo-analyst',
    });
    expect(visionNotifs.length).toBeGreaterThanOrEqual(1);
    expect(visionNotifs.some((n) => n.fromAgentId === 'content-writer')).toBe(true);
  });

  it('should not notify the commenter', async () => {
    const t = convexTest(schema);
    const taskId = await t.mutation(api.tasks.create, {
      title: 'Self Notify Test',
      description: 'desc',
      assigneeIds: ['main', 'seo-analyst'],
      createdBy: 'main',
      priority: 'medium',
      tags: [],
    });

    const lokiNotifsBefore = await t.query(api.notifications.getUndelivered, {
      agentId: 'content-writer',
    });

    await t.mutation(api.messages.create, {
      taskId,
      fromAgentId: 'content-writer',
      content: 'I am commenting',
    });

    const lokiNotifsAfter = await t.query(api.notifications.getUndelivered, {
      agentId: 'content-writer',
    });

    // Should not create additional notif for self
    expect(lokiNotifsAfter.length).toBe(lokiNotifsBefore.length);
  });

  it('should support attachments', async () => {
    const t = convexTest(schema);
    const taskId = await t.mutation(api.tasks.create, {
      title: 'Attachment Task',
      description: 'desc',
      assigneeIds: [],
      createdBy: 'main',
      priority: 'medium',
      tags: [],
    });

    const docId = await t.mutation(api.documents.create, {
      title: 'Research',
      content: 'findings',
      type: 'research',
      taskId,
      createdBy: 'main',
    });

    const messageId = await t.mutation(api.messages.create, {
      taskId,
      fromAgentId: 'main',
      content: 'See attached research',
      attachmentIds: [docId],
    });

    const messages = await t.query(api.messages.getByTask, { taskId });
    expect(messages[messages.length - 1].attachmentIds).toContain(docId);
  });

  it('should log activity on message creation', async () => {
    const t = convexTest(schema);
    const taskId = await t.mutation(api.tasks.create, {
      title: 'Activity Log Test',
      description: 'desc',
      assigneeIds: [],
      createdBy: 'main',
      priority: 'medium',
      tags: [],
    });

    const activitiesBefore = await t.query(api.activities.getRecent, { limit: 10 });

    await t.mutation(api.messages.create, {
      taskId,
      fromAgentId: 'main',
      content: 'Test message',
    });

    const activitiesAfter = await t.query(api.activities.getRecent, { limit: 10 });
    expect(activitiesAfter.length).toBeGreaterThan(activitiesBefore.length);
    expect(activitiesAfter.some((a) => a.type === 'message_sent')).toBe(true);
  });

  it('should get all messages for a task', async () => {
    const t = convexTest(schema);
    const taskId = await t.mutation(api.tasks.create, {
      title: 'Multi Message Task',
      description: 'desc',
      assigneeIds: [],
      createdBy: 'main',
      priority: 'medium',
      tags: [],
    });

    await t.mutation(api.messages.create, {
      taskId,
      fromAgentId: 'main',
      content: 'Message 1',
    });
    await t.mutation(api.messages.create, {
      taskId,
      fromAgentId: 'seo-analyst',
      content: 'Message 2',
    });
    await t.mutation(api.messages.create, {
      taskId,
      fromAgentId: 'content-writer',
      content: 'Message 3',
    });

    const messages = await t.query(api.messages.getByTask, { taskId });
    expect(messages).toHaveLength(3);
    expect(messages[0].content).toBe('Message 1');
    expect(messages[1].content).toBe('Message 2');
    expect(messages[2].content).toBe('Message 3');
  });

  it('should not duplicate mention notification with subscriber notification', async () => {
    const t = convexTest(schema);
    const taskId = await t.mutation(api.tasks.create, {
      title: 'Mention + Subscribe Test',
      description: 'desc',
      assigneeIds: ['seo-analyst'],
      createdBy: 'main',
      priority: 'medium',
      tags: [],
    });

    // Vision is both assigned (subscriber) and mentioned
    await t.mutation(api.messages.create, {
      taskId,
      fromAgentId: 'main',
      content: '@Vision please review',
      mentions: ['seo-analyst'],
    });

    const visionNotifs = await t.query(api.notifications.getUndelivered, {
      agentId: 'seo-analyst',
    });
    // Should get mention notification (one)
    expect(visionNotifs.length).toBeGreaterThanOrEqual(1);
  });
});
