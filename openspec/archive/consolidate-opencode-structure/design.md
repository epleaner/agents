# Design: Consolidate OpenCode Structure

## Context

yepe is a blueprint installer that copies agent configuration to target repos. Currently it scatters files across multiple top-level locations. Users want project-specific customizations to persist across yepe updates without complex merge logic.

## Goals
- Single `.opencode/` folder contains all agent config
- Learnings serve as the persistence layer for project-specific context
- yepe is stateless—scaffolds core, reads learnings, applies them
- No merge conflicts on re-runs (learnings preserved, core overwritten)

## Non-Goals
- Deep YAML merging of agent configs
- Manifest-based file tracking
- Backward compatibility with old structure (migration required)

## Decisions

### 1. Directory Structure

**Decision**: Consolidate under `.opencode/` without hidden prefixes

**Both source and target repos:**
```
AGENTS.md                  # Root (source only, target gets it in .opencode/)
.opencode/
├── AGENTS.md              # Target repos get it here
├── openspec/              # Spec-driven development
│   ├── AGENTS.md
│   ├── project.md
│   ├── specs/
│   └── changes/
├── learnings/             # Meta-learnings ledgers
│   ├── index.md
│   ├── meta-learnings.md
│   ├── recurring-tasks.md
│   ├── failures-and-resolutions.md
│   └── candidate-automations.md
├── agent/
├── command/
├── skill/
└── templates/
```

**Rationale**: 
- Single consistent structure for both source and target repos
- No hidden prefixes—directories are visible and discoverable
- `AGENTS.md` stays at root in source for visibility, copied into `.opencode/` for targets

### 2. Learnings Preservation

**Decision**: Check for non-empty entries before overwriting

```typescript
function hasLearningsEntries(dir: string): boolean {
  const indexPath = join(dir, '.opencode/learnings/index.md');
  if (!existsSync(indexPath)) return false;
  
  const content = readFileSync(indexPath, 'utf-8');
  // Check if entries table has real entries (not just "_No entries yet_")
  return !content.includes('_No entries yet_') && 
         (content.includes('| ML-') || content.includes('| RT-') || 
          content.includes('| FR-') || content.includes('| CA-'));
}
```

If entries exist, skip scaffolding `learnings/` entirely.

### 3. Agent-Driven Learnings Re-Application

**Decision**: After scaffolding, yepe invokes an agent to re-apply learnings

Learnings are a ledger of what was changed and why. When yepe updates base config, an agent reads the learnings and re-applies those edits to the fresh base files.

**Flow:**
1. yepe scaffolds/updates `.opencode/` (overwrites base files)
2. yepe preserves `learnings/` (never overwrites if entries exist)
3. yepe invokes an agent with prompt:
   ```
   Read all promoted entries in .opencode/learnings/.
   For each entry, re-apply the edit described in "Recommended Action" 
   to the file(s) in "Follow-up Links".
   ```
4. Agent reads learnings, understands the edits, applies them to updated base files

**Example learning entry:**
```markdown
### [ML-20260107-001] Orchestrator should delegate meeting queries
- Status: promoted
- Recommended Action: Add to orchestrator.md guidance section: "For meeting questions, delegate to @fathom subagent"
- Follow-up Links: .opencode/agent/orchestrator.md
```

After yepe updates `orchestrator.md` with latest base, the agent reads this learning and edits `orchestrator.md` to add that guidance back.

**Why agent-driven:**
- Human-readable learnings, no rigid patch format
- Agent understands context and can adapt edits to new base structure
- Same approach works for any type of change (agents, skills, AGENTS.md, etc.)

### 4. yepe Scaffold Logic

**Decision**: yepe merges base config with existing custom files

```typescript
// Source → Target mapping
const SCAFFOLD_MAP = {
  '.opencode/':      '.opencode/',           // Merge (includes openspec/, learnings/)
  'AGENTS.md':       '.opencode/AGENTS.md',  // Copy root file into .opencode
};

// Directories that support custom additions
const MERGEABLE_DIRS = ['agent', 'skill', 'command'];
```

**Merge behavior:**

1. **For mergeable directories** (agent/, skill/, command/):
   - Identify base files (from blueprint) vs custom files (not in blueprint)
   - Update base files with new versions
   - Preserve custom files untouched

2. **For other directories** (templates/, openspec/):
   - Overwrite with base (these are system files)

3. **For learnings/**:
   - Skip if entries exist (preserve project history)
   - Copy templates if empty/missing

```typescript
function mergeDirectory(sourceDir: string, targetDir: string, dirName: string): void {
  const isMergeable = MERGEABLE_DIRS.includes(dirName);
  
  if (isMergeable) {
    // Get list of base files from blueprint
    const baseFiles = new Set(readdirSync(sourceDir));
    
    // Copy/update only base files, leave custom files alone
    for (const file of baseFiles) {
      copyFileSync(join(sourceDir, file), join(targetDir, file));
    }
  } else {
    // Full overwrite for system directories
    copyDirSync(sourceDir, targetDir);
  }
}
```

**Identifying base vs custom:**
- Option A: Track base files in a manifest (`.opencode/.yepe-manifest.json`)
- Option B: Use naming convention (base files have no prefix, custom use `custom-` or project prefix)

Recommendation: **Option A (manifest)** - more reliable, no naming constraints on users.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Breaking existing repos | Provide migration script in proposal |
| Hidden dirs harder to discover | Document in AGENTS.md, keep main AGENTS.md visible |
| Learnings parsing fragile | Use structured format with clear markers |

## Resolved Questions

1. **AGENTS.md location**: Stays at repo root in source, copied to `.opencode/AGENTS.md` in target repos.

2. **Auto-migration**: No. Require explicit migration to avoid surprises.
