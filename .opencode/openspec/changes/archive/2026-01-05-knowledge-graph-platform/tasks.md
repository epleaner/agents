## 1. Implementation
- [x] 1.1 Design the schema covering beads, OpenSpec, Slack, Fathom, Jira/Linear, GitHub, and CI/CD artifacts, including artifact node types, topic/decision/action nodes, edge relationships, and freshness/provenance fields.
- [x] 1.2 Implement ingestion jobs and skills that normalize events with timestamps, entities, references, computed active/stale status, domain-relevance flags, and topic-alignment hints plus revision history.
- [x] 1.3 Enforce governance: permissions, revision history, and provenance tagging per agent role, ensuring writes append immutable audit entries.
- [x] 1.4 Provide query interfaces so Planner/Builder/PM can retrieve linked context, provenance metadata, topic summaries, and freshness indicators in a single request.
- [x] 1.5 Implement relevance filters, topic aggregation logic, and retention policies so the graph stores only domain-level decisions, dependencies, and blockers.
- [x] 1.6 Test by ingesting sample sessions and validating that downstream agents can traverse artifact ↔ topic relationships, read freshness states, inspect relevance tags, and review the paper trail.

## 2. Spec Detailing
- [x] Design the unified knowledge graph schema (sources, entities, relationships) with explicit artifact node types, topic/decision/action nodes, edge semantics, and provenance/freshness metadata.
- [x] Define ingestion pipelines and scheduling (which agents trigger updates, deduplication, stale detection, topic aggregation, relevance filtering, error handling).
- [x] Expose read/write interfaces or skills with permission rules, supported query patterns, and audit-trail responses so Planner/PM/Orchestrator/Researcher can query or append entries.
