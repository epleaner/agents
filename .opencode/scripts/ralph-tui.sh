#!/usr/bin/env bash
# ralph-tui.sh - Terminal User Interface for Ralph orchestrator
# Provides a split-pane TUI for monitoring agent iterations
#
# Usage: ./ralph-tui.sh "prompt text" [options]
#        ./ralph-tui.sh --prompt <file> [options]

set -euo pipefail

# =============================================================================
# CONSTANTS & CONFIGURATION
# =============================================================================

# Script-specific constants
readonly TUI_VERSION="1.0.0"
readonly TUI_SCRIPT_NAME="ralph-tui"
readonly TUI_SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly TUI_PROJECT_ROOT="$(cd "$TUI_SCRIPT_DIR/../.." && pwd)"

# Import base orchestrator functions (provides VERSION, config parsing, etc.)
source "$TUI_SCRIPT_DIR/ralph-orchestrator.sh" 2>/dev/null || {
    echo "Error: Could not source ralph-orchestrator.sh" >&2
    exit 1
}

# TUI Colors
readonly TUI_BORDER='\033[0;36m'    # Cyan for borders
readonly TUI_HEADER='\033[1;37m'    # Bold white for headers
readonly TUI_SELECTED='\033[7m'     # Reverse video for selection
readonly TUI_SUCCESS='\033[0;32m'   # Green for success
readonly TUI_ERROR='\033[0;31m'     # Red for errors
readonly TUI_WARNING='\033[0;33m'   # Yellow for warnings
readonly TUI_DIM='\033[2m'          # Dim for less important text
readonly TUI_BOLD='\033[1m'         # Bold
readonly TUI_RESET='\033[0m'        # Reset

# Spinner frames
readonly SPINNER_FRAMES=('⠋' '⠙' '⠹' '⠸' '⠼' '⠴' '⠦' '⠧' '⠇' '⠏')

# =============================================================================
# TUI STATE
# =============================================================================

# Terminal dimensions
TERM_ROWS=0
TERM_COLS=0
LEFT_PANEL_WIDTH=0
RIGHT_PANEL_WIDTH=0
CONTENT_HEIGHT=0

# Scroll state
SELECTED_ITERATION=0
OUTPUT_SCROLL_OFFSET=0
OUTPUT_TOTAL_LINES=0

# Iteration data
declare -a ITERATION_STATUS=()      # "running", "completed", "failed"
declare -a ITERATION_DURATION=()    # Duration in seconds
declare -a ITERATION_TOKENS=()      # Token count (estimated)
declare -a ITERATION_TIMESTAMP=()   # Start timestamp
declare -a ITERATION_OUTPUT_FILE=() # Path to output file

# Agent process
AGENT_PID=0
CURRENT_ITERATION=0
PAUSED=false

# TUI mode flag
TUI_ACTIVE=false

# =============================================================================
# TERMINAL CONTROL
# =============================================================================

setup_terminal() {
    # Save terminal state and switch to alternate screen buffer
    tput smcup 2>/dev/null || true
    # Hide cursor
    tput civis 2>/dev/null || true
    # Set raw mode for single-char input
    stty -echo -icanon min 0 time 0 2>/dev/null || true
    TUI_ACTIVE=true
    
    # Get terminal dimensions
    update_dimensions
}

restore_terminal() {
    if [[ "$TUI_ACTIVE" == "true" ]]; then
        # Restore terminal settings
        stty echo icanon 2>/dev/null || true
        # Show cursor
        tput cnorm 2>/dev/null || true
        # Return to main screen buffer
        tput rmcup 2>/dev/null || true
        TUI_ACTIVE=false
    fi
}

update_dimensions() {
    TERM_ROWS=$(tput lines)
    TERM_COLS=$(tput cols)
    
    # Left panel is 1/4 width, right panel is 3/4
    LEFT_PANEL_WIDTH=$((TERM_COLS / 4))
    RIGHT_PANEL_WIDTH=$((TERM_COLS - LEFT_PANEL_WIDTH - 1))  # -1 for separator
    
    # Content height (minus top border, bottom status bar, borders)
    CONTENT_HEIGHT=$((TERM_ROWS - 4))
}

move_cursor() {
    local row="$1"
    local col="$2"
    printf '\033[%d;%dH' "$row" "$col"
}

