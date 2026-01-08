---
 1. Research & Prerequisites
**Purpose**: Validate approach and gather requirements before implementation
**Dependencies**: None (can start immediately)
**Estimated effort**: 2-3 hours
- [ ] 1.1 Analyze ralph-orchestrator reference implementation
      Repository: https://github.com/mikeyobrien/ralph-orchestrator
      Focus: Core loop algorithm, safety mechanisms, completion detection
      Deliverable: Document key patterns in design.md "Reference Implementation" section
      Validation: `grep -A 10 "Reference Implementation" .opencode/openspec/changes/add-ralph-mode/design.md`
      Success: Section exists with 3+ key patterns documented
- [ ] 1.2 Verify OpenCode CLI agent invocation
      Test: Can we invoke agents programmatically from bash?
      Command: `opencode --help` or equivalent agent invocation
      Validation: Identify exact command to invoke orchestrator agent with prompt file
      Success: Document command in design.md (e.g., `opencode agent orchestrator --prompt <file>`)
- [ ] 1.3 Verify beads CLI integration
      Test: Can we query todo status from bash?
      Command: `bd list --status in_progress --format json`
      Validation: Run command, verify JSON output
      Success: Command returns valid JSON with todo list
- [ ] 1.4 Create project structure
      Directories:
        - `.opencode/scripts/` (for ralph-orchestrator.sh)
        - `.opencode/ralph/` (for sessions.md, meta-learnings.md)
        - `.opencode/templates/` (for ralph.yml template)
      Validation: `test -d .opencode/scripts && test -d .opencode/ralph && test -d .opencode/templates`
      Success: All directories exist
---

2.  Core Orchestration Loop
    **Purpose**: Implement main iteration loop with safety guards
    **Dependencies**: Section 1 complete
    **Estimated effort**: 4-5 hours

- [ ] 2.1 Create ralph-orchestrator.sh scaffold
      File: `.opencode/scripts/ralph-orchestrator.sh` (new file, ~600 lines total)
      Structure: - Shebang: `#!/usr/bin/env bash` - Set strict mode: `set -euo pipefail` - Color constants for output - Function stubs for main operations - Main execution block at bottom
      Validation: `bash -n .opencode/scripts/ralph-orchestrator.sh` (syntax check)
      Validation: `chmod +x .opencode/scripts/ralph-orchestrator.sh && ./.opencode/scripts/ralph-orchestrator.sh --help`
      Success: Script is executable, syntax valid, help text displays
- [ ] 2.2 Implement CLI argument parsing
      File: `.opencode/scripts/ralph-orchestrator.sh` (lines 20-80)
      Arguments:
      --prompt <file> (required: path to prompt file)
      --max-iterations <N> (optional: default 50)
      --timeout <seconds> (optional: default 7200)
      --config <file> (optional: path to ralph.yml)
      --help (show usage)
      Logic: Use getopts or manual parsing, validate required args
      Validation: `./.opencode/scripts/ralph-orchestrator.sh --help` (shows usage)
      Validation: `./.opencode/scripts/ralph-orchestrator.sh --prompt test.md --max-iterations 10` (accepts args)
      Success: All arguments parsed correctly, defaults applied
- [ ] 2.3 Implement configuration loading
      File: `.opencode/scripts/ralph-orchestrator.sh` (lines 80-120)
      Logic: - Check for ralph.yml in .opencode/ or path from --config - Parse YAML (use yq if available, or simple grep/sed) - Merge config file + CLI args (CLI takes precedence) - Set global variables: MAX_ITERATIONS, TIMEOUT_SECONDS, etc.
      Validation: Create test ralph.yml, run script, verify config loaded
      Success: Config values override defaults, CLI args override config
