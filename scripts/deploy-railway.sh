#!/usr/bin/env bash
set -euo pipefail

# OpenCode Railway Deployment Script
# Usage: ./deploy-railway.sh [command]
#
# Commands:
#   deploy   - Deploy to Railway (default)
#   status   - Show deployment status
#   logs     - Tail deployment logs
#   shell    - Open interactive shell
#   domain   - Show deployment URL
#   vars     - List environment variables
#   stop     - Scale to zero (pause billing)
#   start    - Scale back up
#   help     - Show this help message

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
SERVICE_NAME="${RAILWAY_SERVICE:-opencode-web}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Logging helpers
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[OK]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_header() { echo -e "\n${BOLD}${CYAN}=== $1 ===${NC}\n"; }

# Show help message
show_help() {
    cat << 'EOF'
OpenCode Railway Deployment Script

Usage: deploy-railway.sh [COMMAND]

Commands:
  deploy      Deploy to Railway (default if no command given)
  status      Show deployment status and service info
  logs        Tail deployment logs (Ctrl+C to exit)
  build-logs  Show build logs from latest deployment
  shell       Open interactive shell in the running service
  run CMD     Run a single command in the service
  domain      Show deployment URL
  vars        List environment variables
  set-var     Set environment variable (KEY=VALUE)
  stop        Scale to zero replicas (pause billing)
  start       Scale back to one replica
  restart     Restart the service
  link        Link current directory to Railway project
  help        Show this help message

Environment Variables:
  RAILWAY_SERVICE    Service name (default: opencode-web)

Examples:
  deploy-railway.sh                     # Deploy latest code
  deploy-railway.sh status              # Check deployment status
  deploy-railway.sh logs                # Tail logs
  deploy-railway.sh shell               # Open shell
  deploy-railway.sh run "bd status"     # Run single command
  deploy-railway.sh domain              # Get URL
  deploy-railway.sh set-var FOO=bar     # Set env var
  deploy-railway.sh stop                # Pause to save costs

Cost Optimization:
  - Use 'stop' when not using the deployment to pause billing
  - Railway Starter plan: $5/month, Pro plan: $10/month
  - See design.md for full cost breakdown

EOF
}

# Check if Railway CLI is installed
check_railway_cli() {
    if ! command -v railway &> /dev/null; then
        log_error "Railway CLI not found."
        echo ""
        echo "Install with:"
        echo "  npm install -g @railway/cli"
        echo "  # or"
        echo "  brew install railway"
        echo ""
        exit 1
    fi
}

# Check if user is authenticated
check_auth() {
    if ! railway whoami &> /dev/null 2>&1; then
        log_error "Not authenticated with Railway."
        echo ""
        echo "Run: railway login"
        exit 1
    fi
    local user
    user=$(railway whoami 2>/dev/null || echo "unknown")
    log_info "Authenticated as: $user"
}

# Check if project is linked
check_linked() {
    if ! railway status &> /dev/null 2>&1; then
        log_error "No Railway project linked."
        echo ""
        echo "Options:"
        echo "  1. Link existing project: railway link"
        echo "  2. Create new project:    railway init"
        echo ""
        exit 1
    fi
}

# Get project info
get_project_info() {
    railway status 2>/dev/null | head -20
}

# Deploy command
cmd_deploy() {
    log_header "Deploying to Railway"
    
    check_railway_cli
    check_auth
    check_linked
    
    log_info "Starting deployment..."
    cd "$PROJECT_ROOT"
    
    # Deploy and stream logs
    if railway up --detach; then
        log_success "Deployment initiated!"
        echo ""
        log_info "View deployment progress:"
        echo "  deploy-railway.sh logs"
        echo ""
        log_info "Check status:"
        echo "  deploy-railway.sh status"
        echo ""
        
        # Show domain
        local domain
        domain=$(railway domain 2>/dev/null || echo "")
        if [ -n "$domain" ]; then
            log_success "URL: https://$domain"
        else
            log_info "Generate domain: deploy-railway.sh domain"
        fi
    else
        log_error "Deployment failed"
        echo ""
        echo "Check build logs:"
        echo "  deploy-railway.sh build-logs"
        exit 1
    fi
}

# Status command
cmd_status() {
    log_header "Railway Deployment Status"
    
    check_railway_cli
    check_auth
    check_linked
    
    # Show project/service info
    railway status
    
    echo ""
    
    # Show domain if exists
    local domain
    domain=$(railway domain 2>/dev/null || echo "")
    if [ -n "$domain" ]; then
        log_info "URL: https://$domain"
    fi
}

# Logs command
cmd_logs() {
    log_header "Deployment Logs"
    
    check_railway_cli
    check_auth
    check_linked
    
    log_info "Tailing logs (Ctrl+C to exit)..."
    echo ""
    railway logs
}

# Build logs command
cmd_build_logs() {
    log_header "Build Logs"
    
    check_railway_cli
    check_auth
    check_linked
    
    log_info "Fetching build logs..."
    echo ""
    railway logs --build
}

