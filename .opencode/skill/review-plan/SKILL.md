---
name: review-plan
description: Review and improve task plans using LLM planning best practices
---

## What I do
- Analyze task plans against proven LLM planning principles
- Identify weaknesses in task decomposition, clarity, and dependencies
- Suggest concrete improvements to maximize plan effectiveness
- Score plans on key dimensions (decomposition, specificity, dependencies, etc.)
- Generate actionable recommendations for plan refinement

## Best Practices Checklist

### 1. Task Decomposition ⚙️
**Goal:** Break complex tasks into atomic, manageable, verifiable units

**Check:**
- [ ] Each task is small enough to complete in one focused session (<~100 LOC when applicable)
- [ ] Tasks are hierarchically organized (parent → child relationships clear)
- [ ] Each task has a single, clear objective
- [ ] No task requires "figure it out" - all tasks are concrete
- [ ] Tasks are sized consistently (not mixing 5-minute and 5-hour tasks)

**Red flags:**
- Tasks like "Implement authentication" (too broad)
- Mixing research tasks with implementation tasks
- No clear completion criteria per task

### 2. Step-by-Step Reasoning (Chain of Thought) 🧠
**Goal:** Make the thought process explicit and traceable

**Check:**
- [ ] Rationale explains *why* each task is needed
- [ ] Assumptions are documented explicitly
- [ ] Trade-offs are identified and reasoned through
- [ ] Decision points are marked with justification
- [ ] Alternative approaches are considered and dismissed with reasons

**Red flags:**
- Missing "why" for tasks (only "what")
- Unexplained jumps in logic
- No documented assumptions

### 3. Tree/Graph of Thoughts 🌳
**Goal:** Explore multiple reasoning paths, enable backtracking

**Check:**
- [ ] Alternative approaches are explored in design.md
- [ ] Contingency plans exist for risky tasks
- [ ] Multiple solution paths are compared before selection
- [ ] Rollback/recovery steps are identified
- [ ] Non-linear dependencies are mapped (not just sequential)

**Red flags:**
- Only one approach considered
- No "Plan B" for complex/risky tasks
- Assumes linear execution only

### 4. Reflection and Self-Improvement 🔄
**Goal:** Critique plans before execution, identify issues proactively

**Check:**
- [ ] Plan includes validation checkpoints
- [ ] Potential failure modes are identified
- [ ] Plan has been reviewed against this checklist
- [ ] Review feedback incorporated before finalization
- [ ] Success metrics are measurable

**Red flags:**
- No validation steps
- No risk assessment
- "Happy path" planning only

### 5. Context and Memory 📚
**Goal:** Maintain context across planning steps, reference prior work

**Check:**
- [ ] Prior decisions from related changes are referenced
- [ ] Existing patterns/conventions are followed
- [ ] Related capabilities are cross-referenced
- [ ] Project history informs task breakdown
- [ ] Domain knowledge is captured in design.md

**Red flags:**
- Reinventing existing patterns
- No references to related work
- Missing context from project.md or other specs

### 6. Clear Success Criteria ✅
**Goal:** Define measurable acceptance criteria and validation methods

**Check:**
- [ ] Each task has validation commands (tests, checks, manual steps)
- [ ] Acceptance criteria are objective and measurable
- [ ] "Done" is unambiguous for each task
- [ ] Test scenarios cover requirements
- [ ] Validation can be automated where possible

**Red flags:**
- Vague criteria like "make it work" or "looks good"
- No test commands
- Success depends on subjective judgment

### 7. Specificity and Clarity 🎯
**Goal:** Use concrete, actionable language; avoid ambiguity

**Check:**
- [ ] File paths are specified (not "the config file")
- [ ] Commands are provided (not "run tests")
- [ ] Variable/function names are suggested
- [ ] Examples are included for complex tasks
- [ ] Technical terms are defined or referenced

**Red flags:**
- Vague language: "update the thing", "fix the issue"
- No file paths or line numbers
- Missing examples for complex tasks
- Ambiguous pronouns ("it", "that", "this")

### 8. Dependency Management 🔗
**Goal:** Explicitly state task relationships and ordering

**Check:**
- [ ] Task dependencies are explicit (Task 3 requires Task 1)
- [ ] Parallelizable work is identified
- [ ] Blocking tasks are front-loaded
- [ ] Dependency graph is acyclic (no circular deps)
- [ ] External dependencies are noted (APIs, libraries, people)

**Red flags:**
- No dependency information
- Unclear ordering rationale
- Circular dependencies
- Missing external dependencies

## Usage

