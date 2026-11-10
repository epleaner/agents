# Change: Add Ralph Wiggum mode orchestration

## Why
Users need a way to execute complex, long-running agent tasks without manual orchestration. The Ralph Wiggum technique (continuous iteration loop) enables autonomous agent execution against a prompt file until completion markers are detected or safety limits reached. This addresses a key gap: OpenCode currently requires manual iteration for multi-step workflows, creating friction for tasks like end-to-end feature implementation or comprehensive debugging sessions.

## What Changes
- Add **Ralph mode** as a new orchestration capability in the Codex multi-agent suite
- Implement external bash script (`ralph-orchestrator.sh`) for initial validation, then migrate to OpenCode skill for integration
- Support continuous iteration with safety guards (max iterations, runtime limits, resource quotas)
- Inject orchestration context into agent prompts automatically
- Detect completion markers (`- [x] TASK_COMPLETE`) and todo integration
- Add git checkpointing for periodic state snapshots
- Track metrics (iterations, success rate, duration, token usage)
- Provide configuration system (ralph.yml + CLI args)

## Impact
- **Affected specs:** `codex-multi-agent-suite` gains Ralph Orchestration Loop requirements
- **Affected code:** 
  - New script: `.opencode/scripts/ralph-orchestrator.sh` (~400-500 lines bash)
  - New config template: `.opencode/templates/ralph.yml`
  - Future skill migration: `.opencode/skill/ralph/`
- **Related beads:** Link to beads issue for Ralph mode implementation
- **Breaking changes:** None - this is purely additive functionality
- **Migration path:** Existing workflows unchanged; Ralph mode is opt-in via new command/flag
