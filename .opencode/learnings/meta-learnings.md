# Meta Learnings Ledger

This ledger records session-level observations about agent workflows, coordination patterns, and opportunities to improve instructions.

## Entry Template
Use the following structure for every entry. Replace angle-bracket placeholders and keep the ordering identical so tooling (e.g., `bin/review-learnings`) can parse the fields.

```
### [ENTRY_ID] <concise title>
- Date: YYYY-MM-DD
- Session: <session identifier or transcript link>
- Knowledge Type: meta
- Meta Category: meta-learning
- Owner: <agent responsible for follow-up>
- Status: new|needs-agents-update|needs-spec-change|in-progress|promoted|closed
- Related IDs: beads-xxx, change-yyy (comma-separated or `none`)
- Summary: <1–3 sentences describing the insight>
- Recommended Action: <what should change>
- Supporting Links: <transcripts, AGENTS diffs, etc.>
- Follow-up Links: <AGENTS/spec updates, beads issues, etc.>
```

**IDs:** Use `ML-YYYYMMDD-###` (e.g., `ML-20260105-001`). Each entry must also be referenced from `.opencode/learnings/index.md` once recorded.

## Entries

### [ML-20260107-001] Orchestrator should delegate meeting queries to fathom subagent
- Date: 2026-01-07
- Session: orchestrator session - fathom meeting query
- Knowledge Type: meta
- Meta Category: meta-learning
- Owner: orchestrator
- Status: promoted
- Related IDs: none
- Summary: Orchestrator used fathom skills directly instead of delegating to @fathom subagent, resulting in verbose intermediate output visible to user. Meeting queries should be delegated so the subagent handles fetching internally and returns only the direct answer.
- Recommended Action: Update orchestrator guidance to mandate delegation to @fathom for meeting questions.
- Supporting Links: session transcript
- Follow-up Links: .opencode/agent/orchestrator.md updated

### [ML-20260107-002] Agent responses need direct communication style
- Date: 2026-01-07
- Session: orchestrator session - fathom meeting query
- Knowledge Type: meta
- Meta Category: meta-learning
- Owner: all agents
- Status: promoted
- Related IDs: none
- Summary: Agent responses included unnecessary preambles ("I'll help you...", "Let me..."), politeness padding, and "In summary" conclusions that buried the actual answer. Users want direct answers first, optional context second.
- Recommended Action: Add communication style guidelines to AGENTS.md requiring direct answers without preambles or filler.
- Supporting Links: session transcript
- Follow-up Links: AGENTS.md updated with Communication Style section, .opencode/agent/orchestrator.md updated

### [ML-20260107-003] Proposal process needs assumption clarification step
- Date: 2026-01-07
- Session: consolidate-opencode-structure implementation
- Knowledge Type: meta
- Meta Category: meta-learning
- Owner: planner
- Status: promoted
- Related IDs: none
- Summary: During the consolidate-opencode-structure proposal, there were ~4 exchanges to clarify how learnings re-application works (agent-driven vs programmatic). The proposal was drafted before fully understanding the user's intent.
- Recommended Action: Update propose-new skill to include explicit "clarify assumptions" step before drafting design.md. Ask 1-2 targeted questions when the mechanism is ambiguous.
- Supporting Links: session transcript
- Follow-up Links: .opencode/skill/propose-new/skill.md updated with step 2 "Clarify Assumptions"

### [ML-20260107-004] yepe needs non-interactive mode for testing
- Date: 2026-01-07
- Session: consolidate-opencode-structure integration testing
- Knowledge Type: meta
- Meta Category: meta-learning
- Owner: builder
- Status: promoted
- Related IDs: none
- Summary: Could not run yepe init in automated testing because interactive prompts blocked execution. Had to manually simulate the scaffold instead of testing the actual yepe flow.
- Recommended Action: Add --non-interactive flag to yepe CLI that accepts a JSON config file or uses sensible defaults.
- Supporting Links: integration test in examples/test-project/
- Follow-up Links: packages/yepe/src/cli.ts, packages/yepe/src/prompts.ts, packages/yepe/README.md