### As an Agent
```bash
# Review a proposal's task breakdown
openspec show <change-id> --format json > /tmp/plan.json
.opencode/skill/review-plan/scripts/review-plan /tmp/plan.json

# Review tasks.md directly
.opencode/skill/review-plan/scripts/review-plan openspec/changes/<id>/tasks.md
```

### As a Planner
Before finalizing any OpenSpec proposal:
1. Run the review-plan script on your tasks.md
2. Address all red flags and low scores
3. Iterate until all dimensions score ≥ 4/5
4. Document review findings in proposal.md

## Output Format

```markdown
# Plan Review Report

**Plan ID:** <change-id>
**Reviewed:** <timestamp>

## Overall Score: X/40 (X%)

| Dimension | Score | Notes |
|-----------|-------|-------|
| Task Decomposition | X/5 | ... |
| Step-by-Step Reasoning | X/5 | ... |
| Tree/Graph of Thoughts | X/5 | ... |
| Reflection | X/5 | ... |
| Context & Memory | X/5 | ... |
| Success Criteria | X/5 | ... |
| Specificity & Clarity | X/5 | ... |
| Dependency Management | X/5 | ... |

## Critical Issues
- [ ] Issue 1: description, location, fix
- [ ] Issue 2: ...

## Recommendations
1. **Task Decomposition:** [specific improvements]
2. **Dependencies:** [specific improvements]
3. **Validation:** [specific improvements]

## Strengths
- What the plan does well

## Next Steps
- [ ] Address critical issues
- [ ] Re-run review after fixes
- [ ] Validate with `openspec validate <id> --strict`
```

## Example: Before/After Review

### Before (Score: 18/40 - 45%)
```markdown
## Tasks
1. Implement authentication
2. Add user profile
3. Fix bugs
4. Update docs
```

**Issues:**
- ❌ Too broad (Task 1 could be 20 subtasks)
- ❌ No validation steps
- ❌ No dependencies specified
- ❌ Vague language ("fix bugs")
- ❌ No success criteria

### After (Score: 36/40 - 90%)
```markdown
## Tasks

### Phase 1: Authentication Foundation (Tasks 1-3, no dependencies)
1. **Add auth middleware to Express app**
   - File: `src/middleware/auth.ts`
   - Add JWT validation middleware
   - Validation: `npm test -- auth.test.ts`
   - Success: Middleware rejects invalid tokens

2. **Create user session store**
   - File: `src/services/session.ts`
   - Implement Redis-backed session storage
   - Validation: `npm test -- session.test.ts`
   - Success: Sessions persist across server restarts

3. **Add login endpoint**
   - File: `src/routes/auth.ts`
   - POST /auth/login with email/password
   - Validation: `curl -X POST localhost:3000/auth/login -d '{"email":"test@example.com","password":"test"}'`
   - Success: Returns JWT token on valid credentials

### Phase 2: User Profile (Tasks 4-5, requires Task 2)
4. **Add user profile schema**
   - File: `src/models/user.ts`
   - Add firstName, lastName, avatarUrl fields
   - Validation: `npm run typecheck`
   - Success: TypeScript compiles without errors

5. **Create profile endpoint**
   - File: `src/routes/profile.ts`
   - GET /profile (requires auth from Task 1)
   - Validation: `npm test -- profile.test.ts`
   - Success: Returns user profile for authenticated requests

### Phase 3: Bug Fixes (Task 6, no dependencies)
6. **Fix token refresh race condition**
   - File: `src/middleware/auth.ts:45`
   - Add mutex lock around refresh logic
   - Validation: `npm test -- auth-concurrency.test.ts`
   - Success: Concurrent requests don't trigger duplicate refreshes

### Phase 4: Documentation (Task 7, requires all above)
7. **Update API documentation**
   - File: `docs/api/authentication.md`
   - Document all new endpoints with examples
   - Validation: Manual review of rendered docs
   - Success: All endpoints have curl examples and response schemas
```

**Improvements:**
- ✅ Tasks broken into atomic units
- ✅ File paths specified
- ✅ Validation commands provided
- ✅ Dependencies mapped (phases)
- ✅ Clear success criteria
- ✅ Concrete, actionable language

## Integration with Propose-New Skill

The `propose-new` skill should automatically invoke `review-plan` before step 8 (Validate):

```
7. Draft Tasks
   - Create tasks.md with ordered work items
   - Run review-plan to validate task quality
   - Iterate on tasks until review score ≥ 4/5 on all dimensions

8. Validate
   - Run openspec validate <id> --strict
   - Resolve issues
```

## Guidelines
1. Be strict in reviews - better to catch issues now than during implementation
2. Score each dimension independently (don't let strong areas inflate weak ones)
3. Provide file-specific, actionable recommendations
4. Prioritize critical issues (3+ red flags = must fix before proceeding)
5. Re-review after fixes to confirm improvements
