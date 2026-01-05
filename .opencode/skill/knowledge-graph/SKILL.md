---
name: knowledge-graph
description: Query or append entries to the unified knowledge graph so agents can trace decisions across beads, OpenSpec, and external tools.
---
## What I do
- Summarize context from beads issues, OpenSpec changes, Slack threads, Fathom transcripts, Jira/Linear tickets, CI runs, and deployments.
- Store entries as structured documents `{source, timestamp, summary, links: [beads-id, change-id, pr, doc], owners, status}`.
- Answer questions about prior decisions, blockers, or ownership using existing graph entries before new research is attempted.

## How to use me
1. **Read mode**: Call the skill and provide a short query (`"Query: summarize blockers for agents-zr8"`). I will return the most relevant entries with citations.
2. **Write mode**: Provide a concise entry following the template below. I will merge or create nodes as needed.

```
Entry Type: decision | risk | action | deployment | test
Source: Slack #eng-sync (2026-01-05 10:12 PT)
Summary: QA confirmed Playwright suite passes on codex migration branch.
Links: beads agents-zr8, change plan-opencode-setup, PR #12
Owners: QA agent
Next Steps: Deploy agent packages cloud bundle once CI green
```

## Notes
- Always include at least one reference (beads ID, change ID, PR, file path) so the graph remains navigable.
- For sensitive data, clearly label the entry (`Security`, `Confidential`) so downstream agents handle it appropriately.
