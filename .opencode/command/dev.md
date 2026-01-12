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

2. **Build** (with Reflexion)
   - Execute the plan incrementally, updating todos as work completes.
   - Use `research` skill for documentation lookups.
   - Use `debugger` skill for tricky failures.
   - **After each task**: Run reflexion loop (quality gates → critic → revise if needed)
   - Max 3 reflexion iterations per task; escalate if still failing.

3. **QA** (use `qa` skill, with Reflexion)
   - Run linters, tests, and formatters.
   - Record results and fix any issues.
   - **Reflexion**: If QA fails, critique output and revise.
   - Ensure working tree is clean before proceeding.

4. **Release** (use `release` skill)
   - Prepare clean git state, summarize diffs.
   - Propose commit messages aligned with project guidelines.
   - Create PR if needed.

5. **Reflect** (use `self-improve` skill)
   - Note any friction, tooling gaps, or process improvements.
   - File issues or update docs for systemic fixes.
   - **Log reflexion metrics**: acceptance rate, escalation rate, avg iterations.

**Exit Criteria**
- All tasks complete and tests passing.
- Working tree clean, changes committed.
- Any friction points documented for future improvement.
