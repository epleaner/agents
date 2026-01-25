#!/bin/bash
# Railway start script for OpenCode Web
# Handles persistent storage setup, symlinks, repo cloning, and process management
#
# =============================================================================
# REQUIRED RAILWAY ENVIRONMENT VARIABLES
# =============================================================================
# Set these via Railway dashboard or CLI:
#
#   railway variables set GITHUB_CLIENT_ID=<your_client_id>
#   railway variables set GITHUB_CLIENT_SECRET=<your_client_secret>
#   railway variables set ALLOWED_GITHUB_USERNAME=<your_github_username>
#   railway variables set SESSION_SECRET=$(openssl rand -hex 32)
#   railway variables set ANTHROPIC_API_KEY=<your_anthropic_key>
#
# =============================================================================
# OPTIONAL RAILWAY ENVIRONMENT VARIABLES
# =============================================================================
#
#   # OpenCode Web configuration (defaults shown)
#   railway variables set OPENCODE_SERVER_PASSWORD=""     # Disabled - auth handled by OAuth proxy
#   railway variables set OPENCODE_DATA_DIR="/app/data/.opencode"
#   railway variables set NODE_ENV=production
#
#   # Git repository settings
#   railway variables set AGENTS_REPO_URL="https://github.com/epleaner/agents.git"
#   railway variables set GITHUB_TOKEN=<your_token>       # Required for private repos
#
#   # Additional LLM providers (optional)
#   railway variables set OPENAI_API_KEY=<your_openai_key>
#
# =============================================================================

set -e

echo "=== OpenCode Web Railway Startup ==="
echo "Starting at $(date)"

# Configuration
DATA_DIR="/app/data"
OPENCODE_DIR="$DATA_DIR/.opencode"
WORKSPACE_DIR="$DATA_DIR/workspace"
LOGS_DIR="$DATA_DIR/logs"
OPENCODE_PORT=4096
PROXY_PORT=${PORT:-3000}

# Default repo URL - can be overridden via AGENTS_REPO_URL env var
AGENTS_REPO_URL="${AGENTS_REPO_URL:-https://github.com/epleaner/agents.git}"

# PID tracking for cleanup
OPENCODE_PID=""

# Cleanup function for graceful shutdown
cleanup() {
    echo "Received shutdown signal, cleaning up..."
    if [ -n "$OPENCODE_PID" ] && kill -0 "$OPENCODE_PID" 2>/dev/null; then
        echo "Stopping OpenCode Web (PID: $OPENCODE_PID)..."
        kill -TERM "$OPENCODE_PID" 2>/dev/null || true
        wait "$OPENCODE_PID" 2>/dev/null || true
    fi
    echo "Shutdown complete"
    exit 0
}

# Set up signal traps for graceful shutdown
trap cleanup SIGTERM SIGINT SIGQUIT

# Step 1: Create persistent disk directories if they don't exist
echo "Step 1: Setting up persistent storage directories..."
mkdir -p "$OPENCODE_DIR"
mkdir -p "$WORKSPACE_DIR"
mkdir -p "$LOGS_DIR"
mkdir -p "$OPENCODE_DIR/config"
echo "  Created: $OPENCODE_DIR"
echo "  Created: $WORKSPACE_DIR"
echo "  Created: $LOGS_DIR"

# Step 2: Copy scripts to persistent storage and set up symlinks
echo "Step 2: Setting up persistent storage..."

# Debug: show what's in /app/.opencode
echo "  Contents of /app/.opencode:"
ls -la /app/.opencode/ 2>/dev/null || echo "  /app/.opencode does not exist"

# Copy scripts from Docker image to persistent storage (first run only)
if [ ! -d "$OPENCODE_DIR/scripts" ]; then
    echo "  Copying scripts to persistent storage..."
    cp -r /app/.opencode/scripts "$OPENCODE_DIR/scripts"
fi

# Copy node_modules if not present (check both possible locations)
if [ ! -d "$OPENCODE_DIR/node_modules" ]; then
    echo "  Copying node_modules to persistent storage..."
    if [ -d /app/.opencode/node_modules ]; then
        cp -r /app/.opencode/node_modules "$OPENCODE_DIR/node_modules"
    elif [ -d /app/node_modules ]; then
        cp -r /app/node_modules "$OPENCODE_DIR/node_modules"
    else
        echo "  WARNING: node_modules not found, running npm install..."
        cd "$OPENCODE_DIR" && npm install --production
    fi
