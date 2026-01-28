---
name: fathom-notes
description: Retrieve and summarize Fathom AI meeting transcripts, extracting action items and decisions.
---
## What I do
- Search Fathom recordings by meeting title, date, or participant.
- Return structured summaries `{topics, decisions, blockers, action-items}` with timestamps.
- Feed important takeaways into the action-items skill.

## Usage
```
Meeting: "AI Platform Sync" (2026-01-05)
Participants: Alice, Bob
Need: action-items | decisions | full-summary
Notes: focus on Codex agent deployment
```
I will respond with annotated bullets, e.g.:
- **Decision** (00:12:31) Adopt GPT-5.1 Codex for builder.
- **Action** (00:21:05) QA to add Playwright smoke for cloud bundle.

## Notes
- Always cite timestamps so others can jump to the relevant moment.
- If no matching meeting exists, I’ll explain and suggest alternate queries.
