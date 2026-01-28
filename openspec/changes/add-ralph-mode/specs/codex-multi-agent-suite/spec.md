## ADDED Requirements

### Requirement: Ralph Orchestration Loop
The Codex multi-agent suite SHALL provide a Ralph mode orchestration capability that continuously iterates an agent against a prompt file until completion markers are detected or safety limits are reached. The orchestrator SHALL inject iteration context into prompts, checkpoint progress to git, track execution metrics, and enforce configurable safety guards (max iterations, runtime limits, infinite loop detection).

#### Scenario: Basic autonomous iteration
- **WHEN** a user invokes ralph mode with a prompt file and completion criteria
- **THEN** the orchestrator executes the agent iteratively, injecting orchestration context into each prompt
- **AND** it monitors for completion markers (`- [x] TASK_COMPLETE`, `RALPH_COMPLETE`) or todo completion status
- **AND** it terminates successfully when completion criteria are met.

#### Scenario: Safety limit enforcement
- **WHEN** ralph mode execution reaches max iterations (default: 50) or runtime timeout (default: 2 hours)
- **THEN** the orchestrator terminates gracefully and generates a partial success report
- **AND** it preserves all work completed up to the limit via git checkpoints.

#### Scenario: Infinite loop detection
- **WHEN** the orchestrator detects 3+ consecutive identical agent outputs
- **THEN** it aborts execution with an infinite loop error report
- **AND** it provides the last checkpoint state for manual recovery.

#### Scenario: Manual interruption
- **WHEN** a user sends SIGINT or SIGTERM during ralph mode execution
- **THEN** the orchestrator performs graceful shutdown, completing the current iteration
- **AND** it generates a partial completion report and creates a final git checkpoint.

### Requirement: Prompt Enhancement with Orchestration Context
The Ralph orchestrator SHALL automatically inject iteration metadata into agent prompts before each execution, including iteration count, elapsed time, previous iteration summaries, and completion criteria. This context SHALL enable agents to maintain coherence across iterations and track progress toward objectives.

#### Scenario: Context injection in prompts
- **WHEN** the orchestrator prepares a prompt for iteration N
- **THEN** it prepends orchestration metadata (iteration N/max, elapsed time, previous summaries)
- **AND** the metadata clearly specifies completion criteria for agent awareness.

#### Scenario: Iteration history tracking
- **WHEN** multiple iterations have completed
- **THEN** the orchestrator maintains a brief summary of previous iterations
- **AND** it includes these summaries in subsequent prompt context to preserve continuity.

### Requirement: Completion Detection Mechanisms
The Ralph orchestrator SHALL support multiple completion detection strategies: explicit markers in agent output, integration with beads todo status, and timeout-based fallback completion. Completion SHALL trigger success reporting and final git checkpoint.

#### Scenario: Explicit marker detection
- **WHEN** an agent output contains a configured completion marker (e.g., `- [x] TASK_COMPLETE`)
- **THEN** the orchestrator immediately terminates iteration
- **AND** it generates a success report with final metrics.

#### Scenario: Todo-based completion
- **WHEN** ralph mode is configured to track beads todos
- **THEN** the orchestrator polls `bd list --status in_progress` after each iteration
- **AND** it completes successfully when all tracked todos are marked done.

#### Scenario: Timeout-based completion
- **WHEN** no explicit completion markers are detected but runtime approaches the configured limit
- **THEN** the orchestrator generates a partial success report based on work completed
- **AND** it checkpoints final state for manual review.

### Requirement: Git Checkpointing
The Ralph orchestrator SHALL create periodic git commits to preserve progress during long-running iterations. Checkpoints SHALL include iteration metadata, timestamp, and agent output summaries. The orchestrator SHALL support optional branch isolation for ralph sessions.

#### Scenario: Periodic checkpoint commits
- **WHEN** ralph mode completes N iterations (default: every 10)
- **THEN** the orchestrator creates a git commit with message `ralph: iteration N - [summary]`
- **AND** it includes iteration state metadata in the commit description.