clear_line() {
    printf '\033[K'
}

# =============================================================================
# DRAWING FUNCTIONS
# =============================================================================

draw_horizontal_line() {
    local row="$1"
    local start_col="$2"
    local width="$3"
    local char="${4:-─}"
    
    move_cursor "$row" "$start_col"
    printf "${TUI_BORDER}"
    for ((i=0; i<width; i++)); do
        printf '%s' "$char"
    done
    printf "${TUI_RESET}"
}

draw_vertical_line() {
    local col="$1"
    local start_row="$2"
    local height="$3"
    local char="${4:-│}"
    
    printf "${TUI_BORDER}"
    for ((i=0; i<height; i++)); do
        move_cursor "$((start_row + i))" "$col"
        printf '%s' "$char"
    done
    printf "${TUI_RESET}"
}

draw_box() {
    local top="$1"
    local left="$2"
    local height="$3"
    local width="$4"
    
    printf "${TUI_BORDER}"
    
    # Top border
    move_cursor "$top" "$left"
    printf '┌'
    for ((i=1; i<width-1; i++)); do printf '─'; done
    printf '┐'
    
    # Side borders
    for ((i=1; i<height-1; i++)); do
        move_cursor "$((top + i))" "$left"
        printf '│'
        move_cursor "$((top + i))" "$((left + width - 1))"
        printf '│'
    done
    
    # Bottom border
    move_cursor "$((top + height - 1))" "$left"
    printf '└'
    for ((i=1; i<width-1; i++)); do printf '─'; done
    printf '┘'
    
    printf "${TUI_RESET}"
}

draw_text() {
    local row="$1"
    local col="$2"
    local max_width="$3"
    local text="$4"
    local style="${5:-}"
    
    move_cursor "$row" "$col"
    printf "${style}"
    printf "%-${max_width}.${max_width}s" "$text"
    printf "${TUI_RESET}"
}

# =============================================================================
# PANEL DRAWING
# =============================================================================

