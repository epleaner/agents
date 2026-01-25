# codex-multi-agent-suite Specification

## Purpose
Define the GPT-5.1 Codex multi-agent suite lineup (primary, subagent, and Meta-Agent roles), their models/permissions/skills, and the improvement enforcement scenarios that keep the workflow continuously governed.
## Requirements
### Requirement: GPT-5.1 Codex Multi-Agent Suite
The OpenCode setup SHALL define a GPT-5.1 Codex-centric lineup of six primary agents (Orchestrator, Planner, Proposal, PM, Builder, QA), a cross-cutting Meta-Agent dedicated to improving the agentic setup, and four specialized subagents (Researcher, Debugger, Writer, Release) tuned for Node/TypeScript/Python/React full-stack work.

#### Scenario: Invoke the correct agent for a task
- **WHEN** a user requests implementation, planning, proposal authoring, debugging, QA, release support, or systemic improvements
- **THEN** OpenCode exposes the matching agent with the prescribed model/temperature/tool access (e.g., Proposal agent with read-only repo access plus write scope limited to `openspec/`, Builder with full write/edit/bash)
- **AND** each agent definition enumerates its allowed skills and the conditions for escalating to beads/OpenSpec changes or spawning subagents, including when the Orchestrator engages the Proposal agent before Builder work may start.

#### Scenario: Meta-Agent continuous improvement loop
- **WHEN** workflows repeatedly stall, the same escalation recurs, or instrumentation gaps are detected
- **THEN** the Meta-Agent audits transcripts, beads history, and AGENTS/OpenSpec guidance to recommend concrete improvements
- **AND** it files or updates todos, beads issues, or OpenSpec change proposals before Orchestrator/PM can declare the session complete.

#### Primary Agent Specifications
- **Orchestrator**: GPT-5.1 Codex (temperature <=0.2) with full `write/edit/bash`, skills `exa-search`, `context7-docs`, `slack-notify`, Jira/Linear read-only. Owns beads todos, sequences workflows, launches async subagents, enforces completion.
- **Planner**: GPT-5.1 Codex or Claude Sonnet (temperature <=0.3) with read-only permissions (`write/edit/bash`: deny, OpenSpec commands allowed), skills `exa-search`, `context7-docs`, `fathom-notes`. Focuses on clarifying questions, spec alignment, and beads/OpenSpec cross references before build starts.
- **Proposal Agent**: GPT-5.1 Codex (temperature <=0.25) with repository read access, `write/edit` limited to `openspec/`, `bash` limited to OpenSpec tooling, and skills `exa-search`, `context7-docs`. Specializes in drafting OpenSpec artifacts, asking clarifying questions, and citing research sources before handing work to Planner/Builder.
- **PM**: GPT-5.1 Codex (temperature <=0.25) with limited `write` (docs/AGENTS) and `bash` (bd, openspec, jira) permissions, skills `jira-lookup`, `jira-update`, `linear-sync`, `slack-notify`, `fathom-notes`. Maintains beads/OpenSpec linkage and external comms (Slack/Jira/Linear) referencing change IDs.
- **Builder**: GPT-5.1 Codex (temperature <=0.15) with full `write/edit/bash`, skills `exa-search`, `context7-docs`, limited `slack-notify`. Executes implementation tasks from Planner/Orchestrator and may delegate to Debugger/Researcher/Writer while updating beads todos.
- **QA**: GPT-5.1 Codex (temperature <=0.2) with `write` limited to test/format fixes, `bash` allowed for lint/test/Playwright, skills `playwright`, `slack-notify`, `github-review` (read). Owns lint/test/format gates prior to Release and logs outcomes back to beads/OpenSpec.
- **Meta-Agent**: GPT-5.1 Codex (temperature <=0.2) with read access to transcripts, AGENTS files, beads/OpenSpec history, and limited `write/edit` for documentation/spec proposals; `bash` limited to `bd`, `openspec`, and reporting commands. Skills include `slack-notify`, `action-items`, and `context7-docs`. Audits workflows, captures improvement metrics, files follow-up issues/proposals, and updates AGENTS guidance while coordinating with Orchestrator/PM. When GPT-5.1 Codex is unavailable in a deployment, the Meta-Agent SHALL fall back to `anthropic/claude-3.5-sonnet` so continuous-improvement enforcement remains operable.

