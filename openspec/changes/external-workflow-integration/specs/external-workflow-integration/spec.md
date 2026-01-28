## ADDED Requirements

### Requirement: External Workflow Integration
The OpenCode setup SHALL integrate with Slack, Jira, Linear, Fathom, and GitHub so that daily updates, decisions, and my action items are captured automatically and reconciled with beads/OpenSpec records.

#### Scenario: Daily Slack EOD digest
- **WHEN** the PM agent runs the Slack EOD routine
- **THEN** it pulls all messages since the prior digest across designated channels, extracts action items/decisions, maps them to beads/change IDs, and posts a formatted summary referencing owners and due dates.

#### Scenario: Sync Jira/Linear status
- **WHEN** PM updates beads issue states or OpenSpec milestones
- **THEN** the integration updates linked Jira/Linear tickets (status, labels, comments) so external stakeholders see consistent information.

#### Scenario: Broadcast build/release outcomes
- **WHEN** QA or Release completes validation
- **THEN** the integration posts results to Slack (or other communication channels), attaches relevant GitHub PR/CI links, and references the governing beads/OpenSpec IDs so downstream conversations stay traceable.

### Requirement: My External Action Items
My action items that surface inside Slack EOD recaps, Fathom transcripts, QA/Release digests, or PM clarifications SHALL be normalized into todowrite/beads entries with owners, due dates, and change references.

#### Scenario: Capture my external action item
- **WHEN** the Slack EOD workflow or a Fathom transcript extractor identifies a task assigned to me
- **THEN** the integration creates or updates the todowrite/beads entry with the originating link, due date, owner (me), and governing beads/OpenSpec change IDs.

### Requirement: Personal Action Item Enforcement
The integrated workflow SHALL enforce completion of my action items by running the todo enforcer plus PM checks, escalating overdue tasks through Slack mentions/DMs, and updating beads labels to reflect status changes.

#### Scenario: Escalate overdue personal item
- **WHEN** my action item exceeds its due date without completion confirmation
- **THEN** the enforcement automation pings me in Slack and tags the owning beads issue with overdue metadata so scope can be renegotiated or reassigned.
