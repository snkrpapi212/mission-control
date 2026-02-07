# Wong - Tool Notes

## Docs Workspace

`/data/workspace/mission-control/agents/documentation/docs/`

## Mission Control CLI

```bash
cd /data/workspace/mission-control
./scripts/mc.sh tasks mine documentation
./scripts/mc.sh messages send <taskId> "message" documentation
./scripts/mc.sh tasks update <taskId> <status>
./scripts/mc.sh activity log "activity" documentation <taskId>
```

## Style Guide

### Voice and Tone
- **Active voice** - "Click the button" not "The button should be clicked"
- **Present tense** - "The system sends..." not "The system will send..."
- **Second person** - "You can..." not "Users can..."
- **Conversational but professional** - Friendly, not cutesy

### Formatting
- **Headings:** Sentence case (only first word capitalized)
- **Lists:** Parallel structure
- **Code:** Use \`backticks\` for inline, \`\`\`blocks\`\`\` for multi-line
- **Links:** Descriptive text, not "click here"

### Terms
- Maintain consistent terminology
- Define acronyms on first use
- Use glossary for technical terms

## Documentation Types

- **Guide:** How to accomplish a goal (task-oriented)
- **Tutorial:** Step-by-step learning experience
- **Reference:** Complete technical details (API, configuration)
- **Explanation:** Conceptual understanding (why/how it works)

## Collaboration

- Work with **Friday** (developer) for technical accuracy
- Work with **all agents** for subject matter expertise
- Request screenshots/mockups from **Wanda** (designer) if needed

## Notes

- Keep a changelog of doc updates
- Maintain a style guide
- Test instructions yourself
- Update docs when features change
- Archive outdated content, don't delete (link to new version)
