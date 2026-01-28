# Ralph Mode Troubleshooting Guide

## Common Issues

### "Infinite loop detected"

**Symptom:** Ralph aborts with "Infinite loop detected: 3 identical consecutive outputs"

**Cause:** The agent is producing the same output repeatedly, indicating it's stuck.

**Solutions:**
1. **Improve prompt clarity**: Add more specific instructions or success criteria
2. **Check for blocking issues**: The agent may be waiting for input or hitting an error
3. **Increase variation**: Add context that encourages different approaches
4. **Review last outputs**: Check `.ralph-state/<session>/*-output.txt` for patterns

```bash
# View last 3 outputs
for f in $(ls -t .ralph-state/ralph-*/*-output.txt | head -3); do
  echo "=== $f ==="
  head -20 "$f"
done
```

### "Timeout reached"

**Symptom:** Ralph stops with "Timeout reached (120 minutes)"

**Cause:** Task took longer than the configured timeout.

**Solutions:**
1. **Increase timeout**: `--timeout 14400` (4 hours)
2. **Break into smaller tasks**: Split the prompt into subtasks
3. **Resume from checkpoint**: Use `--resume <session-id>`
4. **Check iteration times**: Long iterations may indicate problems

```bash
# Check average iteration time
cat .ralph-metrics-ralph-*.json | jq '.metrics.avg_iteration_seconds'
```

### "Max iterations reached"

**Symptom:** Ralph stops with "max_iterations" completion reason

**Cause:** Task didn't complete within the iteration limit.

**Solutions:**
1. **Increase limit**: `--max-iterations 100`
2. **Add completion markers**: Ensure prompt instructs agent to signal completion
3. **Check progress**: Review iteration outputs to see if progress is being made
4. **Simplify task**: Break into smaller, more focused tasks

### "HITL intervention" keeps triggering

**Symptom:** Ralph pauses frequently for HITL approval

**Cause:** Agent output contains high-risk patterns or low confidence indicators.

**Solutions:**
1. **Review triggers**: Check which patterns are triggering HITL
2. **Adjust config**: Modify `hitl.triggers` in ralph.yml
3. **Use advisory mode**: Set `hitl.mode: "advisory"` to log without blocking
4. **Approve patterns**: If operations are safe, approve and continue

### "Agent invocation failed"

**Symptom:** Ralph reports agent errors or non-zero exit codes

**Cause:** OpenCode CLI or agent configuration issues.

**Solutions:**
1. **Check OpenCode installation**: `opencode --version`
2. **Verify agent exists**: `opencode agent list`
3. **Test manually**: `opencode run --agent orchestrator "test"`
4. **Check API keys**: Ensure ANTHROPIC_API_KEY or other credentials are set
5. **Review logs**: Run with `--verbose` for detailed output

```bash
# Test agent invocation
opencode run --agent orchestrator "Say hello"
```

### "Rate limit" errors

**Symptom:** Ralph retries with exponential backoff messages

**Cause:** API rate limits exceeded.

**Solutions:**
1. **Wait**: Ralph will automatically retry with backoff
2. **Increase sleep**: Set `safety.sleep_between_iterations: 5` in config
3. **Reduce parallelism**: Ensure only one Ralph instance is running
4. **Check quotas**: Verify API quota hasn't been exhausted

### "Checkpoint commit failed"

**Symptom:** Warning about failed checkpoint commits

**Cause:** Git repository issues or uncommitted conflicts.

**Solutions:**
1. **Check git status**: `git status`
2. **Resolve conflicts**: Fix any merge conflicts
3. **Clean working directory**: Commit or stash unrelated changes
4. **Verify git config**: Ensure git user.name and user.email are set

```bash
# Check git configuration
git config user.name
git config user.email
```

### "Session not found" when resuming

**Symptom:** Error when using `--resume <session-id>`

**Cause:** Session state directory doesn't exist or was cleaned up.

**Solutions:**
1. **Check session exists**: `ls .ralph-state/`
2. **Verify session ID**: Use exact ID from previous run
3. **Check for cleanup**: State may have been deleted
4. **Start fresh**: Create a new session instead

### "Configuration validation failed"

**Symptom:** Ralph exits with configuration errors

**Cause:** Invalid values in ralph.yml or CLI arguments.

**Solutions:**
1. **Check ranges**: max_iterations (1-1000), timeout (1-86400s)
2. **Verify paths**: Ensure prompt file exists
3. **Review config**: Check ralph.yml syntax
4. **Use defaults**: Remove problematic config options

```bash
# Validate YAML syntax
cat ralph.yml | python -c "import yaml, sys; yaml.safe_load(sys.stdin)"
```

## Debugging Tips

### Enable Verbose Mode

```bash
.opencode/scripts/ralph-orchestrator.sh --prompt task.md --verbose
```

### Check State Files

```bash
# List all state files
ls -la .ralph-state/ralph-*/

# View latest iteration state
cat .ralph-state/ralph-*/$(ls -t .ralph-state/ralph-*/*.json | head -1) | jq .

# View metrics
cat .ralph-metrics-ralph-*.json | jq .
```

### Review Session Ledger

```bash
# Check local session history
cat .opencode/ralph/sessions.md

# Check shared learnings
cat .opencode/ralph/meta-learnings.md
```

### Test Components Individually

```bash
# Test prompt loading
cat your-prompt.md

# Test agent invocation
opencode run --agent orchestrator "$(cat your-prompt.md)"

# Test beads integration
bd list --status in_progress --json
```

## Getting Help

1. **Check design docs**: `.opencode/openspec/changes/add-ralph-mode/design.md`
2. **Review examples**: `.opencode/openspec/changes/add-ralph-mode/examples.md`
3. **File an issue**: Use `bd create` to report problems
4. **Check meta-learnings**: `.opencode/ralph/meta-learnings.md` for known patterns
