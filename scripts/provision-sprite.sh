#!/usr/bin/env bash
set -euo pipefail

# Sprite Provisioning Script for OpenCode Agents
#
# This script provisions a Fly.io Sprite sandbox with the OpenCode agents
# repository. It can be run locally to create/provision a sprite, or inside
# a sprite (via sprite exec) to perform the actual setup.
#
# Sprites come pre-installed with Node.js 22, Python 3.13, Claude Code, etc.
# They have persistent filesystems with checkpoint/restore capabilities.
#
# Usage:
#   Local:  ./provision-sprite.sh [--name <sprite-name>] [--org <org>]
#   Sprite: sprite exec ./provision-sprite.sh --inside
#
# Options:
#   --name, -n       Sprite name (default: opencode-dev)
#   --org, -o        Fly.io organization (optional)
#   --inside         Run provisioning inside sprite (auto-detected)
#   --repo           Git repo URL (default: https://github.com/epleaner/agents.git)
#   --branch, -b     Git branch (default: main)
#   --no-checkpoint  Skip creating checkpoint after provisioning
#   --reprovision    Destroy existing sprite and create fresh
#   --secrets        Path to secrets file (KEY=value format, one per line)
#   --openrouter-key Set OPENROUTER_API_KEY
#   --exa-key        Set EXA_API_KEY
#   --context7-key   Set CONTEXT7_API_KEY
#   --help, -h       Show help
#
# Examples:
#   # Create and provision a new sprite
#   ./provision-sprite.sh
#
#   # Use a specific name and organization
#   ./provision-sprite.sh --name my-dev --org myorg
#
#   # Provision with a specific branch
#   ./provision-sprite.sh --branch feature-xyz
#
#   # Run inside an existing sprite (auto-detected or explicit)
#   sprite exec ./provision-sprite.sh --inside

# Default configuration
SPRITE_NAME="opencode-dev"
SPRITE_ORG=""
GIT_REPO="https://github.com/epleaner/agents.git"
GIT_BRANCH="main"
CREATE_CHECKPOINT=true
INSIDE_SPRITE=false
REPROVISION=false

# API keys (can be passed via flags or environment)
OPENROUTER_API_KEY="${OPENROUTER_API_KEY:-}"
EXA_API_KEY="${EXA_API_KEY:-}"
CONTEXT7_API_KEY="${CONTEXT7_API_KEY:-}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[OK]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_step() { echo -e "${CYAN}==>${NC} $1"; }

show_help() {
    cat << 'EOF'
Sprite Provisioning Script for OpenCode Agents

Usage:
  Local:  ./provision-sprite.sh [OPTIONS]
  Sprite: sprite exec ./provision-sprite.sh --inside

Options:
  --name, -n       Sprite name (default: opencode-dev)
  --org, -o        Fly.io organization (optional)
  --inside         Run provisioning inside sprite (auto-detected)
  --repo           Git repo URL (default: https://github.com/epleaner/agents.git)
  --branch, -b     Git branch (default: main)
  --no-checkpoint  Skip creating checkpoint after provisioning
  --reprovision    Destroy existing sprite and create fresh
  --secrets        Path to secrets file (KEY=value format, one per line)
  --openrouter-key Set OPENROUTER_API_KEY
  --exa-key        Set EXA_API_KEY
  --context7-key   Set CONTEXT7_API_KEY
  --help, -h       Show help

Examples:
  # Create and provision a new sprite
  ./provision-sprite.sh

  # Use a specific name and organization  
  ./provision-sprite.sh --name my-dev --org myorg

  # Provision with a specific branch
  ./provision-sprite.sh --branch feature-xyz

  # Resume provisioning inside an existing sprite
  sprite -s opencode-dev exec "./provision-sprite.sh --inside"

Environment Variables (set inside sprite):
  OPENCODE_DATA_DIR   Data directory for OpenCode
  NODE_ENV            Node environment (production)

After provisioning, set API keys:
  export OPENROUTER_API_KEY=sk-or-...
  export EXA_API_KEY=...
  export CONTEXT7_API_KEY=...
EOF
}

# Parse command line arguments
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --name|-n)
                SPRITE_NAME="$2"
                shift 2
                ;;
            --org|-o)
                SPRITE_ORG="$2"
                shift 2
                ;;
            --inside)
                INSIDE_SPRITE=true
                shift
                ;;
            --repo)
                GIT_REPO="$2"
                shift 2
                ;;
            --branch|-b)
                GIT_BRANCH="$2"
                shift 2
                ;;
            --no-checkpoint)
                CREATE_CHECKPOINT=false
                shift
                ;;
            --reprovision)
                REPROVISION=true
                shift
                ;;
            --secrets)
                SECRETS_FILE="$2"
                if [[ -f "$SECRETS_FILE" ]]; then
                    # shellcheck disable=SC1090
                    source "$SECRETS_FILE"
                else
                    log_error "Secrets file not found: $SECRETS_FILE"
                    exit 1
                fi
                shift 2
                ;;
            --openrouter-key)
                OPENROUTER_API_KEY="$2"
                shift 2
                ;;
            --exa-key)
                EXA_API_KEY="$2"
                shift 2
                ;;
            --context7-key)
                CONTEXT7_API_KEY="$2"
                shift 2
                ;;
            --help|-h)
                show_help
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
}

