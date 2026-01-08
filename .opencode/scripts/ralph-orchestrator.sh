#!/usr/bin/env bash
# ralph-orchestrator.sh - Autonomous agent orchestration loop
# Implements the Ralph Wiggum technique for continuous agent iteration
#
# Usage: ./ralph-orchestrator.sh --prompt <file> [options]
#
# See: .opencode/openspec/changes/add-ralph-mode/design.md

set -euo pipefail

# =============================================================================
# CONSTANTS & COLORS
# =============================================================================

readonly VERSION="1.0.0"
readonly SCRIPT_NAME="ralph-orchestrator"
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Colors for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[0;33m'
readonly BLUE='\033[0;34m'
readonly MAGENTA='\033[0;35m'
readonly CYAN='\033[0;36m'
readonly BOLD='\033[1m'
readonly NC='\033[0m' # No Color

# =============================================================================
# DEFAULT CONFIGURATION
# =============================================================================

# Core settings
DEFAULT_MAX_ITERATIONS=50
DEFAULT_TIMEOUT_SECONDS=7200  # 2 hours
DEFAULT_CHECKPOINT_INTERVAL=10
DEFAULT_SLEEP_BETWEEN_ITERATIONS=2

# Safety settings
DEFAULT_MAX_IDENTICAL_OUTPUTS=3
DEFAULT_DETECT_INFINITE_LOOP=true

# Completion markers
DEFAULT_COMPLETION_MARKERS=(
  "- [x] TASK_COMPLETE"
  "RALPH_COMPLETE"
)

# =============================================================================
# GLOBAL STATE
# =============================================================================

# Configuration (set by CLI args or config file)
PROMPT_FILE=""
MAX_ITERATIONS="$DEFAULT_MAX_ITERATIONS"
TIMEOUT_SECONDS="$DEFAULT_TIMEOUT_SECONDS"
CHECKPOINT_INTERVAL="$DEFAULT_CHECKPOINT_INTERVAL"
SLEEP_BETWEEN_ITERATIONS="$DEFAULT_SLEEP_BETWEEN_ITERATIONS"
CONFIG_FILE=""
AGENT_NAME="orchestrator"
VERBOSE=false
DRY_RUN=false
RESUME_SESSION=""
ROLLBACK_TO=""

# Runtime state
SESSION_ID=""
ITERATION=0
START_TIME=0
SHUTDOWN_REQUESTED=false
COMPLETED=false
COMPLETION_REASON=""

# Output hashes for infinite loop detection
declare -a OUTPUT_HASHES=()

# Iteration history for context injection
declare -a ITERATION_HISTORY=()

# Error tracking for MTTR-A calculation
declare -a ERROR_TIMESTAMPS=()
declare -a RECOVERY_TIMESTAMPS=()
TOTAL_ERRORS=0
RECOVERED_ERRORS=0

# State directory
STATE_DIR=""

# =============================================================================
# LOGGING FUNCTIONS
# =============================================================================

log_info() {
  echo -e "${BLUE}[Ralph]${NC} $*"
}

log_success() {
  echo -e "${GREEN}[Ralph]${NC} $*"
}

log_warning() {
  echo -e "${YELLOW}[Ralph]${NC} $*"
}

log_error() {
  echo -e "${RED}[Ralph]${NC} $*" >&2
}

log_debug() {
  if [[ "$VERBOSE" == "true" ]]; then
    echo -e "${MAGENTA}[Ralph DEBUG]${NC} $*"
  fi
}

log_progress() {
  local iteration="$1"
  local max="$2"
  local elapsed="$3"
  local task="${4:-}"
  
  local percentage=$((iteration * 100 / max))
  local elapsed_min=$((elapsed / 60))
  local elapsed_sec=$((elapsed % 60))
  
  # Calculate ETA based on average iteration time
  local eta="N/A"
  if [[ $iteration -gt 0 ]]; then
    local avg_time=$((elapsed / iteration))
    local remaining=$((max - iteration))
    local eta_seconds=$((avg_time * remaining))
    local eta_min=$((eta_seconds / 60))
    eta="${eta_min}m"
  fi
  
  echo -e "${CYAN}[Ralph]${NC} Iteration ${BOLD}${iteration}/${max}${NC} (${percentage}%) | ${elapsed_min}m${elapsed_sec}s elapsed | ETA: ${eta}${task:+ | Task: $task}"
}

# =============================================================================
# UTILITY FUNCTIONS
# =============================================================================

generate_session_id() {
  echo "ralph-$(date +%Y-%m-%d-%H%M%S)"
}

get_elapsed_seconds() {
  echo $(($(date +%s) - START_TIME))
}

hash_output() {
  local output="$1"
  echo "$output" | md5 2>/dev/null || echo "$output" | md5sum | cut -d' ' -f1
}

# =============================================================================
# SIGNAL HANDLERS
# =============================================================================

graceful_shutdown() {
  log_warning "Shutdown requested, completing current iteration..."
  SHUTDOWN_REQUESTED=true
}

trap 'graceful_shutdown' SIGINT SIGTERM

# SIGUSR1 triggers graceful completion (not abort)
graceful_complete() {
  log_info "Manual completion triggered via SIGUSR1"
  COMPLETED=true
  COMPLETION_REASON="manual_signal"
}

trap 'graceful_complete' SIGUSR1

# =============================================================================
# HELP & USAGE
# =============================================================================

show_help() {
  cat << EOF
${BOLD}Ralph Orchestrator${NC} v${VERSION}
Autonomous agent orchestration loop using the Ralph Wiggum technique.

${BOLD}USAGE:${NC}
  $SCRIPT_NAME --prompt <file> [options]
  $SCRIPT_NAME --resume <session-id>
  $SCRIPT_NAME --rollback-to <iteration>
  $SCRIPT_NAME --help

${BOLD}REQUIRED:${NC}
  --prompt <file>         Path to prompt file containing task description

${BOLD}OPTIONS:${NC}
  --max-iterations <N>    Maximum iterations (default: $DEFAULT_MAX_ITERATIONS)
  --timeout <seconds>     Maximum runtime in seconds (default: $DEFAULT_TIMEOUT_SECONDS)
  --config <file>         Path to ralph.yml configuration file
  --agent <name>          Agent to use (default: orchestrator)
  --checkpoint <N>        Git checkpoint interval (default: $DEFAULT_CHECKPOINT_INTERVAL)
  --verbose               Enable verbose output
  --dry-run               Test mode without executing agents

${BOLD}RECOVERY:${NC}
  --resume <session-id>   Resume from a previous session
  --rollback-to <N>       Rollback to specific iteration

${BOLD}SIGNALS:${NC}
  SIGINT/SIGTERM          Graceful shutdown after current iteration
  SIGUSR1                 Mark task as complete and generate success report

${BOLD}EXAMPLES:${NC}
  # Basic usage
  $SCRIPT_NAME --prompt task.md

  # With limits
  $SCRIPT_NAME --prompt task.md --max-iterations 30 --timeout 3600

  # Resume interrupted session
  $SCRIPT_NAME --resume ralph-2026-01-08-103045

  # Verbose mode
  $SCRIPT_NAME --prompt task.md --verbose

${BOLD}COMPLETION MARKERS:${NC}
  The agent can signal completion by including one of these in output:
  - "- [x] TASK_COMPLETE"
  - "RALPH_COMPLETE"

${BOLD}FILES:${NC}
  .ralph-state/<session>/     Execution state and history
  .ralph-metrics-<session>.json  Session metrics
  .opencode/ralph/sessions.md    Local session ledger (gitignored)
  .opencode/ralph/meta-learnings.md  Shared learnings (committed)

EOF
}

# =============================================================================
# CLI ARGUMENT PARSING
# =============================================================================

parse_args() {
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --prompt)
        PROMPT_FILE="$2"
        shift 2
        ;;
      --max-iterations)
        MAX_ITERATIONS="$2"
        shift 2
        ;;
      --timeout)
        TIMEOUT_SECONDS="$2"
        shift 2
        ;;
      --config)
        CONFIG_FILE="$2"
        shift 2
        ;;
      --agent)
        AGENT_NAME="$2"
        shift 2
        ;;
      --checkpoint)
        CHECKPOINT_INTERVAL="$2"
        shift 2
        ;;
      --verbose)
        VERBOSE=true
        shift
        ;;
      --dry-run)
        DRY_RUN=true
        shift
        ;;
      --resume)
        RESUME_SESSION="$2"
        shift 2
        ;;
      --rollback-to)
        ROLLBACK_TO="$2"
        shift 2
        ;;
      --help|-h)
        show_help
        exit 0
        ;;
      *)
        log_error "Unknown option: $1"
        echo "Use --help for usage information."
        exit 1
        ;;
    esac
  done
}

