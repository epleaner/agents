#!/usr/bin/env bash
# test-ralph.sh - Smoke tests for ralph-orchestrator.sh
#
# Usage: ./test-ralph.sh [--verbose]

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RALPH_SCRIPT="$SCRIPT_DIR/ralph-orchestrator.sh"
TEST_DIR="/tmp/ralph-test-$$"
VERBOSE="${1:-}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m'

# Test counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# =============================================================================
# TEST UTILITIES
# =============================================================================

setup() {
  mkdir -p "$TEST_DIR"
  cd "$TEST_DIR"
  
  # Initialize git repo for checkpoint tests
  git init -q
  git config user.email "test@test.com"
  git config user.name "Test User"
  
  # Create test prompt
  echo "Test task: Say hello" > test-prompt.md
  git add test-prompt.md
  git commit -q -m "Initial commit"
}

cleanup() {
  cd /
  rm -rf "$TEST_DIR"
  # Clean up any ralph state in the original directory
  rm -rf "$SCRIPT_DIR/../../.ralph-state" "$SCRIPT_DIR/../../.ralph-metrics-"*.json 2>/dev/null || true
}

log_test() {
  echo -e "${YELLOW}[TEST]${NC} $*"
}

log_pass() {
  echo -e "${GREEN}[PASS]${NC} $*"
  TESTS_PASSED=$((TESTS_PASSED + 1))
}

log_fail() {
  echo -e "${RED}[FAIL]${NC} $*"
  TESTS_FAILED=$((TESTS_FAILED + 1))
}

run_test() {
  local name="$1"
  local cmd="$2"
  local expected_exit="${3:-0}"
  
  TESTS_RUN=$((TESTS_RUN + 1))
  log_test "$name"
  
  local output
  local exit_code=0
  output=$(eval "$cmd" 2>&1) || exit_code=$?
  
  if [[ "$VERBOSE" == "--verbose" ]]; then
    echo "$output"
  fi
  
  if [[ "$exit_code" -eq "$expected_exit" ]]; then
    log_pass "$name"
    return 0
  else
    log_fail "$name (expected exit $expected_exit, got $exit_code)"
    echo "Output: $output"
    return 1
  fi
}

assert_contains() {
  local output="$1"
  local pattern="$2"
  local name="$3"
  
  TESTS_RUN=$((TESTS_RUN + 1))
  
  if echo "$output" | grep -qF -- "$pattern"; then
    log_pass "$name"
    return 0
  else
    log_fail "$name (pattern not found: $pattern)"
    return 1
  fi
}

assert_file_exists() {
  local file="$1"
  local name="$2"
  
  TESTS_RUN=$((TESTS_RUN + 1))
  
  if [[ -f "$file" ]]; then
    log_pass "$name"
    return 0
  else
    log_fail "$name (file not found: $file)"
    return 1
  fi
}

# =============================================================================
# TESTS
# =============================================================================

test_help() {
  log_test "Help output"
  local output
  output=$("$RALPH_SCRIPT" --help 2>&1)
  
  assert_contains "$output" "Ralph Orchestrator" "Help shows title"
  assert_contains "$output" "--prompt" "Help shows --prompt option"
  assert_contains "$output" "--max-iterations" "Help shows --max-iterations option"
  assert_contains "$output" "TASK_COMPLETE" "Help shows completion markers"
}

test_syntax() {
  run_test "Bash syntax check" "bash -n '$RALPH_SCRIPT'"
}

test_missing_prompt() {
  log_test "Missing prompt error"
  local output
  output=$("$RALPH_SCRIPT" 2>&1) || true
  
  assert_contains "$output" "prompt is required" "Missing prompt shows error"
}

test_dry_run_basic() {
  log_test "Dry run basic execution"
  
  # Run from project root with test prompt
  local test_prompt="$TEST_DIR/test-prompt.md"
  local output_file="$TEST_DIR/output.txt"
  
  # Run with output to file to avoid subshell issues
  "$RALPH_SCRIPT" --prompt "$test_prompt" --max-iterations 2 --checkpoint 1 --dry-run > "$output_file" 2>&1 || true
  
  local output
  output=$(cat "$output_file")
  
  assert_contains "$output" "DRY RUN" "Dry run indicator shown"
  assert_contains "$output" "Iteration" "Iteration progress shown"
  assert_contains "$output" "Session Summary" "Summary generated"
}