# Detect if running inside a sprite
detect_environment() {
    # Check for sprite-specific markers
    if [[ -f "/.sprite" ]] || [[ "${SPRITE_CONTAINER:-}" == "true" ]] || [[ -d "/home/user" && "$(whoami 2>/dev/null)" == "user" ]]; then
        INSIDE_SPRITE=true
    fi
}

# Check if sprite CLI is available
check_sprite_cli() {
    if ! command -v sprite &> /dev/null; then
        log_error "sprite CLI not found"
        echo ""
        echo "Install the sprite CLI:"
        echo "  brew install superfly/tap/sprite"
        echo ""
        echo "Or see: https://fly.io/docs/sprites/getting-started/"
        exit 1
    fi
}

# Check sprite authentication
check_sprite_auth() {
    # Try to list sprites to verify auth
    if ! sprite list &> /dev/null; then
        log_error "Not authenticated with Fly.io"
        echo ""
        echo "Run: sprite login"
        exit 1
    fi
    log_success "Authenticated with Fly.io"
}

# Destroy existing sprite if reprovision flag is set
destroy_if_reprovision() {
    if [[ "$REPROVISION" != true ]]; then
        return
    fi
    
    local org_flag=""
    [[ -n "$SPRITE_ORG" ]] && org_flag="-o $SPRITE_ORG"
    
    # Check if sprite exists (exact match)
    # shellcheck disable=SC2086
    if sprite list $org_flag 2>/dev/null | grep -qE "^${SPRITE_NAME}$"; then
        log_step "Destroying existing sprite: $SPRITE_NAME"
        # shellcheck disable=SC2086
        sprite $org_flag -s "$SPRITE_NAME" destroy --force
        log_success "Sprite destroyed"
        sleep 2  # Brief pause before recreating
    fi
}

# Create or get existing sprite
ensure_sprite() {
    local org_flag=""
    [[ -n "$SPRITE_ORG" ]] && org_flag="-o $SPRITE_ORG"
    
    # Check if sprite exists (exact match)
    # shellcheck disable=SC2086
    if sprite list $org_flag 2>/dev/null | grep -qE "^${SPRITE_NAME}$"; then
        log_info "Sprite '$SPRITE_NAME' already exists"
    else
        log_step "Creating sprite: $SPRITE_NAME"
        # shellcheck disable=SC2086
        sprite create $org_flag -skip-console "$SPRITE_NAME"
        log_success "Sprite created"
    fi
    
    # Set as active sprite for CLI commands
    log_info "Setting active sprite context..."
    # shellcheck disable=SC2086
    sprite use $org_flag "$SPRITE_NAME" 2>/dev/null || true
}

