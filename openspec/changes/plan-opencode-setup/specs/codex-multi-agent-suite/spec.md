## ADDED Requirements

### Requirement: GPT-5.1 Codex Multi-Agent Suite
The OpenCode setup SHALL define a GPT-5.1 Codex–centric lineup of five primary agents (Orchestrator, Planner, PM, Builder, QA) and four specialized subagents (Researcher, Debugger, Writer, Release) tuned for Node/TypeScript/Python/React full-stack work.

#### Scenario: Invoke the correct agent for a task
- **WHEN** a user requests implementation, planning, debugging, QA, or release support
- **THEN** OpenCode exposes the matching agent with the prescribed model/temperature/tool access (e.g., Builder with full write/edit/bash, Planner read-only with OpenSpec commands, QA with lint/test/Playwright permissions, Release with git/CI privileges)
- **AND** each agent definition enumerates its allowed skills and the conditions for escalating to beads/OpenSpec changes or spawning subagents.

#### Primary Agent Specifications
- **Orchestrator**: GPT-5.1 Codex (temperature ≤0.2) with full `write/edit/bash/webfetch`, skills `exa-search`, `context7-docs`, `slack-notify`, Jira/Linear read-only. Owns beads todos, sequences workflows, launches async subagents, enforces completion.
- **Planner**: GPT-5.1 Codex or Claude Sonnet (temperature ≤0.3) with read-only permissions (`write/edit/bash`: deny, OpenSpec commands allowed), skills `exa-search`, `context7-docs`, `fathom-notes`. Focuses on clarifying questions, spec alignment, and beads/OpenSpec cross references before build starts.
- **PM**: GPT-5.1 Codex (temperature ≈0.25) with limited `write` (docs/AGENTS) and `bash` (bd, openspec, jira) permissions, skills `jira-lookup`, `jira-update`, `linear-sync`, `slack-notify`, `fathom-notes`. Maintains beads/OpenSpec linkage and external comms (Slack/Jira/Linear) referencing change IDs.
- **Builder**: GPT-5.1 Codex (temperature ≈0.15) with full `write/edit/bash`, skills `exa-search`, `context7-docs`, limited `slack-notify`. Executes implementation tasks from Planner/Orchestrator and may delegate to Debugger/Researcher/Writer while updating beads todos.
- **QA**: GPT-5.1 Codex (temperature ≈0.2) with `write` limited to test/format fixes, `bash` allowed for lint/test/Playwright, skills `playwright`, `slack-notify`, `github-review` (read). Owns lint/test/format gates prior to Release and logs outcomes back to beads/OpenSpec.

#### Subagent Specifications
- **Release**: GPT-5.1 Codex (temperature ≈0.2) with `write/edit` for metadata/changelog, `bash` for git/bd/openspec, skills `github-review` (PR create/update), `slack-notify`, `cloud-deploy`. Handles commits, PRs, CI follow-up, and cloud bundle rollout while ensuring beads/OpenSpec are updated before closure.

### Requirement: Workflow Chains and Todo Enforcement
The OpenCode setup SHALL provide reusable `/commands` and workflow definitions (e.g., `/workflow feature-development`) that chain Planner → Builder → QA → Release → PM, spawn async subagents as needed, and refuse to exit while todos remain.

#### Scenario: Run a plan-to-build workflow
- **WHEN** a contributor invokes `/workflow feature-development`
- **THEN** OpenCode sequentially launches the designated agents, tracks progress in beads todos, and spawns Researcher/Debugger/Writer tasks in the background
- **AND** the workflow cannot complete until PM confirms beads/OpenSpec alignment, todos are closed, and Release reports CI success.

