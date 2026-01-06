#!/bin/bash
# Test script for interactive prompts with simulated input

set -e

echo "🧪 Testing yepe with interactive prompts..."
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

# Run yepe with simulated input
echo "4️⃣  Running yepe with simulated input..."
echo ""

# Create input file (last line is skill selection: 1,3 = action-items, jira-lookup)
cat > /tmp/yepe-input.txt <<EOF
My Awesome App
A modern web application for managing tasks and projects
TypeScript, React, Node.js, PostgreSQL
Prettier with 2-space indent, ESLint strict mode
Clean Architecture with feature-based modules
Jest unit tests, Playwright E2E, 80% coverage target
Trunk-based development with short-lived feature branches
Task management domain with projects, tasks, and user collaboration
GDPR compliance required, data residency in EU
Auth0 for authentication, Stripe for payments, SendGrid for emails
myapp
1,3
EOF

yepe < /tmp/yepe-input.txt || true
echo ""

# Show results
echo "5️⃣  Checking results..."
echo ""

if [ -f "AGENTS.md" ]; then
    echo "   ✅ AGENTS.md created"
    echo ""
    echo "📄 AGENTS.md header:"
    head -30 AGENTS.md
else
    echo "   ❌ AGENTS.md not found"
fi

echo ""

if [ -f "openspec/project.md" ]; then
    echo "   ✅ openspec/project.md created"
    echo ""
    echo "📄 project.md content:"
    cat openspec/project.md
else
    echo "   ❌ openspec/project.md not found"
fi

echo ""

if [ -f ".yepe-report.json" ]; then
    echo "   ✅ .yepe-report.json created"
else
    echo "   ❌ .yepe-report.json not found"
fi

echo ""

if [ -f "learnings/index.md" ]; then
    echo "   ✅ learnings/index.md created (template)"
    echo ""
    echo "📄 learnings/index.md (first 20 lines):"
    head -20 learnings/index.md
else
    echo "   ❌ learnings/index.md not found"
fi

echo ""

if [ -d ".opencode/skill" ]; then
    echo "   ✅ .opencode/skill/ created"
    echo "   Skills installed:"
    ls -1 .opencode/skill/ | sed 's/^/      /'
else
    echo "   ❌ .opencode/skill/ not found"
fi

echo ""
echo "💡 Test directory: $TEST_DIR"
echo "   (will be deleted when this script exits)"
echo ""
echo "Press Enter to clean up, or Ctrl+C to keep test directory for inspection..."
read
