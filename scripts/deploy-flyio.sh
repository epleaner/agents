#!/usr/bin/env bash
set -euo pipefail

# OpenCode Fly.io Deployment Script
# Usage: ./deploy-flyio.sh [--stop|--start|--status|--help]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
APP_NAME="${FLYIO_APP_NAME:-opencode-agents}"
REGION="${FLYIO_REGION:-sjc}"
VOLUME_NAME="opencode_data"
VOLUME_SIZE=1

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

show_help() {
    cat << EOF
OpenCode Fly.io Deployment Script

Usage: $0 [OPTIONS]

Options:
  --help        Show this help message
  --stop        Stop the Fly.io Machine (pause billing)
  --start       Start the Fly.io Machine
  --status      Show current Machine status
  --ssh         SSH into the running Machine
  --logs        Show recent logs
  --destroy     Destroy the app (WARNING: deletes everything)

Environment Variables:
  FLYIO_APP_NAME    App name (default: opencode-agents)
  FLYIO_REGION      Region (default: sjc)

Examples:
  $0              # Deploy or update
  $0 --stop       # Stop to save costs
  $0 --start      # Resume
  $0 --ssh        # Connect via SSH
EOF
}

check_flyctl() {
    if ! command -v flyctl &> /dev/null; then
        log_error "flyctl not found. Install with: brew install flyctl"
        exit 1
    fi
}

check_auth() {
    if ! flyctl auth whoami &> /dev/null; then
        log_error "Not authenticated. Run: flyctl auth login"
        exit 1
    fi
    log_info "Authenticated as: $(flyctl auth whoami)"
}

check_app_exists() {
    flyctl apps list 2>/dev/null | grep -q "^$APP_NAME " && return 0 || return 1
}

check_volume_exists() {
    flyctl volumes list -a "$APP_NAME" 2>/dev/null | grep -q "$VOLUME_NAME" && return 0 || return 1
}

check_secrets() {
    local missing=()
    
    if ! flyctl secrets list -a "$APP_NAME" 2>/dev/null | grep -q "OPENROUTER_API_KEY"; then
        missing+=("OPENROUTER_API_KEY")
    fi
    
    if ! flyctl secrets list -a "$APP_NAME" 2>/dev/null | grep -q "EXA_API_KEY"; then
        missing+=("EXA_API_KEY")
    fi
    
    if [ ${#missing[@]} -gt 0 ]; then
        log_warn "Missing secrets: ${missing[*]}"
        echo ""
        echo "Set required secrets with:"
        echo "  flyctl secrets set OPENROUTER_API_KEY=sk-or-... -a $APP_NAME"
        echo "  flyctl secrets set EXA_API_KEY=... -a $APP_NAME"
        echo ""
        read -p "Continue without secrets? (y/N) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    else
        log_success "Required secrets configured"
    fi
}

create_app() {
    log_info "Creating Fly.io app: $APP_NAME"
    cd "$PROJECT_ROOT"
    if flyctl apps create "$APP_NAME" --org personal 2>/dev/null; then
        log_success "App created"
    else
        log_info "App '$APP_NAME' already exists or name taken - continuing"
    fi
}

create_volume() {
    log_info "Creating persistent volume: $VOLUME_NAME (${VOLUME_SIZE}GB)"
    flyctl volumes create "$VOLUME_NAME" \
        --app "$APP_NAME" \
        --region "$REGION" \
        --size "$VOLUME_SIZE" \
        --yes || log_warn "Volume may already exist"
}

deploy() {
    log_info "Deploying to Fly.io..."
    cd "$PROJECT_ROOT"
    flyctl deploy --app "$APP_NAME"
    log_success "Deployment complete!"
    echo ""
    echo "Connect via SSH:"
    echo "  flyctl ssh console -a $APP_NAME"
    echo ""
    echo "Or run commands directly:"
    echo "  flyctl ssh console -a $APP_NAME -C 'opencode --version'"
}

stop_machine() {
    log_info "Stopping Machine..."
    flyctl machine stop -a "$APP_NAME" --select
    log_success "Machine stopped. Billing paused."
}

start_machine() {
    log_info "Starting Machine..."
    flyctl machine start -a "$APP_NAME" --select
    log_success "Machine started."
}

show_status() {
    log_info "App status for: $APP_NAME"
    flyctl status -a "$APP_NAME"
}

ssh_connect() {
    log_info "Connecting via SSH..."
    flyctl ssh console -a "$APP_NAME"
}

show_logs() {
    flyctl logs -a "$APP_NAME"
}

destroy_app() {
    log_warn "This will permanently delete the app and all data!"
    read -p "Type '$APP_NAME' to confirm: " confirm
    if [ "$confirm" = "$APP_NAME" ]; then
        flyctl apps destroy "$APP_NAME" --yes
        log_success "App destroyed."
    else
        log_info "Cancelled."
    fi
}

main() {
    case "${1:-}" in
        --help|-h)
            show_help
            exit 0
            ;;
        --stop)
            check_flyctl
            check_auth
            stop_machine
            exit 0
            ;;
        --start)
            check_flyctl
            check_auth
            start_machine
            exit 0
            ;;
        --status)
            check_flyctl
            check_auth
            show_status
            exit 0
            ;;
        --ssh)
            check_flyctl
            check_auth
            ssh_connect
            exit 0
            ;;
        --logs)
            check_flyctl
            check_auth
            show_logs
            exit 0
            ;;
        --destroy)
            check_flyctl
            check_auth
            destroy_app
            exit 0
            ;;
        "")
            # Default: deploy
            ;;
        *)
            log_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac

    # Main deployment flow
    check_flyctl
    check_auth
    
    if ! check_app_exists; then
        create_app
    else
        log_info "App '$APP_NAME' already exists"
    fi
    
    if ! check_volume_exists; then
        create_volume
    else
        log_info "Volume '$VOLUME_NAME' already exists"
    fi
    
    check_secrets
    deploy
}

main "$@"
