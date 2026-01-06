#!/bin/sh
# yepe - Blueprint scaffolding tool
# POSIX-compliant installation script

set -e

# Configuration
BLUEPRINT_REPO="https://github.com/epleaner/agents.git"
STAGING_DIR=".opencode/.yepe-tmp"
REPORT_FILE=".yepe-report.json"

# Blueprint files to copy
BLUEPRINT_FILES="AGENTS.md .opencode/agent .opencode/command .opencode/skill .opencode/templates .opencode/package.json .opencode/.gitignore openspec/AGENTS.md openspec/project.md learnings bin/review-learnings"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
info() {
    printf "${BLUE}%s${NC}\n" "$1"
}

success() {
    printf "${GREEN}%s${NC}\n" "$1"
}

warning() {
    printf "${YELLOW}%s${NC}\n" "$1"
}

error() {
    printf "${RED}%s${NC}\n" "$1" >&2
}

# Check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Validate prerequisites
validate_prerequisites() {
    info "Validating prerequisites..."

    # Check for git
    if ! command_exists git; then
        error "Git is not installed"
        error "Install git and try again"
        exit 1
    fi

    # Check if we're in a git repository
    if [ ! -d ".git" ]; then
        error "Not a git repository"
        error "Run 'git init' to initialize a git repository first"
        exit 1
    fi

    # Check if working tree is clean
    if [ -n "$(git status --porcelain)" ]; then
        error "Working tree is not clean"
        error "Commit or stash your changes before running yepe:"
        error "  git add ."
        error "  git commit -m \"Your changes\""
        error "  # or"
        error "  git stash"
        exit 1
    fi

    # Check for curl or wget
    if ! command_exists curl && ! command_exists wget; then
        error "Neither curl nor wget is installed"
        error "Install curl or wget and try again"
        exit 1
    fi

    success "✓ Prerequisites validated"
    echo ""
}

# Download blueprint
download_blueprint() {
    info "📥 Downloading blueprint from repository..."

    # Remove staging directory if it exists
    if [ -d "$STAGING_DIR" ]; then
        rm -rf "$STAGING_DIR"
    fi
    mkdir -p "$STAGING_DIR"

    # Clone repository (shallow clone for speed)
    if ! git clone --depth 1 "$BLUEPRINT_REPO" "$STAGING_DIR" >/dev/null 2>&1; then
        error "Failed to download blueprint"
        error "Ensure you have internet connection and can access GitHub"
        rm -rf "$STAGING_DIR"
        exit 1
    fi

    success "✓ Blueprint downloaded"
    echo ""
}

# Process files and detect conflicts
analyze_files() {
    info "🔍 Analyzing files..."

    ADDED_COUNT=0
    CONFLICT_COUNT=0
    
    # Start building JSON report
    echo "{" > "$REPORT_FILE"
    echo "  \"version\": \"unknown\"," >> "$REPORT_FILE"
    echo "  \"timestamp\": \"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\"," >> "$REPORT_FILE"
    echo "  \"changes\": [" >> "$REPORT_FILE"

    FIRST_ENTRY=1

    for blueprint_path in $BLUEPRINT_FILES; do
        source_path="$STAGING_DIR/$blueprint_path"
        
        if [ ! -e "$source_path" ]; then
            continue
        fi

        if [ -d "$source_path" ]; then
            process_directory "$source_path" "$blueprint_path"
        else
            process_file "$source_path" "$blueprint_path"
        fi
    done

    # Close changes array
    echo "" >> "$REPORT_FILE"
    echo "  ]," >> "$REPORT_FILE"
    
    # Add conflicts array
    echo "  \"conflicts\": []," >> "$REPORT_FILE"
    
    # Add summary
    echo "  \"summary\": {" >> "$REPORT_FILE"
    echo "    \"added\": $ADDED_COUNT," >> "$REPORT_FILE"
    echo "    \"conflicts\": $CONFLICT_COUNT," >> "$REPORT_FILE"
    echo "    \"skipped\": 0" >> "$REPORT_FILE"
    echo "  }" >> "$REPORT_FILE"
    echo "}" >> "$REPORT_FILE"

    success "✓ Analysis complete: $ADDED_COUNT to add, $CONFLICT_COUNT conflicts"
    echo ""
}