# Run provisioning commands inside the sprite
run_inside_sprite() {
    log_step "Running provisioning inside sprite..."
    
    local org_flag=""
    [[ -n "$SPRITE_ORG" ]] && org_flag="-o $SPRITE_ORG"
    
    # Get the script content for remote execution
    # shellcheck disable=SC2086
    sprite $org_flag -s "$SPRITE_NAME" exec bash << PROVISION_SCRIPT
set -euo pipefail

echo "==> Starting sprite provisioning..."

# Setup working directory
cd "\$HOME"
WORK_DIR="\$HOME/workspace"
mkdir -p "\$WORK_DIR"
cd "\$WORK_DIR"

# Clone or update the repository
REPO_DIR="\$WORK_DIR/agents"
if [[ -d "\$REPO_DIR/.git" ]]; then
    echo "==> Repository exists, pulling latest changes..."
    cd "\$REPO_DIR"
    git fetch origin
    git checkout "$GIT_BRANCH" 2>/dev/null || git checkout -b "$GIT_BRANCH" "origin/$GIT_BRANCH"
    git pull origin "$GIT_BRANCH"
else
    echo "==> Cloning repository..."
    git clone --branch "$GIT_BRANCH" "$GIT_REPO" "\$REPO_DIR"
    cd "\$REPO_DIR"
fi

# Check for required tools (most are pre-installed in sprites)
echo "==> Checking dependencies..."

if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js not found - sprites should have Node.js 22 pre-installed"
    exit 1
fi

echo "Node.js version: \$(node --version)"
echo "npm version: \$(npm --version)"

# Install OpenCode CLI
if ! command -v opencode &> /dev/null && [[ ! -f "\$HOME/.opencode/bin/opencode" ]]; then
    echo "==> Installing OpenCode CLI..."
    curl -fsSL https://opencode.ai/install | bash
fi

# Add opencode to PATH for current session
if [[ -d "\$HOME/.opencode/bin" ]]; then
    export PATH="\$HOME/.opencode/bin:\$PATH"
    echo "==> OpenCode CLI installed: \$(opencode --version 2>/dev/null || echo 'unknown version')"
fi

# Setup environment variables
echo "==> Configuring environment..."
BASHRC="\$HOME/.bashrc"
PROFILE="\$HOME/.profile"

# Add environment variables to all shell configs
add_env_var() {
    local var_name="\$1"
    local var_value="\$2"
    local added=false
    
    # Add to .profile for bash login shells
    if ! grep -q "^export \$var_name=" "\$PROFILE" 2>/dev/null; then
        echo "export \$var_name=\"\$var_value\"" >> "\$PROFILE"
    fi
    
    # Add to .bashrc for bash interactive shells
    if ! grep -q "^export \$var_name=" "\$BASHRC" 2>/dev/null; then
        echo "export \$var_name=\"\$var_value\"" >> "\$BASHRC"
        added=true
    fi
    
    # Add to .zshrc for zsh (sprite console uses zsh)
    if ! grep -q "^export \$var_name=" "\$HOME/.zshrc" 2>/dev/null; then
        echo "export \$var_name=\"\$var_value\"" >> "\$HOME/.zshrc"
        added=true
    fi
    
    if [[ "\$added" == true ]]; then
        echo "  Added \$var_name"
    else
        echo "  \$var_name already configured"
    fi
}

# Create data directory
mkdir -p "\$HOME/.opencode-data"

# Add environment variables
add_env_var "OPENCODE_DATA_DIR" "\$HOME/.opencode-data"
add_env_var "NODE_ENV" "production"
add_env_var "WORKSPACE_DIR" "\$HOME/workspace/agents"

# Add PATH for opencode CLI to all shell configs
if ! grep -q "\.opencode/bin" "\$BASHRC" 2>/dev/null; then
    echo 'export PATH="\$HOME/.opencode/bin:\$PATH"' >> "\$BASHRC"
fi
if ! grep -q "\.opencode/bin" "\$PROFILE" 2>/dev/null; then
    echo 'export PATH="\$HOME/.opencode/bin:\$PATH"' >> "\$PROFILE"
fi
if ! grep -q "\.opencode/bin" "\$HOME/.zshrc" 2>/dev/null; then
    echo 'export PATH="\$HOME/.opencode/bin:\$PATH"' >> "\$HOME/.zshrc"
fi
echo "  Added ~/.opencode/bin to PATH"

# Set API keys if provided
KEYS_SET=0
if [[ -n "$OPENROUTER_API_KEY" ]]; then
    add_env_var "OPENROUTER_API_KEY" "$OPENROUTER_API_KEY"
    KEYS_SET=1
fi
if [[ -n "$EXA_API_KEY" ]]; then
    add_env_var "EXA_API_KEY" "$EXA_API_KEY"
    KEYS_SET=1
fi
if [[ -n "$CONTEXT7_API_KEY" ]]; then
    add_env_var "CONTEXT7_API_KEY" "$CONTEXT7_API_KEY"
    KEYS_SET=1
fi

# Add placeholder comments for API keys if none were set
if [[ "\$KEYS_SET" -eq 0 ]] && ! grep -q "# OpenCode API Keys" "\$BASHRC" 2>/dev/null; then
    cat >> "\$BASHRC" << 'APIKEYS'

# OpenCode API Keys (set these with your actual keys)
# export OPENROUTER_API_KEY=sk-or-...
# export EXA_API_KEY=...
# export CONTEXT7_API_KEY=...
APIKEYS
fi

# Add workspace directory to PATH-like convenience
if ! grep -q "cd.*workspace/agents" "\$BASHRC" 2>/dev/null; then
    echo "" >> "\$BASHRC"
    echo "# Auto-cd to workspace on login" >> "\$BASHRC"
    echo "[[ -d \"\\\$HOME/workspace/agents\" ]] && cd \"\\\$HOME/workspace/agents\"" >> "\$BASHRC"
fi

# Source bashrc to apply changes
source "\$BASHRC" 2>/dev/null || true

echo ""
echo "==> Provisioning complete!"
echo ""
echo "Repository: \$REPO_DIR"
echo "Branch: $GIT_BRANCH"
echo "Node.js: \$(node --version)"
echo ""
PROVISION_SCRIPT

    log_success "Provisioning complete inside sprite"
}

