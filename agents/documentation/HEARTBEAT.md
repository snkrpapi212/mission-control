# Wong Heartbeat

## Checklist

1. **Check for new tasks**
   ```bash
   cd /data/workspace/mission-control
   ./scripts/mc.sh tasks mine documentation
   ```

2. **Update active documentation**
   - Any in-progress docs? Post status

3. **Doc maintenance**
   - Outdated docs flagged? Update them
   - Broken links? Fix them
   - New features deployed? Create docs

4. **Log activity** (if you did something)
   ```bash
   ./scripts/mc.sh activity log "Updated API documentation" documentation
   ```

If nothing needs attention: **HEARTBEAT_OK**
