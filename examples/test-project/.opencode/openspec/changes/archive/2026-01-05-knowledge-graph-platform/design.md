# Knowledge Graph Platform – Design

## 1. Context
- The Meta-Agent mandate requires a single source for cross-agent knowledge so Planner/Builder/PM/Orchestrator can reference the same decisions, blockers, and dependencies without combing through Slack, beads, or OpenSpec manually.
- Existing instructions scatter provenance across beads issues, OpenSpec proposals, Slack threads, and meeting notes, making it difficult to confirm whether context is current or stale.
- This change formalizes a dedicated knowledge graph capability so ingestion, schema, governance, and querying evolve independently from other OpenCode workflows.

## 2. Goals and Non-Goals
### Goals
1. Model domain-significant artifacts (beads, OpenSpec changes, Slack summaries, Fathom notes, Jira/Linear items, GitHub/CI events) as typed nodes with explicit relationships.
2. Preserve provenance (source, timestamp, actor, change references) plus freshness/relevance metadata so agents can trust whether a node is current.
3. Offer ingestion pipelines and skills that normalize events, deduplicate IDs, and filter noise while maintaining an audit trail for every mutation.
4. Provide query interfaces (skill/API) that return neighborhood traversals, timelines, and provenance details in one call.

### Non-Goals
- Building a general-purpose data warehouse; scope stays limited to agent-facing context and audit trails.
- Replicating every low-level commit or Slack message; only domain-relevant changes belong in the graph.
- Designing UI dashboards; focus is on machine-consumable interfaces for agents.

## 3. Architecture Overview
```
[Sources] -> [Ingestion Pipelines] -> [Graph Storage + Schema Enforcement]
                                 -> [Audit/Provenance Ledger]
                Query Skill/API <- [Graph Access Layer w/ RBAC & Freshness Service]
```
- **Sources**: beads CLI, OpenSpec changes, Slack/Fathom exports, Jira/Linear, GitHub, CI/CD.
- **Ingestion Pipelines**: per-source workers normalize payloads, compute relevance, and write to storage via the Graph Access layer.
- **Topic Aggregation Layer**: batches artifact-level changes, detects shared domain topics/decisions, and creates/updates higher-order nodes with links back to supporting evidence.
- **Graph Storage**: Postgres with JSONB tables for node/edge payloads plus adjacency/relationship tables (pgRouting-style) to enforce schema and enable traversal without introducing an external graph engine.
- **Freshness/Relevance Service**: tracks last-update timestamps per source and marks nodes stale when windows expire.
- **Query Skill/API**: handles agent requests (entity lookup, connected-context fetch, topic summaries, timeline replay) and returns results with provenance + audit entries.
- **Audit Ledger**: append-only log mapping node revisions to sources, agents, and reasons.

## 4. Data Model
### Node Types (examples)
- **Artifact nodes**: `bead_issue`, `openspec_change`, `slack_summary`, `fathom_note`, `jira_ticket`, `linear_issue`, `github_event`, `cicd_run`.
- **Domain nodes**: `domain_topic`, `decision_record`, `action_item`, `dependency_cluster`, `risk_item`.

### Required Node Fields
- `node_id` (stable; includes source prefix)
- `node_type`
- `title/summary`
- `domain_context_tags` (decision, blocker, dependency, action-item, learning)
- `provenance`: `{source_system, source_uri, ingestion_time, triggering_agent}`
- `freshness`: `{last_update_at, freshness_window, status (active|stale)}`
- `relevance`: `{is_domain_relevant, rationale}`
- `audit_ref`: pointer to revision history entries

### Edge Types
- Artifact ↔ artifact: `depends_on`, `blocks`, `derived_from`, `mentions`, `owned_by`, `resolves`, `supersedes`
- Artifact ↔ domain node: `supports`, `evidence_for`, `contradicts`, `refines`
- Domain ↔ domain: `relates_to`, `supersedes`, `duplicates`
- Each edge stores `created_at`, `created_by`, optional `confidence`, and `source_event_id`.