draw_current_iteration_panel() {
    local panel_top=2
    local panel_height=5
    
    # Panel header
    draw_text "$panel_top" 2 "$((LEFT_PANEL_WIDTH - 2))" "CURRENT ITERATION" "${TUI_HEADER}${TUI_BOLD}"
    
    # Separator
    move_cursor "$((panel_top + 1))" 1
    printf "${TUI_BORDER}├"
    for ((i=1; i<LEFT_PANEL_WIDTH-1; i++)); do printf '─'; done
    printf "┤${TUI_RESET}"
    
    local content_row=$((panel_top + 2))
    
    if [[ $CURRENT_ITERATION -gt 0 ]]; then
        # Spinner for running iteration
        local spinner_idx=$(($(date +%s) % ${#SPINNER_FRAMES[@]}))
        local spinner="${SPINNER_FRAMES[$spinner_idx]}"
        
        local status="${ITERATION_STATUS[$CURRENT_ITERATION]:-running}"
        local duration="${ITERATION_DURATION[$CURRENT_ITERATION]:-0}"
        local tokens="${ITERATION_TOKENS[$CURRENT_ITERATION]:-0}"
        
        local status_icon="$spinner"
        local status_color="${TUI_WARNING}"
        if [[ "$status" == "completed" ]]; then
            status_icon="✓"
            status_color="${TUI_SUCCESS}"
        elif [[ "$status" == "failed" ]]; then
            status_icon="✗"
            status_color="${TUI_ERROR}"
        fi
        
        # Format duration
        local dur_str
        if [[ $duration -ge 60 ]]; then
            dur_str="$((duration / 60))m $((duration % 60))s"
        else
            dur_str="${duration}s"
        fi
        
        # Format tokens
        local tok_str
        if [[ $tokens -ge 1000 ]]; then
            tok_str="$(echo "scale=1; $tokens / 1000" | bc 2>/dev/null || echo "$((tokens / 1000))")k tok"
        else
            tok_str="${tokens} tok"
        fi
        
        # Capitalize status (compatible with older bash)
        local status_cap
        status_cap="$(echo "${status:0:1}" | tr '[:lower:]' '[:upper:]')${status:1}"
        draw_text "$content_row" 2 "$((LEFT_PANEL_WIDTH - 3))" "${status_icon} #${CURRENT_ITERATION} ${status_cap}..." ""
        draw_text "$((content_row + 1))" 3 "$((LEFT_PANEL_WIDTH - 4))" "${dur_str} | ${tok_str}" "${TUI_DIM}"
    else
        draw_text "$content_row" 2 "$((LEFT_PANEL_WIDTH - 3))" "Waiting to start..." "${TUI_DIM}"
    fi
}

draw_iteration_history_panel() {
    local panel_top=7
    local panel_height=$((CONTENT_HEIGHT - 5))
    
    # Panel header
    draw_text "$panel_top" 2 "$((LEFT_PANEL_WIDTH - 2))" "ITERATION HISTORY" "${TUI_HEADER}${TUI_BOLD}"
    
    # Separator
    move_cursor "$((panel_top + 1))" 1
    printf "${TUI_BORDER}├"
    for ((i=1; i<LEFT_PANEL_WIDTH-1; i++)); do printf '─'; done
    printf "┤${TUI_RESET}"
    
    local content_start=$((panel_top + 2))
    local max_visible=$((panel_height - 3))
    
    # Calculate scroll offset for history
    local total_completed=$((CURRENT_ITERATION - 1))
    local scroll_start=1
    
    if [[ $total_completed -gt $max_visible ]]; then
        scroll_start=$((total_completed - max_visible + 1))
    fi
    
    local row=$content_start
    for ((i=total_completed; i>=scroll_start && row<content_start+max_visible; i--)); do
        local status="${ITERATION_STATUS[$i]:-completed}"
        local duration="${ITERATION_DURATION[$i]:-0}"
        local tokens="${ITERATION_TOKENS[$i]:-0}"
        
        local status_icon="✓"
        local status_color="${TUI_SUCCESS}"
        if [[ "$status" == "failed" ]]; then
            status_icon="✗"
            status_color="${TUI_ERROR}"
        fi
        
        # Format duration (compact)
        local dur_str="${duration}s"
        
        # Format tokens (compact)
        local tok_str
        if [[ $tokens -ge 1000 ]]; then
            tok_str="$(echo "scale=1; $tokens / 1000" | bc 2>/dev/null || echo "$((tokens / 1000))")k"
        else
            tok_str="${tokens}t"
        fi
        
        # Selection indicator
        local prefix="  "
        local style=""
        if [[ $i -eq $SELECTED_ITERATION ]]; then
            prefix="▸ "
            style="${TUI_SELECTED}"
        fi
        
        local line="${prefix}#${i} ${status_color}${status_icon}${TUI_RESET} ${dur_str} ${tok_str}"
        
        move_cursor "$row" 2
        if [[ -n "$style" ]]; then
            printf "${style}"
        fi
        printf "%-$((LEFT_PANEL_WIDTH - 3))s" "#${i} ${status_icon} ${dur_str} ${tok_str}"
        printf "${TUI_RESET}"
        
        row=$((row + 1))
    done
    
    # Clear remaining lines
    while [[ $row -lt $((content_start + max_visible)) ]]; do
        move_cursor "$row" 2
        printf "%-$((LEFT_PANEL_WIDTH - 3))s" ""
        row=$((row + 1))
    done
}

draw_output_panel() {
    local panel_left=$((LEFT_PANEL_WIDTH + 1))
    local panel_top=2
    local panel_width=$RIGHT_PANEL_WIDTH
    local panel_height=$((CONTENT_HEIGHT))
    
    # Panel header
    local header="AGENT OUTPUT"
    if [[ $SELECTED_ITERATION -gt 0 ]]; then
        header="AGENT OUTPUT - Iteration #${SELECTED_ITERATION}"
    fi
    draw_text "$panel_top" "$((panel_left + 1))" "$((panel_width - 2))" "$header" "${TUI_HEADER}${TUI_BOLD}"
    
    # Separator
    move_cursor "$((panel_top + 1))" "$panel_left"
    printf "${TUI_BORDER}"
    for ((i=0; i<panel_width; i++)); do printf '─'; done
    printf "${TUI_RESET}"
    
    local content_start=$((panel_top + 2))
    local max_lines=$((panel_height - 3))
    
    # Get output file for selected iteration
    local output_file=""
    if [[ $SELECTED_ITERATION -gt 0 && $SELECTED_ITERATION -le ${#ITERATION_OUTPUT_FILE[@]} ]]; then
        output_file="${ITERATION_OUTPUT_FILE[$SELECTED_ITERATION]:-}"
    elif [[ $CURRENT_ITERATION -gt 0 ]]; then
        output_file="${ITERATION_OUTPUT_FILE[$CURRENT_ITERATION]:-}"
        SELECTED_ITERATION=$CURRENT_ITERATION
    fi
    
    if [[ -n "$output_file" && -f "$output_file" ]]; then
        # Count total lines
        OUTPUT_TOTAL_LINES=$(wc -l < "$output_file" 2>/dev/null || echo "0")
        
        # Auto-scroll to bottom if viewing current running iteration
        if [[ $SELECTED_ITERATION -eq $CURRENT_ITERATION && "${ITERATION_STATUS[$CURRENT_ITERATION]:-}" == "running" ]]; then
            if [[ $OUTPUT_TOTAL_LINES -gt $max_lines ]]; then
                OUTPUT_SCROLL_OFFSET=$((OUTPUT_TOTAL_LINES - max_lines))
            fi
        fi
        
        # Read and display output
        local row=$content_start
        local line_num=0
        
        while IFS= read -r line || [[ -n "$line" ]]; do
            line_num=$((line_num + 1))
            
            if [[ $line_num -le $OUTPUT_SCROLL_OFFSET ]]; then
                continue
            fi
            
            if [[ $((line_num - OUTPUT_SCROLL_OFFSET)) -gt $max_lines ]]; then
                break
            fi
            
            move_cursor "$row" "$((panel_left + 1))"
            # Truncate line to fit panel width
            printf "%-$((panel_width - 2)).${panel_width}s" "${line:0:$((panel_width - 2))}"
            row=$((row + 1))
        done < "$output_file"
        
        # Clear remaining lines
        while [[ $row -lt $((content_start + max_lines)) ]]; do
            move_cursor "$row" "$((panel_left + 1))"
            printf "%-$((panel_width - 2))s" ""
            row=$((row + 1))
        done
        
        # Scroll indicator
        if [[ $OUTPUT_TOTAL_LINES -gt $max_lines ]]; then
            local scroll_pct
            if [[ $OUTPUT_TOTAL_LINES -gt 0 ]]; then
                scroll_pct=$(( (OUTPUT_SCROLL_OFFSET + max_lines) * 100 / OUTPUT_TOTAL_LINES ))
            else
                scroll_pct=100
            fi
            move_cursor "$content_start" "$((panel_left + panel_width - 6))"
            printf "${TUI_DIM}[%3d%%]${TUI_RESET}" "$scroll_pct"
        fi
    else
        move_cursor "$content_start" "$((panel_left + 1))"
        printf "${TUI_DIM}No output yet...${TUI_RESET}"
    fi
}

draw_status_bar() {
    local bar_row=$((TERM_ROWS - 1))
    
    # Status bar background
    move_cursor "$bar_row" 1
    printf "${TUI_BORDER}│${TUI_RESET}"
    printf " ${TUI_DIM}[↑/↓] Navigate  [q] Quit  [p] Pause  [r] Resume  [?] Help${TUI_RESET}"
    
    # Right side: status info
    local status_text=""
    if [[ "$PAUSED" == "true" ]]; then
        status_text="${TUI_WARNING}PAUSED${TUI_RESET}"
    elif [[ "$COMPLETED" == "true" ]]; then
        status_text="${TUI_SUCCESS}COMPLETE${TUI_RESET}"
    else
        status_text="${TUI_SUCCESS}RUNNING${TUI_RESET}"
    fi
    
    local elapsed=$(get_elapsed_seconds)
    local elapsed_str="$((elapsed / 60))m $((elapsed % 60))s"
    
    local right_text="$status_text | ${elapsed_str} | ${CURRENT_ITERATION}/${MAX_ITERATIONS}"
    local right_col=$((TERM_COLS - ${#right_text} - 15))
    move_cursor "$bar_row" "$right_col"
    printf "%s" "$status_text | ${elapsed_str} | ${CURRENT_ITERATION}/${MAX_ITERATIONS}"
}

draw_frame() {
    # Clear screen
    printf '\033[2J'
    
    # Draw outer border
    draw_box 1 1 "$TERM_ROWS" "$TERM_COLS"
    
    # Draw vertical separator between panels
    draw_vertical_line "$LEFT_PANEL_WIDTH" 2 "$((TERM_ROWS - 3))" "│"
    
    # Draw T-junction at top
    move_cursor 1 "$LEFT_PANEL_WIDTH"
    printf "${TUI_BORDER}┬${TUI_RESET}"
    
    # Draw T-junction at bottom
    move_cursor "$((TERM_ROWS - 1))" "$LEFT_PANEL_WIDTH"
    printf "${TUI_BORDER}┴${TUI_RESET}"
    
    # Draw bottom separator above status bar
    move_cursor "$((TERM_ROWS - 2))" 1
    printf "${TUI_BORDER}├"
    for ((i=1; i<TERM_COLS-1; i++)); do
        if [[ $i -eq $((LEFT_PANEL_WIDTH - 1)) ]]; then
            printf '┴'
        else
            printf '─'
        fi
    done
    printf "┤${TUI_RESET}"
}

draw_help_overlay() {
    local overlay_width=50
    local overlay_height=15
    local overlay_top=$(( (TERM_ROWS - overlay_height) / 2 ))
    local overlay_left=$(( (TERM_COLS - overlay_width) / 2 ))
    
    draw_box "$overlay_top" "$overlay_left" "$overlay_height" "$overlay_width"
    
    local row=$((overlay_top + 1))
    draw_text "$row" "$((overlay_left + 2))" "$((overlay_width - 4))" "KEYBOARD SHORTCUTS" "${TUI_HEADER}${TUI_BOLD}"
    
    row=$((row + 2))
    draw_text "$row" "$((overlay_left + 2))" "$((overlay_width - 4))" "↑/k, ↓/j    Navigate iterations" ""
    row=$((row + 1))
    draw_text "$row" "$((overlay_left + 2))" "$((overlay_width - 4))" "Home/g      Jump to first iteration" ""
    row=$((row + 1))
    draw_text "$row" "$((overlay_left + 2))" "$((overlay_width - 4))" "End/G       Jump to latest iteration" ""
    row=$((row + 1))
    draw_text "$row" "$((overlay_left + 2))" "$((overlay_width - 4))" "PgUp/PgDn   Scroll output" ""
    row=$((row + 1))
    draw_text "$row" "$((overlay_left + 2))" "$((overlay_width - 4))" "p           Pause execution" ""
    row=$((row + 1))
    draw_text "$row" "$((overlay_left + 2))" "$((overlay_width - 4))" "r           Resume execution" ""
    row=$((row + 1))
    draw_text "$row" "$((overlay_left + 2))" "$((overlay_width - 4))" "q           Quit" ""
    row=$((row + 1))
    draw_text "$row" "$((overlay_left + 2))" "$((overlay_width - 4))" "?           Toggle this help" ""
    
    row=$((overlay_top + overlay_height - 2))
    draw_text "$row" "$((overlay_left + 2))" "$((overlay_width - 4))" "Press any key to close..." "${TUI_DIM}"
}

redraw_screen() {
    draw_frame
    draw_current_iteration_panel
    draw_iteration_history_panel
    draw_output_panel
    draw_status_bar
}

# =============================================================================
# INPUT HANDLING
# =============================================================================

read_key() {
    local key=""
    local char
    
    # Read first character (use integer timeout for compatibility)
    if IFS= read -rsn1 -t 1 char 2>/dev/null; then
        key="$char"
        
        # Check for escape sequence
        if [[ "$char" == $'\033' ]]; then
            # Quick successive reads for escape sequences
            if IFS= read -rsn1 -t 1 char 2>/dev/null; then
                key+="$char"
                if IFS= read -rsn1 -t 1 char 2>/dev/null; then
                    key+="$char"
                fi
            fi
        fi
    fi
    
    echo "$key"
}

handle_input() {
    local key
    key=$(read_key)
    
    case "$key" in
        q|Q)
            SHUTDOWN_REQUESTED=true
            COMPLETION_REASON="user_quit"
            return 1
            ;;
        p|P)
            if [[ "$PAUSED" != "true" ]]; then
                PAUSED=true
                if [[ $AGENT_PID -gt 0 ]]; then
                    kill -STOP "$AGENT_PID" 2>/dev/null || true
                fi
            fi
            ;;
        r|R)
            if [[ "$PAUSED" == "true" ]]; then
                PAUSED=false
                if [[ $AGENT_PID -gt 0 ]]; then
                    kill -CONT "$AGENT_PID" 2>/dev/null || true
                fi
            fi
            ;;
        '?')
            draw_help_overlay
            read -rsn1
            redraw_screen
            ;;
        k|$'\033[A')  # k or Up arrow
            if [[ $SELECTED_ITERATION -lt $((CURRENT_ITERATION - 1)) ]]; then
                SELECTED_ITERATION=$((SELECTED_ITERATION + 1))
                OUTPUT_SCROLL_OFFSET=0
            fi
            ;;
        j|$'\033[B')  # j or Down arrow
            if [[ $SELECTED_ITERATION -gt 1 ]]; then
                SELECTED_ITERATION=$((SELECTED_ITERATION - 1))
                OUTPUT_SCROLL_OFFSET=0
            fi
            ;;
        g|$'\033[H')  # g or Home
            SELECTED_ITERATION=1
            OUTPUT_SCROLL_OFFSET=0
            ;;
        G|$'\033[F')  # G or End
            SELECTED_ITERATION=$CURRENT_ITERATION
            OUTPUT_SCROLL_OFFSET=0
            ;;
        $'\033[5~')  # Page Up - scroll output up
            if [[ $OUTPUT_SCROLL_OFFSET -gt 0 ]]; then
                OUTPUT_SCROLL_OFFSET=$((OUTPUT_SCROLL_OFFSET - 10))
                [[ $OUTPUT_SCROLL_OFFSET -lt 0 ]] && OUTPUT_SCROLL_OFFSET=0
            fi
            ;;
        $'\033[6~')  # Page Down - scroll output down
            local max_offset=$((OUTPUT_TOTAL_LINES - CONTENT_HEIGHT + 5))
            if [[ $OUTPUT_SCROLL_OFFSET -lt $max_offset ]]; then
                OUTPUT_SCROLL_OFFSET=$((OUTPUT_SCROLL_OFFSET + 10))
                [[ $OUTPUT_SCROLL_OFFSET -gt $max_offset ]] && OUTPUT_SCROLL_OFFSET=$max_offset
            fi
            ;;
    esac
    
    return 0
}

