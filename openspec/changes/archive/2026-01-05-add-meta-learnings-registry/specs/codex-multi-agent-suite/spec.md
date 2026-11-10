## ADDED Requirements

### Requirement: Meta-Learnings Registry
The Codex multi-agent suite SHALL maintain a `learnings/` directory at the repo root that contains separate markdown ledgers for (a) session meta learnings, (b) recurring manual tasks that might become commands or skills, (c) failures and their resolutions, and (d) candidate automations/skills, plus a shared `index.md`. Each ledger SHALL document a uniform entry template (date/session, bead/change IDs, knowledge type, subcategory, owner, summary, recommended action, status, and supporting links) so the Meta-Agent and Orchestrator can append structured rows without inventing new formats. The index SHALL summarize recent entries, their status, and any linked follow-up artifacts so agents can quickly locate relevant context.

#### Scenario: Ledger and index scaffolding exist
- **WHEN** a new repository clone is prepared or CI verifies project structure
- **THEN** the `learnings/` directory contains the four mandated ledgers plus `index.md`
- **AND** each file includes the required entry template

#### Scenario: Sessions append structured entries
- **WHEN** a session uncovers a new meta learning, recurring task, failure pattern, or candidate command/skill
- **THEN** the Meta-Agent (or delegated Orchestrator) appends an entry to the correct ledger using every template field
- **AND** the entry references the triggering session date, bead/change IDs, supporting transcript or AGENTS snippet, and the intended follow-up owner/status so future sessions can revisit it
- **AND** `index.md` is updated (manually or via the review command) to reflect the new entry and its category

#### Scenario: Review command drives promotion
- **WHEN** a session concludes
- **THEN** the Meta-Agent runs the custom "review learnings" command/workflow to list new or in-progress entries, prompt for next steps, and capture outcomes (informational, needs AGENTS update, needs OpenSpec change, etc.)
- **AND** the command (or resulting manual edits) updates ledger statuses, owners, and the index so the paper trail stays current

#### Scenario: Promote ledger entries into canonical docs
- **WHEN** a ledger entry meets promotion criteria (e.g., repeated twice, blocks delivery, or requires new automation/skill)
- **THEN** the Meta-Agent files or updates the appropriate AGENTS section, configuration, beads issue, or OpenSpec change referencing the ledger entry ID
- **AND** the ledger entry and `index.md` are updated with links to those follow-up artifacts and marked as "Promoted"

