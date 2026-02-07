import { describe, it, expect } from 'vitest';
import { convexTest } from 'convex-test';
import schema from '../schema';
import { api } from '../_generated/api';

/**
 * Real-world workflow test: Product Launch Campaign
 *
 * Scenario: Jarvis (lead) kicks off a landing page project.
 * Vision (SEO analyst) does keyword research, hands findings to
 * Loki (content writer) who drafts the copy. They collaborate
 * through task comments, documents, and notifications until
 * the deliverable is ready for review.
 */
describe('Product Launch Workflow', () => {
  it('should run a full SEO → Content pipeline between two agents', async () => {
    const t = convexTest(schema);

    // ─── Step 1: Register the squad ───────────────────────────
    await t.mutation(api.agents.register, {
      agentId: 'main',
      name: 'Jarvis',
      role: 'Squad Lead',
      level: 'lead',
      emoji: '🤖',
      sessionKey: 'agent:main:main',
    });
    await t.mutation(api.agents.register, {
      agentId: 'seo-analyst',
      name: 'Vision',
      role: 'SEO Analyst',
      level: 'specialist',
      emoji: '📊',
      sessionKey: 'agent:seo-analyst:main',
    });
    await t.mutation(api.agents.register, {
      agentId: 'content-writer',
      name: 'Loki',
      role: 'Content Writer',
      level: 'specialist',
      emoji: '✍️',
      sessionKey: 'agent:content-writer:main',
    });

    // ─── Step 2: Jarvis creates the landing page task ─────────
    const landingPageTaskId = await t.mutation(api.tasks.create, {
      title: 'Create Q3 Product Landing Page',
      description:
        'We need a high-converting landing page for the Q3 product launch. ' +
        'Vision: keyword research + competitor analysis. ' +
        'Loki: write hero copy, features section, and CTA based on Vision\'s research.',
      assigneeIds: ['seo-analyst', 'content-writer'],
      createdBy: 'main',
      priority: 'high',
      tags: ['q3-launch', 'landing-page', 'content'],
    });

    // Both agents should be auto-subscribed as assignees
    const tasksAfterCreate = await t.query(api.tasks.getAll, {});
    const landingPage = tasksAfterCreate.find((t) => t._id === landingPageTaskId)!;
    expect(landingPage.subscriberIds).toContain('seo-analyst');
    expect(landingPage.subscriberIds).toContain('content-writer');
    expect(landingPage.status).toBe('inbox');

    // ─── Step 3: Vision picks up the task and starts research ──
    await t.mutation(api.agents.updateStatus, {
      agentId: 'seo-analyst',
      status: 'working',
    });
    await t.mutation(api.tasks.update, {
      id: landingPageTaskId,
      status: 'in_progress',
      agentId: 'seo-analyst',
    });

    // Vision posts a progress update
    await t.mutation(api.messages.create, {
      taskId: landingPageTaskId,
      fromAgentId: 'seo-analyst',
      content:
        'Starting keyword research. Targeting "AI productivity tools" cluster. ' +
        'Ahrefs shows 12K monthly volume, KD 34. Competitor gaps in long-tail: ' +
        '"ai task automation for teams" (2.4K vol, KD 18). Will have full report in 30 min.',
    });

    // Loki should get notified (subscriber)
    const lokiNotifsAfterUpdate = await t.query(api.notifications.getUndelivered, {
      agentId: 'content-writer',
    });
    expect(lokiNotifsAfterUpdate.length).toBeGreaterThanOrEqual(1);

    // ─── Step 4: Vision delivers keyword research document ─────
    const keywordDocId = await t.mutation(api.documents.create, {
      title: 'Q3 Landing Page - Keyword Research',
      content: [
        '# Keyword Research: Q3 Product Launch',
        '',
        '## Primary Keywords',
        '- "AI productivity tools" — 12,000/mo, KD 34',
        '- "AI task management" — 8,100/mo, KD 41',
        '',
        '## Long-Tail Opportunities',
        '- "ai task automation for teams" — 2,400/mo, KD 18 ✅ Best opportunity',
        '- "automated project management AI" — 1,900/mo, KD 22',
        '- "ai workflow automation software" — 3,100/mo, KD 29',
        '',
        '## Competitor Gaps',
        '- Monday.com ranks for "ai project management" but NOT "ai task automation for teams"',
        '- Notion AI ranks for "ai productivity" but weak on "workflow automation"',
        '',
        '## Recommendations for Copy',
        '1. H1 should target: "AI Task Automation for Teams"',
        '2. Include "workflow automation" in subheading',
        '3. Feature section headers should use long-tail variants',
        '4. CTA: emphasize "automation" over "management"',
      ].join('\n'),
      type: 'research',
      taskId: landingPageTaskId,
      createdBy: 'seo-analyst',
    });

    // Vision posts the handoff message, mentioning Loki
    await t.mutation(api.messages.create, {
      taskId: landingPageTaskId,
      fromAgentId: 'seo-analyst',
      content:
        'Keyword research complete. Attached the full report. ' +
        '@Loki the primary angle is "AI task automation for teams" — ' +
        'low competition, decent volume. H1, subheading, and CTA recs are in the doc. ' +
        'Let me know if you need competitor copy samples.',
      attachmentIds: [keywordDocId],
      mentions: ['content-writer'],
    });

    // Vision marks themselves idle
    await t.mutation(api.agents.updateStatus, {
      agentId: 'seo-analyst',
      status: 'idle',
    });

    // Loki should have a mention notification
    const lokiMentionNotifs = await t.query(api.notifications.getUndelivered, {
      agentId: 'content-writer',
    });
    expect(lokiMentionNotifs.some((n) => n.content.includes('@Loki'))).toBe(true);

    // ─── Step 5: Loki picks up and writes the landing page copy ─
    await t.mutation(api.agents.updateStatus, {
      agentId: 'content-writer',
      status: 'working',
    });

    // Loki acknowledges and asks a question
    await t.mutation(api.messages.create, {
      taskId: landingPageTaskId,
      fromAgentId: 'content-writer',
      content:
        'Got it. Great research — the "automation for teams" angle is smart. ' +
        '@Vision quick question: should I lean B2B enterprise or startup/SMB in tone?',
      mentions: ['seo-analyst'],
    });

    // Vision gets notified of the question
    const visionQuestionNotif = await t.query(api.notifications.getUndelivered, {
      agentId: 'seo-analyst',
    });
    expect(visionQuestionNotif.some((n) => n.content.includes('@Vision'))).toBe(true);

    // Vision responds
    await t.mutation(api.messages.create, {
      taskId: landingPageTaskId,
      fromAgentId: 'seo-analyst',
      content:
        'Competitor analysis says SMB/startup. Monday.com owns the enterprise space. ' +
        'Our long-tail keywords skew toward smaller teams (5-50 people). ' +
        'Keep it conversational, not corporate.',
    });

    // ─── Step 6: Loki delivers the draft ──────────────────────
    const copyDocId = await t.mutation(api.documents.create, {
      title: 'Q3 Landing Page - Copy Draft v1',
      content: [
        '# AI Task Automation for Teams',
        '',
        '## Hero Section',
        '**H1:** AI Task Automation for Teams That Ship Fast',
        '**Subhead:** Stop managing tasks. Start automating workflows. ' +
        'Built for teams of 5–50 who\'d rather build than babysit a backlog.',
        '**CTA:** Automate Your First Workflow →',
        '',
        '## Features Section',
        '',
        '### 🤖 Smart Task Routing',
        'AI reads your backlog and assigns work to the right person. ' +
        'No more standup-driven ticket shuffling.',
        '',
        '### ⚡ Workflow Automation Software',
        'Define a trigger, set the rules, let it run. ' +
        'From PR merged → deploy staging → notify QA — zero manual steps.',
        '',
        '### 📊 Automated Project Intelligence',
        'Real-time dashboards that update themselves. ' +
        'Know what\'s blocked before your team does.',
        '',
        '## Social Proof',
        '"We cut our sprint planning from 2 hours to 15 minutes." — CTO, SeriesB Startup',
        '',
        '## Final CTA',
        '**Stop managing. Start shipping.**',
        'Free for teams up to 10. No credit card required.',
        '[Start Automating →]',
      ].join('\n'),
      type: 'deliverable',
      taskId: landingPageTaskId,
      createdBy: 'content-writer',
    });

    // Loki posts completion message
    await t.mutation(api.messages.create, {
      taskId: landingPageTaskId,
      fromAgentId: 'content-writer',
      content:
        'Draft v1 attached. Hit all the keyword targets: ' +
        '"AI task automation for teams" in H1, "workflow automation software" in features, ' +
        '"automated project" in the intelligence section. Tone is SMB/startup per Vision\'s rec. ' +
        'Ready for review @Jarvis.',
      attachmentIds: [copyDocId],
      mentions: ['main'],
    });

    // Move to review
    await t.mutation(api.tasks.update, {
      id: landingPageTaskId,
      status: 'review',
      agentId: 'content-writer',
    });
    await t.mutation(api.agents.updateStatus, {
      agentId: 'content-writer',
      status: 'idle',
    });

    // ─── Step 7: Verify the full state ────────────────────────

    // Task should be in review
    const finalTasks = await t.query(api.tasks.getAll, {});
    const finalTask = finalTasks.find((t) => t._id === landingPageTaskId)!;
    expect(finalTask.status).toBe('review');
    expect(finalTask.priority).toBe('high');

    // All three agents should be subscribers (two assigned + Vision commented)
    expect(finalTask.subscriberIds).toContain('seo-analyst');
    expect(finalTask.subscriberIds).toContain('content-writer');

    // Jarvis should be notified for review
    const jarvisNotifs = await t.query(api.notifications.getUndelivered, {
      agentId: 'main',
    });
    expect(jarvisNotifs.some((n) => n.content.includes('@Jarvis'))).toBe(true);

    // Should have 5 messages in the thread
    const allMessages = await t.query(api.messages.getByTask, {
      taskId: landingPageTaskId,
    });
    expect(allMessages).toHaveLength(5);

    // Should have 2 documents (research + deliverable)
    const taskDocs = await t.query(api.documents.getByTask, {
      taskId: landingPageTaskId,
    });
    expect(taskDocs).toHaveLength(2);
    expect(taskDocs.some((d) => d.type === 'research')).toBe(true);
    expect(taskDocs.some((d) => d.type === 'deliverable')).toBe(true);

    // Activity log should capture the full lifecycle
    const activities = await t.query(api.activities.getRecent, { limit: 50 });
    const taskActivities = activities.filter(
      (a) => a.taskId === landingPageTaskId || a.type === 'task_created'
    );
    expect(taskActivities.some((a) => a.type === 'task_created')).toBe(true);
    expect(taskActivities.some((a) => a.type === 'status_changed')).toBe(true);
    expect(taskActivities.some((a) => a.type === 'message_sent')).toBe(true);
    expect(taskActivities.some((a) => a.type === 'document_created')).toBe(true);

    // Both agents should be idle after handoff
    const visionAgent = await t.query(api.agents.getById, { agentId: 'seo-analyst' });
    const lokiAgent = await t.query(api.agents.getById, { agentId: 'content-writer' });
    expect(visionAgent?.status).toBe('idle');
    expect(lokiAgent?.status).toBe('idle');
  });

  it('should handle a bug report escalation between agents', async () => {
    const t = convexTest(schema);

    // Register agents
    await t.mutation(api.agents.register, {
      agentId: 'main',
      name: 'Jarvis',
      role: 'Squad Lead',
      level: 'lead',
      emoji: '🤖',
      sessionKey: 'agent:main:main',
    });
    await t.mutation(api.agents.register, {
      agentId: 'developer',
      name: 'Friday',
      role: 'Developer',
      level: 'specialist',
      emoji: '💻',
      sessionKey: 'agent:developer:main',
    });
    await t.mutation(api.agents.register, {
      agentId: 'customer-researcher',
      name: 'Fury',
      role: 'Customer Researcher',
      level: 'specialist',
      emoji: '🕵️',
      sessionKey: 'agent:customer-researcher:main',
    });

    // ─── Fury finds a customer-reported bug ───────────────────
    const bugTaskId = await t.mutation(api.tasks.create, {
      title: 'URGENT: Checkout flow drops payments on mobile Safari',
      description:
        'Three customer reports in the last hour. Payment form submits but ' +
        'Stripe webhook never fires on iOS Safari 17.2+. Desktop Chrome works fine. ' +
        'Likely a fetch API or CSP issue specific to WebKit.',
      assigneeIds: ['developer'],
      createdBy: 'customer-researcher',
      priority: 'urgent',
      tags: ['bug', 'payments', 'mobile', 'p0'],
    });

    // Fury attaches customer evidence
    const evidenceDocId = await t.mutation(api.documents.create, {
      title: 'Customer Reports - Mobile Payment Bug',
      content: [
        '# Customer Reports',
        '',
        '## Report 1 — user_4821 (12:03 UTC)',
        'Device: iPhone 15, Safari 17.2',
        '"Clicked pay, spinner went forever, got charged but no confirmation"',
        'Stripe dashboard: payment_intent succeeded, but webhook POST returned 0 bytes',
        '',
        '## Report 2 — user_7293 (12:15 UTC)',
        'Device: iPhone 14 Pro, Safari 17.2.1',
        '"Same issue. Tried 3 times, all charged, no order created"',
        '',
        '## Report 3 — user_1058 (12:31 UTC)',
        'Device: iPad Air, Safari 17.2',
        '"Payment page just hangs after clicking submit"',
        '',
        '## Pattern',
        '- ALL iOS Safari 17.2+',
        '- Stripe payment succeeds server-side',
        '- Client never receives confirmation → no order created',
        '- Customers charged but see no order',
      ].join('\n'),
      type: 'research',
      taskId: bugTaskId,
      createdBy: 'customer-researcher',
    });

    await t.mutation(api.messages.create, {
      taskId: bugTaskId,
      fromAgentId: 'customer-researcher',
      content:
        '@Friday this is P0 — customers are getting charged with no order created. ' +
        '3 reports in 30 min, all iOS Safari 17.2+. Evidence doc attached. ' +
        'Stripe webhooks fire but client-side fetch seems to die silently.',
      attachmentIds: [evidenceDocId],
      mentions: ['developer'],
    });

    // Friday should be notified
    const fridayNotifs = await t.query(api.notifications.getUndelivered, {
      agentId: 'developer',
    });
    expect(fridayNotifs.length).toBeGreaterThanOrEqual(1);

    // ─── Friday investigates and finds the root cause ─────────
    await t.mutation(api.agents.updateStatus, {
      agentId: 'developer',
      status: 'working',
    });
    await t.mutation(api.tasks.update, {
      id: bugTaskId,
      status: 'in_progress',
      agentId: 'developer',
    });

    await t.mutation(api.messages.create, {
      taskId: bugTaskId,
      fromAgentId: 'developer',
      content:
        'Found it. Safari 17.2 changed how `fetch()` handles keepalive with credentials. ' +
        'Our checkout calls `fetch("/api/confirm", { keepalive: true, credentials: "include" })` — ' +
        'Safari now silently aborts this combo. The request fires but the response never resolves. ' +
        'Fix: use `navigator.sendBeacon()` for the confirmation, or drop keepalive. ' +
        'Pushing hotfix to staging now.',
    });

    // Friday creates the fix documentation
    const fixDocId = await t.mutation(api.documents.create, {
      title: 'Hotfix: Safari 17.2 Payment Confirmation',
      content: [
        '# Hotfix: Safari 17.2 fetch + keepalive + credentials',
        '',
        '## Root Cause',
        'Safari 17.2 silently aborts `fetch()` when BOTH `keepalive: true` AND',
        '`credentials: "include"` are set. The request reaches the server but',
        'the client Promise never resolves.',
        '',
        '## Fix',
        '```diff',
        '- fetch("/api/confirm-order", {',
        '-   method: "POST",',
        '-   keepalive: true,',
        '-   credentials: "include",',
        '-   body: JSON.stringify({ orderId })',
        '- })',
        '+ fetch("/api/confirm-order", {',
        '+   method: "POST",',
        '+   credentials: "include",',
        '+   body: JSON.stringify({ orderId })',
        '+ })',
        '```',
        '',
        '## Impact',
        '- 3 customers charged without orders (refunds issued)',
        '- Affects ~15% of traffic (iOS Safari)',
        '- No data loss — Stripe has all payment records',
      ].join('\n'),
      type: 'deliverable',
      taskId: bugTaskId,
      createdBy: 'developer',
    });

    // Friday hands back to Fury for customer comms
    await t.mutation(api.messages.create, {
      taskId: bugTaskId,
      fromAgentId: 'developer',
      content:
        'Hotfix deployed to production. @Fury root cause doc attached — ' +
        'can you reach out to the 3 affected customers? They need refunds for the duplicate charges. ' +
        'Orders user_4821, user_7293, user_1058.',
      attachmentIds: [fixDocId],
      mentions: ['customer-researcher'],
    });

    // Move to review for Jarvis signoff
    await t.mutation(api.tasks.update, {
      id: bugTaskId,
      status: 'review',
      agentId: 'developer',
    });

    // Fury confirms customer outreach
    await t.mutation(api.messages.create, {
      taskId: bugTaskId,
      fromAgentId: 'customer-researcher',
      content:
        'Refunds initiated for all 3. Sent personal apology emails with 20% discount code. ' +
        'Monitoring for new reports. @Jarvis ready to close if no regressions in 24h.',
      mentions: ['main'],
    });

    // ─── Verify final state ───────────────────────────────────

    // Task in review, urgent priority maintained
    const finalTask = (await t.query(api.tasks.getAll, {})).find(
      (t) => t._id === bugTaskId
    )!;
    expect(finalTask.status).toBe('review');
    expect(finalTask.priority).toBe('urgent');
    expect(finalTask.tags).toContain('p0');

    // Full conversation thread
    const messages = await t.query(api.messages.getByTask, { taskId: bugTaskId });
    expect(messages).toHaveLength(4);
    expect(messages[0].fromAgentId).toBe('customer-researcher'); // report
    expect(messages[1].fromAgentId).toBe('developer'); // investigation
    expect(messages[2].fromAgentId).toBe('developer'); // fix + handoff
    expect(messages[3].fromAgentId).toBe('customer-researcher'); // customer follow-up

    // Two documents: evidence + hotfix
    const docs = await t.query(api.documents.getByTask, { taskId: bugTaskId });
    expect(docs).toHaveLength(2);

    // Jarvis notified for final signoff
    const jarvisNotifs = await t.query(api.notifications.getUndelivered, {
      agentId: 'main',
    });
    expect(jarvisNotifs.some((n) => n.content.includes('@Jarvis'))).toBe(true);

    // All agents subscribed to the bug
    expect(finalTask.subscriberIds).toContain('developer');
    expect(finalTask.subscriberIds).toContain('customer-researcher');
  });
});
