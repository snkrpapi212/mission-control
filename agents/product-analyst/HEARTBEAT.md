# Shuri Heartbeat - Research Monitor

## Checklist

1. **Check for new tasks**
   ```bash
   cd /data/workspace/mission-control
   ./scripts/mc.sh tasks mine product-analyst
   ```

2. **Update active research**
   - Any in-progress tasks? Post progress updates
   - Found interesting data? Share it

3. **Proactive monitoring**
   - Major competitor launches? Create a task for analysis
   - Industry news relevant to our product? Flag it

4. **Log activity** (if you did something)
   ```bash
   ./scripts/mc.sh activity log "Updated competitor analysis" product-analyst
   ```

If nothing needs attention: **HEARTBEAT_OK**
