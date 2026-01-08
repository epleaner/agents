# Ralph Mode Usage Examples

## Basic Usage: Single Feature Implementation

```bash
# Create a prompt file
cat > implement-auth.md << 'EOF'
# Task: Implement User Authentication

Add user authentication to the application:

1. Create login/logout endpoints
2. Add JWT token generation
3. Implement password hashing
4. Add authentication middleware
5. Write unit tests for auth module

When complete, include: - [x] TASK_COMPLETE
EOF

# Run Ralph mode
.opencode/scripts/ralph-orchestrator.sh --prompt implement-auth.md --max-iterations 30
```

## With HITL: High-Risk Operations

```bash
# Create a prompt that may trigger HITL
cat > deploy-changes.md << 'EOF'
# Task: Deploy Database Migration

1. Review pending migrations
2. Back up current database
3. Run migrations
4. Verify data integrity
5. Update deployment status

Note: This task involves database changes that may trigger HITL intervention.

When complete, include: RALPH_COMPLETE
EOF

# Run with verbose output to see HITL prompts
.opencode/scripts/ralph-orchestrator.sh --prompt deploy-changes.md --verbose
```

When HITL triggers, you'll see:
```
[Ralph] ==========================================
[Ralph] HITL Intervention Required (Iteration 5/30)
[Ralph] ==========================================
[Ralph] Reason: High-risk operation detected
[Ralph] Operation: git push

Options:
  [a] Approve and continue
  [r] Reject and skip this iteration
  [i] Inspect full output
  [q] Quit ralph mode

Choice [a/r/i/q]:
```

## Resume: Continuing Interrupted Work

```bash
# Start a long-running task
.opencode/scripts/ralph-orchestrator.sh --prompt refactor.md --max-iterations 50

# If interrupted (Ctrl+C), note the session ID from output:
# [Ralph] Session: ralph-2026-01-08-103045

# Resume later
.opencode/scripts/ralph-orchestrator.sh --resume ralph-2026-01-08-103045
```

## Rollback: Recovering from Failures

```bash
# Run a task that goes wrong
.opencode/scripts/ralph-orchestrator.sh --prompt risky-refactor.md --max-iterations 20

# If iteration 15 broke things, rollback to iteration 10
.opencode/scripts/ralph-orchestrator.sh --rollback-to 10

# This will:
# 1. Find the git checkpoint for iteration 10
# 2. Prompt for confirmation
# 3. Reset to that checkpoint
```

## Dry Run: Testing Configuration

```bash
# Test without actually invoking agents
.opencode/scripts/ralph-orchestrator.sh --prompt task.md --dry-run --max-iterations 5

# Output shows what would happen:
# [Ralph] [DRY RUN] Would invoke: opencode run --agent orchestrator
# [Ralph] [DRY RUN] Would create checkpoint at iteration 5
```

## With Custom Configuration

```bash
# Copy and customize config
cp .opencode/templates/ralph.yml ralph.yml

# Edit ralph.yml to adjust settings
# Then run with config
.opencode/scripts/ralph-orchestrator.sh --prompt task.md --config ralph.yml
```

## Integration with Beads

```bash
# Create a beads issue first
bd create --title "Implement feature X" --type task

# Reference the issue in your prompt
cat > feature-x.md << 'EOF'
# Task: Implement Feature X (agents-abc123)

See beads issue agents-abc123 for requirements.

1. Implement core functionality
2. Add tests
3. Update documentation

When complete, close the beads issue and include: - [x] TASK_COMPLETE
EOF

# Run Ralph mode
.opencode/scripts/ralph-orchestrator.sh --prompt feature-x.md
```

## Monitoring Progress

While Ralph is running, you can:

```bash
# Check current status
cat .ralph-state/ralph-*/$(ls -t .ralph-state/ralph-*/*.json | head -1)

# View iteration history
ls -la .ralph-state/ralph-*/

# Check metrics
cat .ralph-metrics-ralph-*.json | jq .
```

## Sending Signals

```bash
# Get Ralph's PID
pgrep -f ralph-orchestrator

# Graceful shutdown (complete current iteration)
kill -INT <pid>

# Mark as complete (generate success report)
kill -USR1 <pid>
```