fi

# Set up workspace symlink
if [ -L /app/workspace ] || [ -d /app/workspace ]; then
    rm -rf /app/workspace
fi
ln -sf "$WORKSPACE_DIR" /app/workspace
echo "  /app/workspace -> $WORKSPACE_DIR"

# Step 3: Clone agents repo if not exists
echo "Step 3: Checking workspace repository..."
if [ ! -d "$WORKSPACE_DIR/.git" ]; then
    echo "  Workspace not initialized, cloning from $AGENTS_REPO_URL..."
    
    # If GITHUB_TOKEN is set, use it for authentication
    if [ -n "$GITHUB_TOKEN" ]; then
        # Convert https://github.com/user/repo.git to https://token@github.com/user/repo.git
        AUTH_REPO_URL=$(echo "$AGENTS_REPO_URL" | sed "s|https://|https://${GITHUB_TOKEN}@|")
        git clone "$AUTH_REPO_URL" "$WORKSPACE_DIR"
    else
        git clone "$AGENTS_REPO_URL" "$WORKSPACE_DIR"
    fi
    
    echo "  Repository cloned successfully"
else
    echo "  Workspace already initialized at $WORKSPACE_DIR"
    # Optionally fetch latest (but don't merge to avoid conflicts)
    echo "  Run 'git pull' manually via Railway CLI to update"
fi

# Step 4: Create OpenCode Web configuration if it doesn't exist
CONFIG_FILE="$OPENCODE_DIR/config/railway-opencode.json"
echo "Step 4: Checking OpenCode Web configuration..."
if [ ! -f "$CONFIG_FILE" ]; then
    echo "  Creating default configuration at $CONFIG_FILE..."
    cat > "$CONFIG_FILE" << 'EOF'
{
  "server": {
    "port": 4096,
    "hostname": "0.0.0.0",
    "cors": ["http://localhost:3000"]
  }
}
EOF
    echo "  Configuration created"
else
    echo "  Configuration already exists"
fi

# Step 5: Start OpenCode Web in background
echo "Step 5: Starting OpenCode Web on port $OPENCODE_PORT..."
echo "  Working directory: $WORKSPACE_DIR"

# Start OpenCode Web with port and hostname from the workspace directory
# Using explicit cd in subshell to ensure correct working directory
(cd "$WORKSPACE_DIR" && exec opencode web --port $OPENCODE_PORT --hostname 0.0.0.0) > "$LOGS_DIR/opencode.log" 2>&1 &
OPENCODE_PID=$!
echo "  OpenCode Web started (PID: $OPENCODE_PID)"

# Step 6: Wait for OpenCode Web to be ready
echo "Step 6: Waiting for OpenCode Web to be ready..."
MAX_WAIT=30
WAITED=0
while [ $WAITED -lt $MAX_WAIT ]; do
    if curl -s "http://localhost:$OPENCODE_PORT" > /dev/null 2>&1; then
        echo "  OpenCode Web is ready!"
        break
    fi
    
    # Check if process is still running
    if ! kill -0 "$OPENCODE_PID" 2>/dev/null; then
        echo "  ERROR: OpenCode Web process died unexpectedly"
        echo "  Last 50 lines of log:"
        tail -50 "$LOGS_DIR/opencode.log" 2>/dev/null || echo "  (no log available)"
        exit 1
    fi
    
    sleep 1
    WAITED=$((WAITED + 1))
    echo "  Waiting... ($WAITED/$MAX_WAIT)"
done

if [ $WAITED -ge $MAX_WAIT ]; then
    echo "  WARNING: OpenCode Web did not respond within ${MAX_WAIT}s"
    echo "  Continuing anyway - proxy will handle health checks"
fi

# Step 7: Start auth proxy in foreground
echo "Step 7: Starting auth proxy on port $PROXY_PORT..."
echo "=== Startup complete ==="
echo ""

# Start auth proxy - this runs in foreground and keeps the container alive
# The proxy handles health checks at /health
node $OPENCODE_DIR/scripts/railway-auth-proxy.js &
PROXY_PID=$!

# Wait for either process to exit
wait -n $OPENCODE_PID $PROXY_PID 2>/dev/null || true

# If we get here, one of the processes died
echo "A process exited unexpectedly"
cleanup
