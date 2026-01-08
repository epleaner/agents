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
