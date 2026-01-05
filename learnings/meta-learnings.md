# Meta Learnings Ledger

This ledger records session-level observations about agent workflows, coordination patterns, and opportunities to improve instructions. Capture only operational/meta knowledge—domain-specific facts belong in the knowledge graph.

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

**IDs:** Use `ML-YYYYMMDD-###` (e.g., `ML-20260105-001`). Each entry must also be referenced from `learnings/index.md` once recorded.

## Entries

_No entries recorded yet. Run `./bin/review-learnings` after adding entries to keep statuses up to date._
