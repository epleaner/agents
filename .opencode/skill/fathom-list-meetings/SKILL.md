---
name: fathom-list-meetings
description: Fetch all meeting info from Fathom for a given time range.
---
## What I do
- Query the Fathom API to list meetings within a specified date range
- Return meeting metadata including title, date, recording ID, participants, and duration
- Support filtering by date range using ISO 8601 timestamps

## Usage

To list meetings, run the shell script with date parameters:

```bash
# List meetings from the last 7 days
scripts/fathom-list-meetings

# List meetings in a specific date range
scripts/fathom-list-meetings --after "2026-01-01T00:00:00Z" --before "2026-01-07T23:59:59Z"

# Include action items in the response
scripts/fathom-list-meetings --after "2026-01-01T00:00:00Z" --include-action-items
```

## Parameters
- `--after` (optional): ISO 8601 timestamp for start of range (default: 7 days ago)
- `--before` (optional): ISO 8601 timestamp for end of range (default: now)
- `--include-action-items` (optional): Include action items for each meeting
- `--include-summary` (optional): Include AI-generated summary for each meeting
- `--limit` (optional): Maximum number of meetings to return (default: 50)

## Output Format
Returns JSON with meeting list:
```json
{
  "items": [
    {
      "title": "Meeting Title",
      "recording_id": 123456789,
      "created_at": "2026-01-05T14:00:00Z",
      "scheduled_start_time": "2026-01-05T14:00:00Z",
      "scheduled_end_time": "2026-01-05T15:00:00Z",
      "url": "https://fathom.video/xyz123",
      "calendar_invitees": [...]
    }
  ]
}
```

## Prerequisites
- `FATHOM_API_KEY` must be set (either in `.env` file or as environment variable)
- `curl` and `jq` must be available

## Setup
1. Copy `.env.example` to `.env`
2. Add your Fathom API key from https://fathom.video/customize#api-access-header

## Notes
- API key only provides access to meetings recorded by you or shared to your team
- Results are paginated; use cursor for additional pages if needed
