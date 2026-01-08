# yepe - Blueprint Scaffolding Tool

Scaffold agentic workflows into your repository with one command.

## Installation

No installation required! Use `npx` to run directly:

```bash
npx @yepe/init
```

Or with curl (no Node.js required):

```bash
curl -fsSL https://yepe.dev/install.sh | bash
```

## What it does

yepe copies the following from the [agents blueprint repository](https://github.com/epleaner/agents) into `.opencode/`:

- **AGENTS.md** → `.opencode/AGENTS.md` - AI assistant instructions
- **agent/** - Agent definitions (orchestrator, planner, builder, etc.)
- **command/** - Slash commands (/plan, /dev, /research, etc.)
- **skill/** - Specialized capabilities (qa, release, self-improve, etc.)
- **openspec/** - Change proposal framework
- **learnings/** - Meta-learnings ledgers

**Key features:**
- **Single folder footprint**: Everything lives in `.opencode/`
- **Smart project detection**: Auto-detects name, description, and tech stack
- **Learnings preservation**: Existing learnings are never overwritten
- **Custom config preserved**: Your custom agents/skills survive updates
- **Agent re-application**: After update, an agent re-applies promoted learnings
- **Project customization**: Prompts for tech stack, conventions, etc.

## Prerequisites

Before running yepe, ensure:

1. You're in a git-initialized repository: `git init`
2. Your working tree is clean: `git status` (commit or stash changes first)
3. You have git installed and configured

## Commands

yepe has two commands:

| Command | Description |
|---------|-------------|
| `init`  | Initialize a new project with the blueprint (default) |
| `pull`  | Update existing setup without onboarding prompts |

### When to use each

- **Use `init`** for new projects or first-time setup
- **Use `pull`** to update an existing setup with latest blueprint changes

## Usage

### Fresh Installation (init)

In a new repository:

```bash
# Initialize git if needed
git init

# Run yepe (interactive)
npx @yepe/init

# You'll be prompted for:
# - Project name [auto-detected from package.json, etc.]
# - Project description [auto-detected]
# - Beads prefix (2-4 characters for issue IDs)
# - Skill selection (which external integrations to include)

# Review changes
git status

# Commit
git add .
git commit -m "Add yepe blueprint"
```

### Non-Interactive Mode

For CI/CD pipelines or automated testing:

```bash
# Use detected values and defaults
npx @yepe/init --non-interactive

# Or with a config file
npx @yepe/init --non-interactive --config yepe.config.json
```

**Config file format** (`yepe.config.json`):

```json
{
  "name": "my-project",
  "description": "E-commerce platform built with TypeScript/React. Uses Clean Architecture, Jest for testing, trunk-based development. Integrates with Stripe and SendGrid APIs.",
  "beadsPrefix": "app",
  "selectedSkills": ["research", "qa", "release"]
}
```

All fields are optional. When not provided:
1. Detection is attempted (see below)
2. Falls back to sensible defaults

### Updating Existing Setup (pull)

Use `pull` to update without re-answering setup questions:

```bash
npx @yepe/init pull
```

**What `pull` does:**
- Downloads latest blueprint files
- Updates base agents/skills/commands
- Preserves your `project.md` configuration
- Preserves custom agents/skills you've added
- Preserves learnings with existing entries
- Re-applies promoted learnings to restore customizations

**What `pull` requires:**
- Project must be initialized (`.opencode/openspec/project.md` must exist)
- If not initialized, you'll get an error with instructions to run `init` first

Files that conflict are listed in `.yepe-report.json`.

## Project Detection

yepe automatically detects project metadata from common project files:

### Detection Sources (in priority order)

**Project name:**
1. `package.json` → `name` field
2. `Cargo.toml` → `[package] name`
3. `pyproject.toml` → `[project] name` or `[tool.poetry] name`
4. Current directory name (fallback)

**Project description:**
1. `package.json` → `description` field
2. `Cargo.toml` → `[package] description`
3. `pyproject.toml` → `[project] description` or `[tool.poetry] description`
4. `README.md` → First non-heading paragraph

**Tech stack:**
- `package.json` dependencies → React, Vue, Express, TypeScript, etc.
- `Cargo.toml` dependencies → Tokio, Axum, Actix, etc.
- `pyproject.toml` dependencies → FastAPI, Django, Flask, etc.

### Detection Behavior

**Interactive mode:**
- Detected values shown as defaults in brackets: `Project name [detected-name]:`
- Press Enter to accept, or type to override

**Non-interactive mode:**
- Config file values take priority
- Then detected values
- Then hardcoded defaults

Detection is best-effort and never crashes on missing/malformed files.

## Output

yepe creates:

- **Blueprint files** - All non-conflicting files from the blueprint
- **.yepe-report.json** - Detailed report of changes and conflicts

Example report:

```json
{
  "version": "0.1.0",
  "timestamp": "2026-01-05T...",
  "changes": [
    {
      "path": "AGENTS.md",
      "status": "added"
    },
    {
      "path": ".opencode/agent/orchestrator.md",
      "status": "conflict",
      "reason": "File already exists"
    }
  ],
  "conflicts": [".opencode/agent/orchestrator.md"],
  "summary": {
    "added": 45,
    "conflicts": 1,
    "skipped": 0
  }
}
```

## Troubleshooting

### "Not a git repository"

Initialize git first:

```bash
git init
```

### "Working tree is not clean"

Commit or stash your changes:

```bash
git add .
git commit -m "Work in progress"
# or
git stash
```

### "Failed to download blueprint"

Check:
- Internet connection
- Git is installed: `git --version`
- GitHub is accessible: `ping github.com`

## Next Steps

After running yepe:

1. **Initialize OpenSpec**: `openspec init` (if not already initialized)
2. **Initialize beads**: `bd init <prefix>` (if not already initialized)
3. **Review .opencode/AGENTS.md**: Customize for your project
4. **Explore .opencode/**: Configure agents, commands, and skills
5. **Add custom agents/skills**: Create new files in `.opencode/agent/`, `.opencode/skill/`, etc.

## How Learnings Work

Learnings are the persistence layer for project-specific customizations:

1. **self-improve skill** writes insights to `.opencode/learnings/`
2. **Direct edits** are made to agents/skills/AGENTS.md
3. **Learnings record** what was changed and why
4. **On yepe update**, an agent reads promoted learnings and re-applies them

This means your customizations survive base config updates without complex merge logic.

## CLI Reference

```
yepe - AI agent blueprint scaffolding tool

Usage:
  npx @yepe/init [command] [options]

Commands:
  init     Initialize a new project with the blueprint (default)
  pull     Update existing setup without onboarding prompts

Options:
  -n, --non-interactive    Run without prompts (uses detected values or config)
  -c, --config <path>      Path to JSON config file
  -h, --help               Show help message

Examples:
  npx @yepe/init                           # Initialize (interactive)
  npx @yepe/init -n                        # Initialize with detection
  npx @yepe/init -n -c yepe.config.json    # Initialize with config
  npx @yepe/init pull                      # Update existing setup
  npx @yepe/init pull -n                   # Update in CI/CD
```

## Learn More

- [OpenCode Documentation](https://opencode.ai/docs)
- [beads Documentation](https://beads.sh)
- [Blueprint Repository](https://github.com/epleaner/agents)

## License

MIT
