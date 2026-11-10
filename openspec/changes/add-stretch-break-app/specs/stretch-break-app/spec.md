# Spec: Stretch Break App

## ADDED Requirements

### Requirement: Configurable Break Schedule
The app must allow users to configure multiple break types (short/long) with different work durations, break durations, and exercise categories through a JSON configuration file.

**Rationale**: Different users have different work patterns and need variety. Some want frequent short breaks (e.g., 10 min every 40 min) and occasional long breaks (e.g., 30 min every 2 hours). Multiple break types prevent monotony and address different physical needs.

#### Scenario: User configures short and long breaks
```
Given the user edits config.json
And adds a short break: 40min work → 10min break (upper-body, eyes)
And adds a long break: 120min work → 30min break (upper-body, lower-body, core, cardio)
When the app loads the configuration
Then the timer starts with the first break type (short)
And after the short break completes, the timer uses the long break schedule
And after the long break completes, the cycle repeats from short
```

#### Scenario: User adds a third break type
```
Given the user has short (40min → 10min) and long (120min → 30min) breaks
When the user adds a medium break (60min → 15min) between them
Then the cycle becomes: short → medium → long → short → ...
And each break uses its configured exercise categories
```

#### Scenario: User sets 5-minute postpone delay
```
Given the user sets postpone_duration_minutes to 5
When a break notification appears
And the user clicks "Postpone"
Then the timer counts down 5 minutes
And shows another break notification after 5 minutes
And the break type remains the same (short or long)
```

#### Scenario: Menu bar shows upcoming break type
```
Given the user is working toward a short break
And 23 minutes 45 seconds remain
When the user views the menu bar
Then it shows "⏱️ Short break in 23:45"
And the menu shows "Next: Long break (30 min)"
```

#### Scenario: Invalid configuration values
```
Given the user sets a break with work_duration_minutes of 0
When the app loads the configuration
Then validation fails with error "work_duration_minutes must be 1-480"
And the app uses default break schedule (40min → 10min short, 120min → 30min long)
```

#### Scenario: Exercise categories filter exercises
```
Given a short break is configured with categories ["upper-body", "eyes"]
And exercises.json contains upper-body, lower-body, core, and cardio exercises
When the short break starts
Then only upper-body and eyes exercises are selected
And lower-body, core, and cardio exercises are excluded
```

---

### Requirement: Break Notifications with Actions
The app must show macOS native notifications when it's time for a break, with options to take the break or postpone.

**Rationale**: Users need a clear, non-intrusive prompt that respects their current workflow. Postpone option prevents forced interruptions during critical tasks.

#### Scenario: Break notification appears
```
Given the work timer reaches 0
When the timer transitions to BREAK_NOTIFICATION state
Then a macOS notification appears
And the notification title is "Time for a Stretch Break!"
And the notification body explains the break duration
And the notification stays visible until user acts
```

#### Scenario: User takes break from notification
```
Given a break notification is displayed
When the user clicks "Take Break"
Then the timer transitions to BREAK_ACTIVE state
And the break timer window opens
And exercises are displayed
And the break countdown begins
```

#### Scenario: User postpones break
```
Given a break notification is displayed
When the user clicks "Postpone"
Then the timer transitions to POSTPONED state
And the timer counts down the postpone duration (default 5 minutes)
And a new notification appears when postpone duration completes
```

---

### Requirement: Break Timer with Exercise Recommendations
During an active break, the app must display a timer and cycle through recommended exercises.

**Rationale**: Simply taking a break isn't enough—users need guidance on effective stretches to prevent strain. Cycling through exercises keeps the break engaging.

#### Scenario: Break timer displays exercises
```
Given the user starts a 5-minute break
When the break timer window opens
Then 3-4 exercises are selected randomly
And the total exercise duration is ≤ 5 minutes
And the first exercise is displayed with name and description
And the countdown shows remaining break time
```

#### Scenario: Exercises auto-advance
```
Given a break is active with 4 exercises
And the first exercise duration is 30 seconds
When 30 seconds elapse
Then the display advances to the second exercise
And the exercise counter shows "Exercise 2 of 4"
And the countdown continues
```

#### Scenario: User skips exercise
```
Given an exercise is displayed
When the user clicks "Skip Exercise"
Then the display immediately advances to the next exercise
And the countdown continues without interruption
```

