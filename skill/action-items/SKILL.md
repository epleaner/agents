---
name: action-items
description: Maintain the shared action item ledger that mirrors todowrite, beads issues, Slack/Fathom tasks, and Jira/Linear follow-ups.
---
## What I do
- Create, update, and close action items with `{title, owner, due, source, beads-id, change-id}` metadata.
- Sync entries back to todowrite (session todos) and beads comments, ensuring nothing is dropped when agents hand off work.
- Generate escalation warnings for overdue or blocked tasks.

## Usage
1. **Create/update**: Provide the fields below. Missing values will be inferred but try to be explicit.
```
Action: create | update | close
Title: Update QA harness for Playwright
Owner: QA agent (or @username)
Due: 2026-01-06
Status: in_progress
Source: Slack EOD 2026-01-05
Links: beads agents-zr8, change plan-opencode-setup
Notes: Waiting for Builder to finish codex config
```
2. **Query**: Supply filters such as owner, due-before date, or beads ID to pull outstanding items.

## Guidance
- If closing an item, summarize the evidence (test log, PR link) and note any follow-up work.
- Escalations: set `Status: escalate` and include the reason; PM will notify stakeholders via Slack.
