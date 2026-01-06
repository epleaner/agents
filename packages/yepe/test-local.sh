#!/bin/bash
# Local testing script for yepe

set -e

echo "🧪 Testing yepe locally..."
echo ""

# Create temp directory
TEST_DIR=$(mktemp -d)
echo "📁 Test directory: $TEST_DIR"
echo ""

# Cleanup function
cleanup() {
    echo ""
    echo "🧹 Cleaning up..."
    rm -rf "$TEST_DIR"
}

trap cleanup EXIT

# Navigate to test directory
cd "$TEST_DIR"

# Initialize git
echo "1️⃣  Initializing git repository..."
git init
git config user.email "test@example.com"
git config user.name "Test User"

# Create initial commit
echo "# Test Project" > README.md
git add README.md
git commit -m "Initial commit"
echo "   ✓ Git initialized"
echo ""

# Run yepe using node directly
echo "2️⃣  Running yepe..."
YEPE_DIR="/Users/ep/workspace/agents/packages/yepe"
node "$YEPE_DIR/dist/cli.js"
echo ""

# Show results
echo "3️⃣  Results:"
echo ""
echo "📋 Files created:"
ls -la | grep -v "^d" | tail -n +4
echo ""

if [ -f ".yepe-report.json" ]; then
    echo "📊 Report summary:"
    cat .yepe-report.json | grep -A 3 '"summary"'
    echo ""
fi

echo "✅ Test complete!"
echo ""
echo "💡 To inspect manually:"
echo "   cd $TEST_DIR"
