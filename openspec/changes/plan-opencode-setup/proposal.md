# Change: Plan bespoke OpenCode setup

## Why
We need a durable plan for configuring OpenCode across multiple machines and projects. The plan must formalize how beads issue tracking and OpenSpec specifications work together, define the reusable agent/skill suite for Node/TypeScript/Python/React work, and spell out integrations with Jira, Linear, Slack, Fathom, and GitHub.

## What Changes
- Capture requirements for a cross-project OpenCode configuration bundle and distribution process.
- Define the GPT-5.1 Codex–centric multi-agent lineup (Orchestrator, Planner, PM, Builder, QA plus Researcher/Debugger/Writer/Deploy) along with research tooling and browser access expectations.
- Document reusable workflow commands that chain the specialized agents, enforce todos, and keep async subagents/parallel workstreams coordinated via beads.
- Describe how beads issues and OpenSpec changes stay linked throughout the workflow.
- Outline external integration connectors (Jira, Linear, Slack, Fathom, GitHub) via MCP or custom tooling.
- Establish guidance for research tooling (Exa, Context7, Playwright) and documentation (AGENTS instructions, skills, commands).
- Reference oh-my-opencode patterns as inspiration, noting how each concept is reimplemented or adapted inside the bespoke configuration.
- Detail agent orchestration mechanics, including subagent escalation rules and the shared skills library strategy.
- Define the unified knowledge graph, Slack EOD digest automation, persistent todo/action-item management, and cloud deployment workflow that keep the setup operational across environments.

## Impact
- Affected specs: `opencode-setup`
- Related beads issue: `agents-zr8`