#### Scenario: Break completes
```
Given a break timer is running
When the countdown reaches 0
Then the break window closes
And the timer transitions to COUNTING_TO_BREAK state
And the work timer starts counting down
```

---

### Requirement: Screen Inactivity Detection
The app must detect when the user is away from the computer and pause the work timer to avoid triggering breaks when the user is not present.

**Rationale**: Triggering break notifications when the user is away (lunch, meeting) is annoying and defeats the purpose. Smart pausing improves user experience.

#### Scenario: Timer pauses on inactivity
```
Given the work timer is counting down
And the inactivity threshold is 10 minutes
When the user has no keyboard/mouse input for 10 minutes
Then the timer transitions to PAUSED state
And the menu bar shows "⏸️ Paused (away)"
And the countdown stops
```

#### Scenario: Timer resumes on activity
```
Given the timer is in PAUSED state due to inactivity
When the user moves the mouse or types
Then the timer transitions back to COUNTING_TO_BREAK state
And the menu bar shows the countdown again
And the countdown resumes from where it paused
```

#### Scenario: Inactivity during break is ignored
```
Given the timer is in BREAK_ACTIVE state
And the user is inactive for 10+ minutes
Then the timer does NOT pause
And the break continues counting down
And the break completes normally
```

---

### Requirement: Menu Bar Integration
The app must run as a macOS menu bar app with a system tray icon showing the current timer status and providing quick actions.

**Rationale**: Menu bar apps are unobtrusive and always accessible. Users can check time remaining or trigger actions without opening a full window.

#### Scenario: Menu bar shows countdown
```
Given the work timer is counting down
And 23 minutes 45 seconds remain
When the user views the menu bar
Then the icon shows a clock symbol
And the menu shows "⏱️ Next break in 23:45"
And the text updates every second
```

#### Scenario: Menu bar shows paused status
```
Given the timer is paused due to inactivity
When the user views the menu bar
Then the menu shows "⏸️ Paused (away)"
```

#### Scenario: User triggers break from menu
```
Given the work timer is counting down
When the user clicks "Take Break Now" from the menu
Then the timer immediately transitions to BREAK_ACTIVE
And the break window opens
```

#### Scenario: User pauses timer from menu
```
Given the work timer is counting down
When the user clicks "Pause Timer" from the menu
Then the timer transitions to PAUSED state
And the menu item changes to "Resume Timer"
```

---

### Requirement: JSON-Based Configuration
All settings must be stored in a JSON configuration file that users can edit manually or through the settings UI.

**Rationale**: JSON is human-readable, version-controllable, and portable. Power users can edit directly; casual users can use the UI.

#### Scenario: Config file created on first run
```
Given the app is launched for the first time
And no config file exists at ~/Library/Application Support/StretchBreak/config.json
When the app initializes
Then a default config.json is created
And default values are: work=25min, break=5min, postpone=5min, inactivity=10min
```

#### Scenario: Config changes apply on save
```
Given the user opens the settings panel
And changes work_duration_minutes from 25 to 30
When the user clicks "Save"
Then config.json is updated with the new value
And the timer engine reloads the configuration
And the next work cycle uses 30 minutes
```

#### Scenario: Config hot-reload on file change
```
Given the app is running
When the user edits config.json in a text editor
And saves the file
Then the app detects the file change
And reloads the configuration
And applies the new settings to the next timer cycle
```

---

### Requirement: JSON-Based Exercise Database
Exercises must be stored in a JSON file that users can customize by adding, removing, or modifying exercises.

**Rationale**: Users have different physical needs. Some need more wrist stretches (programmers), others need back stretches (desk workers). Customization is key.

#### Scenario: Default exercises provided
```
Given the app is launched for the first time
When exercises.json is created
Then it contains 5 default exercises
And exercises cover: neck, shoulders, wrists, eyes, full-body
And each exercise has: id, name, description, duration_seconds, category
```

#### Scenario: User adds custom exercise
```
Given the user opens exercises.json
And adds a new exercise:
  {
    "id": "back-stretch",
    "name": "Seated Back Stretch",
    "description": "Sit up straight, clasp hands behind head, gently arch back",
    "duration_seconds": 45,
    "category": "back"
  }
When the user saves the file
And starts a new break
Then the custom exercise may appear in the random selection
```

#### Scenario: Exercise selection respects duration limit
```
Given exercises.json contains 10 exercises
And the break duration is 5 minutes (300 seconds)
When exercises are selected for a break
Then the total duration of selected exercises is ≤ 300 seconds
And at least 80% of the break time is filled (≥ 240 seconds)
```

