# Design: yepe init/pull split with smart detection

## Context
yepe is a blueprint scaffolding tool that copies OpenCode assets from this repository into target projects. Currently, it has a single `init` command that always runs the full onboarding flow, even when updating existing setups. Users want:
1. Faster updates without re-answering setup questions
2. Less manual input for new projects (auto-detect metadata)

## Goals
- Split `init` (full setup) from `pull` (updates only)
- Auto-detect project metadata from common project files
- Maintain backward compatibility with existing `npx @yepe/init` usage
- Support both interactive and non-interactive modes for both commands

## Non-Goals
- Detecting all possible project file formats (focus on top 3: Node.js, Rust, Python)
- Changing the blueprint file structure or merge logic
- Adding new configuration options beyond existing ones

## Decisions

### 1. Command Structure
**Decision:** Use subcommands (`init`, `pull`) instead of flags

**Rationale:**
- Clearer intent: `npx @yepe/init` vs `npx @yepe/pull`
- Easier to document and explain
- Follows common CLI patterns (git, npm, cargo)
- Allows different help text per command

**Alternatives considered:**
- Flag-based: `npx @yepe/init --update-only` - Less discoverable, harder to remember
- Separate packages: `@yepe/init` and `@yepe/pull` - Unnecessary complexity, harder to maintain

### 2. Detection Sources Priority
**Decision:** Check files in this order for each field:

**Project name:**
1. package.json `name` field
2. Cargo.toml `[package] name` field
3. pyproject.toml `[project] name` or `[tool.poetry] name`
4. Directory name (fallback)

**Project description:**
1. package.json `description` field
2. Cargo.toml `[package] description` field
3. pyproject.toml `[project] description` or `[tool.poetry] description`
4. README.md first paragraph (non-heading text)
5. Empty string (fallback)

**Tech stack (for description enhancement):**
1. package.json `dependencies` + `devDependencies` (detect React, Vue, Express, etc.)
2. Cargo.toml `[dependencies]` (detect tokio, actix-web, etc.)
3. pyproject.toml `[project.dependencies]` or `[tool.poetry.dependencies]` (detect FastAPI, Django, etc.)

**Rationale:**
- Covers 90%+ of projects (Node.js, Rust, Python are most common)
- Prioritizes most reliable sources first
- Graceful degradation to directory name/empty
- README parsing is last resort (less structured)

**Alternatives considered:**
- Git config: Too unreliable, often missing or generic
- .git/description: Rarely used
- More file formats (Go, Java, etc.): Diminishing returns, can add later

### 3. Interactive Prompt Behavior
**Decision:** Show detected values as defaults in brackets

**Format:**
```
Project name [detected-value]: <user input or Enter to accept>
```

**Rationale:**
- Standard CLI pattern (used by npm init, cargo init)
- Clear what will be used if user presses Enter
- User can override if detection is wrong
- Works with existing readline interface

**Alternatives considered:**
- Pre-fill input: Harder to implement, less clear
- Show detection separately: More verbose, cluttered output

### 4. Non-Interactive Mode
**Decision:** Use detected values when config not provided

**Behavior:**
- `--non-interactive` without `--config`: Use detection for all fields
- `--non-interactive` with `--config`: Config overrides detection
- Config file can omit fields to use detection

**Rationale:**
- Maximizes automation for CI/CD
- Config file remains optional
- Explicit config always wins (principle of least surprise)

### 5. Pull Command Behavior
**Decision:** `pull` skips onboarding entirely, uses existing project.md

**Flow:**
1. Validate prerequisites (git repo, clean tree)
2. Download blueprint
3. Stage files (detect conflicts)
4. Copy non-conflicting files
5. Skip customization (project.md already exists)
6. Generate report
7. Re-apply learnings
8. Print summary

**Rationale:**
- Assumes project already initialized (has .opencode/openspec/project.md)
- Faster for updates (no prompts)
- Learnings re-application preserves customizations
- If project.md missing, error with helpful message to use `init`

**Alternatives considered:**
- Detect if initialized and auto-route: Too magical, harder to debug
- Merge project.md: Complex, error-prone, not needed

