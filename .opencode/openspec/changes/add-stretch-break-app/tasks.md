# Tasks: Stretch Break App Implementation

## Rationale

This implementation follows a **bottom-up approach**: build core infrastructure first (timer engine, config), then add user-facing features (UI, notifications). This ensures a solid foundation before adding complexity.

**Why Tauri?** Native performance and battery efficiency are critical for an always-running menu bar app. Tauri provides Rust's performance with web's flexibility, resulting in <50MB memory and <1% CPU usage.

**Why JSON config?** Human-readable, version-controllable, and editable by both UI and text editor. Power users can script changes, casual users use the settings panel.

**Key Design Decisions:**
- **State machine for timer**: Prevents invalid transitions and makes behavior predictable
- **Break schedule cycling**: Support multiple break types (short/long) that cycle in order
- **Exercise categories**: Filter exercises by category (upper-body, lower-body, core, cardio, eyes) per break type
- **Inactivity detection via CGEventSource**: macOS native API, minimal overhead
- **Random exercise selection**: Keeps breaks engaging, prevents boredom
- **No network dependencies**: Fully offline, no telemetry, respects privacy

**Implementation Order:**
1. Core timer engine (state machine, countdown logic)
2. Configuration system (load, validate, save JSON)
3. Backend services (notifications, inactivity detection, exercises)
4. Frontend UI (settings panel, break timer display)
5. Integration and testing (wire everything together)

**Assumptions:**
- User has macOS 11+ (Big Sur or later)
- User has Rust and Node.js installed (or will install in setup)
- User wants minimal, unobtrusive app (KISS principle)
- User may customize exercises via JSON editing

**Trade-offs:**
- **Tauri vs Electron**: Chose Tauri for performance, accepting smaller ecosystem
- **JSON vs SQLite**: Chose JSON for simplicity, accepting no query capabilities
- **Native notifications vs custom**: Chose native for OS integration, accepting limited customization
- **Vanilla JS vs React**: Chose vanilla for simplicity, accepting more manual DOM work

---

## Task 1: Core Timer Engine & Configuration

**Purpose**: Build the foundational timer state machine and configuration system that all other features depend on.

**Why first?** The timer engine is the heart of the app. Without it, nothing else works. Configuration must be ready before any component can load settings.

**Deliverables**:
- Timer state machine with 6 states (IDLE, COUNTING_TO_BREAK, PAUSED, BREAK_NOTIFICATION, POSTPONED, BREAK_ACTIVE)
- Break schedule cycling logic (tracks current break index, cycles through break types)
- Configuration loader with validation (supports break_schedule array)
- Unit tests for state transitions and break cycling

**Files created/modified**:
- `stretch-break-app/src-tauri/src/timer.rs` (new, ~300 lines)
- `stretch-break-app/src-tauri/src/config.rs` (new, ~200 lines)
- `stretch-break-app/src-tauri/Cargo.toml` (modified, add dependencies)
- `stretch-break-app/config.json` (new, default config)

**Validation**:
```bash
# Verify timer state machine
cd stretch-break-app/src-tauri
cargo test timer::tests --lib
# Expected: All tests pass (5+ tests)

# Verify config loading
cargo test config::tests --lib
# Expected: All tests pass (3+ tests)

# Verify compilation
cargo check
# Expected: No errors
```

**Success criteria**:
- [ ] Timer transitions through all 6 states correctly
- [ ] Invalid state transitions are rejected
- [ ] Break schedule cycles correctly (short → long → short → ...)
- [ ] Timer uses correct work/break duration for each break type
- [ ] Config loads from JSON with defaults on first run (40min→10min short, 120min→30min long)
- [ ] Config validation rejects invalid values (e.g., work_duration=0)
- [ ] Config supports multiple break types in break_schedule array
- [ ] All unit tests pass
- [ ] `cargo check` succeeds with no warnings

**Estimated effort**: 5 points (1-2 days)

**Dependencies**: None (can start immediately after project setup)

**Alternatives considered**:
- **Simple interval timer (no state machine)**: 
  - Pros: Simpler implementation, fewer lines of code
  - Cons: Harder to debug, difficult to add features like postpone/pause
  - Decision: Rejected - state machine provides better error handling and extensibility
