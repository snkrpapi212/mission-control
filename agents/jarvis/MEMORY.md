# Jarvis Memory

## User Preferences
- **NEVER mention NOFX** in Mission Control context. NOFX is a separate project — do not reference it in commits, code, configs, or conversations about Mission Control.
- Focus is **Mission Control and its agents only** unless explicitly told otherwise.
- Always run `npm run lint` and `npm run build` before any git push.
- **ALWAYS TEST locally before committing/pushing.** Do not add features and push without verifying they work.
- User wants to see **real work output**, not just status updates.
- Primary memory source: QMD (not yet found/configured), fallback to this MEMORY.md

## System Architecture (as of 2026-02-07, 19:07 UTC)
- **Agent Dispatcher cron** (every 2 min): Polls for `assigned` tasks, spawns agents to work on them.
  - ID: 5de08fb1-579d-47c7-a05e-939bed19e260
  - Runs continuously, finding no new tasks (board at 13/13 done)
- **Agent Reviewer cron** (every 2 min): Inspects deliverables from `review` tasks, approves or rejects.
  - ID: 38c669c4-cd8a-41c4-aa7f-1dc1e95d4e2d
  - Runs continuously, no tasks in review queue
- **Full autonomous loop proven working:**
  - Task created as `assigned` → Dispatcher picks up → Agent spawns and works → Status moves to `review` → Reviewer inspects and approves → Status moves to `done`
  - Tested with: "Write a Python health check script" (17:39-17:45 UTC, Friday approved by Reviewer)
- Agent outputs stored in: `/data/workspace/mission-control/outputs/<agent-name>/`
- REST API: `/api/tasks`, `/api/agents`, `/api/activities`, `/api/tasks/[taskId]` (all working)
- Convex backend: `https://tidy-salamander-925.eu-west-1.convex.cloud`
- Railway app: `mission-control-production-05fb.up.railway.app`
- GitHub: `snkrpapi212/mission-control` (commit ca8a205, no NOFX references)

## Task Workflow (Verified End-to-End)
1. **Create task** → set status to `assigned`
2. **Dispatcher cron** (every 2 min) finds `assigned` tasks
3. **Dispatcher spawns agent** via `sessions_spawn` with clear instructions
4. **Agent executes work** (code, analysis, design, etc.) and produces deliverable file
5. **Agent updates task** status to `review` via REST API PATCH
6. **Reviewer cron** (every 2 min) finds `review` tasks
7. **Reviewer inspects** the deliverable file in `/data/workspace/mission-control/outputs/<agent>/<filename>`
8. **Reviewer approves or rejects:**
   - ✅ APPROVE: Move to `done`, announce approval
   - ❌ REJECT: Move back to `assigned`, create FEEDBACK.md
9. **Task complete** or retry with feedback

## Current Board Status (19:07 UTC)
- **Total tasks:** 13
- **All tasks:** `done` (100% completion)
- **Dispatcher status:** Idle (no `assigned` tasks)
- **Reviewer status:** Idle (no `review` tasks)
- **System status:** Fully operational, waiting for new work

## Completed Tasks (All Done)
1. Design new product landing page (designer)
2. Analyze competitor pricing (product-analyst)
3. Write API documentation (documentation)
4. Customer interview synthesis (customer-researcher)
5. Q1 content calendar (content-writer)
6. Social media engagement analysis (social-media)
7. Fix critical authentication bug (developer)
8. E2E Test: Verify system (developer)
9. test (placeholder)
10. Email campaign strategy for Q1 (email-marketing)
11. SEO optimization audit (seo-analyst)
12. Debug Test: Write Hello World (developer)
13. **Write a Python health check script (developer)** — FULLY AUTONOMOUS (created 17:39, approved 17:45)

## Key Decisions
- Agents are spawned via `sessions_spawn` by the dispatcher, not manually
- Tasks go through full lifecycle: assigned → in_progress → review → done
- Rejected tasks go back to `assigned` with feedback file
- Database files (*.db) excluded from git
- No audit trail yet in task model (would need timestamps: assignedAt, startedAt, completedAt, reviewedAt, reviewedBy)

## Failed Attempts & Lessons (2026-02-07 19:12 UTC)
- **Commits c86300d + 4d4124c:** Added clearAll() mutation and DELETE /api/tasks endpoint
- **Problem:** Mutation not deployed to Convex; DELETE returns 500 errors
- **Lesson:** Never commit untested features. Always test locally first with curl/manual testing
- **Action needed:** Either:
  1. Deploy Convex functions properly (convex deploy)
  2. Or use simpler workaround (just create fresh tasks, ignore old ones in "done" status)

## Local Convex Setup (2026-02-07 20:47 UTC)
- **Switched to local Convex** for testing: `http://127.0.0.1:3210`
- **Start command:** `cd /data/workspace/mission-control && CONVEX_DEPLOYMENT=anonymous:anonymous-mission-control npx convex dev --tail-logs disable`
- **Local dashboard:** `http://127.0.0.1:6790/?d=anonymous-mission-control`
- **.env.local** updated to point to local: `NEXT_PUBLIC_CONVEX_URL=http://127.0.0.1:3210`
- **All CRUD operations work** including clearAll/DELETE
- **Full autonomous loop verified:** create → dispatcher → agent works → review → approved → done
- **Next.js dev server:** `PORT=3000 NEXT_PUBLIC_CONVEX_URL=http://127.0.0.1:3210 npm run dev`
- **Cloud prod** still at `tidy-salamander-925` (deploy key expired, needs refresh from dashboard)