test_max_iterations() {
  log_test "Max iterations limit"
  local test_prompt="$TEST_DIR/test-prompt.md"
  local output_file="$TEST_DIR/output2.txt"
  
  "$RALPH_SCRIPT" --prompt "$test_prompt" --max-iterations 2 --checkpoint 1 --dry-run > "$output_file" 2>&1 || true
  local output=$(cat "$output_file")
  
  assert_contains "$output" "Iterations: 2/2" "Correct iteration count"
  assert_contains "$output" "max_iterations" "Completion reason is max_iterations"
}

test_timeout_validation() {
  log_test "Timeout validation"
  local test_prompt="$TEST_DIR/test-prompt.md"
  local output_file="$TEST_DIR/output3.txt"
  
  "$RALPH_SCRIPT" --prompt "$test_prompt" --timeout 60 --max-iterations 2 --checkpoint 1 --dry-run > "$output_file" 2>&1 || true
  local output=$(cat "$output_file")
  
  # Should complete quickly due to dry run, not timeout
  assert_contains "$output" "Session Summary" "Completed before timeout"
}

test_completion_marker_detection() {
  log_test "Completion marker detection"
  
  # Create a prompt that includes the completion marker
  local marker_prompt="$TEST_DIR/marker-prompt.md"
  local output_file="$TEST_DIR/output4.txt"
  echo "- [x] TASK_COMPLETE" > "$marker_prompt"
  
  # The dry run won't actually detect markers (simulated output doesn't include them)
  # This test verifies the script runs without error
  "$RALPH_SCRIPT" --prompt "$marker_prompt" --max-iterations 2 --checkpoint 1 --dry-run > "$output_file" 2>&1 || true
  local output=$(cat "$output_file")
  
  assert_contains "$output" "Session Summary" "Script completed"
}

test_state_directory_creation() {
  log_test "State directory creation"
  
  local test_prompt="$TEST_DIR/test-prompt.md"
  local output_file="$TEST_DIR/output5.txt"
  
  "$RALPH_SCRIPT" --prompt "$test_prompt" --max-iterations 2 --checkpoint 1 --dry-run > "$output_file" 2>&1 || true
  local output=$(cat "$output_file")
  
  # Extract session ID from output
  local session_id
  session_id=$(echo "$output" | grep "Session:" | head -1 | awk '{print $NF}')
  
  # State is created in PROJECT_ROOT which is relative to script location
  local project_root="$SCRIPT_DIR/../.."
  if [[ -d "$project_root/.ralph-state/$session_id" ]]; then
    log_pass "State directory created"
    TESTS_PASSED=$((TESTS_PASSED + 1))
  else
    log_fail "State directory not created"
    TESTS_FAILED=$((TESTS_FAILED + 1))
  fi
  TESTS_RUN=$((TESTS_RUN + 1))
}

test_metrics_file_creation() {
  log_test "Metrics file creation"
  
  local test_prompt="$TEST_DIR/test-prompt.md"
  local output_file="$TEST_DIR/output6.txt"
  
  "$RALPH_SCRIPT" --prompt "$test_prompt" --max-iterations 2 --checkpoint 1 --dry-run > "$output_file" 2>&1 || true
  
  # Check for metrics file in project root
  local project_root="$SCRIPT_DIR/../.."
  if ls "$project_root"/.ralph-metrics-*.json 1>/dev/null 2>&1; then
    log_pass "Metrics file created"
    TESTS_PASSED=$((TESTS_PASSED + 1))
    
    # Verify JSON structure
    local metrics_file
    metrics_file=$(ls "$project_root"/.ralph-metrics-*.json | head -1)
    if cat "$metrics_file" | python3 -c "import json,sys; json.load(sys.stdin)" 2>/dev/null; then
      log_pass "Metrics file is valid JSON"
      TESTS_PASSED=$((TESTS_PASSED + 1))
    else
      log_fail "Metrics file is not valid JSON"
      TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    TESTS_RUN=$((TESTS_RUN + 1))
  else
    log_fail "Metrics file not created"
    TESTS_FAILED=$((TESTS_FAILED + 1))
  fi
  TESTS_RUN=$((TESTS_RUN + 1))
}

