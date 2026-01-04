## ADDED Requirements

### Requirement: Portable OpenCode Configuration Bundle
The organization SHALL maintain a version-controlled OpenCode configuration bundle (global config, agents, skills, commands, plugins, AGENTS.md templates) that can be replicated on macOS laptops and remote devboxes.

#### Scenario: Bootstrap a new environment
- **WHEN** a contributor provisions a fresh workstation or remote devbox
- **THEN** they can run a documented bootstrap (dotfiles repo, installer, or `OPENCODE_CONFIG_DIR` override)
- **AND** the process places the shared `.opencode/` assets and `~/.config/opencode/` contents without manual edits.

### Requirement: Claude-First Multi-Agent Suite
The OpenCode bundle SHALL define a reusable Claude-based agent lineup covering build, plan, researcher, debugger, task-manager, documentation, frontend, and backend roles tuned for Node/TypeScript/Python/React.

#### Scenario: Invoke the correct agent for a task
- **WHEN** a user requests implementation, planning, debugging, or research help
- **THEN** OpenCode exposes agents with the prescribed model/temperature/tool access (e.g., Opus build agent with full tools, Haiku/Sonnet plan agent read-only, researcher agent with Exa access but no write/edit)
- **AND** the agent descriptions clarify when to escalate to beads/OpenSpec changes.

### Requirement: Research and Browser Toolchain Guidance
The configuration SHALL instruct agents to prefer Exa MCP, Context7, and other configured research skills before falling back to manual `webfetch`, and to use the Playwright MCP for approved browser-based validation.

#### Scenario: Researching undocumented behavior
- **WHEN** an agent needs API or UX references not present locally
- **THEN** it consults the research skill or MCP servers (Exa, Context7, grep.app) per AGENTS.md instructions
- **AND** only uses Playwright MCP for documented QA scenarios (e.g., local dev verification) with the correct permissions.

### Requirement: Beads and OpenSpec Synchronization
Every new capability or ambiguous change SHALL have both a beads issue and an associated OpenSpec change directory that reference each other before implementation begins.

#### Scenario: Starting a new capability
- **WHEN** a contributor scopes work that alters or adds requirements
- **THEN** they create/claim a beads issue, choose a verb-led `change-id`, scaffold `proposal.md`/`tasks.md`/deltas, and record the beads ID in the proposal
- **AND** they run `openspec validate <change-id> --strict` and summarize the results back in the beads issue before moving to implementation.

### Requirement: External Workflow Integrations
The plan SHALL describe how Jira, Linear, Slack, Fathom analytics, and GitHub integrate with the OpenCode workflow via MCP servers or custom tools, including how activity syncs back to beads/OpenSpec artifacts.

#### Scenario: Logging progress to external systems
- **WHEN** progress updates are required outside of beads/OpenSpec
- **THEN** agents use the documented integration commands (e.g., MCP connectors or custom tools) to mirror status to Jira/Linear, notify Slack/Fathom, or link GitHub references
- **AND** the workflow ensures external updates reference both the beads issue ID and the OpenSpec `change-id` for traceability.