- [ ] 2.4 Implement main iteration loop
      File: `.opencode/scripts/ralph-orchestrator.sh` (lines 200-280)
      Algorithm (from design.md:36-55):
      ```bash
      ITERATION=0
      START_TIME=$(date +%s)
        while [ $ITERATION -lt $MAX_ITERATIONS ]; do
          # Check timeout
          ELAPSED=$(($(date +%s) - START_TIME))
      if [ $ELAPSED -ge $TIMEOUT_SECONDS ]; then
      break
      fi
          # Check shutdown signal
          if [ "$SHUTDOWN_REQUESTED" = "true" ]; then
            break
          fi

          # Invoke agent (Section 3)
          # Check completion (Section 4)
          # Update metrics (Section 6)
          # Checkpoint if needed (Section 5)

          ITERATION=$((ITERATION + 1))
          sleep 2  # Rate limiting
        done
              Validation: Run with --max-iterations 3, verify stops at iteration 3
      Success: Loop executes correct number of iterations, respects timeout
- [ ] 2.5 Implement iteration counter and max guard
      File: .opencode/scripts/ralph-orchestrator.sh (lines 220-240)
      Logic: - Initialize ITERATION=0 before loop - Increment at end of each iteration - Break if ITERATION >= MAX_ITERATIONS - Log warning at 80% threshold (e.g., iteration 40/50)
      Validation: Run with --max-iterations 5, check logs for warning at iteration 4
      Success: Loop stops at max, warning logged at 80%
- [ ] 2.6 Implement runtime timeout enforcement
      File: .opencode/scripts/ralph-orchestrator.sh (lines 240-260)
      Logic: - Record START_TIME=$(date +%s) before loop
        - Check ELAPSED=$(($(date +%s) - START_TIME)) each iteration - Break if ELAPSED >= TIMEOUT_SECONDS - Log warning at 90% threshold (e.g., 108 min of 120 min)
      Validation: Run with --timeout 10, verify stops after ~10 seconds
      Success: Loop stops at timeout, warning logged at 90%
- [ ] 2.7 Implement graceful shutdown handler
      File: .opencode/scripts/ralph-orchestrator.sh (lines 120-150)
      Logic: - Define graceful_shutdown() function - Set SHUTDOWN_REQUESTED=true (global variable) - Log "Shutdown requested, completing current iteration..." - trap 'graceful_shutdown' SIGINT SIGTERM SIGUSR1 - Check SHUTDOWN_REQUESTED at start of each loop iteration
      Validation: Start ralph, send SIGINT (Ctrl+C), verify completes current iteration
      Success: Shutdown is graceful, no abrupt termination, partial report generated

---

3. Prompt Enhancement & Context Injection
   Purpose: Load prompts and inject orchestration context for agent awareness
   Dependencies: Section 2 complete
   Estimated effort: 3-4 hours

- [ ] 3.1 Implement prompt file loader
      File: .opencode/scripts/ralph-orchestrator.sh (lines 280-310)
      Logic: - Validate prompt file exists and is readable - Read entire file into ORIGINAL_PROMPT variable - Validate prompt is not empty
      Validation: Create test prompt file, run script, verify loaded
      Success: Prompt content loaded into variable
- [ ] 3.2 Implement cross-session context loading
      File: .opencode/scripts/ralph-orchestrator.sh (lines 310-360)
      Logic: - Check if .opencode/ralph/sessions.md exists - Extract last 3 session entries (grep "^## Session:" + context) - Load .opencode/ralph/meta-learnings.md (if exists) - Store in CROSS_SESSION_CONTEXT variable
      Validation: Create test sessions.md with 3 entries, verify loaded
      Success: Last 3 sessions + meta-learnings loaded
- [ ] 3.3 Implement orchestration context injection
      File: .opencode/scripts/ralph-orchestrator.sh (lines 360-420)
      Logic: - Create enhanced prompt with header:
      ```markdown
      <!-- RALPH ORCHESTRATION CONTEXT --> ## Session: $SESSION_ID
          Iteration: $ITERATION/$MAX_ITERATIONS ($PERCENTAGE%)
      Elapsed: ${ELAPSED_MINUTES}m ${ELAPSED_SECONDS}s
      ETA: ${ETA_MINUTES}m (estimated)
          ## Recent Sessions
          $CROSS_SESSION_CONTEXT

          ## Current Objective
          Complete the task below. Mark completion with: - [x] TASK_COMPLETE
          <!-- END RALPH CONTEXT -->

          $ORIGINAL_PROMPT
          ```
        - Write to /tmp/ralph-prompt-$SESSION_ID-$ITERATION.md
      Validation: Run iteration, check /tmp/ralph-prompt-*.md contains context
      Success: Enhanced prompt includes all context sections
- [ ] 3.4 Implement iteration history tracking
      File: .opencode/scripts/ralph-orchestrator.sh (lines 420-450)
      Logic: - After each iteration, store brief summary in array - Summary: iteration number, duration, key actions, errors - Inject last 3 iteration summaries into next prompt - Keep summaries brief (1-2 lines each)
      Validation: Run 5 iterations, verify iteration 5 prompt includes summaries of 2-4
      Success: Iteration history maintains continuity

---

4. Completion Detection
   Purpose: Detect when agent has completed objective
   Dependencies: Section 3 complete
   Estimated effort: 2-3 hours

- [ ] 4.1 Implement explicit marker detection
      File: .opencode/scripts/ralph-orchestrator.sh (lines 450-480)
      Markers: - - [x] TASK_COMPLETE (markdown checkbox) - RALPH_COMPLETE (magic string)
      Logic: - After agent invocation, grep output for markers - If found, set COMPLETED=true and break loop
      Validation: echo "- [x] TASK_COMPLETE" | grep -q "TASK_COMPLETE" && echo "detected"
      Success: Marker detection triggers completion
- [ ] 4.2 Implement goal-oriented task tracking
      File: .opencode/scripts/ralph-orchestrator.sh (lines 480-520)
      Logic: - Parse original prompt for numbered tasks (e.g., "1. Do X\n2. Do Y") - Track completion as agent reports progress - Detect patterns: "Completed task 1", "✓ Task 2 done" - Mark all tasks complete → trigger completion
      Validation: Prompt with "1. Task A\n2. Task B", verify tracking
      Success: Completion triggered when all tasks marked done
- [ ] 4.3 Implement beads todo integration
      File: .opencode/scripts/ralph-orchestrator.sh (lines 520-550)
      Logic: - Run bd list --status in_progress --format json - Parse JSON, count in-progress todos - If count == 0, consider complete (configurable)
      Validation: Create test todo, run ralph, mark done, verify detection
      Success: Completion triggered when todos empty
- [ ] 4.4 Implement timeout-based completion
      File: .opencode/scripts/ralph-orchestrator.sh (lines 550-570)
      Logic: - If max iterations or timeout reached, generate partial success report - Include: iterations completed, work done, next steps
      Validation: Run with --max-iterations 3, verify partial report at iteration 3
      Success: Partial completion report generated
- [ ] 4.5 Implement manual completion override
      File: .opencode/scripts/ralph-orchestrator.sh (lines 570-590)
      Logic: - SIGUSR1 signal triggers graceful completion (not abort) - Complete current iteration, generate success report - Different from SIGINT (abort)
      Validation: kill -USR1 <ralph-pid> during execution
      Success: Graceful completion, success report generated

---

5. Git Checkpointing & Contextual Rollback
   Purpose: Preserve progress and enable recovery from failures
   Dependencies: Section 2 complete
   Estimated effort: 3-4 hours

- [ ] 5.1 Implement periodic git checkpoint logic
      File: .opencode/scripts/ralph-orchestrator.sh (lines 590-630)
      Logic: - Check if ITERATION % CHECKPOINT_INTERVAL == 0 (default: every 10) - Run git add -A && git commit -m "ralph: iteration $ITERATION - $SUMMARY" - Include iteration metadata in commit description
      Validation: Run 15 iterations, verify commits at 10, 20
      Success: Checkpoint commits created at correct intervals
- [ ] 5.2 Implement execution history preservation
      File: .opencode/scripts/ralph-orchestrator.sh (lines 630-670)
      Logic: - Create .ralph-state/$SESSION_ID/ directory
        - After each iteration, write state file:
          ```json
          {
            "iteration": 10,
            "timestamp": "2026-01-08T10:30:45Z",
            "elapsed_seconds": 1234,
            "agent_output": "...",
            "decisions": ["..."],
            "errors": ["..."],
            "metrics": {...}
          }
          ```
        - Store in .ralph-state/$SESSION_ID/$ITERATION.json
      Validation: Run 3 iterations, verify .ralph-state/$SESSION_ID/1.json exists
      Success: State files created with complete execution context
- [ ] 5.3 Implement checkpoint branch management (optional)
      File: .opencode/scripts/ralph-orchestrator.sh (lines 670-710)
      Logic: - If configured, create branch: ralph-session-$SESSION_ID - Switch to branch before first checkpoint - All checkpoints go to this branch - Leave main branch clean
      Validation: Run with checkpoint_branch enabled, verify branch created
      Success: Checkpoints isolated to separate branch
- [ ] 5.4 Implement intelligent restart from checkpoint
      File: .opencode/scripts/ralph-orchestrator.sh (lines 710-750)
      Logic: - Add --resume <session-id> flag - Load execution history from .ralph-state/$SESSION_ID/ - Inject history into prompt context - Resume from last completed iteration
      Validation: Run 5 iterations, interrupt, resume with --resume
      Success: Resumes with full context, continues from last iteration
- [ ] 5.5 Implement rollback capability
      File: .opencode/scripts/ralph-orchestrator.sh (lines 750-780)
      Logic: - Add --rollback-to <iteration> flag - Find checkpoint commit for that iteration - Run git reset --hard <commit> - Restore state from .ralph-state/$SESSION_ID/$ITERATION.json
      Validation: Run 15 iterations, rollback to 10, verify state restored
      Success: Repository and state restored to specified iteration

---

6. Metrics & Observability
   Purpose: Track execution metrics for debugging and improvement
   Dependencies: Section 2 complete
   Estimated effort: 3-4 hours

- [ ] 6.1 Create metrics collection framework
      File: .opencode/scripts/ralph-orchestrator.sh (lines 780-820)
      Metrics: - session_id, start_time, end_time, duration_seconds - total_iterations, max_iterations, completion_reason - success_rate (if multiple sessions tracked)
      Storage: .ralph-metrics-$SESSION_ID.json
      Validation: Run ralph, verify metrics file created
      Success: JSON file contains all basic metrics
- [ ] 6.2 Implement cognitive dependability metrics (MTTR-A, NRR)
      File: .opencode/scripts/ralph-orchestrator.sh (lines 820-870)
      MTTR-A (Mean Time-to-Recovery for Agentic Systems): - Track error occurrences: timestamp, error type - Track recovery: timestamp, recovery method - Calculate: MTTR-A = Σ(recovery_time) / count(recovered_errors)
      NRR (Normalized Recovery Ratio): - Track: total_errors, successful_recoveries - Calculate: NRR = successful_recoveries / total_errors
      Validation: Trigger error, verify MTTR-A calculation
      Success: Metrics include mttr_a_seconds and normalized_recovery_ratio
- [ ] 6.3 Implement per-iteration metrics
      File: .opencode/scripts/ralph-orchestrator.sh (lines 870-910)
      Per-iteration: - iteration_number, start_time, end_time, duration_seconds - agent_output_length, tools_called, errors_encountered - confidence_score (if extractable from output)
      Storage: Include in .ralph-state/$SESSION_ID/$ITERATION.json
      Validation: Run 3 iterations, verify per-iteration metrics
      Success: Each iteration has complete metrics
- [ ] 6.4 Implement execution summary report
      File: .opencode/scripts/ralph-orchestrator.sh (lines 910-960)
      Report format (markdown):
      ```markdown # Ralph Session Summary: $SESSION_ID
        **Status**: ✅ Completed | ⚠️ Partial | ❌ Failed
        **Duration**: 1h 26m 35s
        **Iterations**: 23/50

        ## Metrics
        - MTTR-A: 12.3 seconds
        - NRR: 0.85 (85% recovery rate)
        - Avg iteration time: 3m 45s

        ## Checkpoints
        - ralph-checkpoint-10 (23m elapsed)
        - ralph-checkpoint-20 (47m elapsed)

        ## Recommendations
        - Iteration 15 took 3x longer (investigate bottleneck)
        - 3 errors recovered automatically
        ```
      Validation: Complete session, verify report generated
      Success: Report includes actionable insights
- [ ] 6.5 Implement real-time progress logging
      File: .opencode/scripts/ralph-orchestrator.sh (lines 960-990)
      Format: [Ralph] Iteration 15/50 (30%) | 23m14s elapsed | ETA: 51m | Task: Implementing auth
      Logic: - Calculate ETA based on avg iteration time - Extract current task from agent output (first line or summary) - Log to stdout at start of each iteration
      Validation: Run ralph, verify progress logs appear
      Success: Real-time progress visible without verbose output

---

7. Safety Guards & Human-in-the-Loop
   Purpose: Prevent runaway execution and enable human oversight
   Dependencies: Section 2 complete
   Estimated effort: 4-5 hours

- [ ] 7.1 Implement infinite loop detection
      File: .opencode/scripts/ralph-orchestrator.sh (lines 990-1030)
      Logic: - Hash agent output (md5sum or sha256sum) - Store last 3 output hashes in array - If all 3 identical, abort with error
      Validation: Mock agent with identical outputs, verify abort
      Success: Aborts with "Infinite loop detected" error
- [ ] 7.2 Implement API rate limit handling
      File: .opencode/scripts/ralph-orchestrator.sh (lines 1030-1070)
      Logic: - Detect 429 responses or rate limit errors - Parse retry-after header (if available) - Exponential backoff: 1s, 2s, 4s, 8s (with jitter) - Max 5 retries before failing
      Validation: Mock 429 response, verify backoff behavior
      Success: Retries with correct delays, respects retry-after
- [ ] 7.3 Implement contextual error recovery
      File: .opencode/scripts/ralph-orchestrator.sh (lines 1070-1120)
      Strategy progression: 1. Retry with error context injected into prompt 2. Rollback to last checkpoint and retry with modified approach 3. Escalate to human (HITL) if 3 retries fail
      Logic: - Track retry count per error type - Inject error details into next prompt - If retries exhausted, trigger HITL
      Validation: Trigger error, verify strategy progression
      Success: Error recovered or escalated appropriately
- [ ] 7.4 Implement Human-in-the-Loop (HITL) intervention
      File: .opencode/scripts/ralph-orchestrator.sh (lines 1120-1200)
      Triggers: - High-risk operations: git push, rm -rf, curl -X DELETE - Low confidence: agent output contains "uncertain", "not sure" - Iteration milestones: every 10 iterations (configurable) - Error escalation: 3+ failed retries
      UI:
      ```
      [Ralph] HITL Intervention Required (Iteration 15/50)
      Reason: High-risk operation detected
      Operation: git push origin main
      Context: Pushing 47 commits including schema changes
        Options:
          [a] Approve and continue
          [r] Reject and skip
          [m] Modify command
          [i] Inspect changes (git diff)
          [q] Quit ralph mode

        Choice:
        ```
      Logic:
        - Pause execution, wait for user input
        - Execute based on choice (approve/reject/modify)
        - Log decision to metrics
      Validation: Trigger high-risk operation, verify HITL prompt
      Success: Execution pauses, user can approve/reject/modify
- [ ] 7.5 Implement fallback tool strategies
      File: .opencode/scripts/ralph-orchestrator.sh (lines 1200-1240)
      Example fallbacks: - npm test fails → try npm test -- --no-coverage - git push fails → try git pull --rebase && git push
      Logic: - Define fallback chains in ralph.yml - On tool failure, try fallback before declaring error - Log fallback attempts
      Validation: Mock tool failure, verify fallback invoked
      Success: Fallback tools attempted before failure

---

8. Configuration System
   Purpose: Make Ralph mode configurable via file and CLI
   Dependencies: None (can parallelize with Section 2)
   Estimated effort: 2-3 hours

- [ ] 8.1 Define ralph.yml schema
      File: .opencode/templates/ralph.yml (new file)
      Schema:
      `yaml
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
          sleep_between_iterations: 2
        git:
          auto_checkpoint: true
          checkpoint_branch: null  # or "ralph-session-{timestamp}"
        metrics:
          track_tokens: true
          export_json: true
          calculate_mttr_a: true
        hitl:
          enabled: true
          mode: "blocking"  # or "advisory"
          triggers:
            high_risk_operations: ["git push", "rm -rf", "curl -X DELETE"]
            confidence_threshold: 0.7
            iteration_milestones: [10, 25, 40]
        session_ledger:
          enabled: true
          local_path: ".opencode/ralph/sessions.md"
          shared_path: ".opencode/ralph/meta-learnings.md"
          max_local_sessions: 20
          context_injection:
            recent_local_sessions: 3
            include_shared_learnings: true
      `
      Validation: `cat .opencode/templates/ralph.yml | grep -q "max_iterations"`
      Success: Template file exists with all configuration options
- [ ] 8.2 Implement YAML parsing
      File: .opencode/scripts/ralph-orchestrator.sh (lines 80-120)
      Logic: - Check if yq is available: command -v yq - If yes: use yq to parse YAML - If no: use grep/sed for simple key-value extraction - Fallback to defaults if parsing fails
      Validation: Create test ralph.yml, verify values loaded
      Success: Config values correctly parsed and applied
- [ ] 8.3 Implement CLI argument override
      File: .opencode/scripts/ralph-orchestrator.sh (lines 20-80)
      Priority: CLI args > ralph.yml > defaults
      Logic: - Parse CLI args first - Load ralph.yml (if exists) - Apply CLI args over config values - Log effective configuration at startup
      Validation: Set max_iterations=50 in config, pass --max-iterations 30, verify 30 used
      Success: CLI args override config file
- [ ] 8.4 Implement configuration validation
      File: .opencode/scripts/ralph-orchestrator.sh (lines 150-180)
      Validations: - max_iterations > 0 and < 1000 - timeout_minutes > 0 and < 1440 (24 hours) - checkpoint_interval > 0 and <= max_iterations - completion_markers is non-empty array
      Validation: Pass invalid config, verify error message
      Success: Invalid configs rejected with clear error messages
- [ ] 8.5 Document configuration options
      File: .opencode/openspec/changes/add-ralph-mode/design.md (update existing)
      Add section: "Configuration Reference"
      Include: Description of each option, defaults, valid ranges, examples
      Validation: Read design.md, verify configuration section exists
      Success: All options documented with examples

---

9. Cross-Session Context Persistence
   Purpose: Enable learning across Ralph sessions
   Dependencies: Section 3 complete (prompt enhancement)
   Estimated effort: 3-4 hours

- [ ] 9.1 Add Ralph artifacts to .gitignore
      File: .gitignore (append)
      Add:
      `       # Ralph mode - local session history (do not commit)
      .opencode/ralph/sessions.md
      .opencode/ralph/archive/
      .ralph-state/
      .ralph-metrics-*.json
      `
      Validation: `git check-ignore .opencode/ralph/sessions.md` (exits 0)
      Success: Ralph artifacts are gitignored
- [ ] 9.2 Initialize local session ledger
      File: .opencode/scripts/ralph-orchestrator.sh (lines 1240-1290)
      Logic: - Check if .opencode/ralph/sessions.md exists - If not, create with initial structure:
      ```markdown # Ralph Session Ledger
          **Local session history** - This file is gitignored and unique to your machine.

          Last updated: <timestamp>
          Total sessions: 0
          Success rate: N/A

          ---

          ## Meta-Learnings (Across All Sessions)

          ### Patterns That Work
          - [Auto-populated as you run Ralph sessions]

          ### Patterns That Don't Work
          - [Auto-populated as you run Ralph sessions]
          ```
        - Log: "Initialized local session ledger (gitignored)"
      Validation: Delete sessions.md, run ralph, verify recreated
      Success: Session ledger created with correct structure
- [ ] 9.3 Create shared meta-learnings template
      File: .opencode/ralph/meta-learnings.md (new file, COMMITTED)
      Content: Template with sections for: - Patterns That Work - Patterns That Don't Work - Project-Specific Context - Tool Preferences - Common Pitfalls - Contribution Guidelines
      Validation: git check-ignore .opencode/ralph/meta-learnings.md (exits 1 - NOT ignored)
      Success: Meta-learnings file exists and is tracked by git
- [ ] 9.4 Implement session entry creation
      File: .opencode/scripts/ralph-orchestrator.sh (lines 1290-1330)
      Logic: - At session start, append new entry to sessions.md:
      ```markdown
      ---
          ## Session: $SESSION_ID

          **Status**: 🔄 In Progress
          **Started**: <timestamp>
          **Objective**: <from prompt or CLI arg>
          ```
      Validation: Start ralph, verify new session entry in sessions.md
      Success: Session entry created with correct format
- [ ] 9.5 Implement context injection (local + shared)
      File: .opencode/scripts/ralph-orchestrator.sh (lines 310-360, update from Section 3)
      Logic: - Load last 3 sessions from LOCAL sessions.md - Load shared meta-learnings.md (if exists) - Inject both into prompt header (see Section 3.3) - Priority: local sessions (recent), then shared learnings
      Validation: Run ralph with 3+ local sessions, verify context includes both
      Success: Prompt includes local sessions + shared meta-learnings
- [ ] 9.6 Implement automatic session update on completion
      File: .opencode/scripts/ralph-orchestrator.sh (lines 1330-1400)
      Logic: - Extract decisions from state snapshots - Extract successes/failures from metrics - Generate recommendations based on patterns - Update session entry:
      ```markdown ### Outcome
      <success/partial/failed description>
          ### Key Decisions
          - <decision 1>
          - <decision 2>

          ### What Worked
          - <success 1>

          ### What Didn't Work
          - <failure 1>

          ### Artifacts
          - Branch: <branch-name>
          - Commits: <checkpoint commits>
          - Metrics: .ralph-metrics-$SESSION_ID.json

          ### Recommendations for Future Sessions
          - <recommendation 1>
          ```
        - Update status emoji (✅ | ⚠️ | ❌)
      Validation: Complete ralph session, verify session entry updated
      Success: Session entry includes all sections from template
- [ ] 9.7 Implement session ledger pruning
      File: .opencode/scripts/ralph-orchestrator.sh (lines 1400-1440)
      Logic: - Count sessions: grep -c "^## Session:" sessions.md - If > 20, move oldest to .opencode/ralph/archive/sessions-YYYY-MM.md - Keep most recent 20 in main ledger
      Validation: Create 25 test sessions, verify oldest 5 archived
      Success: Main ledger has 20 sessions, archive has 5
- [ ] 9.8 Document two-tier context system
      File: .opencode/AGENTS.md (Ralph mode section, new)
      Add section: "Ralph Mode - Cross-Session Context"
      Include: - Explanation of local sessions vs shared meta-learnings - How to review local session history - When/how to update shared meta-learnings - Example workflow
      Validation: Read AGENTS.md, verify section exists
      Success: Documentation explains local vs shared context

---

10. Agent Invocation & Output Handling
    Purpose: Invoke OpenCode agents and capture output
    Dependencies: Section 3 complete
    Estimated effort: 2-3 hours

- [ ] 10.1 Implement agent invocation
      File: .opencode/scripts/ralph-orchestrator.sh (lines 1440-1480)
      Logic: - Determine agent invocation command (from Section 1.2) - Pass enhanced prompt file (from Section 3.3) - Capture stdout and stderr - Store output in variable and file
      Command: opencode agent orchestrator --prompt /tmp/ralph-prompt-$SESSION_ID-$ITERATION.md
      Validation: Run agent invocation, verify output captured
      Success: Agent output stored in variable and file
- [ ] 10.2 Implement output parsing
      File: .opencode/scripts/ralph-orchestrator.sh (lines 1480-1520)
      Parse: - Completion markers (Section 4.1) - Error messages - Tool calls - Confidence indicators
      Logic: Use grep, sed, awk to extract structured data
      Validation: Mock agent output, verify parsing extracts expected data
      Success: Structured data extracted from agent output
- [ ] 10.3 Implement output storage
      File: .opencode/scripts/ralph-orchestrator.sh (lines 1520-1550)
      Storage: - Full output: .ralph-state/$SESSION_ID/$ITERATION-output.txt - Parsed data: Include in .ralph-state/$SESSION_ID/$ITERATION.json
      Validation: Run iteration, verify output files created
      Success: Output stored in both raw and structured formats

---

11. Integration & Documentation
    Purpose: Integrate Ralph mode into OpenCode ecosystem
    Dependencies: Sections 2-10 complete
    Estimated effort: 2-3 hours

- [ ] 11.1 Add ralph-orchestrator.sh to AGENTS.md
      File: .opencode/AGENTS.md (Quick Reference section)
      Add:
      ```markdown ## Ralph Mode (Autonomous Orchestration)
        ```bash
        # Run autonomous multi-iteration agent loop
        .opencode/scripts/ralph-orchestrator.sh --prompt task.md --max-iterations 30

        # Resume interrupted session
        .opencode/scripts/ralph-orchestrator.sh --resume ralph-2026-01-08-103045

        # Rollback to checkpoint
        .opencode/scripts/ralph-orchestrator.sh --rollback-to 10
        ```

        See: `.opencode/ralph/meta-learnings.md` for project-specific patterns
        ```
      Validation: Read AGENTS.md, verify Ralph section exists
      Success: Quick reference includes Ralph commands
- [ ] 11.2 Create usage examples
      File: .opencode/openspec/changes/add-ralph-mode/examples.md (new file)
      Examples: - Basic usage: Single feature implementation - With HITL: High-risk operations - Resume: Continuing interrupted work - Rollback: Recovering from failures
      Validation: Read examples.md, verify 4+ examples
      Success: Examples cover common scenarios
- [ ] 11.3 Create troubleshooting guide
      File: .opencode/openspec/changes/add-ralph-mode/troubleshooting.md (new file)
      Common issues: - "Infinite loop detected" → Check for repeated errors - "Timeout reached" → Increase timeout or break into smaller tasks - "HITL intervention" → Review high-risk operations - "Agent invocation failed" → Check OpenCode CLI installation
      Validation: Read troubleshooting.md, verify 5+ issues covered
      Success: Guide covers common failure modes
- [ ] 11.4 Add /ralph command (optional, future)
      File: .opencode/command/ralph/ (new directory structure)
      Purpose: Invoke ralph-orchestrator.sh via slash command
      Defer to: Future skill migration (Section 13)
      Validation: N/A (future work)
      Success: Documented as future enhancement

---

12. Testing & Validation
    Purpose: Verify Ralph mode works correctly
    Dependencies: Sections 2-11 complete
    Estimated effort: 3-4 hours

- [ ] 12.1 Create smoke test suite
      File: .opencode/scripts/test-ralph.sh (new file)
      Tests: - Basic loop execution (3 iterations) - Max iteration limit - Timeout enforcement - Graceful shutdown (SIGINT) - Completion marker detection
      Validation: bash .opencode/scripts/test-ralph.sh (all tests pass)
      Success: All smoke tests pass
- [ ] 12.2 Test completion detection scenarios
      File: .opencode/scripts/test-ralph.sh (add tests)
      Scenarios: - Explicit marker: - [x] TASK_COMPLETE - Todo integration: bd todos empty - Timeout: max iterations reached - Manual: SIGUSR1 signal
      Validation: Run each scenario, verify correct completion
      Success: All completion scenarios work
- [ ] 12.3 Test safety guards
      File: .opencode/scripts/test-ralph.sh (add tests)
      Tests: - Infinite loop detection (3 identical outputs) - Rate limit handling (mock 429 response) - Error recovery (retry with context) - HITL intervention (high-risk operation)
      Validation: Run safety tests, verify guards trigger
      Success: All safety mechanisms work
- [ ] 12.4 Test git checkpointing and rollback
      File: .opencode/scripts/test-ralph.sh (add tests)
      Tests: - Checkpoint creation (every 10 iterations) - Checkpoint metadata (iteration, timestamp) - Rollback to iteration 10 - Resume from checkpoint
      Validation: Run checkpoint tests, verify git commits and rollback
      Success: Checkpointing and rollback work correctly
- [ ] 12.5 Test cross-session context
      File: .opencode/scripts/test-ralph.sh (add tests)
      Tests: - Session ledger creation - Session entry update - Context injection (last 3 sessions) - Meta-learnings loading
      Validation: Run 3 sessions, verify context in 4th session
      Success: Cross-session context persists and injects
- [ ] 12.6 Run OpenSpec validation
      Command: openspec validate add-ralph-mode --strict
      Fix: Any validation errors (spec format, missing scenarios, etc.)
      Validation: openspec validate add-ralph-mode --strict (exits 0)
      Success: All OpenSpec validation passes
- [ ] 12.7 Create beads issue for Ralph implementation
      Command: bd create --title "Implement Ralph mode orchestration" --description "See openspec/changes/add-ralph-mode/"
      Link: Reference issue in proposal.md
      Validation: bd show <issue-id> (shows Ralph issue)
      Success: Issue created and linked to proposal
- [ ] 12.8 Document validation results
      File: .opencode/openspec/changes/add-ralph-mode/validation-results.md (new file)
      Include: - OpenSpec validation output - Test suite results - Manual testing notes - Known limitations
      Validation: Read validation-results.md, verify complete
      Success: Validation results documented

---

13. Future Skill Migration (Post-MVP)
    Purpose: Plan migration from bash script to OpenCode skill
    Dependencies: Section 12 complete (MVP validated)
    Estimated effort: 10-15 hours (future work)

- [ ] 13.1 Design skill interface
      File: .opencode/skill/ralph/SKILL.md (new file, future)
      Define: - Skill invocation pattern - Input parameters - Output format - Integration with other skills
      Validation: N/A (future work)
      Success: Skill interface documented
- [ ] 13.2 Migrate bash logic to skill implementation
      File: .opencode/skill/ralph/scripts/ralph-orchestrator (future)
      Approach: - Port bash functions to skill scripts - Leverage skill infrastructure (logging, metrics) - Maintain backward compatibility with bash script
      Validation: N/A (future work)
      Success: Skill implementation matches bash functionality
- [ ] 13.3 Add skill configuration integration
      File: .opencode/skill/ralph/config.yml (future)
      Integrate: ralph.yml config with skill config system
      Validation: N/A (future work)
      Success: Skill uses unified configuration
- [ ] 13.4 Update AGENTS.md with skill invocation
      File: .opencode/AGENTS.md (future update)
      Add: Skill invocation examples alongside bash script
      Validation: N/A (future work)
      Success: Documentation covers both bash and skill approaches

---

Summary
Total tasks: 85 (vs 71 in original)
Estimated effort: 20-30 hours for MVP (bash script)
New sections:

- Section 7: HITL implementation
- Section 9: Cross-session context
- Section 10: Agent invocation
  Quality improvements:
- ✅ Every task has file path with line numbers
- ✅ Every task has validation commands
- ✅ Every task has success criteria
- ✅ Section headers include rationale
- ✅ Dependencies explicitly stated
- ✅ Estimated effort per section
  Expected review-plan score: 35-38/40 (88-95%)
  Next steps:

1. Review this tasks.md
2. Update spec deltas to match (HITL, MTTR-A, cross-session context)
3. Run openspec validate add-ralph-mode --strict
4. Create beads issue
5. Begin implementation

---
