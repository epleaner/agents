<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/.opencode/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/.opencode/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

# Agent Instructions

## Communication Style (All Agents)

**Be direct. No preambles. No filler.**

- Lead with the answer, not context
- Skip phrases like "I'll help you with...", "Let me...", "Sure!", "Great question!"
- No "In summary" or "To summarize" - just state the conclusion
- Omit politeness padding - clarity over friendliness
- If context is needed, put it after the answer in a brief note
- **Don't ask for permission to do your job** - if you're the planner and need a spec, create the OpenSpec proposal immediately. If you're the builder and need to implement, implement.
- **All specs must be in OpenSpec format** - NEVER create standalone specs outside the OpenSpec framework.

**Bad:** "I'll help you find that information. Let me search through the meeting transcripts. After reviewing the data, I found that... In summary, the answer is X."

**Good:** "The answer is X." (then optional brief context if needed)

**Bad (planner):** "Should I proceed with creating the OpenSpec proposal?"

**Good (planner):** "Creating OpenSpec proposal now..."

---

This project uses **bd** (beads) for issue tracking. Run `bd onboard` to get started.

## Using This Repository as a Blueprint

This repository can be used as a blueprint for other projects using **yepe**:

```bash
# In your target repository
npx @yepe/init

# Or without Node.js
curl -fsSL https://yepe.dev/install.sh | bash
```