- **TOML config instead of JSON**: 
  - Pros: More human-friendly syntax, better for complex configs
  - Cons: Less widely known, fewer tools, no native browser support
  - Decision: Rejected - JSON is more widely known and has better tooling
- **Async/await vs channels for timer**: 
  - Pros (async): Simpler code, easier to reason about
  - Cons (async): Requires tokio runtime
  - Decision: Chose async/await - cleaner code outweighs runtime dependency

**References**:
- Design: `design.md` sections "Timer Engine (Rust)" and "Config Loader (Rust)"
- Spec: `specs/stretch-break-app/spec.md` requirements "State Machine Timer Engine" and "JSON-Based Configuration"
- Related changes: None (this is a greenfield project)

---

## Task 2: Backend Services (Inactivity Detection, Exercise Management, Notifications)

**Purpose**: Implement all backend services: screen inactivity detection, exercise database management, and notification system.

**Why second?** These are independent backend services that don't depend on UI. Building them together allows testing the full backend stack before adding frontend complexity.

**Deliverables**:
- Inactivity detector using macOS CGEventSource API
- Exercise loader and random selection algorithm
- Notification system with macOS native notifications
- Integration with timer engine (pause/resume, break notifications)

**Files created/modified**:
- `stretch-break-app/src-tauri/src/inactivity.rs` (new, ~150 lines)
- `stretch-break-app/src-tauri/src/exercises.rs` (new, ~200 lines)
- `stretch-break-app/src-tauri/src/notifications.rs` (new, ~100 lines)
- `stretch-break-app/exercises.json` (new, 5+ default exercises)
- `stretch-break-app/src-tauri/src/timer.rs` (modified, add pause/resume hooks and notification triggers)

**Validation**:
```bash
# Test inactivity detection
cd stretch-break-app/src-tauri
cargo test inactivity::tests --lib
# Expected: Tests pass, idle time detection works

# Test exercise selection
cargo test exercises::tests --lib
# Expected: Random selection respects duration limits

# Test notifications
cargo test notifications::tests --lib
# Expected: Notification creation succeeds

# Manual test: Run app, leave idle for 10+ minutes
cargo tauri dev
# Expected: Timer pauses, menu bar shows "Paused (away)"
# Then move mouse, verify timer resumes

# Manual test: Wait for break notification
# Expected: macOS notification appears with title and body
```

**Success criteria**:
- [ ] Inactivity detector polls every 5 seconds (configurable)
- [ ] Timer pauses after 10 minutes of inactivity (configurable)
- [ ] Timer resumes when user returns (mouse/keyboard input)
- [ ] Exercise selection fills 80-100% of break duration
- [ ] Exercises are randomized each break
- [ ] Break notifications appear when timer reaches 0
- [ ] Notifications display correct title and body
- [ ] All unit tests pass

**Estimated effort**: 5 points (1-1.5 days)

**Dependencies**: Task 1 (timer engine must exist to integrate pause/resume)

**Alternatives considered**:
- **NSWorkspace notifications vs polling**:
  - Pros (notifications): Event-driven, no polling overhead
  - Cons (notifications): More complex, requires Objective-C bridge
  - Decision: Chose polling - simpler and more reliable, 5s interval is negligible overhead
- **Fixed exercise order vs randomization**:
  - Pros (fixed): Predictable, easier to test
  - Cons (fixed): Boring, users may skip breaks
  - Decision: Chose randomization - keeps breaks engaging and prevents habituation
- **SQLite vs JSON for exercises**:
  - Pros (SQLite): Query capabilities, better for large datasets
  - Cons (SQLite): Overkill for <100 exercises, harder to edit manually
  - Decision: Chose JSON - simpler, human-editable, sufficient for use case

**References**:
- Design: `design.md` sections "Inactivity Detector (Rust)", "Exercise Manager (Rust)", and "Notification Manager (Rust)"
- Spec: `specs/stretch-break-app/spec.md` requirements "Screen Inactivity Detection", "Break Timer with Exercise Recommendations", and "Break Notifications with Actions"
- Related changes: None

---

