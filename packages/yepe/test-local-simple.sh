#!/bin/bash
# Simple local test using npm link

set -e

echo "🧪 Testing yepe locally with npm link..."
echo ""

# Build the package
echo "1️⃣  Building package..."
cd /Users/ep/workspace/agents/packages/yepe
npm run build
echo "   ✓ Built"
echo ""

# Link the package globally
echo "2️⃣  Linking package globally..."
npm link
echo "   ✓ Linked"
echo ""

# Create temp directory
TEST_DIR=$(mktemp -d)
echo "📁 Test directory: $TEST_DIR"
echo ""

# Cleanup function
cleanup() {
    echo ""
    echo "🧹 Cleaning up..."
    cd /Users/ep/workspace/agents/packages/yepe
    npm unlink -g @yepe/init 2>/dev/null || true
    rm -rf "$TEST_DIR"
}

trap cleanup EXIT

# Navigate to test directory
cd "$TEST_DIR"

# Initialize git
echo "3️⃣  Initializing git repository..."
git init
git config user.email "test@example.com"
git config user.name "Test User"

# Create initial commit
echo "# Test Project" > README.md
git add README.md
git commit -m "Initial commit"
echo "   ✓ Git initialized"
echo ""

# Run yepe
echo "4️⃣  Running yepe..."
echo ""
yepe || true
echo ""

# Show results
echo "5️⃣  Checking results..."
echo ""

if [ -f "AGENTS.md" ]; then
    echo "   ✅ AGENTS.md created"
else
    echo "   ❌ AGENTS.md not found"
fi

if [ -d ".opencode" ]; then
    echo "   ✅ .opencode/ created"
    echo "      Files: $(find .opencode -type f | wc -l | tr -d ' ')"
else
    echo "   ❌ .opencode/ not found"
fi

if [ -f ".yepe-report.json" ]; then
    echo "   ✅ .yepe-report.json created"
    echo ""
    echo "📊 Report summary:"
    cat .yepe-report.json | python3 -m json.tool 2>/dev/null | grep -A 5 '"summary"' || cat .yepe-report.json
else
    echo "   ❌ .yepe-report.json not found"
fi

echo ""
echo "💡 To inspect manually, the test ran in:"
echo "   $TEST_DIR"
echo "   (will be deleted when this script exits)"
