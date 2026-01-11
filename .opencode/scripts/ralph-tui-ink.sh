#!/usr/bin/env bash
# ralph-tui-ink.sh - Ink-based TUI wrapper for Ralph orchestrator
# This wraps the TypeScript Ink TUI implementation
#
# Usage: ./ralph-tui-ink.sh "prompt text" [options]
#        ./ralph-tui-ink.sh --prompt <file> [options]

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
TUI_DIR="$SCRIPT_DIR/ralph-tui"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[ralph-tui]${NC} $*"
}

log_error() {
    echo -e "${RED}[ralph-tui]${NC} $*" >&2
}

log_warning() {
    echo -e "${YELLOW}[ralph-tui]${NC} $*"
}

# Check if tsx is available
check_tsx() {
    if command -v tsx &>/dev/null; then
        return 0
    fi
    
    # Check if npx tsx works
    if npx tsx --version &>/dev/null 2>&1; then
        return 0
    fi
    
    return 1
}

# Check if dependencies are installed
check_dependencies() {
    local opencode_dir="$PROJECT_ROOT/.opencode"
    local node_modules="$opencode_dir/node_modules"
    
    # Check for ink in node_modules
    if [[ ! -d "$node_modules/ink" ]]; then
        log_warning "Ink dependencies not found. Installing..."
        install_dependencies
    fi
}

# Install dependencies
install_dependencies() {
    local opencode_dir="$PROJECT_ROOT/.opencode"
    
    log_info "Installing Ink TUI dependencies..."
    
    cd "$opencode_dir"
    
    # Install dependencies
    npm install --save ink@5 ink-spinner@5 meow@13 react@18 2>/dev/null || {
        log_error "Failed to install dependencies"
        exit 1
    }
    
    # Install dev dependencies for TypeScript
    npm install --save-dev @types/react@18 typescript tsx 2>/dev/null || {
        log_warning "Failed to install dev dependencies, but continuing..."
    }
    
    log_info "Dependencies installed successfully"
    
    cd "$PROJECT_ROOT"
}

# Show help
show_help() {
    cat << 'EOF'
Ralph TUI (Ink) - Terminal User Interface for Ralph orchestrator

USAGE:
  ralph-tui-ink.sh "inline prompt text" [options]
  ralph-tui-ink.sh --prompt <file> [options]
  ralph-tui-ink.sh --resume <session-id>
  ralph-tui-ink.sh --help

PROMPT (one required):
  "text"                  Inline prompt text (first positional argument)
  -p, --prompt <file>     Path to prompt file containing task description

OPTIONS:
  --max-iterations <N>    Maximum iterations (default: 50)
  --timeout <seconds>     Maximum runtime in seconds (default: 7200)
  --agent <name>          Agent to use (default: orchestrator)
  --checkpoint <N>        Git checkpoint interval (default: 10)
  --verbose               Enable verbose output
  --dry-run               Test mode without executing agents

RECOVERY:
  --resume <session-id>   Resume from a previous session

KEYBOARD CONTROLS:
  ↑/k, ↓/j    Navigate between iterations (INCLUDING current)
  Home/g      Jump to first iteration
  End/G       Jump to latest/current iteration
  PgUp/PgDn   Scroll agent output
  p           Pause execution
  r           Resume execution
  q           Quit
  ?           Show help overlay

EXAMPLES:
  # Inline prompt
  ralph-tui-ink.sh "Implement user authentication"

  # From file
  ralph-tui-ink.sh --prompt task.md

  # With options
  ralph-tui-ink.sh "Fix the bug" --max-iterations 20 --dry-run

EOF
}

# Main
main() {
    # Check for help flag
    for arg in "$@"; do
        if [[ "$arg" == "--help" || "$arg" == "-h" ]]; then
            show_help
            exit 0
        fi
    done
    
    # Check tsx availability
    if ! check_tsx; then
        log_error "tsx not found. Please install it with: npm install -g tsx"
        log_error "Or run: npm install --save-dev tsx in .opencode/"
        exit 1
    fi
    
    # Check and install dependencies
    check_dependencies
    
    # Run the Ink TUI
    cd "$PROJECT_ROOT"
    
    # Use npx tsx to run the TypeScript entry point
    exec npx tsx "$TUI_DIR/index.tsx" "$@"
}

main "$@"
