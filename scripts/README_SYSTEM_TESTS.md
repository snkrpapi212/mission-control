# Mission Control System Tests (No UI Exposure)

When Mission Control UI cannot be exposed (e.g., OpenClaw running on Railway without public ingress), you can still validate the *actual system* by driving Convex mutations/queries and asserting state.

## Minimal 2-agent E2E test

This test validates:
- agents register + list
- tasks create + list + status update
- activity logging
- messages create + query by task
- documents create + query by task

### Prereqs
Run Convex locally (keep it running):

```bash
cd /data/workspace/mission-control
mkdir -p .convex-tmp
CONVEX_TMPDIR=/data/workspace/mission-control/.convex-tmp npx convex dev
```

### Run the test

```bash
cd /data/workspace/mission-control
./scripts/system-test-2agents.sh
```

Expected output ends with:

```
✅ MISSION CONTROL E2E TEST PASS
```

## Notes
- The test creates a couple of tasks/documents/messages with `[E2E]` prefixes.
- It is idempotent for agent registration, but it does not delete old test data.
