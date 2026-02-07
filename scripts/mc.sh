#!/bin/bash
# Mission Control CLI - Interface to Convex backend
# Usage: mc.sh <command> [args...]

CONVEX_URL="http://127.0.0.1:3210"

query() {
  curl -s "$CONVEX_URL/api/query" -X POST \
    -H 'Content-Type: application/json' \
    -d "{\"path\": \"$1\", \"args\": $2}" 2>/dev/null
}

mutation() {
  curl -s "$CONVEX_URL/api/mutation" -X POST \
    -H 'Content-Type: application/json' \
    -d "{\"path\": \"$1\", \"args\": $2}" 2>/dev/null
}

case "$1" in
  agents)
    query "agents:getAll" "{}" | python3 -m json.tool
    ;;
  
  agent-status)
    # mc.sh agent-status <agentId> <status>
    mutation "agents:updateStatus" "{\"agentId\": \"$2\", \"status\": \"$3\"}"
    ;;

  tasks)
    query "tasks:getAll" "{}" | python3 -m json.tool
    ;;

  tasks-status)
    # mc.sh tasks-status <status>
    query "tasks:getByStatus" "{\"status\": \"$2\"}" | python3 -m json.tool
    ;;

  my-tasks)
    # mc.sh my-tasks <agentId>
    query "tasks:getAssigned" "{\"agentId\": \"$2\"}" | python3 -m json.tool
    ;;

  create-task)
    # mc.sh create-task '<json>'
    mutation "tasks:create" "$2"
    ;;

  update-task)
    # mc.sh update-task '<json>'
    mutation "tasks:update" "$2"
    ;;

  messages)
    # mc.sh messages <taskId>
    query "messages:getByTask" "{\"taskId\": \"$2\"}" | python3 -m json.tool
    ;;

  send-message)
    # mc.sh send-message '<json>'
    mutation "messages:create" "$2"
    ;;

  create-doc)
    # mc.sh create-doc '<json>'
    mutation "documents:create" "$2"
    ;;

  docs-for-task)
    # mc.sh docs-for-task <taskId>
    query "documents:getByTask" "{\"taskId\": \"$2\"}" | python3 -m json.tool
    ;;

  notifications)
    # mc.sh notifications <agentId>
    query "notifications:getUndelivered" "{\"agentId\": \"$2\"}" | python3 -m json.tool
    ;;

  mark-delivered)
    # mc.sh mark-delivered <notificationId>
    mutation "notifications:markDelivered" "{\"id\": \"$2\"}"
    ;;

  activity)
    # mc.sh activity [limit]
    LIMIT=${2:-20}
    query "activities:getRecent" "{\"limit\": $LIMIT}" | python3 -m json.tool
    ;;

  *)
    echo "Mission Control CLI"
    echo ""
    echo "Commands:"
    echo "  agents                           - List all agents"
    echo "  agent-status <id> <status>       - Update agent status (idle|working|blocked)"
    echo "  tasks                            - List all tasks"
    echo "  tasks-status <status>            - Tasks by status"
    echo "  my-tasks <agentId>               - Tasks assigned to agent"
    echo "  create-task '<json>'             - Create a task"
    echo "  update-task '<json>'             - Update a task"
    echo "  messages <taskId>                - Get messages for a task"
    echo "  send-message '<json>'            - Send a message"
    echo "  create-doc '<json>'              - Create a document"
    echo "  docs-for-task <taskId>           - Docs for a task"
    echo "  notifications <agentId>          - Undelivered notifications"
    echo "  mark-delivered <notifId>         - Mark notification delivered"
    echo "  activity [limit]                 - Recent activity log"
    ;;
esac
