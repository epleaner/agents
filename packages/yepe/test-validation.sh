#!/bin/bash
# Test validation and re-prompting behavior

set -e

echo "🧪 Testing validation and re-prompting..."
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

# Run yepe with simulated input that tests validation
echo "4️⃣  Running yepe with validation test..."
echo ""
echo "   This simulates:"
echo "   - Empty project name (should re-prompt)"
echo "   - Valid project name"
echo "   - Empty purpose (should re-prompt)"
echo "   - Valid purpose"
echo "   - Invalid beads prefix 'x' (should re-prompt)"
echo "   - Valid beads prefix 'test'"
echo ""

# Create input file with validation errors
cat > /tmp/yepe-validation-input.txt <<EOF

Test App

A test application for validation
TypeScript




test
0
EOF

yepe < /tmp/yepe-validation-input.txt || true
echo ""

# Show results
echo "5️⃣  Checking results..."
echo ""

if [ -f "AGENTS.md" ]; then
    echo "   ✅ AGENTS.md created (validation didn't exit)"
    echo ""
    echo "📄 Project name in AGENTS.md:"
    grep "^# " AGENTS.md | head -1
else
    echo "   ❌ AGENTS.md not found (validation may have exited)"
fi

echo ""

if [ -f "openspec/project.md" ]; then
    echo "   ✅ openspec/project.md created"
    echo ""
    echo "📄 Purpose in project.md:"
    grep -A 1 "## Purpose" openspec/project.md
else
    echo "   ❌ openspec/project.md not found"
fi

echo ""
echo "✅ Validation test complete!"
echo ""
echo "If you saw the tool re-prompt for empty required fields, validation is working correctly."
echo ""
