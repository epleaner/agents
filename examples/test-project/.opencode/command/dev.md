---
description: Run the feature development workflow from planning through implementation.
---
Run the feature development workflow for the specified work. This chains planning, building, QA, and release steps.

<UserRequest>
  $ARGUMENTS
</UserRequest>

**Workflow Steps**

1. **Plan** (use `plan` skill or `/plan`)
   - Confirm scope, break down into tasks, identify acceptance criteria.
   - Ask clarifying questions if requirements are ambiguous.

2. **Build**
   - Execute the plan incrementally, updating todos as work completes.
   - Use `research` skill for documentation lookups.
   - Use `debugger` skill for tricky failures.
   - Run targeted tests after each chunk of work.

3. **QA** (use `qa` skill)
   - Run linters, tests, and formatters.
   - Record results and fix any issues.
   - Ensure working tree is clean before proceeding.

4. **Release** (use `release` skill)
   - Prepare clean git state, summarize diffs.
   - Propose commit messages aligned with project guidelines.
   - Create PR if needed.

5. **Reflect** (use `self-improve` skill)
   - Note any friction, tooling gaps, or process improvements.
   - File issues or update docs for systemic fixes.

**Exit Criteria**
- All tasks complete and tests passing.
- Working tree clean, changes committed.
- Any friction points documented for future improvement.
