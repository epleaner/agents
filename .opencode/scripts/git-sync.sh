#!/bin/bash
# Git sync helper script for Railway deployment
# Usage: railway run bash /app/.opencode/scripts/git-sync.sh

set -e

WORKSPACE_DIR="${WORKSPACE_DIR:-/app/data/workspace}"

echo "=== Git Sync Helper ==="
cd "$WORKSPACE_DIR"

# Check if we have local changes
if ! git diff --quiet || ! git diff --cached --quiet; then
    echo "Stashing local changes..."
    git stash push -m "Auto-stash before sync $(date)"
fi

# Pull latest changes
echo "Pulling latest changes..."
git pull --rebase

# Show status
echo ""
echo "=== Current Status ==="
git log -1 --oneline
git status --short

echo ""
echo "Sync complete!"
