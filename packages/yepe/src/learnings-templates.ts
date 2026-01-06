/**
 * Template content for learnings ledger files
 * These are clean templates without any actual entries from the blueprint repo
 */

export const LEARNINGS_INDEX_TEMPLATE = `# Meta-Learnings Index

Use this index to orient agents to the available ledgers and track which entries need promotion into AGENTS, specs, or configuration. Each ledger entry must be summarized here with its ID, title, category, owner, status, and any follow-up links.

## Ledger Overview
| Ledger | Purpose | Entry ID Prefix | Template Category |
| --- | --- | --- | --- |
| [\`meta-learnings.md\`](./meta-learnings.md) | Session-level insights about workflows/instructions | \`ML-\` | \`meta-learning\` |
| [\`recurring-tasks.md\`](./recurring-tasks.md) | Repetitive manual tasks that may become commands/skills | \`RT-\` | \`recurring-task\` |
| [\`failures-and-resolutions.md\`](./failures-and-resolutions.md) | Significant breakages plus mitigations | \`FR-\` | \`failure-resolution\` |
| [\`candidate-automations.md\`](./candidate-automations.md) | Potential automations or skills | \`CA-\` | \`candidate-automation\` |

## Entry Status Reference
Statuses must be one of:
- \`new\` – recently recorded; not yet reviewed.
- \`needs-agents-update\` – requires changes to AGENTS/config documentation.
- \`needs-spec-change\` – needs an OpenSpec proposal/delta.
- \`in-progress\` – promotion work underway.
- \`promoted\` – AGENTS/spec/config updated and linked here.
- \`closed\` – no action required (informational or superseded).

## Promotion Workflow
1. Append entries to the appropriate ledger during or immediately after sessions.
2. Run \`./bin/review-learnings\` before closing each session. The command lists entries in \`new\`, \`needs-agents-update\`, or \`needs-spec-change\` states and provides prompts for follow-up.
3. Decide whether to update AGENTS, file a beads issue, or draft an OpenSpec change. Reference the ledger entry ID in every follow-up artifact.
4. Update both the ledger entry and this index with the new status, owner, and links (\`Follow-up Links\` column).
5. When promotion is complete, mark the status \`promoted\` and keep the row for historical context.

## Entries
| ID | Title | Ledger | Owner | Status | Follow-up Links |
| --- | --- | --- | --- | --- | --- |
| _No entries yet_ | | | | | |
`;

export const META_LEARNINGS_TEMPLATE = `# Meta Learnings Ledger

This ledger records session-level observations about agent workflows, coordination patterns, and opportunities to improve instructions. Capture only operational/meta knowledge—domain-specific facts belong in the knowledge graph.

## Entry Template
Use the following structure for every entry. Replace angle-bracket placeholders and keep the ordering identical so tooling (e.g., \`bin/review-learnings\`) can parse the fields.

\`\`\`
### [ENTRY_ID] <concise title>
- Date: YYYY-MM-DD
- Session: <session identifier or transcript link>
- Knowledge Type: meta
- Meta Category: meta-learning
- Owner: <agent responsible for follow-up>
- Status: new|needs-agents-update|needs-spec-change|in-progress|promoted|closed
- Related IDs: beads-xxx, change-yyy (comma-separated or \`none\`)
- Summary: <1–3 sentences describing the insight>
- Recommended Action: <what should change>
- Supporting Links: <transcripts, AGENTS diffs, etc.>
- Follow-up Links: <AGENTS/spec updates, beads issues, etc.>
\`\`\`

**IDs:** Use \`ML-YYYYMMDD-###\` (e.g., \`ML-20260105-001\`). Each entry must also be referenced from \`learnings/index.md\` once recorded.

## Entries

_No entries recorded yet. Run \`./bin/review-learnings\` after adding entries to keep statuses up to date._
`;

