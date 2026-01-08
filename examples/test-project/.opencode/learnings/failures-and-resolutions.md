# Failures & Resolutions Ledger

Document notable breakages, regressions, or slips along with how they were resolved so future sessions can avoid repeating them. Keep content operational; domain learnings belong elsewhere.

## Entry Template
```
### [ENTRY_ID] <concise title>
- Date: YYYY-MM-DD
- Session: <session identifier or transcript link>
- Knowledge Type: meta
- Meta Category: failure-resolution
- Owner: <agent accountable for guarding against recurrence>
- Status: new|needs-agents-update|needs-spec-change|in-progress|promoted|closed
- Related IDs: beads-xxx, change-yyy (comma-separated or `none`)
- Summary: <what failed and why>
- Recommended Action: <follow-up to prevent recurrence>
- Supporting Links: <logs, transcripts, AGENTS diffs, etc.>
- Follow-up Links: <AGENTS/spec updates, beads issues, etc.>
```

**IDs:** Use `FR-YYYYMMDD-###`. Update `learnings/index.md` whenever a new entry is added or status changes.

## Entries

### FR-20260105-001 Beads daemon 5+ second startup causing workflow slowdowns
- Date: 2026-01-05
- Session: Meta-Agent performance investigation
- Knowledge Type: meta
- Meta Category: failure-resolution
- Owner: Meta-Agent
- Status: promoted
- Related IDs: none
- Summary: Every `bd` command was taking 5+ seconds due to legacy database lacking repository fingerprint (pre-v0.17.5 schema). Daemon startup failed validation checks, forcing fallback to slow direct mode. This affected all Orchestrator/PM workflows using beads commands.
- Root Cause: Database created before v0.17.5 lacked repository fingerprint, causing daemon to fail validation on every startup with "LEGACY DATABASE DETECTED" error.
- Resolution: Ran `bd migrate --update-repo-id` to add fingerprint (repo ID: f19e22a9). Performance improved 94.5% (5.181s → 0.285s for `bd stats`).
- Recommended Action: Add `bd doctor` check to onboarding/setup workflows. Update AGENTS.md with troubleshooting guidance for slow beads performance.
- Supporting Links: 
  - Daemon log: `.beads/daemon.log` (lines 1-312 show repeated fingerprint validation failures)
  - Before: 5.181s for `bd stats --json`
  - After: 0.285s for `bd stats --json` (94.5% improvement)
- Follow-up Links: 
  - AGENTS.md updated with beads troubleshooting section
  - learnings/index.md entry added