# =============================================================================
# CONFIGURATION LOADING
# =============================================================================

load_config() {
  # Look for config file in order of precedence
  local config_paths=(
    "$CONFIG_FILE"
    "$PROJECT_ROOT/ralph.yml"
    "$PROJECT_ROOT/.opencode/ralph.yml"
  )
  
  local found_config=""
  for path in "${config_paths[@]}"; do
    if [[ -n "$path" && -f "$path" ]]; then
      found_config="$path"
      break
    fi
  done
  
  if [[ -z "$found_config" ]]; then
    log_debug "No config file found, using defaults"
    return 0
  fi
  
  log_info "Loading config from: $found_config"
  
  # Parse YAML using yq if available, otherwise use grep/sed
  if command -v yq &>/dev/null; then
    # Use yq for proper YAML parsing
    local val
    
    val=$(yq -r '.ralph.max_iterations // empty' "$found_config" 2>/dev/null)
    [[ -n "$val" && -z "$MAX_ITERATIONS_CLI" ]] && MAX_ITERATIONS="$val"
    
    val=$(yq -r '.ralph.timeout_minutes // empty' "$found_config" 2>/dev/null)
    [[ -n "$val" && -z "$TIMEOUT_CLI" ]] && TIMEOUT_SECONDS=$((val * 60))
    
    val=$(yq -r '.ralph.checkpoint_interval // empty' "$found_config" 2>/dev/null)
    [[ -n "$val" && -z "$CHECKPOINT_CLI" ]] && CHECKPOINT_INTERVAL="$val"
    
    val=$(yq -r '.ralph.safety.sleep_between_iterations // empty' "$found_config" 2>/dev/null)
    [[ -n "$val" ]] && SLEEP_BETWEEN_ITERATIONS="$val"
  else
    # Fallback to simple grep/sed parsing
    log_debug "yq not found, using simple config parsing"
    
    local val
    val=$(grep -E '^\s*max_iterations:' "$found_config" 2>/dev/null | sed 's/.*:\s*//' | tr -d ' ')
    [[ -n "$val" && -z "$MAX_ITERATIONS_CLI" ]] && MAX_ITERATIONS="$val"
    
    val=$(grep -E '^\s*timeout_minutes:' "$found_config" 2>/dev/null | sed 's/.*:\s*//' | tr -d ' ')
    [[ -n "$val" && -z "$TIMEOUT_CLI" ]] && TIMEOUT_SECONDS=$((val * 60))
    
    val=$(grep -E '^\s*checkpoint_interval:' "$found_config" 2>/dev/null | sed 's/.*:\s*//' | tr -d ' ')
    [[ -n "$val" && -z "$CHECKPOINT_CLI" ]] && CHECKPOINT_INTERVAL="$val"
  fi
  
  log_debug "Config loaded: max_iterations=$MAX_ITERATIONS, timeout=$TIMEOUT_SECONDS, checkpoint=$CHECKPOINT_INTERVAL"
}

