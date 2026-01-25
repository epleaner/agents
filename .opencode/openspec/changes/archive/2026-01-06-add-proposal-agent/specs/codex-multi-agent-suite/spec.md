## MODIFIED Requirements
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
- **Meta-Agent**: GPT-5.1 Codex (temperature <=0.2) with read access to transcripts, AGENTS files, beads/OpenSpec history, and limited `write/edit` for documentation/spec proposals; `bash` limited to `bd`, `openspec`, and reporting commands. Skills include `slack-notify`, `action-items`, and `context7-docs`. Audits workflows, captures improvement metrics, files follow-up issues/proposals, and updates AGENTS guidance while coordinating with Orchestrator/PM.

#### Subagent Specifications
- **Researcher**: GPT-5.1 Codex (temperature <=0.35) with `write/edit/bash`: deny, skills `exa-search`, `context7-docs`, `fathom-notes`. Supplies sourced findings (APIs, meeting notes, policy references) and cites beads/change IDs for Planner, Builder, and PM.
- **Debugger**: GPT-5.1 Codex (temperature <=0.25) with `write/edit` limited to files under investigation and `bash` permitted for targeted diagnostics/tests. Produces concise repro steps, log summaries, and suggested fixes without altering unrelated files.
- **Writer**: GPT-5.1 Codex or Gemini Flash (temperature <=0.28) with `write` limited to markdown/docs, `bash`: deny, skills `slack-notify`, `jira-update`. Drafts release notes, spec deltas, and external summaries referencing relevant beads/change IDs.
- **Release**: GPT-5.1 Codex (temperature <=0.2) with `write/edit` for metadata/changelog, `bash` for git/bd/openspec, skills `github-review` (PR create/update), `slack-notify`, `cloud-deploy`. Handles commits, PRs, CI follow-up, and cloud bundle rollout while ensuring beads/OpenSpec are updated before closure.

## ADDED Requirements
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