## Task 3: System Tray & Menu Bar UI

**Purpose**: Implement menu bar UI with real-time countdown display and quick action menu.

**Why third?** System tray provides always-visible status and quick actions. This is the primary interface users interact with throughout the day.

**Deliverables**:
- System tray icon with dynamic menu
- Real-time countdown display in menu bar
- Menu actions (take break, postpone, pause, settings, quit)
- Integration with notification system from Task 2

**Files created/modified**:
- `stretch-break-app/src-tauri/src/main.rs` (modified, add system tray setup, ~200 lines added)
- `stretch-break-app/src-tauri/icons/icon.png` (new, menu bar icon)

**Validation**:
```bash
# Build and run app
cd stretch-break-app
cargo tauri dev

# Manual tests:
# 1. Verify menu bar icon appears
# 2. Click icon, verify menu shows countdown
# 3. Wait for break notification (or set work_duration=1 for testing)
# 4. Click "Take Break", verify break window opens
# 5. Click "Postpone", verify timer shows postpone countdown
# 6. Click "Pause Timer", verify countdown stops
# 7. Click "Settings", verify settings window opens
```

**Success criteria**:
- [ ] Menu bar icon appears on launch
- [ ] Countdown updates every second in menu
- [ ] Break notification appears when timer reaches 0
- [ ] "Take Break" action opens break window
- [ ] "Postpone" action delays break by configured duration
- [ ] "Pause Timer" toggles to "Resume Timer"
- [ ] All menu actions work without errors

**Estimated effort**: 3 points (0.5-1 day)

**Dependencies**: Task 1 (timer engine), Task 2 (notification system)

**Alternatives considered**:
- **Custom notification window vs native notifications**:
  - Pros (custom): Full control over UI, can add more actions
  - Cons (custom): Doesn't match OS style, more code to maintain
  - Decision: Chose native - better OS integration, users trust native notifications
- **Dock icon vs menu bar**:
  - Pros (dock): More visible, standard for apps
  - Cons (dock): Takes up dock space, more intrusive
  - Decision: Chose menu bar - less intrusive, always accessible, standard for utilities
- **Action buttons in notification vs separate window**:
  - Pros (buttons): Faster interaction, no extra window
  - Cons (buttons): macOS notification API limitations via Tauri
  - Decision: Hybrid approach - notification + small action window for better UX

**References**:
- Design: `design.md` section "Menu Bar UI (Tauri System Tray)"
- Spec: `specs/stretch-break-app/spec.md` requirement "Menu Bar Integration"
- Related changes: None

---

## Task 4: Frontend UI (Settings Panel & Break Timer)

**Purpose**: Create both web-based UIs: settings panel for configuration and break timer for displaying exercises during breaks.

**Why fourth?** Both UIs share styling and Tauri command patterns. Building them together ensures consistency and allows reusing CSS/JS utilities.

**Deliverables**:
- Settings panel: HTML form, CSS styling, JavaScript for config management
- Break timer: HTML layout, CSS styling, JavaScript for countdown and exercise cycling
- Tauri commands for config CRUD and exercise fetching
- Shared CSS for consistent styling

**Files created/modified**:
- `stretch-break-app/src/index.html` (new, ~80 lines, settings panel)
- `stretch-break-app/src/break.html` (new, ~60 lines, break timer)
- `stretch-break-app/src/styles.css` (new, ~250 lines, shared styles)
- `stretch-break-app/src/settings.js` (new, ~100 lines)
- `stretch-break-app/src/break.js` (new, ~150 lines)
- `stretch-break-app/src-tauri/src/commands.rs` (new, ~200 lines, all Tauri commands)
- `stretch-break-app/src-tauri/src/main.rs` (modified, register commands)
- `stretch-break-app/src-tauri/tauri.conf.json` (modified, add break window config)

