## ADDED Requirements

### Requirement: Unified Knowledge Graph Schema
The OpenCode platform SHALL represent beads issues, OpenSpec changes, Slack discussions, Fathom notes, Jira/Linear tickets, GitHub events, and CI/CD runs as typed nodes and SHALL link them via edges that record causal, dependency, and ownership relationships so agents can traverse connected context.

#### Scenario: Link related context across sources
- **WHEN** ingestion receives an event that references an existing bead, change ID, or action item
- **THEN** the knowledge graph creates or updates nodes for each artifact and adds edges capturing the reference direction and rationale
- **AND** the graph remains queryable so Planner, Builder, and PM agents can traverse the linked nodes in a single request.

### Requirement: Node Provenance and Freshness
The knowledge graph SHALL attach provenance metadata (source system, ingestion timestamp, triggering agent) to every node and SHALL track whether each source link is active or stale based on its configured freshness window.

#### Scenario: Flag stale sources
- **WHEN** a source connection has not produced an update within its configured freshness window
- **THEN** the node metadata marks that source reference as stale and records the last known update
- **AND** the graph exposes this status so agents know whether additional verification is required before acting.

### Requirement: Queryable Interfaces with Audit Trail
The platform SHALL provide skill or API interfaces that let agents run structured queries (entity lookup, neighborhood traversal, timeline replay) and SHALL return results with provenance metadata and revision history so updates have a clear paper trail.

#### Scenario: Trace decision history
- **WHEN** an agent queries the graph for a decision or action item
- **THEN** the response includes the linked nodes, their chronological updates, and the sources or agents responsible
- **AND** any new notes appended through the interface automatically create a new revision entry referencing the underlying source.

### Requirement: Graph Governance and Access
The knowledge graph SHALL enforce role-based permissions (e.g., Planner write, Builder read) on ingestion and query interfaces and SHALL retain an immutable audit log of changes.

#### Scenario: Append update with provenance
- **WHEN** an authorized agent writes context into the graph
- **THEN** the system verifies their role, captures the reason for the change, and appends a revision linked to the originating source or annotation
- **AND** the audit trail remains queryable so PMs can explain how and why the node evolved.
