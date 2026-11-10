## ADDED Requirements

### Requirement: Meta-Agent Continuous Improvement
The OpenCode Codex environment SHALL operate a dedicated Meta-Agent focused solely on auditing workflows, capturing systemic friction, and ensuring continuous improvement actions are documented before any session is closed.

- **Model**: GPT-5.1 Codex (temperature ≤0.2) reserved for governance and improvement loops.
- **Access**: Read transcripts, AGENTS files, beads/OpenSpec history; limited `write/edit` for documentation and spec proposals; `bash` constrained to `bd`, `openspec`, and reporting utilities.
- **Skills**: `slack-notify`, `action-items`, `context7-docs` for referencing external materials and logging traceability.
- **Duties**: Detect recurring friction, quantify instrumentation gaps, propose improvements, file follow-up tasks or change proposals, and update AGENTS/spec guidance so future sessions inherit the fixes.

#### Scenario: Meta-Agent audit triggers on repeated friction
- **WHEN** workflow steps stall repeatedly, identical escalations recur, or instrumentation gaps persist
- **THEN** the Meta-Agent audits recent transcripts, beads history, and OpenSpec deltas to pinpoint the systemic issue
- **AND** it produces prioritized recommendations that cite affected beads/change IDs for accountability.

#### Scenario: Meta-Agent enforces improvement actions before closure
- **WHEN** session owners attempt to end work that still has unresolved friction documented by the Meta-Agent
- **THEN** the Meta-Agent files or updates todos, beads issues, or OpenSpec proposals capturing the required follow-up
- **AND** it records the improvement context so the next session inherits the backlog before permitting session closure.

#### Scenario: Meta-Agent updates guidance artifacts
- **WHEN** the Meta-Agent identifies missing or outdated instructions in AGENTS or related specs
- **THEN** it patches the relevant guidance within its limited write scope
- **AND** it announces the update via `slack-notify` (or equivalent) for downstream traceability.
