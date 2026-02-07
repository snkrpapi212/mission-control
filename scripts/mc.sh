#!/bin/bash
# Mission Control CLI - Convex API wrapper for agents
# Usage: ./mc.sh <command> <subcommand> [args...]

set -e

# Configuration
CONVEX_URL="${CONVEX_URL:-https://tidy-salamander-925.eu-west-1.convex.cloud}"
CONVEX_API="${CONVEX_URL}/api/run"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper function to call Convex functions
convex_call() {
    local func_path="$1"
    local args="$2"
    
    # Wrap args in the expected format for Convex HTTP API
    local payload="{\"args\": ${args}}"
    
    local response=$(curl -s -X POST "${CONVEX_API}/${func_path}" \
        -H "Content-Type: application/json" \
        -d "${payload}")
    
    # Pretty print JSON if jq is available, otherwise raw output
    if command -v jq &> /dev/null; then
        echo "$response" | jq '.'
    else
        echo "$response"
    fi
}

# Usage help
usage() {
    cat << EOF
Mission Control CLI - Agent interface to Convex backend

Usage:
    ./mc.sh <command> <subcommand> [args...]

Commands:

    tasks list                                    List all tasks
    tasks mine <agentId>                          Get tasks assigned to agent
    tasks create <title> <desc> <priority> <createdBy> [assigneeIds...]
    tasks update <taskId> <agentId> [--status <s>] [--priority <p>] [--assignees <id,id>]
    
    messages list <taskId>                        List messages for task
    messages send <taskId> <text> <agentId>       Send message on task
    
    activity log <type> <agentId> <message> [taskId]   Log activity
    activity list [limit]                         List recent activity
    
    agents list                                   List all agents
    agents get <agentId>                          Get specific agent
    agents status <agentId> <status>              Update agent status

Environment:
    CONVEX_URL    Convex deployment URL (default: ${CONVEX_URL})

Examples:
    ./mc.sh tasks mine main
    ./mc.sh tasks create "Fix bug" "Description" high main
    ./mc.sh tasks update taskId123 main --status in_progress
    ./mc.sh messages send taskId123 "Working on it" main
    ./mc.sh activity log status_update main "Completed research" taskId123
    ./mc.sh agents status main working

EOF
}

