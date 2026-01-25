# Design: Stretch Break Reminder App

## Architecture Overview

### Technology Stack
- **Framework:** Tauri v1.x (Rust backend + web frontend)
- **Frontend:** Vanilla HTML/CSS/JavaScript (KISS - no framework bloat)
- **Backend:** Rust (system tray, notifications, timers, inactivity detection)
- **Build:** Tauri CLI
- **Target:** macOS 11+ (Big Sur and later)

### Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Menu Bar Icon                          │
│  (Shows countdown or break timer, click for menu)          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Rust Backend (Tauri)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Timer Engine │  │ Notification │  │  Inactivity  │     │
│  │              │  │   Manager    │  │   Detector   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────┐  ┌──────────────┐                       │
│  │Config Loader │  │Exercise Mgr  │                       │
│  └──────────────┘  └──────────────┘                       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Web Frontend (HTML/CSS/JS)                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │Settings Panel│  │ Break Timer  │  │Exercise List │     │
│  │              │  │   Display    │  │              │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    JSON Configuration                       │
│  ┌──────────────┐  ┌──────────────┐                       │
│  │ config.json  │  │exercises.json│                       │
│  │ (settings)   │  │ (exercises)  │                       │
│  └──────────────┘  └──────────────┘                       │
└─────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Timer Engine (Rust)

**State Machine:**
```
IDLE → COUNTING_TO_BREAK → BREAK_NOTIFICATION → BREAK_ACTIVE → IDLE
                ↓                    ↓
            PAUSED              POSTPONED
```

**States:**
- `IDLE`: Initial state, waiting to start
- `COUNTING_TO_BREAK`: Counting down to next break (e.g., 25 minutes)
- `PAUSED`: Inactivity detected, timer paused
- `BREAK_NOTIFICATION`: Notification shown, waiting for user action
- `POSTPONED`: User postponed, counting down postpone duration (e.g., 5 minutes)
- `BREAK_ACTIVE`: User taking break, counting down break duration (e.g., 5 minutes)

**Responsibilities:**
- Maintain current state and countdown timers
- Track current break schedule index (which break type is next)
- Cycle through break schedule (short → long → short → ...)
- Emit events on state transitions
- Handle pause/resume based on inactivity
- Persist state to survive app restarts (optional enhancement)

**Break Cycle Tracking:**
```rust
struct TimerEngine {
    state: TimerState,
    remaining_seconds: u64,
    current_break_index: usize,  // Index into config.break_schedule
    break_schedule: Vec<BreakConfig>,
}

// After break completes:
fn complete_break(&mut self) {
    self.current_break_index = (self.current_break_index + 1) % self.break_schedule.len();
    let next_break = &self.break_schedule[self.current_break_index];
    self.start_work_timer(next_break.work_duration_minutes);
}
```

### 2. Notification Manager (Rust)

**Responsibilities:**
- Show macOS native notifications using `notify-rust` crate
- Add action buttons: "Take Break" and "Postpone"
- Handle notification responses
- Update menu bar icon badge/text

**Notification Format:**
```
Title: "Time for a Stretch Break!"
Body: "You've been working for 25 minutes. Take a 5-minute break?"
Actions: [Take Break] [Postpone]
```

### 3. Inactivity Detector (Rust)

**Approach:**
- Use macOS `CGEventSource` API to get idle time
- Poll every 5 seconds (configurable)
- If idle time > threshold (10 minutes), pause timer
- Resume timer when activity detected

**Implementation:**
```rust
use core_graphics::event_source::{CGEventSource, CGEventSourceStateID};

fn get_idle_time_seconds() -> f64 {
    CGEventSource::seconds_since_last_event_type(
        CGEventSourceStateID::CombinedSessionState,
        CGEventType::Null
    )
}
```

### 4. Config Loader (Rust)

