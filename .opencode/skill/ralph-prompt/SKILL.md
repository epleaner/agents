---
name: ralph-prompt
description: Generate autonomous Ralph mode prompts with beads integration and iteration guidance.
---

## What I do
- Transform user task descriptions into Ralph-optimized autonomous prompts
- Inject beads issue tracking directives and completion criteria
- Add iteration guidance and progress checkpoints
- Include safety guards and quality gates
- Generate prompts that work with Ralph's completion detection

## Usage Template
```
Task: <user's task description>
MaxIterations: <optional: override default 50>
BeadsPrefix: <optional: beads issue prefix, default: auto-detect>
IncludeQualityGates: <optional: true|false, default: true>
```

## Process

### 1. Parse User Task
- Extract the core objective from user's description
- Identify if this is a single feature, bug fix, or multi-part epic
- Checkpoint: If task is vague, request clarification before proceeding

### 2. Analyze Beads Context
- Run `bd ready --json` to check for existing related issues
- Run `bd stats --json` to understand current project state
- Decision: If related issues exist, reference them in prompt; otherwise create new tracking structure

### 3. Structure the Prompt
Build the prompt in this order:
1. **Core Task** - Clear, actionable objective
2. **Beads Integration** - Issue tracking directives
3. **Iteration Guidance** - How to make progress across iterations
4. **Completion Criteria** - Explicit markers for Ralph to detect
5. **Quality Gates** - Tests, lints, validation steps
6. **Safety Guards** - What NOT to do

### 4. Inject Ralph-Specific Directives
Add these mandatory sections:
- **Beads workflow**: Create issues for discovered work, update status, close when done
- **Iteration strategy**: Break work into chunks, commit frequently, validate incrementally
- **Completion detection**: Use `- [x] TASK_COMPLETE` marker when all beads issues are closed
- **Progress tracking**: Update beads status after each significant milestone

### 5. Add Quality Gates (if enabled)
Include validation steps:
- Run tests after each implementation chunk
- Run linters before committing
- Verify builds succeed
- Check for unintended side effects

### 6. Format Output
Return the complete Ralph prompt with:
- Clear section headers
- Explicit completion criteria
- Beads integration commands
- Example iteration flow

## Output Format
```markdown
# Ralph Mode Prompt

## Core Objective
<Clear, actionable task description>

## Beads Integration
You MUST use beads for issue tracking throughout this autonomous session:

1. **Initial Setup**
   - Run `bd ready` to check for existing work
   - Create issues for each major component/milestone: `bd create --title="..." --type=task --priority=2`
   - Claim work before starting: `bd update <id> --status=in_progress`

2. **During Iteration**
   - Create new issues as you discover work: `bd create --title="..." --type=task`
   - Update status as you progress: `bd update <id> --status=in_progress`
   - Close issues when complete: `bd close <id>`
   - Run `bd sync` after significant commits

3. **Completion Check**
   - Before marking complete, verify: `bd list --status=open --json`
   - ALL issues must be closed (status=done) before completion

## Iteration Strategy
Break this work into incremental chunks:
- Each iteration should complete ONE atomic unit of work
- Commit after each successful chunk
- Run targeted tests after each implementation
- Update beads status to track progress
- If blocked, create a beads issue and move to next available work

## Completion Criteria
Mark this task complete when ALL of the following are true:
1. All beads issues are closed (`bd list --status=open` returns empty)
2. All tests pass (`npm test` or equivalent)
3. All code is committed and pushed
4. No linter errors remain

**When complete, output this marker:**
```
- [x] TASK_COMPLETE
```

## Quality Gates
<If IncludeQualityGates=true>
After each implementation chunk:
1. Run tests: `npm test` (or project-specific test command)
2. Run linter: `npm run lint` (or project-specific lint command)
3. Verify build: `npm run build` (if applicable)
4. Check git status: Ensure no unintended changes

Do NOT proceed to next chunk if quality gates fail.
</If>

## Safety Guards
- NEVER commit unrelated files (always review `git status` first)
- NEVER use `git add -A` without reviewing changes
- NEVER skip tests or linters
- NEVER push to main/master without PR (unless explicitly requested)
- If uncertain, create a beads issue for human review and continue with other work

## Example Iteration Flow
```
Iteration 1:
  - Run `bd ready`, create issues for: [auth, tests, docs]
  - Claim auth issue: `bd update beads-xxx --status=in_progress`
  - Implement authentication logic
  - Run tests, commit changes
  - Close auth issue: `bd close beads-xxx`

Iteration 2:
  - Claim tests issue: `bd update beads-yyy --status=in_progress`
  - Write tests for authentication
  - Run tests, verify pass
  - Commit changes, close issue: `bd close beads-yyy`

Iteration 3:
  - Claim docs issue: `bd update beads-zzz --status=in_progress`
  - Update documentation
  - Commit changes, close issue: `bd close beads-zzz`
  - Verify all issues closed: `bd list --status=open` (empty)
  - Output: `- [x] TASK_COMPLETE`
```

---

**Task Details:**
<User's original task description>

**Configuration:**
- Max Iterations: <MaxIterations or 50>
- Beads Prefix: <BeadsPrefix or auto-detected>
- Quality Gates: <Enabled|Disabled>
```

## Examples

### Good: Feature Implementation with Beads Tracking

**Input:**
```
Task: Implement user authentication with JWT tokens
MaxIterations: 30
IncludeQualityGates: true
```

