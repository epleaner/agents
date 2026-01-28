---
name: jira-update
description: Synchronize beads/OpenSpec progress back to Jira issues (status, labels, comments).
---
## Usage Template
```
Issue: ENG-2041
Update:
  Status: In Progress → In Review
  Labels: add codex-agents
  Comment: "Linked beads agents-zr8 (OpenCode setup). Planner complete; Builder in progress."
Links: PR #12, beads agents-zr8, change plan-opencode-setup
```
I apply the updates and echo the result.

## Notes
- Use after verifying Planner/Builder/QA status to avoid stale data.
