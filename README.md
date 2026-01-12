# agents

A blueprint repository for AI-assisted development workflows. Scaffold this into any project to get a complete agentic development system with coordinated agents, slash commands, specialized skills, spec-driven development, and autonomous execution modes.

## Quick Start

Scaffold this blueprint into your repository using yepe. Currently requires building locally (npx publishing is TODO):

```bash
# Clone and build yepe
git clone https://github.com/epleaner/agents.git
cd agents/packages/yepe
npm install && npm run build && npm link

# Run in your target repository
cd /path/to/your/project
yepe init
```

yepe copies the complete agent framework into `.opencode/` and prompts for project customization (name, tech stack, conventions).

## Agents

This system uses a 5-agent architecture with 3 primary agents and 2 subagents.

### Primary Agents

| Agent | Purpose |
|-------|---------|
| **orchestrator** | Primary coordinator that sequences planning, building, and release. Delegates work but never implements directly. |
| **planner** | Creates OpenSpec proposals with tasks, spec deltas, and validation criteria. Researches best practices before planning. |
| **builder** | Implementation agent that executes plans. Uses skills for specialized work (qa, debugger, release). |

### Subagents

Subagents are delegated to by primary agents for specialized tasks.

| Agent | Purpose |
|-------|---------|
| **researcher** | Read-only agent for documentation lookups, API research, and context gathering. Delegated to by planner. |
| **fathom** | Meeting assistant that answers questions about Fathom recordings and extracts action items. Delegated to by orchestrator. |

### Workflow

The typical workflow follows this sequence:

1. **orchestrator** receives a request and determines whether it needs planning or can be executed directly
2. **planner** creates an OpenSpec proposal with requirements, tasks, and spec deltas
3. **builder** implements the approved proposal, using skills like `qa` and `release`
4. **qa** validates the implementation against spec requirements
5. **release** handles git hygiene, commits, and PRs

The orchestrator coordinates but never implements directly. All implementation work flows through the builder agent.

## Commands

Slash commands provide entry points for common workflows:

| Command | Description |
|---------|-------------|
| `/plan` | Break down work into actionable OpenSpec proposals |
| `/dev` | Run the full development workflow |
| `/research` | Look up documentation, APIs, or context |
| `/fathom` | Work with Fathom meeting recordings and transcripts |

## Skills

Skills are specialized capabilities that agents invoke for specific tasks.

### Core Skills

| Skill | Purpose |
|-------|---------|
| `research` | Documentation, API, and context lookups |
| `debugger` | Reproduce failures and propose fixes |
| `qa` | Run linters, tests, and formatters |
| `release` | Git hygiene, commits, and PRs |
| `writer` | Documentation and release notes |
| `pm` | Sync beads, Jira/Linear, Slack status |
| `self-improve` | **Critical**: Reflect on friction and file improvements (see below) |

### OpenSpec Skills

| Skill | Purpose |
|-------|---------|
| `propose-new` | Create change proposals |
| `propose-go` | Implement approved proposals |
| `propose-close` | Archive completed proposals |
| `review-plan` | Review task plans against LLM planning best practices |

### External Integrations

| Skill | Purpose | Status |
|-------|---------|--------|
| `fathom-list-meetings` | List Fathom meetings in a date range | Available |
| `fathom-get-transcript` | Fetch transcript for a specific meeting | Available |
| `fathom-notes` | Pull meeting transcripts and action items | Available |
| `action-items` | Create/escalate todos with owners | Available |
| `slack-notify` | Broadcast status updates | TODO |
| `jira-lookup`, `jira-update` | Jira issue sync | TODO |
| `linear-sync` | Linear issue sync | TODO |

## Self-Improve Workflow

The `self-improve` skill is central to how this system learns and evolves. Run it after any session involving friction, unexpected behavior, or interesting patterns.

### When to Run

- After encountering workflow friction or confusion
- When an agent behaves unexpectedly
- After completing a complex task with lessons learned
- Before closing any significant work session

### What It Does

1. Reviews the current session for friction points and insights
2. Records findings in the appropriate ledger (`.opencode/learnings/`)
3. Proposes updates to AGENTS.md, agent definitions, or skills
4. Creates beads issues or OpenSpec proposals for larger changes

### Invocation

Agents invoke `self-improve` automatically at session end, or you can trigger it explicitly:

```
Run the self-improve skill focused on [specific area]
```

The skill requires write access to apply fixes. If running in a read-only context, it documents recommendations for manual application.

## Beads (Issue Tracking)