# Provision from inside the sprite (when --inside flag is used)
provision_inside() {
    log_step "Running inside sprite - performing setup..."
    
    cd "$HOME"
    WORK_DIR="$HOME/workspace"
    mkdir -p "$WORK_DIR"
    cd "$WORK_DIR"
    
    # Clone or update repository
    REPO_DIR="$WORK_DIR/agents"
    if [[ -d "$REPO_DIR/.git" ]]; then
        log_info "Repository exists, pulling latest changes..."
        cd "$REPO_DIR"
        git fetch origin
        git checkout "$GIT_BRANCH" 2>/dev/null || git checkout -b "$GIT_BRANCH" "origin/$GIT_BRANCH"
        git pull origin "$GIT_BRANCH"
    else
        log_step "Cloning repository..."
        git clone --branch "$GIT_BRANCH" "$GIT_REPO" "$REPO_DIR"
        cd "$REPO_DIR"
    fi
    
    # Check dependencies
    log_step "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        log_error "Node.js not found - sprites should have Node.js 22 pre-installed"
        exit 1
    fi
    
    log_success "Node.js $(node --version)"
    log_success "npm $(npm --version)"
    
    # Setup environment
    log_step "Configuring environment..."
    BASHRC="$HOME/.bashrc"
    
    mkdir -p "$HOME/.opencode-data"
    
    # Add environment variables
    add_env_var() {
        local var_name="$1"
        local var_value="$2"
        
        if ! grep -q "export $var_name=" "$BASHRC" 2>/dev/null; then
            echo "export $var_name=\"$var_value\"" >> "$BASHRC"
            log_info "Added $var_name"
        else
            log_info "$var_name already configured"
        fi
    }
    
    add_env_var "OPENCODE_DATA_DIR" "$HOME/.opencode-data"
    add_env_var "NODE_ENV" "production"
    add_env_var "WORKSPACE_DIR" "$HOME/workspace/agents"
    
    # Add API key placeholders
    if ! grep -q "# OpenCode API Keys" "$BASHRC" 2>/dev/null; then
        cat >> "$BASHRC" << 'APIKEYS'

# OpenCode API Keys (set these with your actual keys)
# export OPENROUTER_API_KEY=sk-or-...
# export EXA_API_KEY=...
# export CONTEXT7_API_KEY=...
APIKEYS
    fi
    
    # Add auto-cd
    if ! grep -q "cd.*workspace/agents" "$BASHRC" 2>/dev/null; then
        echo "" >> "$BASHRC"
        echo "# Auto-cd to workspace on login" >> "$BASHRC"
        echo '[[ -d "$HOME/workspace/agents" ]] && cd "$HOME/workspace/agents"' >> "$BASHRC"
    fi
    
    log_success "Environment configured"
    
    echo ""
    echo "========================================"
    echo "  Provisioning Complete!"
    echo "========================================"
    echo ""
    echo "Repository: $REPO_DIR"
    echo "Branch: $GIT_BRANCH"
    echo ""
    echo "Next steps:"
    echo "  1. Set your API keys in ~/.bashrc:"
    echo "     export OPENROUTER_API_KEY=sk-or-..."
    echo "     export EXA_API_KEY=..."
    echo ""
    echo "  2. Source the updated profile:"
    echo "     source ~/.bashrc"
    echo ""
}

