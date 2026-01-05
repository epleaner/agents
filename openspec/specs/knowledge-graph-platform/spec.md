## ADDED Requirements

### Requirement: Unified Knowledge Graph
The OpenCode setup SHALL maintain a knowledge graph that ingests structured data from beads issues, OpenSpec changes, Slack discussions, Fathom meeting transcripts, Jira/Linear tickets, GitHub activity, and CI/CD events.

#### Scenario: Update knowledge graph from multiple sources
- **WHEN** any agent records new context (e.g., Planner adds clarifications, PM logs Jira status, Slack discussion mentions an action item)
- **THEN** the knowledge graph ingestion task normalizes the information with source, timestamp, entities, and references to beads/change IDs
- **AND** the graph becomes queryable by Orchestrator/Planner/PM agents to drive decisions, surface dependencies, and avoid duplicate work.

### Requirement: Graph Governance and Access
The knowledge graph SHALL expose read/write APIs or skills that enforce permissions (e.g., Builder read-only, PM write access) and keep historical revisions for audits.

#### Scenario: Query graph for context
- **WHEN** Planner or Builder needs to confirm earlier decisions
- **THEN** they query the graph (via skill or command) to retrieve linked beads, OpenSpec requirements, Slack summaries, and action items
- **AND** any updates they make are appended with provenance so PM can trace the reasoning chain.