# Shell command
cmd_shell() {
    log_header "Opening Shell"
    
    check_railway_cli
    check_auth
    check_linked
    
    log_info "Connecting to service..."
    log_info "Type 'exit' to disconnect"
    echo ""
    railway shell
}

# Run command
cmd_run() {
    local cmd="$1"
    
    if [ -z "$cmd" ]; then
        log_error "No command provided"
        echo "Usage: deploy-railway.sh run \"command\""
        exit 1
    fi
    
    check_railway_cli
    check_auth
    check_linked
    
    log_info "Running: $cmd"
    echo ""
    railway run bash -c "$cmd"
}

# Domain command
cmd_domain() {
    check_railway_cli
    check_auth
    check_linked
    
    local domain
    domain=$(railway domain 2>/dev/null || echo "")
    
    if [ -n "$domain" ]; then
        log_success "Deployment URL:"
        echo "  https://$domain"
    else
        log_info "No domain configured. Generating..."
        railway domain --json 2>/dev/null || railway domain
        domain=$(railway domain 2>/dev/null || echo "")
        if [ -n "$domain" ]; then
            log_success "Generated URL: https://$domain"
        fi
    fi
}

# Variables command
cmd_vars() {
    log_header "Environment Variables"
    
    check_railway_cli
    check_auth
    check_linked
    
    railway variables
}

# Set variable command
cmd_set_var() {
    local var="$1"
    
    if [ -z "$var" ] || [[ ! "$var" =~ = ]]; then
        log_error "Invalid variable format"
        echo "Usage: deploy-railway.sh set-var KEY=VALUE"
        exit 1
    fi
    
    check_railway_cli
    check_auth
    check_linked
    
    local key="${var%%=*}"
    log_info "Setting $key..."
    railway variables set "$var"
    log_success "Variable set: $key"
}

# Stop command (scale to zero)
cmd_stop() {
    log_header "Stopping Service"
    
    check_railway_cli
    check_auth
    check_linked
    
    log_warn "Scaling service to zero replicas..."
    log_info "This will pause billing but preserve your data."
    echo ""
    
    # Railway doesn't have a direct "stop" command, but we can scale to 0
    # This requires using the Railway API or dashboard
    # For now, provide instructions
    
    log_info "To stop the service and pause billing:"
    echo ""
    echo "  1. Open Railway dashboard: railway open"
    echo "  2. Go to your service settings"
    echo "  3. Set replicas to 0"
    echo ""
    echo "Or use the Railway API:"
    echo "  railway service scale 0"
    echo ""
    
    # Try the scale command if available
    if railway service --help 2>&1 | grep -q "scale"; then
        read -p "Attempt to scale to 0? (y/N) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            railway service scale 0 || log_warn "Scale command may not be available"
        fi
    fi
}

# Start command (scale back up)
cmd_start() {
    log_header "Starting Service"
    
    check_railway_cli
    check_auth
    check_linked
    
    log_info "Scaling service to 1 replica..."
    
    # Similar to stop, provide instructions
    log_info "To start the service:"
    echo ""
    echo "  1. Open Railway dashboard: railway open"
    echo "  2. Go to your service settings"
    echo "  3. Set replicas to 1"
    echo ""
    echo "Or redeploy:"
    echo "  deploy-railway.sh deploy"
    echo ""
    
    # Try the scale command if available
    if railway service --help 2>&1 | grep -q "scale"; then
        read -p "Attempt to scale to 1? (y/N) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            railway service scale 1 || log_warn "Scale command may not be available"
        fi
    fi
}

# Restart command
cmd_restart() {
    log_header "Restarting Service"
    
    check_railway_cli
    check_auth
    check_linked
    
    log_info "Restarting service..."
    
    # Try restart command
    if railway service --help 2>&1 | grep -q "restart"; then
        railway service restart
        log_success "Service restarted"
    else
        log_info "Restart not directly available. Redeploying instead..."
        cmd_deploy
    fi
}

# Link command
cmd_link() {
    log_header "Linking Project"
    
    check_railway_cli
    check_auth
    
    log_info "Linking to Railway project..."
    railway link
    log_success "Project linked!"
}

# Main entry point
main() {
    local command="${1:-deploy}"
    shift || true
    
    case "$command" in
        deploy)
            cmd_deploy
            ;;
        status)
            cmd_status
            ;;
        logs)
            cmd_logs
            ;;
        build-logs|build)
            cmd_build_logs
            ;;
        shell|sh)
            cmd_shell
            ;;
        run)
            cmd_run "${1:-}"
            ;;
        domain|url)
            cmd_domain
            ;;
        vars|variables|env)
            cmd_vars
            ;;
        set-var|set)
            cmd_set_var "${1:-}"
            ;;
        stop)
            cmd_stop
            ;;
        start)
            cmd_start
            ;;
        restart)
            cmd_restart
            ;;
        link)
            cmd_link
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            log_error "Unknown command: $command"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

main "$@"
