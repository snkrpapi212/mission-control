import { describe, it, expect } from 'vitest';
import { convexTest } from 'convex-test';
import schema from '../schema';
import { api } from '../_generated/api';

describe('Tasks', () => {
  it('should create a task with default status inbox', async () => {
    const t = convexTest(schema);
    const taskId = await t.mutation(api.tasks.create, {
      title: 'Test Task',
      description: 'Test description',
      assigneeIds: ['main'],
      createdBy: 'main',
      priority: 'medium',
      tags: ['test'],
    });

    expect(taskId).toBeDefined();

    const tasks = await t.query(api.tasks.getAll, {});
    expect(tasks).toHaveLength(1);
    expect(tasks[0].status).toBe('inbox');
    expect(tasks[0].title).toBe('Test Task');
    expect(tasks[0].priority).toBe('medium');
  });

  it('should initialize subscriberIds with assigneeIds', async () => {
    const t = convexTest(schema);
    const taskId = await t.mutation(api.tasks.create, {
      title: 'Subscriber Test',
      description: 'desc',
      assigneeIds: ['vision', 'loki'],
      createdBy: 'main',
      priority: 'high',
      tags: [],
    });

    const tasks = await t.query(api.tasks.getAll, {});
    expect(tasks[0].subscriberIds).toContain('vision');
    expect(tasks[0].subscriberIds).toContain('loki');
  });

  it('should update task status and log activity', async () => {
    const t = convexTest(schema);
    const taskId = await t.mutation(api.tasks.create, {
      title: 'Update Test',
      description: 'desc',
      assigneeIds: [],
      createdBy: 'main',
      priority: 'low',
      tags: [],
    });

    await t.mutation(api.tasks.update, {
      id: taskId,
      status: 'in_progress',
      agentId: 'main',
    });

    const tasks = await t.query(api.tasks.getAll, {});
    expect(tasks[0].status).toBe('in_progress');

    const activities = await t.query(api.activities.getRecent, { limit: 10 });
    expect(activities.some((a) => a.type === 'status_changed')).toBe(true);
    expect(activities.find((a) => a.type === 'status_changed')?.message).toContain('inbox');
    expect(activities.find((a) => a.type === 'status_changed')?.message).toContain('in_progress');
  });

  it('should return tasks by status', async () => {
    const t = convexTest(schema);
    await t.mutation(api.tasks.create, {
      title: 'Inbox Task 1',
      description: 'desc',
      assigneeIds: [],
      createdBy: 'main',
      priority: 'low',
      tags: [],
    });
    await t.mutation(api.tasks.create, {
      title: 'Inbox Task 2',
      description: 'desc',
      assigneeIds: [],
      createdBy: 'main',
      priority: 'low',
      tags: [],
    });

    const inboxTasks = await t.query(api.tasks.getByStatus, { status: 'inbox' });
    expect(inboxTasks).toHaveLength(2);
    expect(inboxTasks.every((t) => t.status === 'inbox')).toBe(true);
  });

  it('should return tasks assigned to a specific agent', async () => {
    const t = convexTest(schema);
    const task1Id = await t.mutation(api.tasks.create, {
      title: 'For Vision',
      description: 'SEO task',
      assigneeIds: ['seo-analyst'],
      createdBy: 'main',
      priority: 'high',
      tags: ['seo'],
    });
    const task2Id = await t.mutation(api.tasks.create, {
      title: 'For Loki',
      description: 'Writing task',
      assigneeIds: ['content-writer'],
      createdBy: 'main',
      priority: 'medium',
      tags: ['content'],
    });

    const visionTasks = await t.query(api.tasks.getAssigned, { agentId: 'seo-analyst' });
    expect(visionTasks).toHaveLength(1);
    expect(visionTasks[0].title).toBe('For Vision');

    const lokiTasks = await t.query(api.tasks.getAssigned, { agentId: 'content-writer' });
    expect(lokiTasks).toHaveLength(1);
    expect(lokiTasks[0].title).toBe('For Loki');
  });

  it('should add new assignees and retain subscribers', async () => {
    const t = convexTest(schema);
    const taskId = await t.mutation(api.tasks.create, {
      title: 'Multi-Agent Task',
      description: 'desc',
      assigneeIds: ['vision'],
      createdBy: 'main',
      priority: 'medium',
      tags: [],
    });

    // Update with new assignee
    await t.mutation(api.tasks.update, {
      id: taskId,
      assigneeIds: ['vision', 'loki'],
      agentId: 'main',
    });

    const tasks = await t.query(api.tasks.getAll, {});
    expect(tasks[0].assigneeIds).toContain('vision');
    expect(tasks[0].assigneeIds).toContain('loki');
    expect(tasks[0].subscriberIds).toContain('vision');
    expect(tasks[0].subscriberIds).toContain('loki');
  });

  it('should update priority without affecting status', async () => {
    const t = convexTest(schema);
    const taskId = await t.mutation(api.tasks.create, {
      title: 'Priority Test',
      description: 'desc',
      assigneeIds: [],
      createdBy: 'main',
      priority: 'low',
      tags: [],
    });

    await t.mutation(api.tasks.update, {
      id: taskId,
      priority: 'urgent',
      agentId: 'main',
    });

    const tasks = await t.query(api.tasks.getAll, {});
    expect(tasks[0].priority).toBe('urgent');
    expect(tasks[0].status).toBe('inbox');
  });

  it('should log activity on task creation', async () => {
    const t = convexTest(schema);
    await t.mutation(api.tasks.create, {
      title: 'Activity Log Test',
      description: 'desc',
      assigneeIds: [],
      createdBy: 'main',
      priority: 'medium',
      tags: [],
    });

    const activities = await t.query(api.activities.getRecent, { limit: 10 });
    expect(activities.some((a) => a.type === 'task_created')).toBe(true);
    const created = activities.find((a) => a.type === 'task_created');
    expect(created?.message).toContain('Activity Log Test');
    expect(created?.agentId).toBe('main');
  });

  it('should not log status_changed if status is same', async () => {
    const t = convexTest(schema);
    const taskId = await t.mutation(api.tasks.create, {
      title: 'No Change Test',
      description: 'desc',
      assigneeIds: [],
      createdBy: 'main',
      priority: 'medium',
      tags: [],
    });

    const activitiesBefore = await t.query(api.activities.getRecent, { limit: 10 });
    const countBefore = activitiesBefore.filter((a) => a.type === 'status_changed').length;

    await t.mutation(api.tasks.update, {
      id: taskId,
      status: 'inbox',
      agentId: 'main',
    });

    const activitiesAfter = await t.query(api.activities.getRecent, { limit: 10 });
    const countAfter = activitiesAfter.filter((a) => a.type === 'status_changed').length;

    expect(countAfter).toBe(countBefore);
  });
});
