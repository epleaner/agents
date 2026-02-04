---
name: jira
description: Perform deterministic Jira actions via Atlassian `acli`, emitting stable JSON for automation.
---

## What I do
- Provide a single, deterministic Jira interface backed by `acli jira ...`
- Emit stable JSON envelopes to stdout for every action
- Preflight `acli` availability and Jira auth status
- Require explicit confirmation for mutating actions

## Prerequisites
- Install Atlassian CLI (`acli`) and ensure it is on PATH
- Authenticate:
  - `acli jira auth login --web`

## Wrapper
All actions are performed via:
`./skill/jira/scripts/jira <command> [args]`

## Output format
Every invocation prints exactly one JSON object to stdout:
```json
{
  "ok": true,
  "action": "workitem.view",
  "request": { "key": "TEAM-123" },
  "result": {}
}
```

On error:
```json
{
  "ok": false,
  "action": "preflight",
  "request": {},
  "error": {
    "type": "not_authenticated",
    "message": "Not authenticated to Jira via acli",
    "remediation": "Run: acli jira auth login --web"
  }
}
```

## Commands

### Preflight
```bash
./skill/jira/scripts/jira preflight
```

### Auth
```bash
./skill/jira/scripts/jira auth status
./skill/jira/scripts/jira auth login-hints
```

### Projects
```bash
./skill/jira/scripts/jira project view --key "TEAM"
./skill/jira/scripts/jira project list --limit 50
./skill/jira/scripts/jira project list --paginate
```

### Workitems
```bash
./skill/jira/scripts/jira workitem view --key "TEAM-123"
./skill/jira/scripts/jira workitem search --jql "project = TEAM ORDER BY updated DESC" --limit 50
./skill/jira/scripts/jira workitem search --jql "project = TEAM" --paginate
```

### Mutations (require `--yes` or `--confirm`)
```bash
./skill/jira/scripts/jira workitem comment create --key "TEAM-123" --body "Update..." --yes
./skill/jira/scripts/jira workitem transition --key "TEAM-123" --status "Done" --confirm
./skill/jira/scripts/jira workitem edit --key "TEAM-123" --summary "New title" --yes
```

## Smoke plan
```bash
acli --version
acli jira auth status

./skill/jira/scripts/jira preflight
./skill/jira/scripts/jira workitem view --key "KEY-1"
```

Expected behavior:
- If `acli` is missing: deterministic `{ ok:false, error.type:"missing_dependency" }`
- If not authenticated: deterministic `{ ok:false, error.type:"not_authenticated" }`
