# Testing yepe Locally

This guide shows you how to test yepe before publishing to npm.

## Prerequisites

- Node.js 20+ installed
- Git installed
- This repository cloned

## Quick Start

### Option 1: Test Shell Script (No Build Required)

The shell script can be tested immediately:

```bash
# Create a test directory
mkdir -p /tmp/yepe-test
cd /tmp/yepe-test

# Initialize git
git init
git config user.email "test@example.com"
git config user.name "Test User"

# Create initial commit (required)
echo "# Test" > README.md
git add README.md
git commit -m "Initial commit"

# Run the shell script
bash /Users/ep/workspace/agents/packages/yepe/install.sh

# Check results
ls -la
cat .yepe-report.json
```

### Option 2: Test npm Package with npm link

```bash
# 1. Build and link the package
cd /Users/ep/workspace/agents/packages/yepe
npm install
npm run build
npm link

# 2. Create test directory
mkdir -p /tmp/yepe-test
cd /tmp/yepe-test

# 3. Initialize git
git init
git config user.email "test@example.com"
git config user.name "Test User"
echo "# Test" > README.md
git add README.md
git commit -m "Initial commit"

# 4. Run yepe
yepe

# 5. Check results
ls -la
cat .yepe-report.json

# 6. Cleanup (when done)
cd /Users/ep/workspace/agents/packages/yepe
npm unlink -g @yepe/init
```

### Option 3: Test with Node Directly

```bash
# 1. Build the package
cd /Users/ep/workspace/agents/packages/yepe
npm install
npm run build

# 2. Create test directory
mkdir -p /tmp/yepe-test
cd /tmp/yepe-test

# 3. Initialize git
git init
git config user.email "test@example.com"
git config user.name "Test User"
echo "# Test" > README.md
git add README.md
git commit -m "Initial commit"

# 4. Run with node
node /Users/ep/workspace/agents/packages/yepe/dist/cli.js

# 5. Check results
ls -la
cat .yepe-report.json
```

## Automated Test Scripts

### Shell Script Test

```bash
cd /Users/ep/workspace/agents/packages/yepe
bash test/smoke-test.sh
```

### npm Package Test

```bash
cd /Users/ep/workspace/agents/packages/yepe
./test-local-simple.sh
```

## What to Verify

After running yepe, check that:

1. **Files are created:**
   - `AGENTS.md` exists
   - `.opencode/` directory exists with subdirectories
   - `openspec/` directory exists
   - `learnings/` directory exists
   - `bin/` directory exists

2. **Report is generated:**
   - `.yepe-report.json` exists
   - Contains `version`, `timestamp`, `changes`, `summary`
   - Summary shows counts for `added`, `conflicts`, `skipped`

3. **No errors:**
   - Prerequisites validated successfully
   - Blueprint downloaded successfully
   - Files copied without errors

4. **Git status:**
   - New files are untracked (not staged)
   - No modifications to existing files

## Testing Conflict Detection

To test that yepe properly detects conflicts:

```bash
# 1. Run yepe once
mkdir -p /tmp/yepe-test
cd /tmp/yepe-test
git init
git config user.email "test@example.com"
git config user.name "Test User"
echo "# Test" > README.md
git add README.md
git commit -m "Initial commit"

# Run yepe
bash /Users/ep/workspace/agents/packages/yepe/install.sh

# 2. Commit the changes
git add .
git commit -m "Add yepe blueprint"

# 3. Run yepe again (should detect conflicts)
bash /Users/ep/workspace/agents/packages/yepe/install.sh

# 4. Check the report
cat .yepe-report.json
# Should show conflicts for existing files
```

## Testing Prerequisites Validation

### Test: Not a git repository

```bash
mkdir -p /tmp/not-git
cd /tmp/not-git
bash /Users/ep/workspace/agents/packages/yepe/install.sh
# Should fail with "Not a git repository" error
```

### Test: Dirty working tree

```bash
mkdir -p /tmp/dirty-tree
cd /tmp/dirty-tree
git init
git config user.email "test@example.com"
git config user.name "Test User"
echo "# Test" > README.md
git add README.md
git commit -m "Initial commit"

# Make working tree dirty
echo "changes" >> README.md

# Try to run yepe
bash /Users/ep/workspace/agents/packages/yepe/install.sh
# Should fail with "Working tree is not clean" error
```

## Troubleshooting

### "Failed to download blueprint"

This means the git clone failed. Possible causes:
- No internet connection
- GitHub is not accessible
- Repository URL is incorrect
- Git is not installed

Check:
```bash
git --version
ping github.com
git clone --depth 1 https://github.com/epleaner/agents.git /tmp/test-clone
```

### "Command not found: yepe"

If using `npm link`, ensure:
- You ran `npm link` in the package directory
- Your npm global bin directory is in PATH
- Try `npm list -g @yepe/init` to verify it's linked

### TypeScript errors during build

```bash
cd /Users/ep/workspace/agents/packages/yepe
rm -rf node_modules dist
npm install
npm run build
```

## Development Workflow

When making changes to yepe:

1. **Edit source files** in `src/`
2. **Rebuild:** `npm run build`
3. **Test:** Run one of the test methods above
4. **Iterate:** Repeat until working

For faster iteration, use `npm run dev` to watch for changes:

```bash
# Terminal 1: Watch and rebuild
cd /Users/ep/workspace/agents/packages/yepe
npm run dev

# Terminal 2: Test after each change
cd /tmp/yepe-test
node /Users/ep/workspace/agents/packages/yepe/dist/cli.js
```