**Config Schema (`config.json`):**
```json
{
  "version": "1.0",
  "break_schedule": [
    {
      "type": "short",
      "work_duration_minutes": 40,
      "break_duration_minutes": 10,
      "exercise_categories": ["upper-body", "eyes"]
    },
    {
      "type": "long",
      "work_duration_minutes": 120,
      "break_duration_minutes": 30,
      "exercise_categories": ["upper-body", "lower-body", "core", "cardio"]
    }
  ],
  "postpone_duration_minutes": 5,
  "inactivity_threshold_minutes": 10,
  "inactivity_poll_interval_seconds": 5,
  "auto_start_on_login": false,
  "sound_enabled": true,
  "notification_sound": "default"
}
```

**Break Scheduling Logic:**
- Timer cycles through break_schedule in order
- After short break (40min work → 10min break), timer starts next cycle (120min work → 30min break)
- After long break, cycle repeats from first break
- Example: 40min work → 10min short break → 120min work → 30min long break → repeat

**Responsibilities:**
- Load config from `~/Library/Application Support/StretchBreak/config.json`
- Provide defaults if file missing
- Validate ranges (e.g., work_duration > 0, < 480)
- Watch file for changes (hot reload)

### 5. Exercise Manager (Rust)

**Exercise Schema (`exercises.json`):**
```json
{
  "version": "1.0",
  "exercises": [
    {
      "id": "neck-rolls",
      "name": "Neck Rolls",
      "description": "Slowly roll your head in a circle, 5 times each direction",
      "duration_seconds": 30,
      "category": "upper-body"
    },
    {
      "id": "shoulder-shrugs",
      "name": "Shoulder Shrugs",
      "description": "Raise shoulders to ears, hold 5 seconds, release. Repeat 10 times",
      "duration_seconds": 60,
      "category": "upper-body"
    },
    {
      "id": "wrist-stretches",
      "name": "Wrist Stretches",
      "description": "Extend arm, pull fingers back gently. Hold 15 seconds each hand",
      "duration_seconds": 30,
      "category": "upper-body"
    },
    {
      "id": "standing-stretch",
      "name": "Standing Full Body Stretch",
      "description": "Stand up, reach arms overhead, stretch tall. Hold 10 seconds",
      "duration_seconds": 20,
      "category": "upper-body"
    },
    {
      "id": "eye-rest",
      "name": "Eye Rest (20-20-20)",
      "description": "Look at something 20 feet away for 20 seconds",
      "duration_seconds": 20,
      "category": "eyes"
    },
    {
      "id": "squats",
      "name": "Bodyweight Squats",
      "description": "Stand with feet shoulder-width apart, lower down, stand back up. 10 reps",
      "duration_seconds": 45,
      "category": "lower-body"
    },
    {
      "id": "calf-raises",
      "name": "Calf Raises",
      "description": "Stand on toes, hold 2 seconds, lower. Repeat 15 times",
      "duration_seconds": 30,
      "category": "lower-body"
    },
    {
      "id": "torso-twist",
      "name": "Seated Torso Twist",
      "description": "Sit up straight, twist torso left and right. 10 times each side",
      "duration_seconds": 40,
      "category": "core"
    },
    {
      "id": "march-in-place",
      "name": "March in Place",
      "description": "Lift knees high, march for 30 seconds to get blood flowing",
      "duration_seconds": 30,
      "category": "cardio"
    },
    {
      "id": "jumping-jacks",
      "name": "Jumping Jacks",
      "description": "Classic jumping jacks, 20 reps to elevate heart rate",
      "duration_seconds": 30,
      "category": "cardio"
    }
  ]
}
```

**Exercise Categories:**
- **upper-body**: Neck, shoulders, arms, wrists, back (desk work focus)
- **lower-body**: Legs, hips, calves (counteract sitting)
- **core**: Torso, abs, lower back (posture support)
- **cardio**: Light cardio to get blood flowing (longer breaks)
- **eyes**: Eye strain relief (short breaks)

**Responsibilities:**
- Load exercises from `~/Library/Application Support/StretchBreak/exercises.json`
- Provide default exercises if file missing
- Filter exercises by categories specified in break schedule
- Select random subset for each break (e.g., 3-4 exercises for short, 6-8 for long)
- Ensure total duration ≤ break_duration
- Balance exercise selection across categories