## 5. Ingestion Pipelines
1. **Connector** per source fetches events via webhook, API poll, or log scrape.
2. **Normalizer** maps payload to canonical node/edge schema, looks up existing IDs, merges duplicates.
3. **Relevance Filter** evaluates whether the event materially changes domain context; otherwise store as lightweight revision or discard.
4. **Topic Aggregator** groups relevant artifacts under shared topics/decisions (based on tags, embeddings, or explicit references) and emits domain-node mutations.
5. **Freshness Updater** adjusts node freshness and stale flags.
6. **Write Adapter** enforces RBAC, appends audit entries, and persists to graph storage.
7. **Error Handling**: retry queue with alerting to Meta-Agent if ingestion fails repeatedly; partial failures logged with references to the offending source event.

## 6. Governance and Audit
- **RBAC**: Planner/PM/Meta-Agent = read/write, Builder/Researcher = read, automated pipelines = scoped write tokens.
- **Audit Trail**: every write stores `{node_id, revision_id, actor, source_event_id, reason, timestamp}` in append-only ledger; graph nodes keep pointer to latest revision.
- **Freshness Policy**: configurable window per source (e.g., Slack summaries 24h, Jira tickets 48h). Scheduler marks stale nodes and triggers action-item reminders if critical context is outdated.
- **Relevance Policy**: YAML or table describing inclusion criteria per node type; ingestion must cite which rule justified inclusion or exclusion.

## 7. Query Interfaces
- **Skill Contract**
  - Inputs: `{entity_id|search_terms, depth, time_window, include_audit (bool)}`
  - Outputs: `{nodes[], edges[], provenance[], freshness_status, audit_log[]}`
- **Supported Patterns**
  1. Entity lookup by ID (artifact or domain topic).
  2. Neighborhood traversal (N hops) to surface related blockers/dependencies.
  3. Topic summary query that returns the domain node plus supporting/contradicting artifact evidence.
  4. Timeline replay showing revisions and source evidence for a decision/action item.
  5. Freshness report listing stale nodes by capability or owner.
- **Write Interface**
  - Accepts structured payload with node/edge changes, requires `change_reason` and `source_reference` fields, enforces RBAC, and logs audit revision automatically.

## 8. Testing Strategy
1. **Schema Validation**: unit tests ensuring required fields exist per node type and edges only connect allowed combinations.
2. **Ingestion Simulations**: replay historical sessions (Slack thread + beads issue + OpenSpec change) and verify resulting graph matches expectations, deduplicates IDs, and attaches artifacts to the correct topic nodes.
3. **Topic Aggregation Tests**: synthetic scenarios that confirm multiple artifacts roll up under a shared domain node with accurate "supports/contradicts" edges and provenance.
4. **Relevance Filter Tests**: feed mixed events (important decision vs routine commit) to confirm non-domain noise is excluded.
5. **Freshness + Stale Alerts**: mock delayed updates and ensure stale status flips plus appropriate alerts/task creation.
6. **Query Contract Tests**: integration tests hitting skill/API to confirm traversal depth, topic summary queries, timeline replay, and audit metadata.
7. **Security/RBAC Tests**: ensure unauthorized writes are rejected and read scopes are enforced.

## 9. Open Questions
_(None at this time; new discovery items will be logged here as they arise.)_

**Resolved Decisions**
- Backing store: Postgres + JSONB (with adjacency tables/pgRouting patterns) to keep infra simple and reuse existing operational playbooks.
- Legacy bootstrap: defer until steady-state ingestion proves out (avoid overwhelming the relevance filters for now).
- Freshness auto-adjustment: defer; start with static windows per source and revisit once usage data exists.
- SLA: End-to-end ingestion latency and query responses must stay under 100 ms (p95) during normal load.