#### Subagent Specifications
- **Researcher**: GPT-5.1 Codex (temperature <=0.35) with `write/edit/bash`: deny, skills `exa-search`, `context7-docs`, `fathom-notes`. Supplies sourced findings (APIs, meeting notes, policy references) and cites beads/change IDs for Planner, Builder, and PM.
- **Debugger**: GPT-5.1 Codex (temperature <=0.25) with `write/edit` limited to files under investigation and `bash` permitted for targeted diagnostics/tests. Produces concise repro steps, log summaries, and suggested fixes without altering unrelated files.
- **Writer**: GPT-5.1 Codex or Gemini Flash (temperature <=0.28) with `write` limited to markdown/docs, `bash`: deny, skills `slack-notify`, `jira-update`. Drafts release notes, spec deltas, and external summaries referencing relevant beads/change IDs.
- **Release**: GPT-5.1 Codex (temperature <=0.2) with `write/edit` for metadata/changelog, `bash` for git/bd/openspec, skills `github-review` (PR create/update), `slack-notify`, `cloud-deploy`. Handles commits, PRs, CI follow-up, and cloud bundle rollout while ensuring beads/OpenSpec are updated before closure.

### Requirement: Meta-Agent Continuous Improvement
The OpenCode Codex environment SHALL operate a dedicated Meta-Agent focused solely on auditing workflows, capturing systemic friction, and ensuring continuous improvement actions are documented before any session is closed.

- **Model**: GPT-5.1 Codex (temperature ≤0.2) reserved for governance and improvement loops, with a required fallback to `anthropic/claude-3.5-sonnet` whenever Codex access is unavailable so the Meta-Agent can still engage.
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
- **AND** it announces the update via `slack-notify` (or equivalent) and records the edit in the learnings ledger for downstream traceability.

### Requirement: Meta-Learnings Registry
The Codex multi-agent suite SHALL maintain a `.opencode/learnings/` directory that contains separate markdown ledgers for (a) session meta learnings, (b) recurring manual tasks that might become commands or skills, (c) failures and their resolutions, and (d) candidate automations/skills, plus a shared `index.md`. Each ledger SHALL document a uniform entry template (date/session, bead/change IDs, knowledge type, subcategory, owner, summary, recommended action, status, and supporting links) so the Meta-Agent and Orchestrator can append structured rows without inventing new formats. The index SHALL summarize recent entries, their status, and any linked follow-up artifacts so agents can quickly locate relevant context.

#### Scenario: Ledger and index scaffolding exist
- **WHEN** a new repository clone is prepared or CI verifies project structure
- **THEN** the `.opencode/learnings/` directory contains the four mandated ledgers plus `index.md`
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

### Requirement: Proposal Agent Ownership of OpenSpec Flow
The Codex multi-agent suite SHALL route every new or ambiguous change request through the Proposal agent so it can gather clarifying questions, research best practices, and author the complete OpenSpec package (proposal, tasks, design, spec deltas) before Builder or QA engage. The Proposal agent SHALL cite its research sources, record outstanding questions, and limit all write operations to `openspec/` while using Orchestrator-managed beads for traceability.

#### Scenario: Clarify vague requests before drafting
- **WHEN** a user request lacks sufficient detail for implementation (e.g., "make repo act as blueprint")
- **THEN** the Proposal agent asks targeted clarifying questions, logs answers in the proposal, and blocks drafting until questions are resolved.

#### Scenario: Research-driven proposals
- **WHEN** the Proposal agent drafts a change
- **THEN** it performs web/library research via `exa-search`/`context7-docs`, cites the findings in the proposal or design, and notes any best-practice references tied to the beads/change IDs.

#### Scenario: Controlled write scope and hand-off
- **WHEN** the Proposal agent needs to persist work
- **THEN** it writes only within `openspec/` (proposal/tasks/design/spec) and runs `openspec validate <change-id> --strict`
- **AND** it hands the validated change plus outstanding assumptions to Planner and Orchestrator before Builder can begin implementation.
