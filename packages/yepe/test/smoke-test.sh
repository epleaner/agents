#!/bin/bash
# Smoke test for yepe installation script

set -e

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INSTALL_SCRIPT="$SCRIPT_DIR/../install.sh"

TEST_DIR=$(mktemp -d)
echo "Test directory: $TEST_DIR"

cleanup() {
    echo "Cleaning up test directory..."
    rm -rf "$TEST_DIR"
}

trap cleanup EXIT

cd "$TEST_DIR"

# Initialize git repo
git init
git config user.email "test@example.com"
git config user.name "Test User"

# Create initial commit (required for clean working tree check)
echo "# Test Project" > README.md
git add README.md
git commit -m "Initial commit"

# Run install script
echo "Running yepe install script from: $INSTALL_SCRIPT"
bash "$INSTALL_SCRIPT"

# Verify key files exist
echo "Verifying installation..."

if [ ! -f "AGENTS.md" ]; then
    echo "ERROR: AGENTS.md not found"
    exit 1
fi

if [ ! -d ".opencode" ]; then
    echo "ERROR: .opencode directory not found"
    exit 1
fi

if [ ! -f ".yepe-report.json" ]; then
    echo "ERROR: .yepe-report.json not found"
    exit 1
fi

# Verify report structure
if ! grep -q '"added"' .yepe-report.json; then
    echo "ERROR: Invalid report structure"
    exit 1
fi

echo "✓ Smoke test passed!"