**Output:**
```markdown
# Ralph Mode Prompt

## Core Objective
Implement JWT-based user authentication system with login, logout, and token refresh endpoints.

## Beads Integration
You MUST use beads for issue tracking throughout this autonomous session:

1. **Initial Setup**
   - Run `bd ready` to check for existing work
   - Create issues for:
     - `bd create --title="Implement JWT auth middleware" --type=task --priority=2`
     - `bd create --title="Add login/logout endpoints" --type=task --priority=2`
     - `bd create --title="Write auth tests" --type=task --priority=2`
     - `bd create --title="Update API documentation" --type=task --priority=3`
   - Claim first issue: `bd update <id> --status=in_progress`

2. **During Iteration**
   - Create new issues as you discover work
   - Update status as you progress
   - Close issues when complete
   - Run `bd sync` after significant commits

3. **Completion Check**
   - Before marking complete, verify: `bd list --status=open --json`
   - ALL issues must be closed before completion

## Iteration Strategy
Break this work into incremental chunks:
- Iteration 1-5: JWT middleware and token generation
- Iteration 6-10: Login/logout endpoints
- Iteration 11-15: Token refresh logic
- Iteration 16-20: Tests
- Iteration 21-25: Documentation and cleanup

Each iteration should:
- Complete ONE atomic unit of work
- Commit after successful implementation
- Run targeted tests
- Update beads status

## Completion Criteria
Mark this task complete when ALL of the following are true:
1. All beads issues are closed (`bd list --status=open` returns empty)
2. All tests pass (`npm test`)
3. All code is committed and pushed
4. No linter errors remain

**When complete, output this marker:**
```
- [x] TASK_COMPLETE
```

## Quality Gates
After each implementation chunk:
1. Run tests: `npm test`
2. Run linter: `npm run lint`
3. Verify build: `npm run build`
4. Check git status: Ensure no unintended changes

Do NOT proceed to next chunk if quality gates fail.

## Safety Guards
- NEVER commit unrelated files (always review `git status` first)
- NEVER use `git add -A` without reviewing changes
- NEVER skip tests or linters
- NEVER push to main/master without PR
- If uncertain, create a beads issue for human review

## Example Iteration Flow
```
Iteration 1:
  - Create beads issues for auth components
  - Claim JWT middleware issue
  - Implement JWT signing/verification
  - Run tests, commit
  - Close middleware issue

Iteration 2:
  - Claim login endpoint issue
  - Implement POST /auth/login
  - Add validation and error handling
  - Run tests, commit
  - Close login issue

... (continue until all issues closed)

Final Iteration:
  - Verify `bd list --status=open` is empty
  - Run full test suite
  - Push all changes
  - Output: `- [x] TASK_COMPLETE`
```

---

**Task Details:**
Implement JWT-based user authentication system with login, logout, and token refresh endpoints.

**Configuration:**
- Max Iterations: 30
- Beads Prefix: auto-detected
- Quality Gates: Enabled
```

### Bad: Vague Prompt Without Structure

**Input:**
```
Task: Fix the bugs
```

**Output:**
```markdown
# Ralph Mode Prompt

Fix the bugs in the codebase.

Keep working until done.
```

**Problems:**
- ❌ No beads integration directives
- ❌ No completion criteria
- ❌ No iteration strategy
- ❌ Vague objective ("fix the bugs" - which bugs?)
- ❌ No quality gates
- ❌ No safety guards
- ❌ Missing completion marker guidance

**Fix:**
Request clarification from user:
- Which bugs? (provide issue IDs or descriptions)
- What's the expected behavior?
- Are there existing beads issues to reference?

Then generate a structured prompt with specific objectives.

### Edge Case: Single-File Quick Fix

**Input:**
```
Task: Fix typo in README.md line 42
MaxIterations: 5
IncludeQualityGates: false
```

**Output:**
```markdown
# Ralph Mode Prompt

## Core Objective
Fix typo in README.md line 42.

## Beads Integration
For this simple task:
1. Create single issue: `bd create --title="Fix README typo" --type=task --priority=3`
2. Claim it: `bd update <id> --status=in_progress`
3. Fix typo, commit
4. Close issue: `bd close <id>`

## Iteration Strategy
This should complete in 1-2 iterations:
- Iteration 1: Fix typo, commit, close issue
- Iteration 2: Verify and mark complete

## Completion Criteria
Mark complete when:
1. Typo is fixed
2. Change is committed
3. Beads issue is closed

**When complete, output:**
```
- [x] TASK_COMPLETE
```

## Safety Guards
- Review the change before committing
- Ensure only README.md is modified

---

**Task Details:**
Fix typo in README.md line 42.

**Configuration:**
- Max Iterations: 5
- Beads Prefix: auto-detected
- Quality Gates: Disabled (simple fix)
```

**Why this works:**
- Proportional complexity (simple task = simple prompt)
- Still includes beads tracking (even for small tasks)
- Clear completion criteria
- Appropriate iteration budget

## Guidelines

1. **Always include beads integration** - Even for simple tasks, tracking in beads ensures visibility and prevents lost work.

2. **Be explicit about completion** - Ralph needs clear markers. Always include `- [x] TASK_COMPLETE` in completion criteria.

3. **Break down iteration strategy** - Give Ralph a roadmap for how to chunk the work across iterations.

4. **Include safety guards** - Prevent common mistakes (committing unrelated files, skipping tests, etc.).

5. **Scale complexity to task** - Simple tasks get simple prompts; complex tasks get detailed iteration plans.

6. **Reference existing beads issues** - If the user mentions issue IDs or if `bd ready` shows related work, reference them in the prompt.

7. **Quality gates are optional but recommended** - For production code, always include quality gates. For experiments or quick fixes, they can be disabled.

8. **Provide example iteration flow** - Concrete examples help Ralph understand the expected workflow.

9. **Check beads context first** - Always run `bd ready` and `bd stats` to understand current project state before generating prompt.

10. **Validate task clarity** - If the user's task is vague, request clarification before generating the prompt. A vague task will produce a vague prompt and waste iterations.
