# Candidate Automations & Skills Ledger

Capture ideas for new commands, scripts, or skills that could improve the agent experience. These are potential automation hooks discovered during sessions.

## Entry Template
```
### [ENTRY_ID] <concise title>
- Date: YYYY-MM-DD
- Session: <session identifier or transcript link>
- Knowledge Type: meta
- Meta Category: candidate-automation
- Owner: <agent exploring feasibility>
- Status: new|needs-agents-update|needs-spec-change|in-progress|promoted|closed
- Related IDs: beads-xxx, change-yyy (comma-separated or `none`)
- Summary: <1–3 sentences describing the automation idea>
- Recommended Action: <next step for validating/implementing>
- Supporting Links: <transcripts, AGENTS diffs, prototypes, etc.>
- Follow-up Links: <AGENTS/spec updates, beads issues, etc.>
```

**IDs:** Use `CA-YYYYMMDD-###`. Mirror each entry in `learnings/index.md` for quick navigation.

## Entries

### [CA-20260107-001] GitHub source fetcher skill
- Date: 2026-01-07
- Session: ralph-mode research
- Knowledge Type: meta
- Meta Category: candidate-automation
- Owner: builder
- Status: new
- Related IDs: change-add-ralph-mode
- Summary: Deep dive into ralph-orchestrator required 3 separate webfetch calls to get source files (orchestrator.py, main.py, base.py). A skill that can batch-fetch multiple files from a GitHub repo would streamline research.
- Recommended Action: Create github-source-fetcher skill that accepts repo URL and list of file paths, returns content of all files in one operation.
- Supporting Links: session transcript
- Follow-up Links: none
