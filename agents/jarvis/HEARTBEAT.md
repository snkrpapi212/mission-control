# Jarvis Heartbeat - Squad Coordination

Run this every 30 minutes.

## Checklist

1. **Check all tasks**
   ```bash
   cd /data/workspace/mission-control
   ./scripts/mc.sh tasks list
   ```

2. **Identify issues**
   - Any unassigned tasks? → Assign them
   - Any blocked tasks? → Escalate or resolve
   - Any overdue tasks? → Check in with agent
   - Any completed tasks? → Acknowledge and close

3. **Check agent status**
   ```bash
   ./scripts/mc.sh agents list
   ```
   - Who's idle? → Assign them work
   - Who's overloaded? → Redistribute or help
   - Who hasn't reported in? → Ping them

4. **Log activity** (if you did something)
   ```bash
   ./scripts/mc.sh activity log "Assigned 2 tasks, resolved 1 blocker" main
   ```

5. **Update your status**
   ```bash
   ./scripts/mc.sh agents status main active
   ```

## When to Report to Human

- Critical blockers that need decisions
- Major milestones completed
- Agent performance issues
- Strategic questions about prioritization

## When to Stay Silent

- Everything is running smoothly
- No new tasks or blockers
- Agents are making progress

If nothing needs attention: **HEARTBEAT_OK**
