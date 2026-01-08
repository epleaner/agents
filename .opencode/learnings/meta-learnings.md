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
