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

yepe copies the following from the [agents blueprint repository](https://github.com/epleaner/agents):

- **AGENTS.md** - AI assistant instructions and workflow documentation
- **.opencode/** - OpenCode agent definitions, commands, and skills
- **openspec/** - OpenSpec change proposal framework
- **learnings/** - Meta-learnings and operational insights ledgers
- **bin/** - Helper scripts (review-learnings, etc.)

**New in v0.2.0:** yepe now prompts for project information and automatically customizes:
- `openspec/project.md` with your tech stack, architecture, and conventions
- `AGENTS.md` with your project name, purpose, and domain context
- **Skill selection**: Choose which external integration skills to include
- **Clean learnings**: Copies template-only learnings files (no blueprint repo entries)

## Prerequisites

Before running yepe, ensure:

1. You're in a git-initialized repository: `git init`
2. Your working tree is clean: `git status` (commit or stash changes first)
3. You have git installed and configured

## Usage

### Fresh Installation

In a new repository:

```bash
# Initialize git if needed
git init

# Run yepe (interactive)
npx @yepe/init

# You'll be prompted for:
# Required fields (marked with *):
# - * Project name
# - * Purpose/goals (1-2 sentences)
# - * Beads prefix (2-4 characters)
#
# Optional fields (press Enter to skip):
# - Tech stack (comma-separated)
# - Code style & formatting
# - Architecture patterns
# - Testing strategy
# - Git workflow
# - Domain context
# - Important constraints
# - External dependencies
# - Skill selection (which external integrations to include)

# Review changes
git status

# Commit
git add .
git commit -m "Add yepe blueprint"
```

### Updating Existing Setup

yepe is idempotent - safe to re-run:

```bash
npx @yepe/init
```

Files that already exist will be marked as conflicts in `.yepe-report.json`. You can manually merge updates as needed.

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
2. **Initialize beads**: `bd init` (if not already initialized)
3. **Review AGENTS.md**: Customize for your project
4. **Explore .opencode/**: Configure agents, commands, and skills

## Learn More

- [OpenCode Documentation](https://opencode.ai/docs)
- [beads Documentation](https://beads.sh)
- [Blueprint Repository](https://github.com/epleaner/agents)

## License

MIT
