---
description: Chain Planner → Builder → QA → Release → PM with todo enforcement and logged skill usage.
---
Run this workflow when the user requests feature work that spans planning through release. Follow each step in order; do not advance until the exit criteria are satisfied and todos are closed.

1. **Orchestrator**
   - Confirm active beads issue + OpenSpec change, sync todos, and share scope.
   - Spawn `@planner` with acceptance criteria and outstanding questions.
   - Log a knowledge-graph entry (`workflow: feature-development`, phase: orchestrator).
2. **Planner**
   - Read proposal/tasks/specs, run `openspec list/show` as needed, and draft a numbered plan (<7 steps) citing files/tests.
   - Record clarifying questions plus required skills; log plan summary to beads + action-items.
   - Hand off to Orchestrator with explicit success criteria.
3. **Builder**
   - Execute the plan incrementally, updating todos as work completes.
   - Delegate `@researcher`, `@debugger`, or `@writer` when extra context, diagnostics, or docs are needed.
   - Run targeted tests, summarize output, and stop editing once implementation + self-checks pass.
   - Log each skill invocation (exa/context7/knowledge-graph/action-items) with beads/change IDs.
4. **QA**
   - Run lint/tests/Playwright per plan.
   - Note commands + results, capturing failures as todos/action-items linked to beads.
   - Only mark QA complete after all checks pass and working tree is clean.
5. **Release**
   - Verify git status, stage changes, propose commit/PR, and (optionally) trigger cloud deploys via `cloud-deploy`.
   - Update `github-review`, `slack-notify`, and knowledge-graph with deployment + CI status.
   - Refuse to proceed if QA or todos remain open.
6. **Meta-Agent**
   - Review transcripts, beads comments, todo lists, and spec diffs to identify recurring friction, tooling gaps, or policy drift that surfaced during the run.
   - Require that improvement todos, beads issues, or OpenSpec proposals are filed (or resolved) before approving handoff; document evidence links for each action.
   - Log a knowledge-graph entry summarizing the improvement actions and announce key updates via `slack-notify` so downstream sessions inherit the fixes.
7. **PM**
   - Sync beads/OpenSpec status, update Jira/Linear via skills, and send Slack recap.
   - Close or reassign action items; document residual risk and confirm todo list empty (including Meta-Agent follow-ups).

**Exit Criteria**
- Todos/action-items are complete, beads/OpenSpec updated, QA + Release sign-offs recorded, Meta-Agent improvements logged, and knowledge-graph entries exist for every phase.
- If any step fails, Orchestrator loops back to the responsible agent (or spawns `@debugger`/`@meta-agent`) before retrying downstream phases.

**Validation Checklist**
- Dry-run `/workflow feature-development` after editing agent files by narrating each phase (Orchestrator through Meta-Agent + PM) and confirming the new instructions cover responsibilities, skills, escalation paths, and improvement checkpoints.
- Capture the dry-run summary in the knowledge graph (source: workflow-doc, tags: `feature-development`, `codex-multi-agent-suite`, `meta-agent`) and ensure improvement actions/todos are documented before sign-off.
