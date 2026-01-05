## 1. Implementation
- [ ] 1.1 Design the schema covering beads, OpenSpec, Slack, Fathom, Jira/Linear, GitHub, and CI/CD artifacts, including node types, edge relationships, and freshness/provenance fields.
- [ ] 1.2 Implement ingestion jobs and skills that normalize events with timestamps, entities, references, and computed active/stale status plus revision history.
- [ ] 1.3 Enforce governance: permissions, revision history, and provenance tagging per agent role, ensuring writes append immutable audit entries.
- [ ] 1.4 Provide query interfaces so Planner/Builder/PM can retrieve linked context, provenance metadata, and freshness indicators in a single request.
- [ ] 1.5 Test by ingesting sample sessions and validating that downstream agents can traverse relationships, read freshness states, and review the paper trail.

## 2. Spec Detailing
- [ ] Design the unified knowledge graph schema (sources, entities, relationships) with explicit node types, edge semantics, and provenance/freshness metadata.
- [ ] Define ingestion pipelines and scheduling (which agents trigger updates, deduplication, stale detection, error handling).
- [ ] Expose read/write interfaces or skills with permission rules, supported query patterns, and audit-trail responses so Planner/PM/Orchestrator/Researcher can query or append entries.