---

### Requirement: Performance and Battery Efficiency
The app must be lightweight and battery-efficient, suitable for running continuously on a laptop.

**Rationale**: Users will run this app all day. High CPU or battery usage is unacceptable and will lead to uninstallation.

#### Scenario: Low CPU usage
```
Given the app is running
And the timer is counting down
When measured over 1 hour
Then average CPU usage is < 1%
And peak CPU usage is < 2% (during notifications)
```

#### Scenario: Low memory footprint
```
Given the app is running
When memory usage is measured
Then the app uses < 50 MB of RAM
And memory usage remains stable over time (no leaks)
```

#### Scenario: Minimal battery impact
```
Given the app is running on a MacBook
When battery usage is measured over 1 hour
Then the app consumes < 0.1% of battery per hour
```

#### Scenario: Efficient timer updates
```
Given the menu bar text updates every second
When the timer is running
Then updates use minimal CPU (no busy loops)
And updates are batched to minimize redraws
```

---

### Requirement: KISS Principle Adherence
The app must follow the "Keep It Simple, Stupid" principle—minimal features, no bloat, straightforward UX.

**Rationale**: Feature creep kills apps. Users want a simple tool that does one thing well: remind them to stretch.

#### Scenario: No unnecessary features
```
Given the app feature set
Then it includes ONLY:
  - Configurable timers
  - Break notifications
  - Exercise recommendations
  - Inactivity detection
  - Settings panel
And it does NOT include:
  - Statistics/analytics
  - Social features
  - Gamification
  - Cloud sync
  - Premium tiers
```

#### Scenario: Minimal UI
```
Given the settings panel
Then it contains only essential controls
And all settings fit on one screen (no scrolling)
And the UI uses native macOS controls (no custom widgets)
```

#### Scenario: No external dependencies at runtime
```
Given the app is built
Then it requires no internet connection
And it makes no network requests
And it has no telemetry or analytics
And all data is stored locally
```

---

### Requirement: State Machine Timer Engine
The timer must implement a well-defined state machine to handle all timer states and transitions.

**Rationale**: State machines prevent bugs and make behavior predictable. Clear states make debugging and testing easier.

#### Scenario: Valid state transitions
```
Given the timer state machine
Then valid transitions are:
  IDLE → COUNTING_TO_BREAK (on start)
  COUNTING_TO_BREAK → PAUSED (on inactivity)
  PAUSED → COUNTING_TO_BREAK (on activity)
  COUNTING_TO_BREAK → BREAK_NOTIFICATION (on timer complete)
  BREAK_NOTIFICATION → BREAK_ACTIVE (on take break)
  BREAK_NOTIFICATION → POSTPONED (on postpone)
  POSTPONED → BREAK_NOTIFICATION (on timer complete)
  BREAK_ACTIVE → COUNTING_TO_BREAK (on timer complete)
```

#### Scenario: Invalid transitions rejected
```
Given the timer is in BREAK_ACTIVE state
When a pause command is issued
Then the command is ignored
And the state remains BREAK_ACTIVE
And an error is logged
```

#### Scenario: State persists across restarts (optional enhancement)
```
Given the timer is in COUNTING_TO_BREAK state with 15 minutes remaining
When the app is quit
And relaunched within 5 minutes
Then the timer resumes from the remaining time
And the state is restored
```

---

## Validation Criteria

### Functional Validation
- [ ] All timer states transition correctly
- [ ] Break notifications appear at correct times
- [ ] Exercises display and cycle correctly
- [ ] Inactivity detection pauses/resumes timer
- [ ] Settings save and load correctly
- [ ] Menu bar updates in real-time

### Performance Validation
- [ ] CPU usage < 1% average, < 2% peak
- [ ] Memory usage < 50 MB
- [ ] Battery impact < 0.1% per hour
- [ ] No memory leaks over 24-hour run

### UX Validation
- [ ] Settings panel is intuitive (no documentation needed)
- [ ] Break timer is clear and motivating
- [ ] Notifications are non-intrusive
- [ ] Menu bar provides quick access to all actions

### Code Quality Validation
- [ ] All Rust code passes `cargo check`
- [ ] All unit tests pass
- [ ] No panics or crashes during normal operation
- [ ] Config validation prevents invalid states