### 6. Menu Bar UI (Tauri System Tray)

**Menu Items:**
```
┌─────────────────────────────────┐
│ ⏱️  Short break in 23:45        │ (dynamic, updates every second)
├─────────────────────────────────┤
│ Take Break Now                  │
│ Postpone Break                  │
│ Pause Timer                     │ (toggle: Pause/Resume)
├─────────────────────────────────┤
│ Next: Long break (30 min)       │ (shows upcoming break type)
├─────────────────────────────────┤
│ Settings...                     │
│ About                           │
│ Quit                            │
└─────────────────────────────────┘
```

**Dynamic Status Text:**
- Working toward short break: "⏱️ Short break in 23:45"
- Working toward long break: "⏱️ Long break in 1:45:30"
- During break: "🧘 Break time! 4:32 remaining"
- Paused: "⏸️ Paused (away)"

**Icon States:**
- Default: Clock icon
- Break time: Notification badge
- Paused: Pause icon overlay

### 7. Settings Panel (Web Frontend)

**UI Layout:**
```
┌─────────────────────────────────────────────────┐
│  Stretch Break Settings                         │
├─────────────────────────────────────────────────┤
│                                                 │
│  Break Schedule:                                │
│  ┌───────────────────────────────────────────┐ │
│  │ Short Break                               │ │
│  │ Work: [40] min  Break: [10] min          │ │
│  │ Categories: [upper-body] [eyes]          │ │
│  │                                           │ │
│  │ Long Break                                │ │
│  │ Work: [120] min  Break: [30] min         │ │
│  │ Categories: [upper-body] [lower-body]    │ │
│  │             [core] [cardio]               │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  [+ Add Break Type]  [- Remove]                 │
│                                                 │
│  Postpone Duration: [5] minutes                 │
│                                                 │
│  Inactivity Pause:  [✓] Enabled                 │
│  Threshold:         [10] minutes                │
│                                                 │
│  Sound:             [✓] Enabled                 │
│  Auto-start:        [ ] Launch on login         │
│                                                 │
│  [Save]  [Reset to Defaults]                    │
│                                                 │
│  Exercises: [Edit exercises.json]               │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Break Schedule Editor:**
- Users can add/remove break types
- Each break type has: work duration, break duration, exercise categories
- Categories are multi-select checkboxes
- Breaks cycle in order shown (top to bottom)

**Implementation:**
- Simple HTML form with input validation
- Tauri commands to save config
- Link to open exercises.json in default editor

### 8. Break Timer Display (Web Frontend)

**UI Layout:**
```
┌─────────────────────────────────────────────────┐
│  Break Time! 🧘                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│         Time Remaining: 4:32                    │
│         ████████████░░░░░░░░░░                  │
│                                                 │
│  Current Exercise (2 of 4):                     │
│                                                 │
│  🦴 Neck Rolls                                  │
│  Slowly roll your head in a circle,             │
│  5 times each direction                         │
│                                                 │
│  [Skip Exercise]  [End Break Early]             │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Features:**
- Progress bar for break duration
- Cycle through selected exercises
- Auto-advance to next exercise when duration complete
- Skip or end break early options

## Data Flow

### Break Notification Flow
```
1. Timer reaches 0 (work duration complete)
2. Timer Engine → BREAK_NOTIFICATION state
3. Notification Manager shows notification
4. User clicks "Take Break" or "Postpone"
5. Notification Manager → Timer Engine (action)
6. Timer Engine transitions to BREAK_ACTIVE or POSTPONED
7. If BREAK_ACTIVE, open Break Timer window
8. Exercise Manager selects random exercises
9. Frontend displays exercises with countdown
10. Break completes → Timer Engine → COUNTING_TO_BREAK
```