# =============================================================================
# CONFIGURATION VALIDATION
# =============================================================================

validate_config() {
  local errors=()
  
  # Validate max_iterations
  if [[ ! "$MAX_ITERATIONS" =~ ^[0-9]+$ ]] || [[ "$MAX_ITERATIONS" -le 0 ]] || [[ "$MAX_ITERATIONS" -gt 1000 ]]; then
    errors+=("max_iterations must be between 1 and 1000 (got: $MAX_ITERATIONS)")
  fi
  
  # Validate timeout
  if [[ ! "$TIMEOUT_SECONDS" =~ ^[0-9]+$ ]] || [[ "$TIMEOUT_SECONDS" -le 0 ]] || [[ "$TIMEOUT_SECONDS" -gt 86400 ]]; then
    errors+=("timeout must be between 1 and 86400 seconds (got: $TIMEOUT_SECONDS)")
  fi
  
  # Validate checkpoint_interval
  if [[ ! "$CHECKPOINT_INTERVAL" =~ ^[0-9]+$ ]] || [[ "$CHECKPOINT_INTERVAL" -le 0 ]] || [[ "$CHECKPOINT_INTERVAL" -gt "$MAX_ITERATIONS" ]]; then
    errors+=("checkpoint_interval must be between 1 and max_iterations (got: $CHECKPOINT_INTERVAL)")
  fi
  
  # Validate prompt file (unless resuming)
  if [[ -z "$RESUME_SESSION" && -z "$ROLLBACK_TO" ]]; then
    if [[ -z "$PROMPT_FILE" ]]; then
      errors+=("--prompt is required")
    elif [[ ! -f "$PROMPT_FILE" ]]; then
      errors+=("Prompt file not found: $PROMPT_FILE")
    elif [[ ! -r "$PROMPT_FILE" ]]; then
      errors+=("Prompt file not readable: $PROMPT_FILE")
    fi
  fi
  
  if [[ ${#errors[@]} -gt 0 ]]; then
    log_error "Configuration validation failed:"
    for err in "${errors[@]}"; do
      log_error "  - $err"
    done
    exit 1
  fi
  
  log_debug "Configuration validated successfully"
}

# =============================================================================
# STATE MANAGEMENT
# =============================================================================

init_state_dir() {
  STATE_DIR="$PROJECT_ROOT/.ralph-state/$SESSION_ID"
  mkdir -p "$STATE_DIR"
  log_debug "State directory: $STATE_DIR"
}

save_iteration_state() {
  local iteration="$1"
  local output="$2"
  local duration="$3"
  local errors="${4:-}"
  
  local state_file="$STATE_DIR/${iteration}.json"
  local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
  local elapsed=$(get_elapsed_seconds)
  
  cat > "$state_file" << EOF
{
  "iteration": $iteration,
  "timestamp": "$timestamp",
  "elapsed_seconds": $elapsed,
  "duration_seconds": $duration,
  "agent_output_length": ${#output},
  "errors": "$errors",
  "completed": $COMPLETED,
  "completion_reason": "$COMPLETION_REASON"
}
EOF
  
  # Also save raw output
  echo "$output" > "$STATE_DIR/${iteration}-output.txt"
  
  log_debug "Saved state for iteration $iteration"
}

load_session_state() {
  local session_id="$1"
  local state_dir="$PROJECT_ROOT/.ralph-state/$session_id"
  
  if [[ ! -d "$state_dir" ]]; then
    log_error "Session not found: $session_id"
    exit 1
  fi
  
  # Find the last iteration
  local last_iteration=0
  for f in "$state_dir"/*.json; do
    [[ -f "$f" ]] || continue
    local num=$(basename "$f" .json)
    [[ "$num" =~ ^[0-9]+$ ]] && [[ "$num" -gt "$last_iteration" ]] && last_iteration="$num"
  done
  
  log_info "Resuming session $session_id from iteration $last_iteration"
  
  SESSION_ID="$session_id"
  STATE_DIR="$state_dir"
  ITERATION="$last_iteration"
  
  # Load iteration history for context
  for ((i=1; i<=last_iteration && i<=3; i++)); do
    local prev=$((last_iteration - 3 + i))
    [[ $prev -lt 1 ]] && continue
    local output_file="$state_dir/${prev}-output.txt"
    if [[ -f "$output_file" ]]; then
      local summary=$(head -c 200 "$output_file" | tr '\n' ' ')
      ITERATION_HISTORY+=("Iteration $prev: $summary...")
    fi
  done
}

# =============================================================================
# PROMPT ENHANCEMENT
# =============================================================================

load_prompt() {
  if [[ ! -f "$PROMPT_FILE" ]]; then
    log_error "Prompt file not found: $PROMPT_FILE"
    exit 1
  fi
  
  cat "$PROMPT_FILE"
}

load_cross_session_context() {
  local context=""
  local sessions_file="$PROJECT_ROOT/.opencode/ralph/sessions.md"
  local learnings_file="$PROJECT_ROOT/.opencode/ralph/meta-learnings.md"
  
  # Load last 3 sessions from local ledger
  if [[ -f "$sessions_file" ]]; then
    # Extract last 3 session entries
    local sessions=$(grep -A 20 "^## Session:" "$sessions_file" 2>/dev/null | tail -60)
    if [[ -n "$sessions" ]]; then
      context+="### Recent Sessions\n$sessions\n\n"
    fi
  fi
  
  # Load shared meta-learnings
  if [[ -f "$learnings_file" ]]; then
    local learnings=$(cat "$learnings_file")
    if [[ -n "$learnings" ]]; then
      context+="### Meta-Learnings\n$learnings\n\n"
    fi
  fi
  
  echo -e "$context"
}

create_enhanced_prompt() {
  local iteration="$1"
  local original_prompt="$2"
  
  local elapsed=$(get_elapsed_seconds)
  local elapsed_min=$((elapsed / 60))
  local elapsed_sec=$((elapsed % 60))
  local percentage=$((iteration * 100 / MAX_ITERATIONS))
  
  # Calculate ETA
  local eta="N/A"
  if [[ $iteration -gt 0 ]]; then
    local avg_time=$((elapsed / iteration))
    local remaining=$((MAX_ITERATIONS - iteration))
    local eta_seconds=$((avg_time * remaining))
    local eta_min=$((eta_seconds / 60))
    eta="${eta_min}m"
  fi
  
  # Load cross-session context
  local cross_session_context=$(load_cross_session_context)
  
  # Build iteration history summary
  local history_summary=""
  if [[ ${#ITERATION_HISTORY[@]} -gt 0 ]]; then
    history_summary="### Recent Iterations\n"
    for entry in "${ITERATION_HISTORY[@]}"; do
      history_summary+="- $entry\n"
    done
  fi
  
  # Create enhanced prompt
  cat << EOF
<!-- RALPH ORCHESTRATION CONTEXT -->
## Session: $SESSION_ID
Iteration: $iteration/$MAX_ITERATIONS ($percentage%)
Elapsed: ${elapsed_min}m ${elapsed_sec}s
ETA: $eta (estimated)

$cross_session_context
$history_summary
## Current Objective
Complete the task below. When finished, include one of these markers:
- \`- [x] TASK_COMPLETE\` (markdown checkbox)
- \`RALPH_COMPLETE\` (magic string)

<!-- END RALPH CONTEXT -->

$original_prompt
EOF
}

# =============================================================================
# COMPLETION DETECTION
# =============================================================================

check_completion_markers() {
  local output="$1"
  
  for marker in "${DEFAULT_COMPLETION_MARKERS[@]}"; do
    if echo "$output" | grep -qF -- "$marker"; then
      log_success "Completion marker detected: $marker"
      return 0
    fi
  done
  
  return 1
}

check_beads_todos() {
  # Check if all in_progress todos are done
  if ! command -v bd &>/dev/null; then
    log_debug "beads CLI not found, skipping todo check"
    return 1
  fi
  
  local in_progress_count
  in_progress_count=$(bd list --status in_progress --json 2>/dev/null | grep -c '"id"' || echo "0")
  
  if [[ "$in_progress_count" -eq 0 ]]; then
    log_info "All beads todos completed"
    return 0
  fi
  
  log_debug "Found $in_progress_count in-progress todos"
  return 1
}

detect_completion() {
  local output="$1"
  
  # Check explicit markers
  if check_completion_markers "$output"; then
    COMPLETION_REASON="marker_detected"
    return 0
  fi
  
  # Check beads todos (optional)
  # Disabled by default - uncomment to enable
  # if check_beads_todos; then
  #   COMPLETION_REASON="todos_complete"
  #   return 0
  # fi
  
  return 1
}

# =============================================================================
# INFINITE LOOP DETECTION
# =============================================================================

detect_infinite_loop() {
  local output="$1"
  local hash=$(hash_output "$output")
  
  OUTPUT_HASHES+=("$hash")
  
  # Keep only last N hashes
  local max_hashes=$DEFAULT_MAX_IDENTICAL_OUTPUTS
  if [[ ${#OUTPUT_HASHES[@]} -gt $max_hashes ]]; then
    OUTPUT_HASHES=("${OUTPUT_HASHES[@]:1}")
  fi
  
  # Check if all recent hashes are identical
  if [[ ${#OUTPUT_HASHES[@]} -ge $max_hashes ]]; then
    local first_hash="${OUTPUT_HASHES[0]}"
    local all_same=true
    for h in "${OUTPUT_HASHES[@]}"; do
      if [[ "$h" != "$first_hash" ]]; then
        all_same=false
        break
      fi
    done
    
    if [[ "$all_same" == "true" ]]; then
      log_error "Infinite loop detected: $max_hashes identical consecutive outputs"
      return 0
    fi
  fi
  
  return 1
}

# =============================================================================
# RATE LIMIT HANDLING
# =============================================================================

# Retry state
RETRY_COUNT=0
MAX_RETRIES=5
RETRY_DELAY=1

handle_rate_limit() {
  local error_msg="$1"
  
  # Check for rate limit indicators
  if echo "$error_msg" | grep -qiE "rate.?limit|429|too.?many.?requests|retry.?after"; then
    RETRY_COUNT=$((RETRY_COUNT + 1))
    
    if [[ $RETRY_COUNT -gt $MAX_RETRIES ]]; then
      log_error "Max retries ($MAX_RETRIES) exceeded for rate limiting"
      return 1
    fi
    
    # Exponential backoff with jitter
    local delay=$((RETRY_DELAY * (2 ** (RETRY_COUNT - 1))))
    local jitter=$((RANDOM % 3))
    delay=$((delay + jitter))
    
    log_warning "Rate limit detected, waiting ${delay}s before retry ($RETRY_COUNT/$MAX_RETRIES)"
    sleep "$delay"
    return 0
  fi
  
  return 1
}

# =============================================================================
# HUMAN-IN-THE-LOOP (HITL) INTERVENTION
# =============================================================================

# High-risk operation patterns
HIGH_RISK_PATTERNS=(
  "git push"
  "rm -rf"
  "curl -X DELETE"
  "DROP TABLE"
  "DROP DATABASE"
  "force push"
  "--force"
  "sudo rm"
)

# Low confidence indicators
LOW_CONFIDENCE_PATTERNS=(
  "uncertain"
  "not sure"
  "might be wrong"
  "I think"
  "possibly"
  "unclear"
)

check_high_risk_operation() {
  local output="$1"
  
  for pattern in "${HIGH_RISK_PATTERNS[@]}"; do
    if echo "$output" | grep -qiF "$pattern"; then
      echo "$pattern"
      return 0
    fi
  done
  
  return 1
}

check_low_confidence() {
  local output="$1"
  local count=0
  
  for pattern in "${LOW_CONFIDENCE_PATTERNS[@]}"; do
    if echo "$output" | grep -qiF "$pattern"; then
      count=$((count + 1))
    fi
  done
  
  # Return true if 2+ low confidence indicators found
  [[ $count -ge 2 ]]
}

hitl_intervention() {
  local reason="$1"
  local context="$2"
  local operation="${3:-}"
  
  echo
  log_warning "=========================================="
  log_warning "HITL Intervention Required (Iteration $ITERATION/$MAX_ITERATIONS)"
  log_warning "=========================================="
  log_warning "Reason: $reason"
  [[ -n "$operation" ]] && log_warning "Operation: $operation"
  echo
  echo "Context:"
  echo "$context" | head -10
  echo
  echo "Options:"
  echo "  [a] Approve and continue"
  echo "  [r] Reject and skip this iteration"
  echo "  [i] Inspect full output"
  echo "  [q] Quit ralph mode"
  echo
  
  while true; do
    read -p "Choice [a/r/i/q]: " -n 1 -r choice
    echo
    
    case "$choice" in
      a|A)
        log_info "HITL: Approved by user"
        return 0
        ;;
      r|R)
        log_info "HITL: Rejected by user, skipping iteration"
        return 1
        ;;
      i|I)
        echo
        echo "=== Full Output ==="
        echo "$context"
        echo "==================="
        echo
        ;;
      q|Q)
        log_info "HITL: User requested quit"
        SHUTDOWN_REQUESTED=true
        COMPLETION_REASON="hitl_quit"
        return 2
        ;;
      *)
        echo "Invalid choice. Please enter a, r, i, or q."
        ;;
    esac
  done
}

should_trigger_hitl() {
  local output="$1"
  local iteration="$2"
  
  # Check for high-risk operations
  local risk_op
  if risk_op=$(check_high_risk_operation "$output"); then
    hitl_intervention "High-risk operation detected" "$output" "$risk_op"
    return $?
  fi
  
  # Check for low confidence
  if check_low_confidence "$output"; then
    hitl_intervention "Low confidence detected in agent output" "$output"
    return $?
  fi
  
  # Check iteration milestones (every 10 iterations)
  if [[ $((iteration % 10)) -eq 0 && $iteration -gt 0 ]]; then
    hitl_intervention "Iteration milestone reached" "Completed $iteration iterations. Review progress and decide whether to continue."
    return $?
  fi
  
  return 0
}

# =============================================================================
# ERROR RECOVERY
# =============================================================================

record_error() {
  local timestamp=$(date +%s)
  ERROR_TIMESTAMPS+=("$timestamp")
  TOTAL_ERRORS=$((TOTAL_ERRORS + 1))
}

record_recovery() {
  local timestamp=$(date +%s)
  RECOVERY_TIMESTAMPS+=("$timestamp")
  RECOVERED_ERRORS=$((RECOVERED_ERRORS + 1))
}

# =============================================================================
# AGENT INVOCATION
# =============================================================================

invoke_agent() {
  local prompt_file="$1"
  local output=""
  local exit_code=0
  
  if [[ "$DRY_RUN" == "true" ]]; then
    log_info "[DRY RUN] Would invoke: opencode run --agent $AGENT_NAME --format json < $prompt_file"
    output="[DRY RUN] Simulated agent output for iteration $ITERATION"
    echo "$output"
    return 0
  fi
  
  log_debug "Invoking agent: opencode run --agent $AGENT_NAME"
  
  # Invoke OpenCode agent with prompt
  local prompt_content
  prompt_content=$(cat "$prompt_file")
  
  # Retry loop for rate limiting
  local attempt=0
  while [[ $attempt -lt $MAX_RETRIES ]]; do
    output=$(opencode run --agent "$AGENT_NAME" "$prompt_content" 2>&1) || exit_code=$?
    
    if [[ $exit_code -eq 0 ]]; then
      # Reset retry count on success
      RETRY_COUNT=0
      break
    fi
    
    # Check if it's a rate limit error
    if handle_rate_limit "$output"; then
      record_error
      attempt=$((attempt + 1))
      continue
    fi
    
    # Not a rate limit error, break out
    break
  done
  
  if [[ $exit_code -ne 0 ]]; then
    log_warning "Agent returned non-zero exit code: $exit_code"
    record_error
  else
    # If we had errors and now succeeded, record recovery
    if [[ $TOTAL_ERRORS -gt $RECOVERED_ERRORS ]]; then
      record_recovery
    fi
  fi
  
  echo "$output"
  return $exit_code
}

# =============================================================================
# GIT CHECKPOINTING
# =============================================================================

create_checkpoint() {
  local iteration="$1"
  local summary="${2:-checkpoint}"
  
  if [[ "$DRY_RUN" == "true" ]]; then
    log_info "[DRY RUN] Would create checkpoint at iteration $iteration"
    return 0
  fi
  
  # Check if we're in a git repo
  if ! git rev-parse --git-dir &>/dev/null; then
    log_debug "Not in a git repository, skipping checkpoint"
    return 0
  fi
  
  # Stage all changes
  git add -A 2>/dev/null || true
  
  # Check if there are changes to commit
  if git diff --cached --quiet 2>/dev/null; then
    log_debug "No changes to checkpoint"
    return 0
  fi
  
  # Create checkpoint commit
  local message="ralph: iteration $iteration - $summary"
  git commit -m "$message" --no-verify 2>/dev/null || {
    log_warning "Failed to create checkpoint commit"
    return 1
  }
  
  log_info "Created checkpoint: $message"
}

# =============================================================================
# ROLLBACK
# =============================================================================

rollback_to_iteration() {
  local target_iteration="$1"
  
  log_info "Rolling back to iteration $target_iteration..."
  
  # Find the checkpoint commit
  local commit
  commit=$(git log --oneline --grep="ralph: iteration $target_iteration" -1 --format="%H" 2>/dev/null)
  
  if [[ -z "$commit" ]]; then
    log_error "No checkpoint found for iteration $target_iteration"
    exit 1
  fi
  
  log_warning "This will reset to commit: $(git log --oneline -1 "$commit")"
  log_warning "All changes after this point will be lost!"
  
  read -p "Continue? [y/N] " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    log_info "Rollback cancelled"
    exit 0
  fi
  
  git reset --hard "$commit"
  log_success "Rolled back to iteration $target_iteration"
}

# =============================================================================
# METRICS & REPORTING
# =============================================================================

calculate_mttr_a() {
  # Mean Time-to-Recovery for Agentic Systems
  # Returns average recovery time in seconds, or 0 if no recoveries
  if [[ $RECOVERED_ERRORS -eq 0 ]]; then
    echo "0"
    return
  fi
  
  local total_recovery_time=0
  local count=${#RECOVERY_TIMESTAMPS[@]}
  
  for ((i=0; i<count; i++)); do
    local error_time="${ERROR_TIMESTAMPS[$i]}"
    local recovery_time="${RECOVERY_TIMESTAMPS[$i]}"
    total_recovery_time=$((total_recovery_time + recovery_time - error_time))
  done
  
  echo $((total_recovery_time / count))
}

calculate_nrr() {
  # Normalized Recovery Ratio
  # Returns ratio of successful recoveries to total errors (0-1)
  if [[ $TOTAL_ERRORS -eq 0 ]]; then
    echo "1.0"
    return
  fi
  
  # Use bc for floating point, or fallback to integer percentage
  if command -v bc &>/dev/null; then
    echo "scale=2; $RECOVERED_ERRORS / $TOTAL_ERRORS" | bc
  else
    echo "$((RECOVERED_ERRORS * 100 / TOTAL_ERRORS))%"
  fi
}

generate_metrics() {
  local metrics_file="$PROJECT_ROOT/.ralph-metrics-$SESSION_ID.json"
  local end_time=$(date +%s)
  local duration=$((end_time - START_TIME))
  local mttr_a=$(calculate_mttr_a)
  local nrr=$(calculate_nrr)
  local avg_iteration_time=0
  
  if [[ $ITERATION -gt 0 ]]; then
    avg_iteration_time=$((duration / ITERATION))
  fi
  
  cat > "$metrics_file" << EOF
{
  "session_id": "$SESSION_ID",
  "start_time": $START_TIME,
  "end_time": $end_time,
  "duration_seconds": $duration,
  "total_iterations": $ITERATION,
  "max_iterations": $MAX_ITERATIONS,
  "completed": $COMPLETED,
  "completion_reason": "$COMPLETION_REASON",
  "prompt_file": "$PROMPT_FILE",
  "agent": "$AGENT_NAME",
  "metrics": {
    "avg_iteration_seconds": $avg_iteration_time,
    "total_errors": $TOTAL_ERRORS,
    "recovered_errors": $RECOVERED_ERRORS,
    "mttr_a_seconds": $mttr_a,
    "normalized_recovery_ratio": "$nrr"
  }
}
EOF
  
  log_info "Metrics saved to: $metrics_file"
}

generate_report() {
  local status_emoji="?"
  local status_text="Unknown"
  
  case "$COMPLETION_REASON" in
    marker_detected|todos_complete|manual_signal)
      status_emoji="+"
      status_text="Completed"
      ;;
    max_iterations|timeout)
      status_emoji="!"
      status_text="Partial"
      ;;
    error|infinite_loop|shutdown)
      status_emoji="-"
      status_text="Failed"
      ;;
  esac
  
  local elapsed=$(get_elapsed_seconds)
  local elapsed_h=$((elapsed / 3600))
  local elapsed_m=$(((elapsed % 3600) / 60))
  local elapsed_s=$((elapsed % 60))
  
  local mttr_a=$(calculate_mttr_a)
  local nrr=$(calculate_nrr)
  local avg_time=0
  [[ $ITERATION -gt 0 ]] && avg_time=$((elapsed / ITERATION))
  local avg_min=$((avg_time / 60))
  local avg_sec=$((avg_time % 60))
  
  cat << EOF

================================================================================
                        Ralph Session Summary: $SESSION_ID
================================================================================

Status: $status_emoji $status_text
Reason: $COMPLETION_REASON
Duration: ${elapsed_h}h ${elapsed_m}m ${elapsed_s}s
Iterations: $ITERATION/$MAX_ITERATIONS

## Metrics
- MTTR-A: ${mttr_a} seconds
- NRR: ${nrr} (recovery rate)
- Avg iteration time: ${avg_min}m ${avg_sec}s
- Total errors: $TOTAL_ERRORS
- Recovered errors: $RECOVERED_ERRORS

## Files
- State Directory: $STATE_DIR
- Metrics File: $PROJECT_ROOT/.ralph-metrics-$SESSION_ID.json

================================================================================
EOF
}

# =============================================================================
# SESSION LEDGER
# =============================================================================

init_session_ledger() {
  local ledger_dir="$PROJECT_ROOT/.opencode/ralph"
  local ledger_file="$ledger_dir/sessions.md"
  
  mkdir -p "$ledger_dir"
  
  if [[ ! -f "$ledger_file" ]]; then
    cat > "$ledger_file" << 'EOF'
# Ralph Session Ledger

**Local session history** - This file is gitignored and unique to your machine.

Last updated: (auto-updated)
Total sessions: 0
Success rate: N/A

---

## Meta-Learnings (Across All Sessions)

### Patterns That Work
- [Auto-populated as you run Ralph sessions]

### Patterns That Don't Work
- [Auto-populated as you run Ralph sessions]

---

EOF
    log_info "Initialized local session ledger (gitignored)"
  fi
}

add_session_entry() {
  local ledger_file="$PROJECT_ROOT/.opencode/ralph/sessions.md"
  local timestamp=$(date "+%Y-%m-%d %H:%M:%S")
  local objective=""
  
  # Extract objective from prompt (first non-empty line)
  if [[ -f "$PROMPT_FILE" ]]; then
    objective=$(grep -v '^#' "$PROMPT_FILE" | grep -v '^$' | head -1 | cut -c1-80)
  fi
  
  # Append new session entry
  cat >> "$ledger_file" << EOF

## Session: $SESSION_ID

**Status**: In Progress
**Started**: $timestamp
**Objective**: $objective

EOF
}

update_session_entry() {
  local ledger_file="$PROJECT_ROOT/.opencode/ralph/sessions.md"
  local timestamp=$(date "+%Y-%m-%d %H:%M:%S")
  local elapsed=$(get_elapsed_seconds)
  local elapsed_min=$((elapsed / 60))
  
  local status_emoji="?"
  case "$COMPLETION_REASON" in
    marker_detected|todos_complete|manual_signal) status_emoji="+" ;;
    max_iterations|timeout) status_emoji="!" ;;
    *) status_emoji="-" ;;
  esac
  
  # This is a simplified update - in production, use sed to update in place
  cat >> "$ledger_file" << EOF

### Outcome ($timestamp)
**Status**: $status_emoji $COMPLETION_REASON
**Duration**: ${elapsed_min}m
**Iterations**: $ITERATION/$MAX_ITERATIONS

EOF
}

# =============================================================================
# MAIN LOOP
# =============================================================================

run_main_loop() {
  local original_prompt
  original_prompt=$(load_prompt)
  
  log_info "Starting Ralph orchestration loop"
  log_info "Session: $SESSION_ID"
  log_info "Max iterations: $MAX_ITERATIONS"
  log_info "Timeout: $((TIMEOUT_SECONDS / 60)) minutes"
  log_info "Prompt file: $PROMPT_FILE"
  echo
  
  while [[ $ITERATION -lt $MAX_ITERATIONS ]]; do
    ITERATION=$((ITERATION + 1))
    local iteration_start=$(date +%s)
    
    # Check timeout
    local elapsed=$(get_elapsed_seconds)
    if [[ $elapsed -ge $TIMEOUT_SECONDS ]]; then
      log_warning "Timeout reached ($((TIMEOUT_SECONDS / 60)) minutes)"
      COMPLETION_REASON="timeout"
      break
    fi
    
    # Check shutdown signal
    if [[ "$SHUTDOWN_REQUESTED" == "true" ]]; then
      log_info "Shutdown requested, stopping after iteration $((ITERATION - 1))"
      ITERATION=$((ITERATION - 1))
      COMPLETION_REASON="shutdown"
      break
    fi
    
    # Check if already completed (via SIGUSR1)
    if [[ "$COMPLETED" == "true" ]]; then
      break
    fi
    
    # Log progress
    log_progress "$ITERATION" "$MAX_ITERATIONS" "$elapsed"
    
    # Warn at 80% of max iterations
    if [[ $ITERATION -eq $((MAX_ITERATIONS * 80 / 100)) ]]; then
      log_warning "Approaching iteration limit (80%)"
    fi
    
    # Warn at 90% of timeout
    if [[ $elapsed -ge $((TIMEOUT_SECONDS * 90 / 100)) && $elapsed -lt $((TIMEOUT_SECONDS * 90 / 100 + SLEEP_BETWEEN_ITERATIONS)) ]]; then
      log_warning "Approaching timeout limit (90%)"
    fi
    
    # Create enhanced prompt
    local enhanced_prompt
    enhanced_prompt=$(create_enhanced_prompt "$ITERATION" "$original_prompt")
    
    # Write enhanced prompt to temp file
    local prompt_file="/tmp/ralph-prompt-$SESSION_ID-$ITERATION.md"
    echo "$enhanced_prompt" > "$prompt_file"
    
    # Invoke agent
    local output=""
    local agent_exit_code=0
    output=$(invoke_agent "$prompt_file") || agent_exit_code=$?
    
    # Calculate iteration duration
    local iteration_end=$(date +%s)
    local iteration_duration=$((iteration_end - iteration_start))
    
    # Save iteration state
    save_iteration_state "$ITERATION" "$output" "$iteration_duration"
    
    # Update iteration history (keep last 3)
    local summary=$(echo "$output" | head -c 200 | tr '\n' ' ')
    ITERATION_HISTORY+=("Iteration $ITERATION (${iteration_duration}s): $summary...")
    if [[ ${#ITERATION_HISTORY[@]} -gt 3 ]]; then
      ITERATION_HISTORY=("${ITERATION_HISTORY[@]:1}")
    fi
    
    # Check for infinite loop
    if detect_infinite_loop "$output"; then
      COMPLETION_REASON="infinite_loop"
      break
    fi
    
    # HITL intervention check (skip in dry-run mode)
    if [[ "$DRY_RUN" != "true" ]]; then
      local hitl_result=0
      should_trigger_hitl "$output" "$ITERATION" || hitl_result=$?
      
      case $hitl_result in
        1)
          # User rejected, skip to next iteration
          log_info "Skipping iteration $ITERATION due to HITL rejection"
          continue
          ;;
        2)
          # User quit
          break
          ;;
      esac
    fi
    
    # Check for completion
    if detect_completion "$output"; then
      COMPLETED=true
      break
    fi
    
    # Create checkpoint if needed
    if [[ $((ITERATION % CHECKPOINT_INTERVAL)) -eq 0 ]]; then
      create_checkpoint "$ITERATION" "periodic checkpoint"
    fi
    
    # Rate limiting sleep
    sleep "$SLEEP_BETWEEN_ITERATIONS"
  done
  
  # Check if we hit max iterations
  if [[ $ITERATION -ge $MAX_ITERATIONS && -z "$COMPLETION_REASON" ]]; then
    COMPLETION_REASON="max_iterations"
  fi
  
  # Final checkpoint
  create_checkpoint "$ITERATION" "final"
}

# =============================================================================
# MAIN ENTRY POINT
# =============================================================================

main() {
  # Parse command line arguments
  parse_args "$@"
  
  # Handle rollback
  if [[ -n "$ROLLBACK_TO" ]]; then
    rollback_to_iteration "$ROLLBACK_TO"
    exit 0
  fi
  
  # Handle resume
  if [[ -n "$RESUME_SESSION" ]]; then
    load_session_state "$RESUME_SESSION"
    START_TIME=$(date +%s)
    # Adjust start time based on previous elapsed time
    # (simplified - in production, load from state)
  else
    SESSION_ID=$(generate_session_id)
    START_TIME=$(date +%s)
  fi
  
  # Load configuration
  load_config
  
  # Validate configuration
  validate_config
  
  # Initialize state directory
  init_state_dir
  
  # Initialize session ledger
  init_session_ledger
  add_session_entry
  
  # Run main loop
  run_main_loop
  
  # Update session ledger
  update_session_entry
  
  # Generate metrics
  generate_metrics
  
  # Generate report
  generate_report
  
  # Exit with appropriate code
  if [[ "$COMPLETED" == "true" ]]; then
    exit 0
  else
    exit 1
  fi
}

# Run main if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  main "$@"
fi