# Process a directory recursively
process_directory() {
    source_dir="$1"
    blueprint_dir="$2"

    for entry in "$source_dir"/*; do
        [ -e "$entry" ] || continue
        
        entry_name=$(basename "$entry")
        
        # Skip .git and node_modules
        if [ "$entry_name" = ".git" ] || [ "$entry_name" = "node_modules" ]; then
            continue
        fi

        entry_blueprint_path="$blueprint_dir/$entry_name"

        if [ -d "$entry" ]; then
            process_directory "$entry" "$entry_blueprint_path"
        else
            process_file "$entry" "$entry_blueprint_path"
        fi
    done
}

# Process a single file
process_file() {
    source_file="$1"
    target_path="$2"

    # Add comma before entry if not first
    if [ $FIRST_ENTRY -eq 0 ]; then
        echo "," >> "$REPORT_FILE"
    fi
    FIRST_ENTRY=0

    if [ -e "$target_path" ]; then
        # File exists - conflict
        echo "    {\"path\": \"$target_path\", \"status\": \"conflict\", \"reason\": \"File already exists\"}" >> "$REPORT_FILE"
        CONFLICT_COUNT=$((CONFLICT_COUNT + 1))
    else
        # File doesn't exist - safe to add
        echo "    {\"path\": \"$target_path\", \"status\": \"added\"}" >> "$REPORT_FILE"
        ADDED_COUNT=$((ADDED_COUNT + 1))
        
        # Add to copy list
        echo "$source_file|$target_path" >> "$STAGING_DIR/.copy-list"
    fi
}

# Copy files
copy_files() {
    info "📋 Copying files..."

    COPIED=0

    if [ -f "$STAGING_DIR/.copy-list" ]; then
        while IFS='|' read -r source_file target_path; do
            # Create directory if needed
            target_dir=$(dirname "$target_path")
            mkdir -p "$target_dir"

            # Copy file
            cp "$source_file" "$target_path"
            COPIED=$((COPIED + 1))
        done < "$STAGING_DIR/.copy-list"
    fi

    success "✓ Copied $COPIED files"
    echo ""
}

# Cleanup
cleanup() {
    if [ -d "$STAGING_DIR" ]; then
        rm -rf "$STAGING_DIR"
    fi
}

# Print summary
print_summary() {
    # Read summary from report
    ADDED=$(grep '"added":' "$REPORT_FILE" | sed 's/[^0-9]//g')
    CONFLICTS=$(grep '"conflicts":' "$REPORT_FILE" | sed 's/[^0-9]//g')

    echo ""
    info "📊 Summary:"
    echo "   • Added: $ADDED files"
    echo "   • Conflicts: $CONFLICTS files"

    if [ "$CONFLICTS" -gt 0 ]; then
        echo ""
        warning "⚠️  Conflicts detected - review .yepe-report.json for details"
    fi

    echo ""
    info "✨ Next steps:"
    echo "   1. Review changes: git status"
    echo "   2. Review conflicts in .yepe-report.json"
    
    if [ -d "openspec" ]; then
        echo "   3. Initialize OpenSpec: (already exists)"
    else
        echo "   3. Initialize OpenSpec: openspec init"
    fi
    
    if [ -d ".beads" ]; then
        echo "   4. Initialize beads: (already exists)"
    else
        echo "   4. Initialize beads: bd init"
    fi
    
    echo "   5. Commit changes: git add . && git commit -m \"Add yepe blueprint\""
    echo ""
}

# Main execution
main() {
    echo ""
    info "🚀 Initializing yepe blueprint..."
    echo ""

    validate_prerequisites
    download_blueprint
    analyze_files
    copy_files
    cleanup
    print_summary
}

# Run main function
main
