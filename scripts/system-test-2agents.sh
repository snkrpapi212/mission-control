#!/usr/bin/env bash
set -euo pipefail

# Mission Control - Minimal end-to-end system test (2 agents)
#
# This validates the *real system* (Convex backend + data model) without needing to expose the UI.
# It runs mutations + queries and asserts expected state transitions.
#
# Prereqs:
# - `npx convex dev` is running for this repo (local deployment)
# - .env.local exists (created by convex dev)
#
# Usage:
#   cd /data/workspace/mission-control
#   ./scripts/system-test-2agents.sh

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "[FAIL] Missing required command: $1" >&2
    exit 1
  }
}

require_cmd node
require_cmd curl

if [[ ! -f .env.local ]]; then
  echo "[FAIL] .env.local not found. Run: npx convex dev (once)" >&2
  exit 1
fi

# Check Convex is reachable
if ! curl -fsS http://127.0.0.1:3210/ >/dev/null 2>&1; then
  echo "[FAIL] Convex not reachable on http://127.0.0.1:3210" >&2
  echo "       Start it with:" >&2
  echo "         mkdir -p .convex-tmp" >&2
  echo "         CONVEX_TMPDIR=$ROOT_DIR/.convex-tmp npx convex dev" >&2
  exit 1
fi

echo "[INFO] Convex is reachable. Running system test..."

json_get() {
  # Usage: json_get '<json>' 'js_expression_returning_value'
  local json="$1"
  local expr="$2"
  node -e "const fs=require('fs'); const j=JSON.parse(fs.readFileSync(0,'utf8')); const v=(${expr}); if (v===undefined) process.exit(2); process.stdout.write(String(v));" <<<"$json"
}

json_assert_contains() {
  # Usage: json_assert_contains '<json>' 'substring'
  local json="$1"
  local needle="$2"
  if ! node -e "const s=require('fs').readFileSync(0,'utf8'); process.exit(s.includes(process.argv[1])?0:1)" "$needle" <<<"$json"; then
    echo "[FAIL] Expected output to contain: $needle" >&2
    echo "--- output ---" >&2
    echo "$json" >&2
    echo "--------------" >&2
    exit 1
  fi
}

run_convex() {
  # Run convex and capture JSON output
  local fn="$1"
  local args="${2:-}"
  if [[ -n "$args" ]]; then
    npx convex run "$fn" "$args"
  else
    npx convex run "$fn"
  fi
}

# 1) Register 2 agents (idempotent)
echo "[STEP] Register agents (2)"
run_convex agents:register '{"agentId":"main","name":"Jarvis","role":"Squad Lead","level":"lead","emoji":"🤖","sessionKey":"agent:main:main"}' >/dev/null
run_convex agents:register '{"agentId":"product-analyst","name":"Shuri","role":"Product Analyst","level":"specialist","emoji":"🔍","sessionKey":"agent:product-analyst:main"}' >/dev/null

agents_json="$(run_convex agents:getAll)"
json_assert_contains "$agents_json" '"agentId": "main"'
json_assert_contains "$agents_json" '"agentId": "product-analyst"'

echo "[PASS] Agents present"

# 2) Create two tasks
echo "[STEP] Create tasks"
TASK_A_ID="$(run_convex tasks:create '{"title":"[E2E] Task A","description":"Owned by Jarvis","assigneeIds":["main"],"createdBy":"main","priority":"high","tags":["e2e"]}' | tr -d '"')"
TASK_B_ID="$(run_convex tasks:create '{"title":"[E2E] Task B","description":"Owned by Shuri","assigneeIds":["product-analyst"],"createdBy":"main","priority":"medium","tags":["e2e"]}' | tr -d '"')"

echo "[INFO] TASK_A_ID=$TASK_A_ID"
echo "[INFO] TASK_B_ID=$TASK_B_ID"

all_tasks_json="$(run_convex tasks:getAll)"
json_assert_contains "$all_tasks_json" "[E2E] Task A"
json_assert_contains "$all_tasks_json" "[E2E] Task B"

echo "[PASS] Tasks created"

# 3) Update status and verify activity logged
echo "[STEP] Update task status + verify activity"
run_convex tasks:update "{\"id\":\"$TASK_A_ID\",\"status\":\"in_progress\",\"agentId\":\"main\"}" >/dev/null

activities_json="$(run_convex activities:getRecent '{"limit":50}')"
json_assert_contains "$activities_json" '"type": "status_changed"'
json_assert_contains "$activities_json" "$TASK_A_ID"

echo "[PASS] Activity logged for status change"

# 4) Post a comment + verify message thread
echo "[STEP] Post comment + verify messages"
MSG_ID="$(run_convex messages:create "{\"taskId\":\"$TASK_A_ID\",\"fromAgentId\":\"main\",\"content\":\"[E2E] Starting work now\"}" | tr -d '"')"

msgs_json="$(run_convex messages:getByTask "{\"taskId\":\"$TASK_A_ID\"}")"
json_assert_contains "$msgs_json" "$MSG_ID"
json_assert_contains "$msgs_json" "[E2E] Starting work now"

echo "[PASS] Message created and retrievable"

# 5) Create a document + verify linked to task
echo "[STEP] Create document + verify documents"
DOC_ID="$(run_convex documents:create "{\"title\":\"[E2E] Spec\",\"content\":\"hello world\",\"type\":\"draft\",\"taskId\":\"$TASK_A_ID\",\"createdBy\":\"main\"}" | tr -d '"')"

docs_json="$(run_convex documents:getByTask "{\"taskId\":\"$TASK_A_ID\"}")"
json_assert_contains "$docs_json" "$DOC_ID"
json_assert_contains "$docs_json" "[E2E] Spec"

echo "[PASS] Document created and linked"

echo ""
echo "=============================="
echo "✅ MISSION CONTROL E2E TEST PASS"
echo "- agents: register/getAll"
echo "- tasks: create/getAll/update"
echo "- activities: getRecent"
echo "- messages: create/getByTask"
echo "- documents: create/getByTask"
echo "=============================="