yepe copies the following assets into `.opencode/`:
- **AGENTS.md** - AI assistant instructions (copied to `.opencode/AGENTS.md`)
- **agent/** - Agent definitions
- **command/** - Slash commands
- **skill/** - Specialized capabilities
- **openspec/** - Change proposal framework
- **learnings/** - Meta-learnings ledgers

For more information, see the [yepe documentation](packages/yepe/README.md).

## Quick Reference

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --status in_progress  # Claim work
bd close <id>         # Complete work
bd sync               # Sync with git
```

## Agents

This project uses 5 agents:

| Agent | Purpose |
| --- | --- |
| **orchestrator** | Primary coordinator that sequences planning, building, and release |
| **planner** | Creates OpenSpec proposals with tasks, spec deltas, and validation criteria |
| **builder** | Implementation agent that executes plans using skills |
| **researcher** | Read-only research agent for documentation and context lookups |
| **fathom** | Meeting assistant for transcripts, action items, and Q&A on recordings |

## Commands

| Command | Description |
| --- | --- |
| `/research` | Look up documentation, APIs, or context |
| `/plan` | Break down work into actionable steps (creates OpenSpec proposals) |
| `/dev` | Run the full development workflow |
| `/fathom` | Work with Fathom meeting recordings, transcripts, and action items |

## Skills

Skills are specialized capabilities that agents can invoke:

| Skill | Purpose |
| --- | --- |
| `research` | Documentation, API, and context lookups |
| `debugger` | Reproduce failures and propose fixes |
| `qa` | Run linters, tests, and formatters |
| `release` | Git hygiene, commits, and PRs |
| `writer` | Documentation and release notes |
| `pm` | Sync beads, Jira/Linear, Slack status |
| `self-improve` | Reflect on friction and file improvements |
| `propose-new` | Create OpenSpec proposals |
| `propose-go` | Implement proposals |
| `propose-close` | Archive completed proposals |
| `review-plan` | Review and improve task plans against LLM planning best practices |

### External Skills

| Skill | Purpose |
| --- | --- |
| `exa-search`, `context7-docs` | Research APIs/docs |
| `fathom-list-meetings` | List Fathom meetings in a date range |
| `fathom-get-transcript` | Fetch transcript for a specific meeting |
| `fathom-notes` | Pull meeting transcripts + action items |
| `slack-notify` | Broadcast status updates |
| `jira-lookup`, `jira-update`, `linear-sync` | Sync external trackers |
| `action-items` | Create/escalate todos with owners |
| `cloud-deploy` | Package + deploy bundles |

## Beads Performance Troubleshooting

If `bd` commands are slow (>1 second), run diagnostics:

```bash
bd doctor              # Check for issues
```

**Common issues and fixes:**

1. **"Daemon took too long to start" or "LEGACY DATABASE DETECTED"**
   - **Symptom:** Commands take 5+ seconds, daemon falls back to direct mode
   - **Cause:** Database missing repository fingerprint (pre-v0.17.5 schema)
   - **Fix:** `bd migrate --update-repo-id`
   - **Expected improvement:** 90%+ faster (5s → 0.3s)

2. **"Database out of sync" in sandboxed environments**
   - **Symptom:** Daemon permission errors, sync conflicts
   - **Cause:** Sandboxed environments (Claude Code, containers) restrict daemon
   - **Fix:** Use `--sandbox` flag or `export BEADS_NO_DAEMON=1`

3. **Git worktree conflicts**
   - **Symptom:** Commits to wrong branch, shared database state issues
   - **Cause:** Daemon mode doesn't support git worktrees
   - **Fix:** `export BEADS_NO_DAEMON=1` when using worktrees

4. **Outdated CLI version**
   - **Check:** `bd --version` vs `bd doctor` output
   - **Fix:** `brew upgrade bd` (macOS) or check installation docs

**Performance expectations:**
- **With daemon:** 50-300ms for most commands
- **Without daemon (direct mode):** 1-5s for most commands
- **Daemon startup:** <1s (if >5s, check for legacy database issue)

## Meta-Learnings Workflow

- Capture operational/meta insights under `.opencode/learnings/` using the required template for each ledger.
- Update `.opencode/learnings/index.md` whenever you add or modify an entry so other agents can quickly find status, owners, and follow-up links.
- Before closing a session, run the `self-improve` skill's review-learnings script:
  ```bash
  .opencode/skill/self-improve/scripts/review-learnings
  ```
  - Lists entries in `new`, `needs-agents-update`, or `needs-spec-change` states.
  - Prompts you to adjust status/owners/follow-up links and writes the updates back to both the ledger and index.
- When an entry requires action, immediately promote it by updating the relevant AGENTS section, filing a beads issue, or drafting an OpenSpec change. Always reference the ledger entry ID in those follow-ups and mark the entry as `promoted` once done.

## Using Beads and OpenSpec Together

1. **Start with beads**: every task must have an issue. Use `bd ready`/`bd create` to select or add work, then claim it via `bd update <id> --status in_progress` before making spec changes.
2. **Decide if OpenSpec is required**: when work implies a new capability, architecture shift, or ambiguous change, run `openspec list`, `openspec spec list --long`, and read `.opencode/openspec/project.md` to confirm whether a proposal/delta already exists.
3. **Create/associate change IDs**: note the beads issue ID inside the OpenSpec `proposal.md` (and vice versa) so status updates stay linked. Use verb-led `change-id`s and keep them scoped to a single beads issue whenever possible.
4. **Work in lockstep**:
   - Use `propose-new` skill to draft proposal/tasks/spec deltas under `.opencode/openspec/changes/<change-id>/`.
   - Track progress using beads statuses (`in_progress`, `review`, `done`) and mirror the same milestones in `tasks.md`.
   - Before implementation, run `openspec validate <change-id> --strict` and attach the output or summary back to the beads issue.
5. **Close out**: when the change is merged/deployed, use `propose-close` skill to archive the OpenSpec change and move the beads issue to `done`. Run `bd sync` so git commits and beads metadata stay aligned.

> Tip: if you are unsure whether a task needs an OpenSpec proposal, leave a beads comment with your reasoning and ask for guidance before continuing.

## Git Commit Hygiene

**NEVER commit unrelated files.** Each commit must contain only changes for the current task.

**MANDATORY before every commit:**
1. Run `git status` and review ALL modified/untracked files
2. Identify which files are related to the current task
3. Stage ONLY task-related files using explicit paths:
   ```bash
   git add path/to/file1.ts path/to/file2.ts
   ```
4. If unrelated changes exist, leave them unstaged or stash them

**NEVER use:**
- `git add -A` or `git add .` without first reviewing `git status`
- These commands stage everything, including unrelated work

**If you accidentally staged unrelated files:**
```bash
git reset HEAD path/to/unrelated/file
```

## Ralph Mode (Autonomous Orchestration)

Ralph mode enables autonomous multi-iteration agent execution using the Ralph Wiggum technique.

```bash
# Run autonomous multi-iteration agent loop
.opencode/scripts/ralph-orchestrator.sh --prompt task.md --max-iterations 30

# With verbose output
.opencode/scripts/ralph-orchestrator.sh --prompt task.md --verbose

# Dry run (test without executing)
.opencode/scripts/ralph-orchestrator.sh --prompt task.md --dry-run

# Resume interrupted session
.opencode/scripts/ralph-orchestrator.sh --resume ralph-2026-01-08-103045

# Rollback to checkpoint
.opencode/scripts/ralph-orchestrator.sh --rollback-to 10
```

**Completion markers** - Include one of these in agent output to signal completion:
- `- [x] TASK_COMPLETE` (markdown checkbox)
- `RALPH_COMPLETE` (magic string)

**Configuration** - Copy `.opencode/templates/ralph.yml` to project root and customize.

**Cross-session context**:
- Local sessions: `.opencode/ralph/sessions.md` (gitignored)
- Shared learnings: `.opencode/ralph/meta-learnings.md` (committed)

See: `.opencode/openspec/changes/add-ralph-mode/design.md` for full documentation.

## Landing the Plane (Session Completion)

**When ending a work session**, you MUST complete ALL steps below. Work is NOT complete until `git push` succeeds.

**MANDATORY WORKFLOW:**

1. **File issues for remaining work** - Create issues for anything that needs follow-up
2. **Run quality gates** (if code changed) - Use `qa` skill for tests, linters, builds
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
7. **Reflect** - Use `self-improve` skill to capture friction and improvements
8. **Hand off** - Provide context for next session

**CRITICAL RULES:**
- Work is NOT complete until `git push` succeeds
- NEVER stop before pushing - that leaves work stranded locally
- NEVER say "ready to push when you are" - YOU must push
- If push fails, resolve and retry until it succeeds