### [ML-20260107-005] Planner must NEVER create standalone specs - all specs must be OpenSpec proposals
- Date: 2026-01-07
- Session: ralph-mode research and proposal
- Knowledge Type: meta
- Meta Category: meta-learning
- Owner: planner
- Status: promoted
- Related IDs: change-add-ralph-mode
- Summary: Planner agent created detailed standalone spec for Ralph Wiggum mode instead of recognizing it as a new capability requiring OpenSpec proposal. User had to ask "shouldn't this be in openspec?" to trigger the correct workflow. Additionally, planner was asking for permission before creating OpenSpec proposals instead of just creating them.
- Recommended Action: MANDATORY RULES: (1) Planner should NEVER create standalone specs - ALL specs must be OpenSpec proposals. (2) Planner should NOT ask for permission before creating OpenSpec proposals - just create them immediately. (3) New capabilities, breaking changes, architecture shifts, or ambiguous work ALWAYS require OpenSpec - make it the default, not optional.
- Supporting Links: session transcript
- Follow-up Links: .opencode/agent/planner.md, AGENTS.md Communication Style section

### [ML-20260107-006] Agents must review staged files before committing
- Date: 2026-01-07
- Session: yepe simplification
- Knowledge Type: meta
- Meta Category: meta-learning
- Owner: orchestrator
- Status: promoted
- Related IDs: none
- Summary: Used `git add -A` without reviewing what was being staged, accidentally committing unrelated `add-ralph-mode` change proposal files alongside the yepe simplification changes. This polluted commit history with mixed concerns.
- Recommended Action: Update AGENTS.md git workflow to: (1) NEVER use `git add -A` or `git add .` blindly. (2) Always review `git status` output before staging. (3) Stage only files related to the current task. (4) Use explicit file paths or patterns when staging.
- Supporting Links: session transcript
- Follow-up Links: AGENTS.md "Git Commit Hygiene" section added

### [ML-20260107-007] Planner must distinguish "research requirements" from "explore codebase"
- Date: 2026-01-07
- Session: qa skill enhancement planning
- Knowledge Type: meta
- Meta Category: meta-learning
- Owner: planner
- Status: promoted
- Related IDs: none
- Summary: When user said "do research on testing best practices", planner used explore agent to analyze codebase test files instead of using researcher agent + Exa to fetch external documentation and best practices. "Research" in planning context should mean external docs/APIs/patterns, not codebase exploration.
- Recommended Action: Update planner.md workflow step 2 to clarify: "Research = external documentation, APIs, best practices (use researcher agent + Exa). Codebase exploration = understanding current implementation (use explore agent or direct file reads)."
- Supporting Links: session transcript
- Follow-up Links: .opencode/agent/planner.md updated with step 2/3 clarification

### [ML-20260107-008] Planner must research best practices before answering questions
- Date: 2026-01-07
- Session: backpropagation workflow discussion + self-improve reflection
- Knowledge Type: meta
- Meta Category: meta-learning
- Owner: planner
- Status: promoted
- Related IDs: none
- Summary: When user asks planner a question (e.g., "what's the best way to..."), planner should ALWAYS delegate to researcher sub-agent first to gather best practices, API patterns, and prior art before formulating an answer. Currently planner may answer directly without research, missing opportunities to incorporate authoritative sources.
- Recommended Action: Update planner.md workflow to mandate: "When answering ANY planning question, FIRST delegate to researcher sub-agent to gather best practices, patterns, and documentation. THEN synthesize the research into your answer."
- Supporting Links: session transcript
- Follow-up Links: .opencode/agent/planner.md updated with mandatory research step 2

### [ML-20260107-009] Self-improve skill needs focus parameter and tool requirements documentation
- Date: 2026-01-07
- Session: self-improve reflection on backpropagation + self-improve invocation
- Knowledge Type: meta
- Meta Category: meta-learning
- Owner: builder
- Status: promoted
- Related IDs: none
- Summary: Self-improve skill was invoked in orchestrator context without bash/write/edit tools, preventing it from actually applying fixes. Additionally, user wanted to provide focus guidance ("if i give arguments, focus on those") but skill didn't accept parameters. Skill needed: (1) documentation of required tools, (2) graceful degradation to document-only mode, (3) optional focus parameter for targeted reflection.
- Recommended Action: Update self-improve skill.md to: (1) document required tools (bash, write, edit), (2) add document-only mode when tools unavailable, (3) add optional focus parameter for user-guided reflection.
- Supporting Links: session transcript
- Follow-up Links: .opencode/skill/self-improve/skill.md updated with Required Tools section, Focus Parameter section, and updated guidelines

