<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

# Agent Instructions

This project uses **bd** (beads) for issue tracking. Run `bd onboard` to get started.

## Quick Reference

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --status in_progress  # Claim work
bd close <id>         # Complete work
bd sync               # Sync with git
```

## Using Beads and OpenSpec Together

1. **Start with beads**: every task must have an issue. Use `bd ready`/`bd create` to select or add work, then claim it via `bd update <id> --status in_progress` before making spec changes.
2. **Decide if OpenSpec is required**: when work implies a new capability, architecture shift, or ambiguous change, run `openspec list`, `openspec spec list --long`, and read `openspec/project.md` to confirm whether a proposal/delta already exists.
3. **Create/associate change IDs**: note the beads issue ID inside the OpenSpec `proposal.md` (and vice versa) so status updates stay linked. Use verb-led `change-id`s and keep them scoped to a single beads issue whenever possible.
4. **Work in lockstep**:
   - Draft proposal/tasks/spec deltas under `openspec/changes/<change-id>/`.
   - Track progress using beads statuses (`in_progress`, `review`, `done`) and mirror the same milestones in `tasks.md`.
   - Before implementation, run `openspec validate <change-id> --strict` and attach the output or summary back to the beads issue.
5. **Close out**: when the change is merged/deployed, archive the OpenSpec change if required and move the beads issue to `done`. Run `bd sync` so git commits and beads metadata stay aligned.

> Tip: if you are unsure whether a task needs an OpenSpec proposal, leave a beads comment with your reasoning and ask for guidance before continuing.

## Landing the Plane (Session Completion)

**When ending a work session**, you MUST complete ALL steps below. Work is NOT complete until `git push` succeeds.

**MANDATORY WORKFLOW:**

1. **File issues for remaining work** - Create issues for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **PUSH TO REMOTE** - This is MANDATORY:
   ```bash
   git pull --rebase
   bd sync
   git push
   git status  # MUST show "up to date with origin"
   ```
5. **Clean up** - Clear stashes, prune remote branches
6. **Verify** - All changes committed AND pushed
7. **Hand off** - Provide context for next session

**CRITICAL RULES:**
- Work is NOT complete until `git push` succeeds
- NEVER stop before pushing - that leaves work stranded locally
- NEVER say "ready to push when you are" - YOU must push
- If push fails, resolve and retry until it succeeds

