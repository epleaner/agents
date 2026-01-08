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

### [ML-20260107-003] Custom deployer needs production safeguards
- Date: 2026-01-07
- Session: test-project deployment session
- Knowledge Type: meta
- Meta Category: meta-learning
- Owner: custom-deployer
- Status: promoted
- Related IDs: none
- Summary: Custom deployer agent was deploying to production without confirmation. Added safeguards to require explicit approval for production deployments.
- Recommended Action: Add production deployment confirmation to custom-deployer agent instructions.
- Supporting Links: deployment logs
- Follow-up Links: .opencode/agent/custom-deployer.yaml updated with safeguards

### [ML-20260107-004] Test project needs production caution notice
- Date: 2026-01-07
- Session: test-project setup
- Knowledge Type: meta
- Meta Category: meta-learning
- Owner: orchestrator
- Status: promoted
- Related IDs: none
- Summary: Test project needs a visible notice in AGENTS.md reminding agents to use caution when deploying to production.
- Recommended Action: Add "## Test Project Specific Guidelines" section to AGENTS.md after the Communication Style section, with text: "This is a test project. Always use caution when deploying to production."
- Supporting Links: none
- Follow-up Links: .opencode/AGENTS.md updated