#### Scenario: Checkpoint branch isolation
- **WHEN** ralph mode is configured to use a separate branch
- **THEN** the orchestrator creates a timestamped branch (e.g., `ralph-session-2026-01-07-21-30`)
- **AND** it performs all checkpoints on that branch, leaving the main working branch clean.

#### Scenario: Rollback from checkpoint
- **WHEN** ralph mode fails or is interrupted
- **THEN** users can manually roll back to the last successful checkpoint via git reset
- **AND** the checkpoint metadata provides context for resuming work.

### Requirement: Metrics and Telemetry
The Ralph orchestrator SHALL collect execution metrics including iteration count, total runtime, success rate, token usage (if accessible), and API call counts. Metrics SHALL be exported in both human-readable and machine-readable (JSON) formats for analysis and debugging.

#### Scenario: Execution summary report
- **WHEN** ralph mode completes (successfully or via timeout)
- **THEN** the orchestrator generates a summary report with total iterations, runtime, completion status
- **AND** it lists all git checkpoints created during the session.

#### Scenario: JSON metrics export
- **WHEN** ralph mode is configured to export metrics
- **THEN** the orchestrator writes a `.ralph-metrics.json` file with structured execution data
- **AND** the JSON includes iteration timestamps, agent outputs, completion markers detected, and resource usage.

#### Scenario: Real-time progress logging
- **WHEN** ralph mode is executing
- **THEN** the orchestrator logs iteration progress to stdout (iteration N/max, elapsed time)
- **AND** it provides periodic status updates for long-running sessions.

### Requirement: Configuration System
The Ralph orchestrator SHALL support configuration via a `ralph.yml` file and CLI arguments. Configuration SHALL specify max iterations, timeout, checkpoint interval, completion markers, safety settings, and git options. CLI arguments SHALL override file-based configuration.

#### Scenario: Load configuration from ralph.yml
- **WHEN** ralph mode starts and a `ralph.yml` file exists in `.opencode/`
- **THEN** the orchestrator loads max iterations, timeout, checkpoint interval, and other settings
- **AND** it validates all configuration values before starting execution.

#### Scenario: CLI argument override
- **WHEN** ralph mode is invoked with CLI flags (e.g., `--max-iterations 100`)
- **THEN** the CLI values override corresponding ralph.yml settings
- **AND** the orchestrator logs the effective configuration at startup.

#### Scenario: Default configuration fallback
- **WHEN** no ralph.yml file exists and no CLI arguments are provided
- **THEN** the orchestrator uses sensible defaults (50 iterations, 2 hour timeout, 10-iteration checkpoints)
- **AND** it logs the default configuration for user awareness.

### Requirement: Safety Guards and Error Handling
The Ralph orchestrator SHALL implement multiple safety mechanisms to prevent runaway loops and resource exhaustion: max iteration limits, runtime timeouts, infinite loop detection via output hashing, rate limiting between iterations, and graceful shutdown handlers. All safety violations SHALL generate detailed error reports.

#### Scenario: Max iteration limit enforcement
- **WHEN** ralph mode reaches the configured max iterations without completion
- **THEN** the orchestrator terminates with a timeout status
- **AND** it generates a partial success report showing progress to that point.

#### Scenario: Runtime timeout enforcement
- **WHEN** ralph mode exceeds the configured timeout (e.g., 2 hours)
- **THEN** the orchestrator completes the current iteration and then terminates
- **AND** it creates a final checkpoint and timeout report.

#### Scenario: Rate limiting between iterations
- **WHEN** ralph mode completes an iteration
- **THEN** the orchestrator sleeps for a configured duration (default: 2 seconds) before starting the next
- **AND** this prevents API rate limit exhaustion on backend services.

#### Scenario: Error recovery with retry
- **WHEN** an agent invocation fails with a transient error (network, rate limit)
- **THEN** the orchestrator retries the iteration up to 3 times with exponential backoff
- **AND** it logs retry attempts and eventual success or failure.