### [ML-20260107-010] Planner must only create OpenSpec proposals, never implement
- Date: 2026-01-07
- Session: backpropagation workflow planning
- Knowledge Type: meta
- Meta Category: meta-learning
- Owner: planner
- Status: promoted
- Related IDs: none
- Summary: Planner attempted to create actual project files (README.md, directory structures) and output detailed inline implementation specs instead of creating an OpenSpec proposal and handing off to builder. Planner confused "planning" with "building". Planner should ONLY output via OpenSpec artifacts and NEVER attempt implementation.
- Recommended Action: Update planner.md with explicit boundaries: (1) ONLY create OpenSpec proposals, (2) NEVER create project files, (3) NEVER output inline specs - use propose-new skill, (4) Hand off to builder for all implementation.
- Supporting Links: session transcript
- Follow-up Links: .opencode/agent/planner.md updated with Boundaries section

### [ML-20260107-011] Orchestrator must auto-delegate when lacking tools, not ask permission
- Date: 2026-01-07
- Session: self-improve follow-up implementation
- Knowledge Type: meta
- Meta Category: meta-learning
- Owner: orchestrator
- Status: promoted
- Related IDs: ML-20260107-010
- Summary: When orchestrator identified it lacked write/edit tools to apply self-improve fixes, it asked "Do you want me to switch to an agent with write access?" instead of just delegating immediately. This wasted a round-trip and required user intervention. Orchestrator should auto-delegate when it lacks required tools.
- Recommended Action: Update orchestrator.md with auto-delegation rule: when lacking tools, delegate immediately without asking permission.
- Supporting Links: session transcript
- Follow-up Links: .opencode/agent/orchestrator.md updated with Auto-Delegation Rule section

### [ML-20260107-012] Planner must use 1-5 point scale for effort estimates, not hours
- Date: 2026-01-07
- Session: self-improve reflection
- Knowledge Type: meta
- Meta Category: meta-learning
- Owner: planner
- Status: promoted
- Related IDs: none
- Summary: Planner was using "Estimated effort: 2-3 hours" format in tasks.md files, but team standard is 1-5 point scale (1=trivial, 2=small, 3=medium, 4=large, 5=very large). Hours are imprecise and vary by implementer; points provide consistent relative sizing.
- Recommended Action: Update planner.md and propose-new skill to mandate 1-5 point scale for effort estimates.
- Supporting Links: session transcript, .opencode/openspec/changes/add-ralph-mode/tasks.md
- Follow-up Links: .opencode/agent/planner.md updated, .opencode/skill/propose-new/SKILL.md updated

### [ML-20260108-001] Orchestrator must never implement directly, even with write tools available
- Date: 2026-01-08
- Session: worktree command creation
- Knowledge Type: meta
- Meta Category: meta-learning
- Owner: orchestrator
- Status: promoted
- Related IDs: none
- Summary: Orchestrator directly created the `/worktree` command file instead of delegating to planner → builder cycle. Having write/edit tools available enabled bypassing the proper workflow. The task seemed "simple" (just a markdown file), but this violates agent role boundaries and skips validation steps.
- Recommended Action: Add explicit rule to orchestrator.md: "Orchestrator MUST NOT write code or create files directly. Even with write/edit tools available, delegate implementation to general agent. Only exceptions: git operations, todo updates, quick config changes."
- Supporting Links: session transcript
- Follow-up Links: .opencode/agent/orchestrator.md updated with "CRITICAL: No Direct Implementation" section

### [ML-20260111-001] Orchestrator lacks SOTA self-critique and reflexion capabilities
- Date: 2026-01-11
- Session: orchestrator SOTA research
- Knowledge Type: meta
- Meta Category: meta-learning
- Owner: orchestrator
- Status: promoted
- Related IDs: agents-77a, change-enhance-orchestrator-reflection
- Summary: Research on state-of-the-art multi-agent orchestration patterns (Jan 2026) identified that our orchestrator is missing critical capabilities: (1) Reflexion Loop - self-critique → revise → iterate cycle for task outputs, (2) Bidirectional Reflection Protocol (BRP) - monitor agent watching orchestrator decisions, (3) Structured State Management - explicit state schema for agent coordination. The existing `self-improve` skill captures session-level friction but does NOT provide real-time, task-specific self-correction that SOTA reflexion loops offer.
- Recommended Action: Implement Reflexion pattern with quality gates (tests, linter, coverage, logical correctness), max 3 iterations, and escalation to human review. Add critic agent for self-evaluation. Define explicit OrchestratorState schema.
- Supporting Links: AWS Strands Agents (Reflexion), COCO Framework (BRP), Agent-R (Self-Training), LangGraph Multi-Agent Patterns
- Follow-up Links: agents-77a (beads issue), .opencode/openspec/changes/enhance-orchestrator-reflection/ (OpenSpec proposal), AGENTS.md "Quality Gates and Acceptance Criteria" section
