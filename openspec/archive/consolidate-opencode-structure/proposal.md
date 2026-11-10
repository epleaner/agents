# Change: Consolidate All Config Under .opencode/

## Why

Currently, yepe scaffolds multiple top-level directories (`AGENTS.md`, `.opencode/`, `openspec/`, `learnings/`). This clutters target repos and makes it unclear what belongs to the agent config system. Consolidating everything under `.opencode/`:
1. Keeps all agent config in one place
2. Makes yepe's footprint obvious (one folder)
3. Enables learnings-based persistence for project-specific customizations

## What Changes

### Directory Restructure (both source and target repos)
- `AGENTS.md` stays at root (copied to `.opencode/AGENTS.md` in target)
- `openspec/` → `.opencode/openspec/`
- `learnings/` → `.opencode/learnings/`

### Final Structure
```
AGENTS.md                    # Root (source repo only)
.opencode/
├── AGENTS.md                # Target repos get it here
├── openspec/                # Spec-driven development
│   ├── AGENTS.md
│   ├── project.md
│   ├── specs/
│   └── changes/
├── learnings/               # Meta-learnings ledgers
│   ├── index.md
│   └── *.md
├── agent/
├── command/
├── skill/
└── templates/
```

### yepe Behavior Changes
- Only copy `.opencode/` folder (plus `AGENTS.md` → `.opencode/AGENTS.md`)
- **Merge, don't replace**: preserve custom agents/skills/commands in target repo
- **Preserve learnings**: never overwrite `learnings/` if entries exist
- **Agent-driven re-application**: after scaffolding, invoke an agent to read promoted learnings and re-apply those edits to the updated base files
- Update `BLUEPRINT_FILES` list to reflect new structure

### self-improve Skill Changes
- **Simplified architecture**: learnings ledgers replace external dependencies
- **Write to learnings**: record insights in `.opencode/learnings/` ledgers
- **Edit directly**: make direct edits to agents/skills/AGENTS.md as appropriate
- Learnings become the single source of truth for meta-insights

## Impact

- **Affected specs**: `portable-config-bundle`
- **Affected code**:
  - `yepe repo: src/init.ts` - new structure, learnings preservation, apply step
  - `yepe repo: src/learnings-templates.ts` - path updates
  - `.opencode/skill/self-improve/skill.md` - explicit learnings writes
  - All files referencing `openspec/` or `learnings/` paths
- **Breaking**: Existing repos using old structure need migration

## Migration

For existing repos (including this source repo):
```bash
# Move directories into .opencode
mv openspec .opencode/openspec
mv learnings .opencode/learnings

# Update any hardcoded paths in scripts/configs
```