# =============================================================================
# AGENT EXECUTION (TUI-AWARE)
# =============================================================================

invoke_agent_tui() {
    local prompt_file="$1"
    local iteration="$2"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        # Simulate agent execution
        echo "[DRY RUN] Simulated agent output for iteration $iteration" > "${ITERATION_OUTPUT_FILE[$iteration]}"
        sleep 2
        ITERATION_STATUS[$iteration]="completed"
        ITERATION_DURATION[$iteration]=2
        ITERATION_TOKENS[$iteration]=$((RANDOM % 1000 + 500))
        return 0
    fi
    
    local prompt_content
    prompt_content=$(cat "$prompt_file")
    
    # Start agent in background, redirect output to file
    opencode run --agent "$AGENT_NAME" "$prompt_content" > "${ITERATION_OUTPUT_FILE[$iteration]}" 2>&1 &
    AGENT_PID=$!
    
    local start_time=$(date +%s)
    
    # Monitor agent process
    while kill -0 "$AGENT_PID" 2>/dev/null; do
        local now=$(date +%s)
        ITERATION_DURATION[$iteration]=$((now - start_time))
        
        # Estimate tokens from output size
        if [[ -f "${ITERATION_OUTPUT_FILE[$iteration]}" ]]; then
            local size=$(wc -c < "${ITERATION_OUTPUT_FILE[$iteration]}" 2>/dev/null || echo "0")
            ITERATION_TOKENS[$iteration]=$((size / 4))  # Rough estimate: 4 chars per token
        fi
        
        # Check for pause
        while [[ "$PAUSED" == "true" ]]; do
            sleep 0.5
        done
        
        sleep 0.5
    done
    
    # Get exit code
    wait "$AGENT_PID" 2>/dev/null
    local exit_code=$?
    AGENT_PID=0
    
    local end_time=$(date +%s)
    ITERATION_DURATION[$iteration]=$((end_time - start_time))
    
    if [[ $exit_code -eq 0 ]]; then
        ITERATION_STATUS[$iteration]="completed"
    else
        ITERATION_STATUS[$iteration]="failed"
    fi
    
    return $exit_code
}

