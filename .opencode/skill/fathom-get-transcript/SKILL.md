---
name: fathom-get-transcript
description: Fetch the full transcript for a specific Fathom meeting recording.
---
## What I do
- Query the Fathom API to retrieve the full transcript for a meeting
- Return speaker-attributed transcript with timestamps
- Support both synchronous (direct return) and asynchronous (webhook) modes

## Usage

To fetch a transcript, run the shell script with the recording ID:

```bash
# Get transcript for a specific meeting
scripts/fathom-get-transcript --recording-id 123456789

# Output as plain text instead of JSON
scripts/fathom-get-transcript --recording-id 123456789 --format text
```

## Parameters
- `--recording-id` (required): The recording ID from Fathom (get this from `fathom-list-meetings`)
- `--format` (optional): Output format - `json` (default) or `text`

## Output Format

### JSON format (default)
```json
{
  "transcript": [
    {
      "speaker": {
        "display_name": "Alice Johnson",
        "matched_calendar_invitee_email": "alice@example.com"
      },
      "text": "Let's revisit the budget allocations.",
      "timestamp": "00:05:32"
    }
  ]
}
```

### Text format
```
[00:05:32] Alice Johnson: Let's revisit the budget allocations.
[00:05:45] Bob Smith: I think we should increase the Q2 budget.
```

## Prerequisites
- `FATHOM_API_KEY` must be set (either in `.env` file or as environment variable)
- `curl` and `jq` must be available
- Recording ID must be from a meeting you recorded or that was shared with your team

## Setup
1. Copy `.env.example` to `.env`
2. Add your Fathom API key from https://fathom.video/customize#api-access-header

## Notes
- Large transcripts may take a moment to fetch
- Timestamps are in HH:MM:SS format
- Speaker attribution depends on Fathom's speaker detection