# Main command router
case "$1" in
    tasks)
        case "$2" in
            list)
                convex_call "tasks/getAll" '{}'
                ;;
            mine)
                if [ -z "$3" ]; then
                    echo -e "${RED}Error: agentId required${NC}" >&2
                    echo "Usage: ./mc.sh tasks mine <agentId>" >&2
                    exit 1
                fi
                convex_call "tasks/getAssigned" "{\"agentId\": \"$3\"}"
                ;;
            create)
                if [ -z "$3" ] || [ -z "$4" ] || [ -z "$5" ] || [ -z "$6" ]; then
                    echo -e "${RED}Error: title, description, priority, and createdBy required${NC}" >&2
                    echo "Usage: ./mc.sh tasks create <title> <desc> <priority> <createdBy> [assigneeIds...]" >&2
                    exit 1
                fi
                # Collect assignee IDs
                ASSIGNEES="[]"
                if [ -n "$7" ]; then
                    shift 6
                    ASSIGNEES="["
                    for id in "$@"; do
                        ASSIGNEES="${ASSIGNEES}\"${id}\","
                    done
                    ASSIGNEES="${ASSIGNEES%,}]"
                fi
                ARGS="{\"title\": \"$3\", \"description\": \"$4\", \"priority\": \"$5\", \"createdBy\": \"$6\", \"assigneeIds\": ${ASSIGNEES}, \"tags\": []}"
                convex_call "tasks/create" "$ARGS"
                ;;
            update)
                if [ -z "$3" ] || [ -z "$4" ]; then
                    echo -e "${RED}Error: taskId and agentId required${NC}" >&2
                    echo "Usage: ./mc.sh tasks update <taskId> <agentId> [--status <s>] [--priority <p>] [--assignees <id,id>]" >&2
                    exit 1
                fi
                TASK_ID="$3"
                AGENT_ID="$4"
                shift 4
                
                # Build args from flags
                ARGS="{\"id\": \"$TASK_ID\", \"agentId\": \"$AGENT_ID\""
                while [ $# -gt 0 ]; do
                    case "$1" in
                        --status)
                            ARGS="${ARGS}, \"status\": \"$2\""
                            shift 2
                            ;;
                        --priority)
                            ARGS="${ARGS}, \"priority\": \"$2\""
                            shift 2
                            ;;
                        --assignees)
                            # Convert comma-separated to array
                            IFS=',' read -ra ADDR <<< "$2"
                            ASSIGNEE_ARR="["
                            for i in "${ADDR[@]}"; do
                                ASSIGNEE_ARR="${ASSIGNEE_ARR}\"${i}\","
                            done
                            ASSIGNEE_ARR="${ASSIGNEE_ARR%,}]"
                            ARGS="${ARGS}, \"assigneeIds\": ${ASSIGNEE_ARR}"
                            shift 2
                            ;;
                        *)
                            echo -e "${YELLOW}Warning: Unknown flag $1${NC}" >&2
                            shift
                            ;;
                    esac
                done
                ARGS="${ARGS}}"
                convex_call "tasks/update" "$ARGS"
                ;;
            *)
                echo -e "${RED}Unknown tasks subcommand: $2${NC}" >&2
                usage
                exit 1
                ;;
        esac
        ;;
    
    messages)
        case "$2" in
            list)
                if [ -z "$3" ]; then
                    echo -e "${RED}Error: taskId required${NC}" >&2
                    exit 1
                fi
                convex_call "messages/getByTask" "{\"taskId\": \"$3\"}"
                ;;
            send)
                if [ -z "$3" ] || [ -z "$4" ] || [ -z "$5" ]; then
                    echo -e "${RED}Error: taskId, text, and agentId required${NC}" >&2
                    echo "Usage: ./mc.sh messages send <taskId> <text> <agentId>" >&2
                    exit 1
                fi
                convex_call "messages/create" "{\"taskId\": \"$3\", \"content\": \"$4\", \"fromAgentId\": \"$5\"}"
                ;;
            *)
                echo -e "${RED}Unknown messages subcommand: $2${NC}" >&2
                usage
                exit 1
                ;;
        esac
        ;;
    
    activity)
        case "$2" in
            log)
                if [ -z "$3" ] || [ -z "$4" ] || [ -z "$5" ]; then
                    echo -e "${RED}Error: type, agentId, and message required${NC}" >&2
                    echo "Usage: ./mc.sh activity log <type> <agentId> <message> [taskId]" >&2
                    exit 1
                fi
                ARGS="{\"type\": \"$3\", \"agentId\": \"$4\", \"message\": \"$5\""
                if [ -n "$6" ]; then
                    ARGS="${ARGS}, \"taskId\": \"$6\""
                fi
                ARGS="${ARGS}}"
                convex_call "activities/log" "$ARGS"
                ;;
            list)
                LIMIT="${3:-50}"
                convex_call "activities/getRecent" "{\"limit\": $LIMIT}"
                ;;
            *)
                echo -e "${RED}Unknown activity subcommand: $2${NC}" >&2
                usage
                exit 1
                ;;
        esac
        ;;
    
    agents)
        case "$2" in
            list)
                convex_call "agents/getAll" '{}'
                ;;
            get)
                if [ -z "$3" ]; then
                    echo -e "${RED}Error: agentId required${NC}" >&2
                    exit 1
                fi
                convex_call "agents/getById" "{\"agentId\": \"$3\"}"
                ;;
            status)
                if [ -z "$3" ] || [ -z "$4" ]; then
                    echo -e "${RED}Error: agentId and status required${NC}" >&2
                    echo "Usage: ./mc.sh agents status <agentId> <status>" >&2
                    echo "Status must be: idle, working, or blocked" >&2
                    exit 1
                fi
                convex_call "agents/updateStatus" "{\"agentId\": \"$3\", \"status\": \"$4\"}"
                ;;
            *)
                echo -e "${RED}Unknown agents subcommand: $2${NC}" >&2
                usage
                exit 1
                ;;
        esac
        ;;
    
    help|--help|-h|"")
        usage
        ;;
    
    *)
        echo -e "${RED}Unknown command: $1${NC}" >&2
        usage
        exit 1
        ;;
esac
