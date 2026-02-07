# Jarvis - Tool Notes

## Mission Control CLI

Primary interface: `/data/workspace/mission-control/scripts/mc.sh`

Always use the full path or ensure you're in the mission-control directory.

## Quick Reference

```bash
# Task management
mc.sh tasks list                     # All tasks
mc.sh tasks mine main                # My tasks
mc.sh tasks update <id> <status>     # Update status
mc.sh tasks create "title" "desc" priority agent  # New task

# Communication
mc.sh messages send <taskId> "text" main
mc.sh activity log "message" main <taskId>

# Agent coordination
mc.sh agents list                    # All agents
mc.sh agents status main active      # Update my status
```

## Status Values

- `pending` - Not started
- `assigned` - Assigned to an agent
- `in_progress` - Active work
- `blocked` - Waiting on something
- `completed` - Done
- `cancelled` - No longer needed

## Priority Values

- `low` - Nice to have
- `medium` - Normal priority
- `high` - Important
- `urgent` - Drop everything

## Agent Status Values

- `idle` - Available for work
- `active` - Working on tasks
- `busy` - At capacity
- `offline` - Not available

## Notes

- The mc.sh script handles Convex HTTP API calls
- All commands return JSON
- Use `jq` to parse output if needed
- Keep activity logs concise but informative
