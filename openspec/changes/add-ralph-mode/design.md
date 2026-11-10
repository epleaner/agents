## Context
The Ralph Wiggum technique enables autonomous agent execution through continuous iteration loops. Reference implementation (mikeyobrien/ralph-orchestrator) demonstrates ~400 lines of Python logic. We need to integrate this pattern into OpenCode's agent orchestration system while maintaining safety, observability, and integration with existing beads/OpenSpec workflows.

## Goals / Non-Goals
- **Goals:**
  - Enable autonomous multi-iteration agent execution without manual intervention
  - Provide safety guards to prevent runaway loops and resource exhaustion
  - Integrate with existing OpenCode workflows (beads, OpenSpec, git)
  - Support both interactive and CI/CD execution modes
  - Create clear completion detection mechanisms
- **Non-Goals:**
  - Replacing existing single-iteration agent patterns
  - Implementing distributed or parallel orchestration (single-threaded for MVP)
  - Auto-tuning iteration limits (manual configuration for now)
  - Integration with external orchestration platforms (K8s, Temporal, etc.)

## Decisions

### Implementation Strategy: Three-Phase Approach
1. **Phase 1 (MVP):** External bash script (`.opencode/scripts/ralph-orchestrator.sh`)
   - Fastest path to validation
   - Easy to iterate and debug
   - Minimal coupling to OpenCode internals
   - Can be run standalone or via wrapper command
2. **Phase 2:** OpenCode skill (`.opencode/skill/ralph/`)
   - Better integration with agent framework
   - Access to skill infrastructure (logging, metrics, etc.)
   - Can be invoked by other agents programmatically
3. **Phase 3:** Native agent (optional, long-term)
   - Full first-class orchestration support
   - Deep integration with OpenCode agent lifecycle
   - Only if usage patterns justify the complexity

**Decision:** Start with Phase 1 (bash script) for this proposal.

### Core Loop Algorithm
```
WHILE iteration < max_iterations AND elapsed < timeout AND NOT completed:
  1. Load/update prompt with orchestration context
  2. Invoke agent (via opencode CLI or API)
  3. Capture output and parse for completion markers
  4. Check todo status via bd integration
  5. Update metrics and state
  6. Optionally checkpoint to git
  7. Increment iteration counter
  8. Sleep briefly to avoid rate limits
END WHILE

IF completed:
  Generate success report
ELSE IF iteration >= max_iterations:
  Generate timeout report with partial results
ELSE:
  Generate failure report
```

### Prompt Enhancement Strategy
Inject orchestration metadata into agent prompts:
```markdown
<!-- RALPH ORCHESTRATION CONTEXT -->
Iteration: 15/50
Elapsed: 23m 14s
Previous iterations: [brief summary]
Current objective: [from prompt file]
Completion criteria: Detect `- [x] TASK_COMPLETE` or all bd todos done
<!-- END RALPH CONTEXT -->

[Original prompt content...]
```

### Completion Detection Mechanisms
1. **Primary:** Explicit marker in agent output
   - `- [x] TASK_COMPLETE` in markdown
   - `RALPH_COMPLETE` magic string
2. **Secondary:** Todo integration
   - Check `bd list --status in_progress` (if empty, consider complete)
   - Optionally require specific todo completion
3. **Fallback:** Timeout-based
   - If max iterations reached, generate partial success report
   - If runtime limit exceeded, graceful shutdown

### Safety Guards
1. **Iteration limit:** Default 50, configurable via ralph.yml or CLI
2. **Runtime limit:** Default 2 hours, configurable
3. **Infinite loop detection:** Hash agent outputs, abort if 3+ identical consecutive outputs
4. **Rate limiting:** Built-in sleep between iterations (1-5 seconds)
5. **Resource quotas:** Track token usage if API provides metrics
6. **Manual override:** SIGINT/SIGTERM handlers for graceful shutdown

### Git Checkpointing Strategy
- **Frequency:** Configurable (default: every 10 iterations)
- **Commit message format:** `ralph: iteration N - [brief summary]`
- **Branch management:** Optional separate branch `ralph-session-<timestamp>`
- **Rollback:** Manual via git reset or checkout
- **Metadata:** Store iteration state in commit description

### Configuration Schema (ralph.yml)
```yaml
ralph:
  max_iterations: 50
  timeout_minutes: 120
  checkpoint_interval: 10
  completion_markers:
    - "- [x] TASK_COMPLETE"
    - "RALPH_COMPLETE"
  safety:
    detect_infinite_loop: true
    max_identical_outputs: 3
    sleep_between_iterations: 2  # seconds
  git:
    auto_checkpoint: true
    checkpoint_branch: "ralph-session-{timestamp}"
  metrics:
    track_tokens: true
    export_json: true
```

### Alternatives Considered

**Alternative 1: Pure Python implementation**
- Pros: Better testability, richer libraries
- Cons: Adds Python dependency, harder to bootstrap
- Decision: Rejected for Phase 1; bash is ubiquitous in dev environments

**Alternative 2: Native OpenCode agent**
- Pros: First-class support, deep integration
- Cons: High complexity, longer development time
- Decision: Deferred to Phase 3 pending validation

**Alternative 3: External service (K8s CronJob, GitHub Actions)**
- Pros: Distributed execution, platform-managed
- Cons: Requires infrastructure, poor local dev experience
- Decision: Rejected; local-first is core to OpenCode philosophy

## Risks / Trade-offs

### Risk: Runaway resource consumption
- **Mitigation:** Hard limits on iterations, runtime, optional token quotas
- **Monitoring:** Metrics export for post-mortem analysis

### Risk: Infinite loops with subtle variations
- **Mitigation:** Hash-based loop detection, manual override hooks
- **Fallback:** Timeout guards ensure eventual termination

