## ADDED Requirements

### Requirement: External Workflow Integration
The OpenCode setup SHALL integrate with Slack, Jira, Linear, Fathom, and GitHub so that daily updates, decisions, and action items are captured automatically and reconciled with beads/OpenSpec/knowledge-graph records.

#### Scenario: Daily Slack EOD digest
- **WHEN** the PM agent runs the Slack EOD routine
- **THEN** it pulls all messages since the prior digest across designated channels, extracts action items/decisions, maps them to beads/change IDs, updates the knowledge graph, and posts a formatted summary referencing owners and due dates.

#### Scenario: Sync Jira/Linear status
- **WHEN** PM updates beads issue states or OpenSpec milestones
- **THEN** the integration updates linked Jira/Linear tickets (status, labels, comments) so external stakeholders see consistent information
- **AND** the knowledge graph records the change for later queries.

#### Scenario: Broadcast build/release outcomes
- **WHEN** QA or Release completes validation
- **THEN** the integration posts results to Slack (or other communication channels), attaches relevant GitHub PR/CI links, and references the governing beads/OpenSpec IDs so downstream conversations stay traceable.