# =============================================================================
# MAIN TUI LOOP
# =============================================================================

run_tui_loop() {
    local original_prompt
    original_prompt=$(load_prompt)
    
    # Setup terminal for TUI
    setup_terminal
    
    # Trap for cleanup
    trap 'restore_terminal; exit' EXIT
    trap 'SHUTDOWN_REQUESTED=true' INT TERM
    
    # Initial draw
    redraw_screen
    
    while [[ $ITERATION -lt $MAX_ITERATIONS && "$SHUTDOWN_REQUESTED" != "true" && "$COMPLETED" != "true" ]]; do
        ITERATION=$((ITERATION + 1))
        CURRENT_ITERATION=$ITERATION
        
        # Initialize iteration data
        ITERATION_STATUS[$ITERATION]="running"
        ITERATION_DURATION[$ITERATION]=0
        ITERATION_TOKENS[$ITERATION]=0
        ITERATION_TIMESTAMP[$ITERATION]=$(date +%s)
        ITERATION_OUTPUT_FILE[$ITERATION]="$STATE_DIR/${ITERATION}-output.txt"
        
        # Select current iteration by default
        if [[ $SELECTED_ITERATION -eq 0 || $SELECTED_ITERATION -eq $((ITERATION - 1)) ]]; then
            SELECTED_ITERATION=$ITERATION
        fi
        
        # Check timeout
        local elapsed=$(get_elapsed_seconds)
        if [[ $elapsed -ge $TIMEOUT_SECONDS ]]; then
            COMPLETION_REASON="timeout"
            break
        fi
        
        # Create enhanced prompt
        local enhanced_prompt
        enhanced_prompt=$(create_enhanced_prompt "$ITERATION" "$original_prompt")
        
        local prompt_file="/tmp/ralph-tui-prompt-$SESSION_ID-$ITERATION.md"
        echo "$enhanced_prompt" > "$prompt_file"
        
        # Run agent in background with TUI updates
        invoke_agent_tui "$prompt_file" "$ITERATION" &
        local agent_job=$!
        
        # UI update loop while agent runs
        while kill -0 "$agent_job" 2>/dev/null; do
            # Handle input
            if ! handle_input; then
                kill "$agent_job" 2>/dev/null || true
                break
            fi
            
            # Update dimensions if terminal resized
            update_dimensions
            
            # Redraw
            redraw_screen
            
            sleep 0.2
        done
        
        wait "$agent_job" 2>/dev/null || true
        
        # Check for shutdown
        if [[ "$SHUTDOWN_REQUESTED" == "true" ]]; then
            COMPLETION_REASON="shutdown"
            break
        fi
        
        # Save iteration state
        local output=""
        [[ -f "${ITERATION_OUTPUT_FILE[$ITERATION]}" ]] && output=$(cat "${ITERATION_OUTPUT_FILE[$ITERATION]}")
        save_iteration_state "$ITERATION" "$output" "${ITERATION_DURATION[$ITERATION]}"
        
        # Check for completion markers
        if detect_completion "$output"; then
            COMPLETED=true
            break
        fi
        
        # Check for infinite loop
        if detect_infinite_loop "$output"; then
            COMPLETION_REASON="infinite_loop"
            break
        fi
        
        # Create checkpoint if needed
        if [[ $((ITERATION % CHECKPOINT_INTERVAL)) -eq 0 ]]; then
            create_checkpoint "$ITERATION" "periodic checkpoint"
        fi
        
        sleep "$SLEEP_BETWEEN_ITERATIONS"
    done
    
    # Check max iterations
    if [[ $ITERATION -ge $MAX_ITERATIONS && -z "$COMPLETION_REASON" ]]; then
        COMPLETION_REASON="max_iterations"
    fi
    
    # Final redraw
    redraw_screen
    
    # Wait for user to acknowledge completion
    move_cursor "$((TERM_ROWS / 2))" "$((TERM_COLS / 2 - 15))"
    printf "${TUI_BOLD}Session complete. Press any key to exit...${TUI_RESET}"
    read -rsn1
    
    # Restore terminal
    restore_terminal
    
    # Final checkpoint
    create_checkpoint "$ITERATION" "final"
}

