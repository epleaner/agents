## REMOVED Requirements

### Requirement: Artifact Ingestion
**Reason**: Knowledge graph replaced by learnings ledgers. Agents write to learnings/ and make direct edits instead.
**Migration**: Use `.opencode/learnings/` for meta-insights, direct file edits for fixes.

### Requirement: Topic and Decision Nodes
**Reason**: Knowledge graph replaced by learnings ledgers.
**Migration**: Use learnings ledgers to track decisions and their rationale.

### Requirement: Provenance and Freshness
**Reason**: Knowledge graph replaced by learnings ledgers.
**Migration**: Learnings entries include date, session, and supporting links for provenance.

### Requirement: Query Interface
**Reason**: Knowledge graph replaced by learnings ledgers.
**Migration**: Agents read learnings/ directly.

### Requirement: Access Control and Audit
**Reason**: Knowledge graph replaced by learnings ledgers.
**Migration**: Git history provides audit trail for learnings changes.