### 6. Backward Compatibility
**Decision:** `npx @yepe/init` with no subcommand defaults to `init` behavior

**Implementation:**
```typescript
// If no subcommand provided, default to init
const command = args[0] || 'init';
```

**Rationale:**
- Existing documentation and scripts continue to work
- Natural default (init is more common for new users)
- Can deprecate later if needed

## Implementation Details

### Detection Module (`src/detect.ts`)
```typescript
export interface DetectedProject {
  name?: string;
  description?: string;
  techStack?: string[];
}

export function detectProject(): DetectedProject {
  return {
    name: detectProjectName(),
    description: detectProjectDescription(),
    techStack: detectTechStack(),
  };
}

function detectProjectName(): string | undefined {
  // Check package.json, Cargo.toml, pyproject.toml
  // Return first found, undefined if none
}

function detectProjectDescription(): string | undefined {
  // Check package.json, Cargo.toml, pyproject.toml, README.md
  // Return first found, undefined if none
}

function detectTechStack(): string[] {
  // Parse dependencies from project files
  // Return array of detected frameworks/libraries
}
```

### CLI Routing (`src/cli.ts`)
```typescript
function parseArgs(): { command: 'init' | 'pull'; options: InitOptions } {
  const args = process.argv.slice(2);
  const command = (args[0] === 'pull' ? 'pull' : 'init') as 'init' | 'pull';
  const optionArgs = command === args[0] ? args.slice(1) : args;
  
  // Parse options from optionArgs
  return { command, options };
}

async function main() {
  const { command, options } = parseArgs();
  
  await validatePrerequisites();
  
  if (command === 'init') {
    await init(options);
  } else {
    await pull(options);
  }
}
```

### Prompts Integration (`src/prompts.ts`)
```typescript
export async function promptProjectInfo(
  blueprintDir: string,
  options: PromptOptions = {}
): Promise<ProjectInfo> {
  // Detect project metadata
  const detected = detectProject();
  
  if (options.nonInteractive) {
    const defaults = getDefaultProjectInfo(detected);
    const config = options.config || {};
    return { ...defaults, ...config };
  }
  
  // Interactive mode with detected defaults
  const name = await question(
    `Project name${detected.name ? ` [${detected.name}]` : ''}: `
  ) || detected.name || '';
  
  // ... similar for other fields
}

function getDefaultProjectInfo(detected?: DetectedProject): ProjectInfo {
  const cwd = process.cwd();
  const dirName = basename(cwd);
  
  return {
    name: detected?.name || dirName,
    description: detected?.description || `${detected?.name || dirName} project`,
    beadsPrefix: (detected?.name || dirName).substring(0, 3).toLowerCase(),
    selectedSkills: [],
  };
}
```

## Risks and Mitigations

### Risk: Detection produces wrong values
**Mitigation:**
- Interactive mode always allows override
- Non-interactive mode can use config file
- Detection is best-effort, not mandatory
- Document which files are checked

### Risk: Pull command used on uninitialized project
**Mitigation:**
- Check for `.opencode/openspec/project.md` existence
- Error with clear message: "Project not initialized. Run `npx @yepe/init` first."
- Exit code 1 for scripting

### Risk: Breaking existing workflows
**Mitigation:**
- Maintain `npx @yepe/init` as default
- No changes to existing flags or behavior
- Document migration path in README
- Version bump to 0.3.0 (minor, not major)

### Risk: README parsing is fragile
**Mitigation:**
- Use simple heuristic (first non-heading paragraph)
- Fallback to empty if parsing fails
- Don't crash on malformed README
- Lowest priority in detection chain

## Migration Plan

### For Users
1. **No action required** - `npx @yepe/init` continues to work
2. **Optional:** Use `npx @yepe/pull` for faster updates
3. **Optional:** Benefit from auto-detection in new projects

### For Documentation
1. Update README.md with both commands
2. Add "When to use init vs pull" section
3. Document detection behavior and sources
4. Update examples to show both flows

### Rollback
If issues arise:
1. Revert to 0.2.0 via npm
2. Detection is additive, no data loss
3. Pull command is new, no existing usage to break

## Open Questions
None - all design decisions finalized.
