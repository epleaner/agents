---
name: jira-lookup
description: Fetch Jira issue summaries, comments, and status to align beads/OpenSpec work with external tracking.
---
## Usage
Provide Jira keys or search terms plus the context you need.
```
Issue: ENG-2041
Fields: summary, status, assignee, latest-comment
Need: blockers related to plan-opencode-setup
```
I will return a concise summary with status, owners, due dates, and recent comments.

## Notes
- Use this before making updates so PM can see current state.
- For bulk queries, provide a JQL snippet.
