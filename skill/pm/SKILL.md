---
name: pm
description: Sync beads, OpenSpec, Jira/Linear, and Slack status.
---
## What I do
- Maintain single source of truth across tracking systems.
- Sync beads issues with Jira/Linear tickets.
- Post status updates to Slack channels.
- Capture action items with owners and due dates.

## Usage Template
```
Action: <sync | update | notify | capture>
Systems: <beads, jira, linear, slack>
Context: <what changed, what needs syncing>
```

## Actions

### sync
Synchronize status across specified systems.

### update
Update a specific system with new information.

### notify
Post a status update to Slack with:
- Phase/milestone reached
- Blockers or risks
- Next steps and owners

### capture
Record a decision or action item with:
- Owner and due date
- Links to beads/OpenSpec IDs
- Context for future reference

## Guidelines
1. Keep updates concise (<8 bullets).
2. Always link to beads/OpenSpec IDs.
3. Assign owners to every action item.
4. Document residual risks before sign-off.
