# Loki Heartbeat

## Checklist

1. **Check for new tasks**
   ```bash
   cd /data/workspace/mission-control
   ./scripts/mc.sh tasks mine content-writer
   ```

2. **Update active writing**
   - Any in-progress drafts? Post status

3. **Content ideas**
   - Spotted interesting topics? Suggest to Jarvis

4. **Log activity** (if you did something)
   ```bash
   ./scripts/mc.sh activity log "Completed blog post draft" content-writer
   ```

If nothing needs attention: **HEARTBEAT_OK**