export const RECURRING_TASKS_TEMPLATE = `# Recurring Tasks Ledger

This ledger tracks repetitive manual tasks that agents perform frequently. When a pattern emerges (3+ occurrences), record it here and consider promoting it to a command, skill, or automation.

## Entry Template
Use the following structure for every entry. Replace angle-bracket placeholders and keep the ordering identical so tooling (e.g., \`bin/review-learnings\`) can parse the fields.

\`\`\`
### [ENTRY_ID] <concise title>
- Date: YYYY-MM-DD
- Session: <session identifier or transcript link>
- Knowledge Type: meta
- Meta Category: recurring-task
- Owner: <agent responsible for follow-up>
- Status: new|needs-agents-update|needs-spec-change|in-progress|promoted|closed
- Related IDs: beads-xxx, change-yyy (comma-separated or \`none\`)
- Task Description: <what is done repeatedly>
- Frequency: <how often; e.g., "every session", "3x this week">
- Current Manual Steps: <numbered list>
- Automation Potential: <how this could be automated>
- Supporting Links: <transcripts, examples>
- Follow-up Links: <AGENTS/spec updates, beads issues, etc.>
\`\`\`

**IDs:** Use \`RT-YYYYMMDD-###\` (e.g., \`RT-20260105-001\`). Each entry must also be referenced from \`learnings/index.md\` once recorded.

## Entries

_No entries recorded yet. Run \`./bin/review-learnings\` after adding entries to keep statuses up to date._
`;

export const FAILURES_TEMPLATE = `# Failures and Resolutions Ledger

This ledger records significant breakages, errors, or workflow failures along with their root causes and mitigations. Use this to prevent recurrence and improve system resilience.

## Entry Template
Use the following structure for every entry. Replace angle-bracket placeholders and keep the ordering identical so tooling (e.g., \`bin/review-learnings\`) can parse the fields.

\`\`\`
### [ENTRY_ID] <concise title>
- Date: YYYY-MM-DD
- Session: <session identifier or transcript link>
- Knowledge Type: meta
- Meta Category: failure-resolution
- Owner: <agent responsible for follow-up>
- Status: new|needs-agents-update|needs-spec-change|in-progress|promoted|closed
- Related IDs: beads-xxx, change-yyy (comma-separated or \`none\`)
- Failure Description: <what broke and how it manifested>
- Root Cause: <why it broke>
- Impact: <severity and scope>
- Resolution: <what fixed it>
- Prevention: <how to prevent recurrence>
- Supporting Links: <error logs, transcripts>
- Follow-up Links: <AGENTS/spec updates, beads issues, etc.>
\`\`\`

**IDs:** Use \`FR-YYYYMMDD-###\` (e.g., \`FR-20260105-001\`). Each entry must also be referenced from \`learnings/index.md\` once recorded.

## Entries

_No entries recorded yet. Run \`./bin/review-learnings\` after adding entries to keep statuses up to date._
`;

export const CANDIDATE_AUTOMATIONS_TEMPLATE = `# Candidate Automations Ledger

This ledger tracks potential automations, skills, or tools that could improve agent workflows. Use this to collect ideas and prioritize automation work.

## Entry Template
Use the following structure for every entry. Replace angle-bracket placeholders and keep the ordering identical so tooling (e.g., \`bin/review-learnings\`) can parse the fields.

\`\`\`
### [ENTRY_ID] <concise title>
- Date: YYYY-MM-DD
- Session: <session identifier or transcript link>
- Knowledge Type: meta
- Meta Category: candidate-automation
- Owner: <agent responsible for follow-up>
- Status: new|needs-agents-update|needs-spec-change|in-progress|promoted|closed
- Related IDs: beads-xxx, change-yyy (comma-separated or \`none\`)
- Automation Description: <what could be automated>
- Current Process: <how it's done manually today>
- Proposed Solution: <how automation would work>
- Expected Benefit: <time saved, errors reduced, etc.>
- Implementation Effort: <low/medium/high estimate>
- Supporting Links: <examples, research>
- Follow-up Links: <AGENTS/spec updates, beads issues, etc.>
\`\`\`

**IDs:** Use \`CA-YYYYMMDD-###\` (e.g., \`CA-20260105-001\`). Each entry must also be referenced from \`learnings/index.md\` once recorded.

## Entries

_No entries recorded yet. Run \`./bin/review-learnings\` after adding entries to keep statuses up to date._
`;

/**
 * Returns the template content for a learnings file
 */
export function getLearningsTemplate(filename: string): string | null {
  switch (filename) {
    case 'index.md':
      return LEARNINGS_INDEX_TEMPLATE;
    case 'meta-learnings.md':
      return META_LEARNINGS_TEMPLATE;
    case 'recurring-tasks.md':
      return RECURRING_TASKS_TEMPLATE;
    case 'failures-and-resolutions.md':
      return FAILURES_TEMPLATE;
    case 'candidate-automations.md':
      return CANDIDATE_AUTOMATIONS_TEMPLATE;
    default:
      return null;
  }
}