# Create checkpoint after provisioning
create_checkpoint() {
    if [[ "$CREATE_CHECKPOINT" != true ]]; then
        log_info "Skipping checkpoint creation (--no-checkpoint)"
        return
    fi
    
    log_step "Creating checkpoint..."
    
    local org_flag=""
    [[ -n "$SPRITE_ORG" ]] && org_flag="-o $SPRITE_ORG"
    
    local checkpoint_name="provisioned-$(date +%Y%m%d-%H%M%S)"
    
    # shellcheck disable=SC2086
    if sprite $org_flag -s "$SPRITE_NAME" checkpoint create --name "$checkpoint_name" 2>/dev/null; then
        log_success "Checkpoint created: $checkpoint_name"
    else
        # Try without --name flag (older CLI versions)
        # shellcheck disable=SC2086
        sprite $org_flag -s "$SPRITE_NAME" checkpoint create && log_success "Checkpoint created"
    fi
}

# Show final instructions
show_final_instructions() {
    local org_flag=""
    [[ -n "$SPRITE_ORG" ]] && org_flag="-o $SPRITE_ORG"
    
    local keys_configured=false
    [[ -n "$OPENROUTER_API_KEY" || -n "$EXA_API_KEY" || -n "$CONTEXT7_API_KEY" ]] && keys_configured=true
    
    echo ""
    echo "========================================"
    echo "  Sprite Provisioning Complete!"
    echo "========================================"
    echo ""
    echo "Sprite: $SPRITE_NAME"
    [[ -n "$SPRITE_ORG" ]] && echo "Org: $SPRITE_ORG"
    
    if [[ "$keys_configured" == true ]]; then
        echo "API Keys: configured"
    fi
    echo ""
    echo "Connect and run:"
    echo "  sprite -s $SPRITE_NAME console"
    echo "  opencode"
    echo ""
    
    if [[ "$keys_configured" != true ]]; then
        echo "Set API keys inside the sprite:"
        echo "  export OPENROUTER_API_KEY=sk-or-..."
        echo "  export EXA_API_KEY=..."
        echo ""
    fi
    
    echo "Useful commands:"
    echo "  sprite -s $SPRITE_NAME exec <command>   # Run command"
    echo "  sprite -s $SPRITE_NAME checkpoint list  # List checkpoints"
    echo "  sprite -s $SPRITE_NAME restore <id>     # Restore checkpoint"
    echo ""
}

# Main entry point
main() {
    parse_args "$@"
    detect_environment
    
    if [[ "$INSIDE_SPRITE" == true ]]; then
        # Running inside a sprite
        provision_inside
    else
        # Running locally - orchestrate sprite creation and provisioning
        log_step "Sprite Provisioning Script"
        echo ""
        
        check_sprite_cli
        check_sprite_auth
        destroy_if_reprovision
        ensure_sprite
        run_inside_sprite
        create_checkpoint
        show_final_instructions
    fi
}

main "$@"
