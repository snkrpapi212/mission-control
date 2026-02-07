# Fury Heartbeat - Customer Voice Monitor

## Checklist

1. **Check for new tasks**
   ```bash
   cd /data/workspace/mission-control
   ./scripts/mc.sh tasks mine customer-researcher
   ```

2. **Update active analysis**
   - Any in-progress feedback synthesis? Post updates
   - Critical customer issues? Flag immediately

3. **Proactive monitoring**
   - Major user complaints surfacing? Create task
   - Positive feedback worth sharing? Log it

4. **Log activity** (if you did something)
   ```bash
   ./scripts/mc.sh activity log "Analyzed 30 support tickets" customer-researcher
   ```

If nothing needs attention: **HEARTBEAT_OK**
