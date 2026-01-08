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
- **Learnings preservation**: Existing learnings are never overwritten
- **Custom config preserved**: Your custom agents/skills survive updates
- **Agent re-application**: After update, an agent re-applies promoted learnings
- **Project customization**: Prompts for tech stack, conventions, etc.

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

### Non-Interactive Mode

For CI/CD pipelines or automated testing:

```bash
# Use defaults (project name from directory, minimal config)
npx @yepe/init --non-interactive

# Or with a config file
npx @yepe/init --non-interactive --config yepe.config.json
```

**Config file format** (`yepe.config.json`):

```json
{
  "name": "my-project",
  "purpose": "A brief description of the project",
  "techStack": ["TypeScript", "React", "Node.js"],
  "codeStyle": "Prettier, ESLint",
  "architecture": "Clean Architecture",
  "testing": "Jest, Playwright",
  "gitWorkflow": "trunk-based",
  "domain": "E-commerce platform",
  "constraints": "GDPR compliance required",
  "dependencies": "Stripe API, SendGrid",
  "beadsPrefix": "app",
  "selectedSkills": ["research", "qa", "release"]
}
```

All fields are optional. Defaults:
- `name`: Current directory name
- `purpose`: `"{name} project"`
- `beadsPrefix`: First 3 characters of directory name
- `selectedSkills`: Empty (no external skills)

### Updating Existing Setup

yepe is safe to re-run:

```bash
npx @yepe/init
```

**What happens on update:**
- Base files (from blueprint) are updated
- Custom agents/skills you added are preserved
- Learnings with entries are never overwritten
- After update, an agent re-applies your promoted learnings to restore customizations

Files that conflict are listed in `.yepe-report.json`.

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

## Learn More

- [OpenCode Documentation](https://opencode.ai/docs)
- [beads Documentation](https://beads.sh)
- [Blueprint Repository](https://github.com/epleaner/agents)

## License

MIT
