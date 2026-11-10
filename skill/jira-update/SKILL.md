---
name: jira-update
description: Synchronize beads/OpenSpec progress back to Jira issues (status, labels, comments).
---
## Deprecated
This skill is deprecated. Use the `jira` skill instead:

Examples:
```bash
./skill/jira/scripts/jira workitem comment create --key "KEY-123" --body "Update..." --yes
./skill/jira/scripts/jira workitem transition --key "KEY-123" --status "In Review" --yes
./skill/jira/scripts/jira workitem edit --key "KEY-123" --summary "New" --yes
```

If you are an agent invoking this skill, return a deterministic error (no prose):
```json
{
  "ok": false,
  "action": "deprecated",
  "request": {"skill": "jira-update"},
  "error": {
    "type": "deprecated_skill",
    "message": "Skill 'jira-update' is deprecated; use 'jira' wrapper",
    "remediation": "Use: ./skill/jira/scripts/jira workitem transition|edit|comment ... --yes"
  }
}
```