**Validation**:
```bash
# Run app
cargo tauri dev

# Settings panel tests:
# 1. Click "Settings..." from menu bar
# 2. Verify all form fields display current config values
# 3. Change work_duration to 30, click Save
# 4. Verify config.json updated: cat ~/Library/Application\ Support/StretchBreak/config.json
# 5. Restart app, verify setting persisted
# 6. Click "Reset to Defaults", verify values reset
# 7. Click "Edit exercises.json", verify file opens in editor

# Break timer tests:
# 1. Set work_duration=1 in config for fast testing
# 2. Wait for break notification, click "Take Break"
# 3. Verify break window opens with first exercise
# 4. Verify countdown shows remaining time (e.g., "4:32")
# 5. Verify progress bar fills as time elapses
# 6. Wait for first exercise duration, verify auto-advance to next exercise
# 7. Click "Skip Exercise", verify immediate advance
# 8. Click "End Break Early", verify confirmation dialog
# 9. Let break complete naturally, verify window closes and work timer restarts
```

**Success criteria**:
- [ ] Settings panel displays all config options
- [ ] Form loads current config on open
- [ ] Save button persists changes to config.json
- [ ] Reset button restores defaults
- [ ] Input validation prevents invalid values (e.g., work_duration < 1)
- [ ] "Edit exercises.json" opens file in default editor
- [ ] Settings apply to next timer cycle (no restart required)
- [ ] Break window opens when user takes break
- [ ] Countdown displays remaining time (MM:SS format)
- [ ] Progress bar updates smoothly
- [ ] Exercises display with name, description, and counter (e.g., "2 of 4")
- [ ] Exercises auto-advance based on duration
- [ ] Skip button advances to next exercise
- [ ] End button closes window and restarts work timer
- [ ] Break completion triggers work timer restart

**Estimated effort**: 5 points (1-1.5 days)

**Dependencies**: Task 1 (config system), Task 2 (exercise management), Task 3 (system tray menu)

**Alternatives considered**:
- **React/Vue framework vs vanilla JS**:
  - Pros (framework): Component reusability, reactive state management
  - Cons (framework): Bundle size, build complexity, learning curve
  - Decision: Chose vanilla JS - KISS principle, settings panel is simple enough
- **Native macOS UI (SwiftUI) vs web UI**:
  - Pros (native): Better performance, native look and feel
  - Cons (native): Requires Swift knowledge, harder to iterate, Tauri loses advantage
  - Decision: Chose web UI - easier to iterate, leverages Tauri's strength
- **Form library vs manual DOM manipulation**:
  - Pros (library): Validation, error handling built-in
  - Cons (library): Dependency, overkill for simple form
  - Decision: Manual DOM - form is simple, custom validation is straightforward

**References**:
- Design: `design.md` sections "Settings Panel (Web Frontend)" and "Break Timer Display (Web Frontend)"
- Spec: `specs/stretch-break-app/spec.md` requirements "Configurable Break Intervals", "JSON-Based Configuration", and "Break Timer with Exercise Recommendations"
- Related changes: None

---

## Task 5: Integration, Testing & Polish

**Purpose**: Wire all components together, perform end-to-end testing, validate performance requirements, and add final polish (README, icons, build).

**Why last?** Integration testing requires all components to be complete. Performance testing needs the full app running. Polish ensures professional user experience.

**Deliverables**:
- Fully integrated app with all features working together
- End-to-end test scenarios validated
- Performance benchmarks met (CPU <1%, Memory <50MB)
- User documentation (README.md)
- Production build and packaging

**Files created/modified**:
- `stretch-break-app/src-tauri/src/main.rs` (modified, wire all components together)
- `stretch-break-app/README.md` (new, ~200 lines, user documentation)
- `stretch-break-app/src-tauri/icons/` (finalized, professional icons)
- `stretch-break-app/.github/workflows/build.yml` (optional, CI/CD)

