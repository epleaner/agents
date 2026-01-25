# Change: Add macOS menu bar stretch break reminder app

## Why
Prolonged computer use without breaks leads to physical strain, reduced productivity, and health issues. Users need a simple, unobtrusive tool that:
- Reminds them to take regular stretch breaks
- Provides exercise recommendations during breaks
- Respects their workflow (postpone option)
- Conserves battery and system resources
- Pauses when the user is away from the computer

This addresses the gap between complex wellness apps (bloated, subscription-based) and simple timers (no exercise guidance, no smart pause).

## What Changes
- Create new **macOS menu bar application** using Tauri framework
- Implement **configurable break schedule** supporting multiple break types (e.g., short 10min every 40min, long 30min every 2hrs)
- Add **exercise category system** (upper-body, lower-body, core, cardio, eyes) with category-based filtering per break type
- Add **notification system** with take/postpone actions
- Build **break timer UI** with exercise recommendations
- Implement **screen inactivity detection** to pause countdown
- Store **configuration and exercises in JSON files** for easy customization
- Follow **KISS principle**: minimal UI, essential features only, no bloat

## Impact
- **Affected specs:** New spec `stretch-break-app` with requirements for timing, notifications, exercises, and inactivity detection
- **Affected code:**
  - New directory: `stretch-break-app/` (Tauri project root)
  - Frontend: `stretch-break-app/src/` (HTML/CSS/JS)
  - Backend: `stretch-break-app/src-tauri/` (Rust)
  - Config: `stretch-break-app/config.json` (user settings)
  - Exercises: `stretch-break-app/exercises.json` (exercise database)
- **Related beads:** agents-d4w
- **Breaking changes:** None - this is a new standalone application
- **Migration path:** N/A - greenfield project

## Clarified Assumptions
1. **Technology:** Tauri (Rust + web frontend) for native performance and battery efficiency
2. **Break Types:** Multiple break types in a cycle (e.g., short 40min→10min, long 120min→30min)
3. **Exercise Categories:** Push/pull style categories (upper-body, lower-body, core, cardio, eyes)
4. **Exercise Management:** JSON config file with 10+ default exercises, user can edit manually
5. **Postpone Duration:** User-configurable with 5-minute default
6. **Inactivity Threshold:** 10 minutes of no screen input pauses the timer
7. **Settings Storage:** JSON config file for portability and version control
8. **Scope:** macOS only for MVP (cross-platform support deferred to post-MVP)