### Risk: Poor observability in long runs
- **Mitigation:** Periodic git checkpoints, metrics export, progress logging
- **Future improvement:** Real-time dashboard or live log streaming

### Trade-off: Bash vs. native implementation
- **Chosen:** Bash for speed to validation
- **Cost:** Less robust error handling, harder to test
- **Mitigation:** Strict shellcheck, comprehensive smoke tests

## Migration Plan
1. MVP bash script deployment (this proposal)
2. Gather usage feedback and iteration patterns
3. Identify pain points and missing features
4. Skill migration proposal if usage justifies complexity
5. No breaking changes; bash script remains supported

## Open Questions
- Should Ralph mode be restricted to certain agents (e.g., only Builder/Orchestrator)?
- How to handle interactive prompts during iterations (auto-skip, fail, prompt once)?
- Should metrics be sent to external telemetry (Slack, dashboard)?
- What's the right default checkpoint interval? (10 iterations may be too frequent for fast loops)

## Reference Implementation Analysis

Analysis of [mikeyobrien/ralph-orchestrator](https://github.com/mikeyobrien/ralph-orchestrator) (v1.2.2):

### Key Patterns

1. **Core Loop Algorithm**: The reference uses a simple while loop with three termination conditions:
   - Max iterations reached (default: 100)
   - Max runtime exceeded (default: 4 hours)
   - Task completion marker detected
   
2. **Agent Scratchpad Mechanism**: ACP agents persist context across iterations via `.agent/scratchpad.md`. This enables agents to continue from where they left off rather than restarting each iteration. Key for maintaining continuity.

3. **Multi-Agent Support with Auto-Detection**: Supports Claude, Kiro, Q, Gemini, and ACP-compliant agents. Auto-detects available agents and falls back gracefully.

4. **Async-First Architecture**: Non-blocking I/O throughout (logging, git operations). Thread-safe async logging with rotation and security masking.

5. **Permission Handling Modes**: Four modes for handling agent tool requests:
   - `auto_approve`: Approve all requests automatically (CI/CD)
   - `deny_all`: Deny all permission requests (testing)
   - `allowlist`: Only approve matching patterns (production)
   - `interactive`: Prompt user for each request (development)

6. **Git-Based Checkpointing**: Async git checkpointing at configurable intervals (default: every 5 iterations). Enables recovery and history tracking.

7. **State Persistence**: Saves metrics and state to `.ralph/` directory for analysis. Includes iteration count, runtime, errors, and token usage.

### Safety Mechanisms

- **Retry Logic**: Failed iterations retry after configurable delay with exponential backoff
- **Error Limits**: Stops after 5 consecutive errors
- **Timeout Protection**: 5-minute timeout per iteration
- **Security Features**: Automatic masking of API keys and sensitive data in logs

### Completion Detection

- Primary: Explicit marker in agent output (`- [x] TASK_COMPLETE`)
- Secondary: Check if all tasks in prompt are marked done
- Fallback: Max iterations or runtime limit reached

### Differences from Our Implementation

| Aspect | Reference (Python) | Our Implementation (Bash) |
|--------|-------------------|---------------------------|
| Language | Python (~400 lines) | Bash (~600 lines) |
| Agent Invocation | SDK/CLI adapters | OpenCode CLI |
| State Storage | JSON files | JSON + git commits |
| Todo Integration | None | beads integration |
| Cross-Session | Scratchpad file | Session ledger + meta-learnings |
| HITL | Permission modes | Interactive prompts |

## OpenCode CLI Agent Invocation

The OpenCode CLI provides the `run` subcommand for non-interactive agent execution:

```bash
# Basic invocation with inline message
opencode run "Your task description here"

# With specific agent
opencode run --agent orchestrator "Your task description here"

# With prompt from file (using cat)
opencode run "$(cat /path/to/prompt.md)"

# With JSON output format for parsing
opencode run --format json "Your task"

# Continue existing session
opencode run --continue --session <session-id> "Follow-up message"

# With file attachments
opencode run --file context.md "Process this file"
```

**Key options for Ralph mode:**
- `--agent <name>`: Specify which agent to use (orchestrator, builder, etc.)
- `--format json`: Get structured JSON output for parsing completion markers
- `--session <id>`: Continue a specific session for context continuity
- `--continue`: Continue the last session
- `--title <title>`: Set session title for tracking

## Configuration Reference

Ralph mode is configured via `ralph.yml` in your project root. See `.opencode/templates/ralph.yml` for the full template.

### Core Settings

| Option | Default | Description |
|--------|---------|-------------|
| `max_iterations` | 50 | Maximum iterations before stopping (1-1000) |
| `timeout_minutes` | 120 | Maximum runtime in minutes (1-1440) |
| `checkpoint_interval` | 10 | Git checkpoint every N iterations |

### Safety Settings

| Option | Default | Description |
|--------|---------|-------------|
| `safety.detect_infinite_loop` | true | Abort if N identical consecutive outputs |
| `safety.max_identical_outputs` | 3 | Number of identical outputs to trigger abort |
| `safety.sleep_between_iterations` | 2 | Seconds to sleep between iterations |

### HITL Settings

| Option | Default | Description |
|--------|---------|-------------|
| `hitl.enabled` | true | Enable Human-in-the-Loop intervention |
| `hitl.mode` | "blocking" | "blocking" (pause) or "advisory" (log only) |
| `hitl.triggers.high_risk_operations` | [...] | Operations that trigger HITL |
| `hitl.triggers.iteration_milestones` | [10, 25, 40] | Trigger at these iteration counts |

### CLI Override Priority

Configuration is loaded in this order (later overrides earlier):
1. Built-in defaults
2. `ralph.yml` in project root
3. `--config <file>` specified config
4. CLI arguments (highest priority)