[Beads](https://github.com/epleaner/beads) is a git-native issue tracker. Issues live alongside code and sync automatically with commits.

**In this repo, agents and skills invoke beads commands internally.** You typically don't run `bd` directly - instead, use the orchestrator or builder agents who manage issue state as part of their workflows.

### Key Concepts

- Issues are stored in `.beads/` and committed to git
- Status flows: `open` -> `in_progress` -> `review` -> `done`
- `bd sync` keeps issues aligned with git history

### Manual Commands (for reference)

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --status in_progress  # Claim work
bd close <id>         # Complete work
bd sync               # Sync with git
```

Get started with `bd onboard`. If commands are slow, run `bd doctor` for diagnostics.

### Troubleshooting

- **Slow startup (5+ seconds)**: Run `bd migrate --update-repo-id`
- **Sandboxed environments**: Use `--sandbox` flag or `export BEADS_NO_DAEMON=1`
- **Git worktrees**: Use `export BEADS_NO_DAEMON=1`

## OpenSpec (Change Proposals)

[OpenSpec](https://github.com/epleaner/openspec) is a spec-driven development framework. It separates current truth (specs) from proposed changes, ensuring all significant work is planned before implementation.

**In this repo, agents and skills invoke openspec commands internally.** The planner agent creates proposals via the `propose-new` skill, and the builder archives them via `propose-close`. You typically interact through agents rather than running `openspec` directly.

### Key Concepts

- **specs/** - Current truth: what IS built
- **changes/** - Proposals: what SHOULD change
- Changes require approval before implementation begins

### Three-Stage Workflow

**1. Create** (planner agent via `propose-new` skill)

When adding features, making breaking changes, or changing architecture, the planner creates:
- `proposal.md` - Why and what changes
- `tasks.md` - Implementation checklist
- `design.md` - Technical decisions (optional)
- `specs/` - Delta changes (ADDED/MODIFIED/REMOVED requirements)

**2. Implement** (builder agent via `propose-go` skill)

Builder executes tasks and validates against specs.

**3. Archive** (builder agent via `propose-close` skill)

After deployment, the change is archived and specs are updated.

### Manual Commands (for reference)

```bash
openspec list              # List active changes
openspec list --specs      # List specifications
openspec show <item>       # View details
openspec validate --strict # Validate changes
openspec archive <id>      # Archive completed work
```

## Ralph Mode (Autonomous Orchestration)

Ralph mode enables autonomous multi-iteration agent execution for complex tasks that require many steps.

```bash
# Inline prompt
.opencode/scripts/ralph-orchestrator.sh "Implement user authentication"

# From file with iteration limit
.opencode/scripts/ralph-orchestrator.sh --prompt task.md --max-iterations 30

# Dry run
.opencode/scripts/ralph-orchestrator.sh "Test task" --dry-run

# Resume interrupted session
.opencode/scripts/ralph-orchestrator.sh --resume ralph-2026-01-08-103045

# Rollback to checkpoint
.opencode/scripts/ralph-orchestrator.sh --rollback-to 10
```

### Key Features

- **Configurable limits**: Max iterations (default: 50), timeout (default: 2 hours)
- **Git checkpointing**: Automatic commits at configurable intervals
- **Completion detection**: Via markers (`- [x] TASK_COMPLETE` or `RALPH_COMPLETE`)
- **Safety guards**: Infinite loop detection, rate limiting, graceful shutdown
- **Human-in-the-loop**: Interactive prompts for high-risk operations
- **Session metrics**: Iteration count, runtime, token usage

### Configuration

Copy `.opencode/templates/ralph.yml` to your project root and customize:

```yaml
ralph:
  max_iterations: 50
  timeout_minutes: 120
  checkpoint_interval: 10
  safety:
    detect_infinite_loop: true
    max_identical_outputs: 3
  hitl:
    enabled: true
    mode: "blocking"
```

## Learnings (Meta-Learning System)

The learnings system captures operational insights and promotes them into actionable improvements.

### Ledgers

| Ledger | Purpose |
|--------|---------|
| `meta-learnings.md` | Session-level workflow insights |
| `recurring-tasks.md` | Repetitive tasks that may become commands/skills |
| `failures-and-resolutions.md` | Breakages and mitigations |
| `candidate-automations.md` | Potential automations |

### Workflow

1. **Capture**: Record insights during sessions in `.opencode/learnings/`
2. **Review**: Run `self-improve` skill before closing sessions
3. **Promote**: Update AGENTS.md, file beads issues, or create OpenSpec changes
4. **Track**: Mark entries as `promoted` with links to follow-up artifacts

Entry statuses: `new`, `needs-agents-update`, `needs-spec-change`, `in-progress`, `promoted`, `closed`

## yepe (Blueprint Scaffolding)

yepe scaffolds this blueprint into any repository. Currently requires building locally (npx publishing is TODO):

```bash
# Clone and build (one-time setup)
git clone https://github.com/epleaner/agents.git
cd agents/packages/yepe
npm install && npm run build && npm link

# Run in your target repository
cd /path/to/your/project
yepe init
```

### What It Copies

- **AGENTS.md** - AI assistant instructions
- **agent/** - Agent definitions
- **command/** - Slash commands
- **skill/** - Specialized capabilities
- **openspec/** - Change proposal framework
- **learnings/** - Meta-learnings ledgers

### Features

- **Single folder footprint**: Everything lives in `.opencode/`
- **Learnings preservation**: Existing learnings with entries are never overwritten
- **Custom config preserved**: Your custom agents/skills survive updates
- **Learnings re-application**: After updating base files, an agent re-applies promoted learnings to restore your customizations
- **Project customization**: Prompts for tech stack and conventions

### Non-Interactive Mode

For CI/CD pipelines or automated testing:

```bash
yepe init --non-interactive

# With config file
yepe init --non-interactive --config yepe.config.json
```

Config file format:

```json
{
  "name": "my-project",
  "description": "E-commerce platform with TypeScript/React",
  "beadsPrefix": "app",
  "selectedSkills": ["research", "qa", "release"]
}
```

## Communication Style

All agents follow a direct communication style:

- Lead with the answer, not context
- No preambles ("I'll help you with...", "Let me...")
- No filler or politeness padding
- Context comes after the answer if needed
- Don't ask permission to do the job - just do it

**Bad:** "I'll help you find that information. Let me search through the files. After reviewing the data, I found that... In summary, the answer is X."

**Good:** "The answer is X."

## License

MIT