**Validation**:
```bash
# End-to-end test scenarios
cd stretch-break-app

# Scenario 1: Full work/break cycle
# 1. Set work_duration=1, break_duration=1 in config
# 2. Start app: cargo tauri dev
# 3. Wait 1 minute, verify notification appears
# 4. Click "Take Break", verify break window opens
# 5. Wait 1 minute, verify break completes and work timer restarts
# Expected: Full cycle completes without errors

# Scenario 2: Postpone functionality
# 1. Wait for break notification
# 2. Click "Postpone"
# 3. Verify menu shows postpone countdown
# 4. Wait for postpone to complete
# 5. Verify notification appears again
# Expected: Postpone delays break correctly

# Scenario 3: Inactivity detection
# 1. Start work timer
# 2. Leave computer idle for 10+ minutes
# 3. Verify menu shows "Paused (away)"
# 4. Move mouse, verify timer resumes
# Expected: Timer pauses and resumes based on activity

# Scenario 4: Settings persistence
# 1. Open settings, change work_duration to 30
# 2. Save, quit app
# 3. Restart app
# 4. Verify work timer uses 30 minutes
# Expected: Settings persist across restarts

# Performance testing
# Run app for 1 hour, monitor with Activity Monitor
# Expected: CPU <1% average, Memory <50MB, no leaks

# Build production app
cargo tauri build
# Expected: Build succeeds, app bundle created at src-tauri/target/release/bundle/macos/StretchBreak.app

# Test production build
open src-tauri/target/release/bundle/macos/StretchBreak.app
# Expected: App runs without development dependencies
```

**Success criteria**:
- [ ] All end-to-end scenarios pass without errors
- [ ] Performance requirements met (CPU <1%, Memory <50MB, Battery <0.1%/hr)
- [ ] Settings persist across restarts
- [ ] Inactivity detection works reliably
- [ ] Exercise randomization works (5+ breaks show different exercises)
- [ ] Menu bar updates in real-time
- [ ] No crashes or panics during 1-hour stress test
- [ ] README.md covers installation, usage, configuration, troubleshooting
- [ ] Production build works on clean macOS system
- [ ] App icon looks professional in menu bar

**Estimated effort**: 4 points (1 day)

**Dependencies**: Tasks 1-4 (all components must be complete)

**Alternatives considered**:
- **Automated E2E tests vs manual testing**:
  - Pros (automated): Repeatable, catches regressions, faster long-term
  - Cons (automated): Setup time, flaky tests, maintenance overhead
  - Decision: Manual for MVP - faster to ship, automated tests deferred to post-MVP
- **Beta testing program vs self-testing**:
  - Pros (beta): Real user feedback, diverse hardware/OS versions
  - Cons (beta): Coordination overhead, delays release
  - Decision: Self-testing for MVP - focus on core functionality, beta program post-MVP
- **CI/CD pipeline vs manual builds**:
  - Pros (CI/CD): Automated releases, consistent builds
  - Cons (CI/CD): Setup time, GitHub Actions costs
  - Decision: Manual builds for MVP - simpler, CI/CD added when release cadence increases

**References**:
- Design: `design.md` sections "Performance & Battery Efficiency" and "Data Flow"
- Spec: `specs/stretch-break-app/spec.md` requirements "Performance and Battery Efficiency" and "KISS Principle Adherence"
- Related changes: None
- Validation criteria: All requirements in `specs/stretch-break-app/spec.md` must pass

---

## Summary

**Total tasks**: 5 high-level tasks
**Estimated effort**: 22 points (~3-4 weeks for MVP)
**Critical path**: Task 1 → Task 2 → Task 3 → Task 4 → Task 5

**Parallelization opportunities**:
- Task 2 (backend services) can start as soon as Task 1 is complete
- Task 3 (system tray) and Task 4 (frontend UI) can be developed in parallel after Task 2

**Risk mitigation**:
- **Risk**: Tauri learning curve
  - **Mitigation**: Start with Task 1 (pure Rust), gradually add Tauri features
- **Risk**: macOS API compatibility issues
  - **Mitigation**: Test on multiple macOS versions (11, 12, 13, 14)
- **Risk**: Performance degradation over time
  - **Mitigation**: Include 1-hour stress test in Task 6

**Quality gates**:
- All Rust code must pass `cargo check` and `cargo clippy`
- All unit tests must pass
- Manual E2E scenarios must pass
- Performance benchmarks must be met
- No compiler warnings allowed

**Next steps**:
1. Review this task breakdown with stakeholders
2. Set up development environment (Rust, Node.js, Tauri CLI)
3. Begin Task 1 (Core Timer Engine & Configuration)
4. Iterate based on learnings from each task
5. Conduct user testing after Task 4 (before final polish)