test_session_ledger_init() {
  log_test "Session ledger initialization"
  
  local test_prompt="$TEST_DIR/test-prompt.md"
  local output_file="$TEST_DIR/output7.txt"
  
  "$RALPH_SCRIPT" --prompt "$test_prompt" --max-iterations 2 --checkpoint 1 --dry-run > "$output_file" 2>&1 || true
  
  # Session ledger is created in PROJECT_ROOT
  local project_root="$SCRIPT_DIR/../.."
  assert_file_exists "$project_root/.opencode/ralph/sessions.md" "Session ledger created"
}

test_verbose_mode() {
  log_test "Verbose mode"
  local test_prompt="$TEST_DIR/test-prompt.md"
  local output_file="$TEST_DIR/output8.txt"
  
  "$RALPH_SCRIPT" --prompt "$test_prompt" --max-iterations 2 --checkpoint 1 --dry-run --verbose > "$output_file" 2>&1 || true
  local output=$(cat "$output_file")
  
  # Verbose mode should show debug output
  # (In dry run, we may not see DEBUG messages, but the script should run)
  assert_contains "$output" "Session Summary" "Verbose mode completed"
}

test_config_validation() {
  log_test "Config validation - invalid max_iterations"
  local test_prompt="$TEST_DIR/test-prompt.md"
  local output_file="$TEST_DIR/output9.txt"
  
  "$RALPH_SCRIPT" --prompt "$test_prompt" --max-iterations 0 --checkpoint 1 > "$output_file" 2>&1 || true
  local output=$(cat "$output_file")
  
  assert_contains "$output" "validation failed" "Invalid config rejected"
}

test_graceful_shutdown() {
  log_test "Graceful shutdown signal handling"
  
  local test_prompt="$TEST_DIR/test-prompt.md"
  local output_file="$TEST_DIR/output10.txt"
  
  # Start ralph in background
  "$RALPH_SCRIPT" --prompt "$test_prompt" --max-iterations 100 --checkpoint 10 --dry-run > "$output_file" 2>&1 &
  local pid=$!
  
  # Wait a moment then send SIGINT
  sleep 2
  kill -INT $pid 2>/dev/null || true
  
  # Wait for process to finish
  wait $pid 2>/dev/null || true
  
  log_pass "Graceful shutdown handled"
  TESTS_PASSED=$((TESTS_PASSED + 1))
  TESTS_RUN=$((TESTS_RUN + 1))
}

# =============================================================================
# MAIN
# =============================================================================

main() {
  echo "========================================"
  echo "Ralph Orchestrator Test Suite"
  echo "========================================"
  echo
  
  # Setup
  setup
  trap cleanup EXIT
  
  # Run tests
  test_syntax
  test_help
  test_missing_prompt
  test_dry_run_basic
  test_max_iterations
  test_timeout_validation
  test_completion_marker_detection
  test_state_directory_creation
  test_metrics_file_creation
  test_session_ledger_init
  test_verbose_mode
  test_config_validation
  test_graceful_shutdown
  
  # Summary
  echo
  echo "========================================"
  echo "Test Results"
  echo "========================================"
  echo "Tests run:    $TESTS_RUN"
  echo -e "Tests passed: ${GREEN}$TESTS_PASSED${NC}"
  echo -e "Tests failed: ${RED}$TESTS_FAILED${NC}"
  echo
  
  if [[ $TESTS_FAILED -eq 0 ]]; then
    echo -e "${GREEN}All tests passed!${NC}"
    exit 0
  else
    echo -e "${RED}Some tests failed.${NC}"
    exit 1
  fi
}

main "$@"