# =============================================================================
# CLI HELP (TUI-SPECIFIC)
# =============================================================================

show_tui_help() {
    echo -e "${TUI_BOLD}Ralph TUI${TUI_RESET} v${TUI_VERSION}"
    echo "Terminal User Interface for Ralph orchestrator."
    echo ""
    echo -e "${TUI_BOLD}USAGE:${TUI_RESET}"
    echo "  $TUI_SCRIPT_NAME \"inline prompt text\" [options]"
    echo "  $TUI_SCRIPT_NAME --prompt <file> [options]"
    echo "  $TUI_SCRIPT_NAME --resume <session-id>"
    echo "  $TUI_SCRIPT_NAME --help"
    echo ""
    echo -e "${TUI_BOLD}PROMPT (one required):${TUI_RESET}"
    echo "  \"text\"                  Inline prompt text (first positional argument)"
    echo "  -p, --prompt <file>     Path to prompt file containing task description"
    echo ""
    echo -e "${TUI_BOLD}OPTIONS:${TUI_RESET}"
    echo "  --max-iterations <N>    Maximum iterations (default: $DEFAULT_MAX_ITERATIONS)"
    echo "  --timeout <seconds>     Maximum runtime in seconds (default: $DEFAULT_TIMEOUT_SECONDS)"
    echo "  --config <file>         Path to ralph.yml configuration file"
    echo "  --agent <name>          Agent to use (default: orchestrator)"
    echo "  --checkpoint <N>        Git checkpoint interval (default: $DEFAULT_CHECKPOINT_INTERVAL)"
    echo "  --verbose               Enable verbose output"
    echo "  --dry-run               Test mode without executing agents"
    echo ""
    echo -e "${TUI_BOLD}RECOVERY:${TUI_RESET}"
    echo "  --resume <session-id>   Resume from a previous session"
    echo "  --rollback-to <N>       Rollback to specific iteration"
    echo ""
    echo -e "${TUI_BOLD}TUI KEYBOARD CONTROLS:${TUI_RESET}"
    echo "  ↑/k, ↓/j    Navigate between iterations"
    echo "  Home/g      Jump to first iteration"
    echo "  End/G       Jump to latest iteration"
    echo "  PgUp/PgDn   Scroll agent output"
    echo "  p           Pause execution"
    echo "  r           Resume execution"
    echo "  q           Quit"
    echo "  ?           Show help overlay"
    echo ""
    echo -e "${TUI_BOLD}EXAMPLES:${TUI_RESET}"
    echo "  # Inline prompt"
    echo "  $TUI_SCRIPT_NAME \"Implement user authentication\""
    echo ""
    echo "  # From file"
    echo "  $TUI_SCRIPT_NAME --prompt task.md"
    echo ""
    echo "  # With options"
    echo "  $TUI_SCRIPT_NAME \"Fix the bug\" --max-iterations 20 --dry-run"
    echo ""
}

