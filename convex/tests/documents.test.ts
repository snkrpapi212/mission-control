import { describe, it, expect } from 'vitest';
import { convexTest } from 'convex-test';
import schema from '../schema';
import { api } from '../_generated/api';

describe('Documents', () => {
  it('should create a document', async () => {
    const t = convexTest(schema);
    const taskId = await t.mutation(api.tasks.create, {
      title: 'Doc Task',
      description: 'desc',
      assigneeIds: [],
      createdBy: 'main',
      priority: 'medium',
      tags: [],
    });

    const docId = await t.mutation(api.documents.create, {
      title: 'Research Report',
      content: '# Findings\n\nKey insight here...',
      type: 'research',
      taskId,
      createdBy: 'customer-researcher',
    });

    expect(docId).toBeDefined();

    const docs = await t.query(api.documents.getByType, { type: 'research' });
    expect(docs.length).toBeGreaterThanOrEqual(1);
    expect(docs.some((d) => d.title === 'Research Report')).toBe(true);
  });

  it('should create document without task reference', async () => {
    const t = convexTest(schema);

    const docId = await t.mutation(api.documents.create, {
      title: 'Standalone Document',
      content: 'Content here',
      type: 'protocol',
      createdBy: 'main',
    });

    expect(docId).toBeDefined();

    const docs = await t.query(api.documents.getByType, { type: 'protocol' });
    expect(docs.some((d) => d.title === 'Standalone Document')).toBe(true);
  });

  it('should log activity on document creation', async () => {
    const t = convexTest(schema);
    const taskId = await t.mutation(api.tasks.create, {
      title: 'Doc Task',
      description: 'desc',
      assigneeIds: [],
      createdBy: 'main',
      priority: 'medium',
      tags: [],
    });

    await t.mutation(api.documents.create, {
      title: 'Research Report',
      content: '# Findings',
      type: 'research',
      taskId,
      createdBy: 'customer-researcher',
    });

    const activities = await t.query(api.activities.getRecent, { limit: 10 });
    expect(activities.some((a) => a.type === 'document_created')).toBe(true);
    const created = activities.find((a) => a.type === 'document_created');
    expect(created?.message).toContain('Research Report');
    expect(created?.message).toContain('research');
  });

  it('should get documents by task', async () => {
    const t = convexTest(schema);
    const task1Id = await t.mutation(api.tasks.create, {
      title: 'Task 1',
      description: 'desc',
      assigneeIds: [],
      createdBy: 'main',
      priority: 'medium',
      tags: [],
    });
    const task2Id = await t.mutation(api.tasks.create, {
      title: 'Task 2',
      description: 'desc',
      assigneeIds: [],
      createdBy: 'main',
      priority: 'medium',
      tags: [],
    });

    await t.mutation(api.documents.create, {
      title: 'Doc for Task 1',
      content: 'content',
      type: 'research',
      taskId: task1Id,
      createdBy: 'main',
    });
    await t.mutation(api.documents.create, {
      title: 'Another for Task 1',
      content: 'content',
      type: 'analysis',
      taskId: task1Id,
      createdBy: 'main',
    });
    await t.mutation(api.documents.create, {
      title: 'Doc for Task 2',
      content: 'content',
      type: 'draft',
      taskId: task2Id,
      createdBy: 'main',
    });

    const task1Docs = await t.query(api.documents.getByTask, { taskId: task1Id });
    expect(task1Docs).toHaveLength(2);
    expect(task1Docs.every((d) => d.taskId === task1Id)).toBe(true);

    const task2Docs = await t.query(api.documents.getByTask, { taskId: task2Id });
    expect(task2Docs).toHaveLength(1);
  });

  it('should get documents by type', async () => {
    const t = convexTest(schema);
    const taskId = await t.mutation(api.tasks.create, {
      title: 'Task',
      description: 'desc',
      assigneeIds: [],
      createdBy: 'main',
      priority: 'medium',
      tags: [],
    });

    await t.mutation(api.documents.create, {
      title: 'Research 1',
      content: 'content',
      type: 'research',
      taskId,
      createdBy: 'main',
    });
    await t.mutation(api.documents.create, {
      title: 'Research 2',
      content: 'content',
      type: 'research',
      taskId,
      createdBy: 'main',
    });
    await t.mutation(api.documents.create, {
      title: 'Analysis 1',
      content: 'content',
      type: 'analysis',
      taskId,
      createdBy: 'main',
    });

    const researchDocs = await t.query(api.documents.getByType, { type: 'research' });
    expect(researchDocs.length).toBeGreaterThanOrEqual(2);
    expect(researchDocs.every((d) => d.type === 'research')).toBe(true);

    const analysisDocs = await t.query(api.documents.getByType, { type: 'analysis' });
    expect(analysisDocs.length).toBeGreaterThanOrEqual(1);
    expect(analysisDocs.every((d) => d.type === 'analysis')).toBe(true);
  });

  it('should update document content', async () => {
    const t = convexTest(schema);
    const taskId = await t.mutation(api.tasks.create, {
      title: 'Task',
      description: 'desc',
      assigneeIds: [],
      createdBy: 'main',
      priority: 'medium',
      tags: [],
    });

    const docId = await t.mutation(api.documents.create, {
      title: 'Original Title',
      content: 'Original content',
      type: 'draft',
      taskId,
      createdBy: 'main',
    });

    await t.mutation(api.documents.update, {
      id: docId,
      title: 'Updated Title',
      content: 'Updated content',
    });

    const docs = await t.query(api.documents.getByTask, { taskId });
    const updated = docs.find((d) => d._id === docId);
    expect(updated?.title).toBe('Updated Title');
    expect(updated?.content).toBe('Updated content');
  });

  it('should update document title only', async () => {
    const t = convexTest(schema);
    const taskId = await t.mutation(api.tasks.create, {
      title: 'Task',
      description: 'desc',
      assigneeIds: [],
      createdBy: 'main',
      priority: 'medium',
      tags: [],
    });

    const docId = await t.mutation(api.documents.create, {
      title: 'Original Title',
      content: 'Original content',
      type: 'draft',
      taskId,
      createdBy: 'main',
    });

    await t.mutation(api.documents.update, {
      id: docId,
      title: 'Updated Title',
    });

    const docs = await t.query(api.documents.getByTask, { taskId });
    const updated = docs.find((d) => d._id === docId);
    expect(updated?.title).toBe('Updated Title');
    expect(updated?.content).toBe('Original content');
  });

  it('should update document content only', async () => {
    const t = convexTest(schema);
    const taskId = await t.mutation(api.tasks.create, {
      title: 'Task',
      description: 'desc',
      assigneeIds: [],
      createdBy: 'main',
      priority: 'medium',
      tags: [],
    });

    const docId = await t.mutation(api.documents.create, {
      title: 'Original Title',
      content: 'Original content',
      type: 'draft',
      taskId,
      createdBy: 'main',
    });

    await t.mutation(api.documents.update, {
      id: docId,
      content: 'Updated content',
    });

    const docs = await t.query(api.documents.getByTask, { taskId });
    const updated = docs.find((d) => d._id === docId);
    expect(updated?.title).toBe('Original Title');
    expect(updated?.content).toBe('Updated content');
  });

  it('should have proper createdAt and updatedAt timestamps', async () => {
    const t = convexTest(schema);

    const docId = await t.mutation(api.documents.create, {
      title: 'Timestamp Test',
      content: 'content',
      type: 'draft',
      createdBy: 'main',
    });

    const docs = await t.run(async (ctx) => {
      return await ctx.db.query('documents').collect();
    });

    const doc = docs.find((d) => d._id === docId);
    expect(doc?.createdAt).toBeDefined();
    expect(doc?.updatedAt).toBeDefined();
    expect(typeof doc?.createdAt).toBe('number');
    expect(typeof doc?.updatedAt).toBe('number');
  });

  it('should support all document types', async () => {
    const t = convexTest(schema);

    const types = ['deliverable', 'research', 'protocol', 'analysis', 'draft'] as const;

    for (const type of types) {
      const docId = await t.mutation(api.documents.create, {
        title: `Document: ${type}`,
        content: 'content',
        type,
        createdBy: 'main',
      });

      expect(docId).toBeDefined();
    }

    for (const type of types) {
      const docs = await t.query(api.documents.getByType, { type });
      expect(docs.some((d) => d.type === type)).toBe(true);
    }
  });

  it('should associate document with activity log', async () => {
    const t = convexTest(schema);
    const taskId = await t.mutation(api.tasks.create, {
      title: 'Task',
      description: 'desc',
      assigneeIds: [],
      createdBy: 'main',
      priority: 'medium',
      tags: [],
    });

    const docId = await t.mutation(api.documents.create, {
      title: 'Activity Test Document',
      content: 'content',
      type: 'research',
      taskId,
      createdBy: 'main',
    });

    const activities = await t.query(api.activities.getRecent, { limit: 10 });
    const docActivity = activities.find((a) => a.type === 'document_created');
    expect(docActivity?.documentId).toEqual(docId);
    expect(docActivity?.taskId).toEqual(taskId);
  });
});
