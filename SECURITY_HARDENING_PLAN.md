# Security Hardening Sprint Plan (Mission Control)

## Phase 0 — Audit Baseline (Done)
- Code audit for auth, authorization, destructive operations, and data integrity.
- Dependency audit (`npm audit --omit=dev`) clean.
- Findings: no backend auth checks, open dashboard route, destructive mutations exposed, message thread inconsistency.

## Phase 1 — Immediate Containment (In Progress)
### Goals
Ship fast protections without architecture rewrite.

### Tasks
1. Add app login gate for `/dashboard`.
2. Add server-side login/logout endpoints.
3. Protect destructive `clearAll` mutations with admin key + explicit confirmation token.
4. Fix deterministic task message ordering.

### Status
- [x] Middleware route gate for `/dashboard` using secure cookie token.
- [x] `/login` page and `/api/auth/login|logout` endpoints.
- [x] `tasks.clearAll` and `activities.clearAll` now require `adminKey` + confirmation literal.
- [x] `messages.getByTask` now sorted by `createdAt` ascending.

## Phase 2 — Convex Authorization Model
### Goals
Move from perimeter auth to function-level auth.

### Tasks
1. Integrate Convex auth identity checks in all mutating functions.
2. Enforce role-based authorization (`admin`, `lead`, `agent`, `viewer`).
3. Stop trusting client-provided actor IDs (`agentId`, `createdBy`); derive from identity/session mapping.
4. Add tests for unauthorized read/write attempts.

## Phase 3 — Session Hardening + UX
### Goals
Production-grade authentication behavior.

### Tasks
1. Replace static session token model with signed session/JWT or provider auth (Clerk/Auth.js).
2. Add logout control in app shell.
3. Add failed-login throttling / lockout.
4. Secure cookie flags review for non-production HTTP environments.

## Phase 4 — Security Operations
### Goals
Make security sustainable.

### Tasks
1. Add SECURITY.md and runbook for incident response.
2. Add CI checks for dangerous exports and auth guard coverage.
3. Add periodic security review checklist and penetration smoke tests.
4. Optional: add audit log table for sensitive operations.

## Required Environment Variables
- `MC_LOGIN_PASSWORD`
- `MC_SESSION_TOKEN`
- `MC_ADMIN_KEY`

Without these set, auth/deletion protections are intentionally restrictive.