# =============================================================================
# MAIN ENTRY POINT
# =============================================================================

main() {
    # Check for help flag first
    for arg in "$@"; do
        if [[ "$arg" == "--help" || "$arg" == "-h" ]]; then
            show_tui_help
            exit 0
        fi
    done
    
    # Parse command line arguments
    parse_args "$@"
    
    # Handle rollback
    if [[ -n "$ROLLBACK_TO" ]]; then
        rollback_to_iteration "$ROLLBACK_TO"
        exit 0
    fi
    
    # Handle resume
    if [[ -n "$RESUME_SESSION" ]]; then
        load_session_state "$RESUME_SESSION"
        START_TIME=$(date +%s)
    else
        SESSION_ID=$(generate_session_id)
        START_TIME=$(date +%s)
    fi
    
    # Load and validate configuration
    load_config
    validate_config
    
    # Initialize state directory
    init_state_dir
    
    # Initialize session ledger
    init_session_ledger
    add_session_entry
    
    # Run TUI loop
    run_tui_loop
    
    # Update session ledger
    update_session_entry
    
    # Generate metrics and report
    generate_metrics
    generate_report
    
    # Exit with appropriate code
    if [[ "$COMPLETED" == "true" ]]; then
        exit 0
    else
        exit 1
    fi
}

# Run main if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