### Inactivity Detection Flow
```
1. Inactivity Detector polls every 5 seconds
2. If idle_time > threshold AND state == COUNTING_TO_BREAK
3. Timer Engine → PAUSED state
4. Menu bar shows "Paused (away)" status
5. User returns (idle_time < threshold)
6. Timer Engine → COUNTING_TO_BREAK (resume)
7. Menu bar shows countdown again
```

### Config Update Flow
```
1. User edits config.json or uses Settings panel
2. Config Loader detects file change (file watcher)
3. Config Loader validates and reloads
4. Timer Engine receives new config
5. Apply changes (e.g., new work_duration for next cycle)
```

## Performance & Battery Efficiency

### Optimization Strategies

1. **Timer Precision:**
   - Use `tokio::time::interval` for efficient async timers
   - Update menu bar text every 1 second (not more frequent)
   - Batch UI updates to minimize redraws

2. **Inactivity Polling:**
   - Poll every 5 seconds (not every second)
   - Use lightweight CGEventSource API (no process spawning)
   - Skip polling when in BREAK_ACTIVE or IDLE states

3. **Memory Footprint:**
   - Lazy load exercise data (only when break starts)
   - Close Break Timer window when not in use
   - Use Tauri's single-instance mode

4. **CPU Usage:**
   - No busy loops - use async/await with timers
   - Minimize menu bar icon updates (only on state change or 1s tick)
   - Use native notifications (no custom rendering)

5. **Battery Impact:**
   - No network requests (fully offline)
   - No background animations
   - Minimal file I/O (config loaded once, watched for changes)

**Expected Resource Usage:**
- Memory: ~30-50 MB (Tauri baseline)
- CPU: <1% average (spikes to ~2% during notifications)
- Battery: Negligible impact (<0.1% per hour)

## File Structure

```
stretch-break-app/
├── src/                          # Frontend (HTML/CSS/JS)
│   ├── index.html                # Settings panel
│   ├── break.html                # Break timer display
│   ├── styles.css                # Shared styles
│   ├── settings.js               # Settings logic
│   └── break.js                  # Break timer logic
├── src-tauri/                    # Rust backend
│   ├── src/
│   │   ├── main.rs               # Entry point, system tray setup
│   │   ├── timer.rs              # Timer engine state machine
│   │   ├── notifications.rs      # Notification manager
│   │   ├── inactivity.rs         # Inactivity detector
│   │   ├── config.rs             # Config loader
│   │   ├── exercises.rs          # Exercise manager
│   │   └── commands.rs           # Tauri commands (frontend ↔ backend)
│   ├── Cargo.toml                # Rust dependencies
│   ├── tauri.conf.json           # Tauri configuration
│   └── icons/                    # App icons
├── config.json                   # Default config (copied to user dir)
├── exercises.json                # Default exercises (copied to user dir)
├── README.md                     # User documentation
└── package.json                  # Build scripts
```

## Security Considerations

1. **Config Validation:**
   - Validate all numeric ranges (prevent negative durations, overflow)
   - Sanitize file paths (prevent directory traversal)
   - Limit config file size (prevent DoS)

2. **Permissions:**
   - Request accessibility permissions for inactivity detection
   - Request notification permissions
   - No network access required

3. **Data Privacy:**
   - No telemetry or analytics
   - All data stored locally
   - No external dependencies at runtime

## Future Enhancements (Out of Scope for MVP)

- [ ] Cross-platform support (Windows, Linux)
- [ ] Exercise animations/videos
- [ ] Statistics dashboard (breaks taken, time worked)
- [ ] Integration with calendar (skip breaks during meetings)
- [ ] Custom exercise creation UI
- [ ] Dark mode support
- [ ] Keyboard shortcuts
- [ ] Multiple break profiles (short/long breaks)
- [ ] Sync config across devices (iCloud)

## References

- Tauri Documentation: https://tauri.app/v1/guides/
- macOS Inactivity Detection: https://developer.apple.com/documentation/coregraphics/cgeventsource
- notify-rust: https://github.com/hoodie/notify-rust
- 20-20-20 Rule: https://www.aao.org/eye-health/tips-prevention/computer-usage
