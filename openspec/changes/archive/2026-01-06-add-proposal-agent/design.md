## Context
OpenSpec work currently bounces between Orchestrator, Planner, Writer, and Builder. Requests often arrive vague, forcing builders to clarify scope mid-implementation. We need a dedicated Proposal agent that can interview stakeholders (via clarifying questions), research prior art, and fully author OpenSpec artifacts before handing off to Planner/Builder.

## Goals / Non-Goals
- **Goals:**
  - Centralize proposal creation in one agent with guardrails around tools + write scope.
  - Ensure every change proposal includes clarifying questions, research summaries, and validation steps before Builder starts.
  - Maintain traceability between Proposal agent output and beads/change IDs.
- **Non-Goals:**
  - Replacing Planner (still validates scope and cross-capability impacts).
  - Granting Proposal agent general repo write access.

## Decisions
- **Tooling:** Proposal agent may call `exa-search` for external best practices, `context7-docs` for library docs, and read any repo file, but write/edit operations are limited to `openspec/` so implementation code remains untouched.
- **Workflow:** Orchestrator routes any new change/proposal request to Proposal agent first. Proposal agent drafts `proposal.md`, `tasks.md`, `design.md` (when complexity warrants), and spec deltas, then pings Planner for validation before Builder/QA engage.
- **Logging:** Proposal agent must document clarifying questions + answers inside the proposal (or linked notes) and log research summaries referencing beads/change IDs.

## Risks / Trade-offs
- **Overlap with Planner:** Without clear hand-offs, responsibilities could blur. Mitigation: update AGENTS/command docs so Planner focuses on validation + cross-capability checks after Proposal agent scaffolds.
- **Write-scope restriction:** Proposal agent cannot patch AGENTS or code directly; if documentation tweaks are required, escalate to Writer/PM.

## Open Questions
- Should the Proposal agent also own OpenSpec validations for other agents deltas, or only the changes it authors? (Default: only its own submissions.)
- Do we need automation to ensure Orchestrator cannot skip the Proposal agent when specs are requested? (Possible follow-up enforcement.)
