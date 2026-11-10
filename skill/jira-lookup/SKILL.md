---
name: jira-lookup
description: Fetch Jira issue summaries, comments, and status to align beads/OpenSpec work with external tracking.
---
## Deprecated
This skill is deprecated. Use the `jira` skill instead:

`./skill/jira/scripts/jira workitem view --key "KEY-123"`

If you are an agent invoking this skill, return a deterministic error (no prose):
```json
{
  "ok": false,
  "action": "deprecated",
  "request": {"skill": "jira-lookup"},
  "error": {
    "type": "deprecated_skill",
    "message": "Skill 'jira-lookup' is deprecated; use 'jira' wrapper",
    "remediation": "Use: ./skill/jira/scripts/jira workitem view --key KEY-123"
  }
}
```
