#!/usr/bin/env npx tsx
/**
 * Ralph - Autonomous multi-iteration agent orchestrator with TUI
 *
 * Uses ansi-diff for differential rendering - only updates changed parts of the screen.
 * This eliminates flickering by computing minimal terminal updates.
 */

import { spawn, ChildProcess } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// CommonJS require for diffy (no ESM exports)
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const createDiffy = require('diffy');
const trim = require('diffy/trim');

// ============================================================================
// Types
// ============================================================================

type IterationStatus = 'pending' | 'running' | 'completed' | 'failed';

interface Iteration {
  id: number;
  status: IterationStatus;
  startTime?: number;
  endTime?: number;
  duration: number;
  tokens: number;
  output: string;
}

interface SessionState {
  sessionId: string;
  startTime: number;
  maxIterations: number;
  timeout: number;
  paused: boolean;
  completed: boolean;
  completionReason: string;
  currentIteration: number;
  iterations: Map<number, Iteration>;
}

interface Config {
  promptFile?: string;
  promptText?: string;
  maxIterations: number;
  timeout: number;
  agentName: string;
  dryRun: boolean;
  resumeSession?: string;
}

// ============================================================================
// Constants
// ============================================================================

const COMPLETION_MARKERS = ['- [x] TASK_COMPLETE', 'RALPH_COMPLETE'];
const SPINNER_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
const RENDER_INTERVAL_MS = 100;
const ITERATION_DELAY_MS = 2000;

// Colors using ANSI escape codes
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  inverse: '\x1b[7m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  gray: '\x1b[90m',
  white: '\x1b[97m',
  bgCyan: '\x1b[46m',
  bgYellow: '\x1b[43m',
  bgGreen: '\x1b[42m',
  bgRed: '\x1b[41m',
};

// ============================================================================
// CLI Argument Parsing
// ============================================================================

function parseArgs(): Config {
  const args = process.argv.slice(2);
  const config: Config = {
    maxIterations: 50,
    timeout: 7200,
    agentName: 'orchestrator',
    dryRun: false,
  };

  let i = 0;
  while (i < args.length) {
    const arg = args[i];

    if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    } else if (arg === '--prompt' || arg === '-p') {
      config.promptFile = args[++i];
    } else if (arg === '--max-iterations') {
      config.maxIterations = parseInt(args[++i], 10);
    } else if (arg === '--timeout') {
      config.timeout = parseInt(args[++i], 10);
    } else if (arg === '--agent') {
      config.agentName = args[++i];
    } else if (arg === '--dry-run') {
      config.dryRun = true;
    } else if (arg === '--resume') {
      config.resumeSession = args[++i];
    } else if (!arg.startsWith('-')) {
      config.promptText = arg;
    }
    i++;
  }

  // Validate
  if (!config.promptText && !config.promptFile && !config.resumeSession) {
    console.error(
      'Error: Prompt required. Provide inline text or use --prompt <file>'
    );
    printHelp();
    process.exit(1);
  }

  if (config.promptFile && !fs.existsSync(config.promptFile)) {
    console.error(`Error: Prompt file not found: ${config.promptFile}`);
    process.exit(1);
  }

  return config;
}

function printHelp(): void {
  console.log(`
Usage
  $ ralph.ts "inline prompt" [options]
  $ ralph.ts --prompt <file> [options]

Options
  --prompt, -p        Path to prompt file
  --max-iterations    Maximum iterations (default: 50)
  --timeout           Timeout in seconds (default: 7200)
  --agent             Agent name (default: orchestrator)
  --dry-run           Simulate execution
  --resume            Resume session ID
  --help, -h          Show this help

Examples
  $ ralph.ts "Implement user authentication"
  $ ralph.ts --prompt task.md --max-iterations 30
  $ ralph.ts "Fix the bug" --dry-run

Keybindings
  q           Quit
  p           Pause execution
  r           Resume execution
  Up/k        Navigate to newer iteration
  Down/j      Navigate to older iteration
  g           Jump to first iteration
  G           Jump to current iteration
  ?           Toggle help overlay
`);
}

// ============================================================================
// Utility Functions
// ============================================================================

function generateSessionId(): string {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10);
  const timePart = now.toTimeString().slice(0, 8).replace(/:/g, '');
  return `ralph-${datePart}-${timePart}`;
}

function detectCompletion(output: string): boolean {
  return COMPLETION_MARKERS.some((marker) => output.includes(marker));
}

function hashOutput(output: string): string {
  let hash = 0;
  for (let i = 0; i < output.length; i++) {
    const char = output.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash.toString(16);
}

function formatDuration(seconds: number): string {
  if (seconds >= 60) {
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}

function formatTokens(tokens: number): string {
  if (tokens >= 1000) {
    return `${(tokens / 1000).toFixed(1)}k`;
  }
  return `${tokens}`;
}

function truncateLine(line: string, maxWidth: number): string {
  // Strip ANSI codes for length calculation
  const stripped = line.replace(/\x1b\[[0-9;]*m/g, '');
  if (stripped.length <= maxWidth) return line;
  return line.substring(0, maxWidth - 3) + '...';
}

// Box drawing helpers
function drawBox(
  content: string[],
  width: number,
  borderColor: string = colors.cyan
): string[] {
  const innerWidth = width - 2;
  const lines: string[] = [];
  lines.push(`${borderColor}┌${'─'.repeat(innerWidth)}┐${colors.reset}`);
  for (const line of content) {
    const stripped = line.replace(/\x1b\[[0-9;]*m/g, '');
    const padding = Math.max(0, innerWidth - stripped.length);
    lines.push(
      `${borderColor}│${colors.reset}${line}${' '.repeat(padding)}${borderColor}│${colors.reset}`
    );
  }
  lines.push(`${borderColor}└${'─'.repeat(innerWidth)}┘${colors.reset}`);
  return lines;
}

// ============================================================================
// Ralph TUI Class
// ============================================================================

class RalphTUI {
  private diffy: any;
  private config: Config;
  private state: SessionState;
  private stateDir: string;
  private agentProcess: ChildProcess | null = null;
  private outputHashes: string[] = [];
  private running = true;
  private spinnerFrame = 0;
  private selectedIteration = 0;
  private outputScrollOffset = 0;
  private showHelp = false;
  private renderInterval: NodeJS.Timeout | null = null;

  constructor(config: Config) {
    this.config = config;
    this.state = {
      sessionId: config.resumeSession || generateSessionId(),
      startTime: Date.now(),
      maxIterations: config.maxIterations,
      timeout: config.timeout,
      paused: false,
      completed: false,
      completionReason: '',
      currentIteration: 0,
      iterations: new Map(),
    };

    // Initialize state directory
    const projectRoot = process.cwd();
    this.stateDir = path.join(
      projectRoot,
      '.ralph-state',
      this.state.sessionId
    );
    fs.mkdirSync(this.stateDir, { recursive: true });

    // Initialize diffy with fullscreen mode
    this.diffy = createDiffy({ fullscreen: true });
  }

  // --------------------------------------------------------------------------
  // Rendering
  // --------------------------------------------------------------------------

  private getTerminalSize(): { width: number; height: number } {
    return {
      width: process.stdout.columns || 120,
      height: process.stdout.rows || 40,
    };
  }

  private getStatusIcon(status: IterationStatus): { icon: string; color: string } {
    switch (status) {
      case 'running':
        return {
          icon: SPINNER_FRAMES[this.spinnerFrame],
          color: colors.yellow,
        };
      case 'completed':
        return { icon: '✓', color: colors.green };
      case 'failed':
        return { icon: '✗', color: colors.red };
      default:
        return { icon: '○', color: colors.gray };
    }
  }

  private renderCurrentIterationPanel(width: number): string[] {
    const lines: string[] = [];
    lines.push(
      `${colors.bold}${colors.white} CURRENT ITERATION${colors.reset}`
    );

    const iter = this.state.iterations.get(this.state.currentIteration);
    const status = iter?.status || 'pending';
    const duration = iter?.duration || 0;
    const tokens = iter?.tokens || 0;
    const { icon, color } = this.getStatusIcon(status);
    const isSelected =
      this.selectedIteration === this.state.currentIteration ||
      this.selectedIteration === 0;

    const content: string[] = [];
    if (this.state.currentIteration > 0) {
      const iterNum = `#${this.state.currentIteration}`;
      const iterDisplay = isSelected
        ? `${colors.inverse}${iterNum}${colors.reset}`
        : iterNum;
      content.push(`${color}${icon}${colors.reset} ${iterDisplay} ${status}...`);
      content.push(
        `${colors.dim}${formatDuration(duration)} | ${formatTokens(tokens)} tok${colors.reset}`
      );
    } else {
      content.push(`${colors.dim}Waiting to start...${colors.reset}`);
    }

    lines.push(...drawBox(content, width));
    return lines;
  }

  private renderIterationHistory(width: number, maxItems: number): string[] {
    const lines: string[] = [];
    lines.push(
      `${colors.bold}${colors.white} ITERATION HISTORY${colors.reset}`
    );

    const content: string[] = [];
    const iterations: Iteration[] = [];

    // Collect iterations in reverse order (newest first)
    for (let i = this.state.currentIteration; i >= 1; i--) {
      const iter = this.state.iterations.get(i);
      if (iter && iter.status !== 'pending') {
        iterations.push(iter);
      }
    }

    if (iterations.length === 0) {
      content.push(`${colors.dim}No completed iterations${colors.reset}`);
    } else {
      const visible = iterations.slice(0, maxItems);
      for (const iter of visible) {
        const { icon, color } = this.getStatusIcon(iter.status);
        const isSelected = iter.id === this.selectedIteration;
        const pointer = isSelected ? '▸ ' : '  ';
        const iterNum = `#${iter.id}`;
        const iterDisplay = isSelected
          ? `${colors.inverse}${iterNum}${colors.reset}`
          : iterNum;
        const durStr = `${iter.duration}s`;
        const tokStr =
          iter.tokens >= 1000
            ? `${(iter.tokens / 1000).toFixed(1)}k`
            : `${iter.tokens}t`;
        content.push(
          `${pointer}${iterDisplay} ${color}${icon}${colors.reset} ${colors.dim}${durStr} ${tokStr}${colors.reset}`
        );
      }
    }

    // Pad content to fill available space
    while (content.length < maxItems) {
      content.push('');
    }

    lines.push(...drawBox(content, width));
    return lines;
  }

  private renderOutputPanel(
    width: number,
    height: number
  ): string[] {
    const lines: string[] = [];
    const iterToShow =
      this.selectedIteration || this.state.currentIteration || 0;
    const header =
      iterToShow > 0
        ? `AGENT OUTPUT - Iteration #${iterToShow}`
        : 'AGENT OUTPUT';

    // Get output for selected iteration
    let output = '';
    if (iterToShow > 0) {
      const iter = this.state.iterations.get(iterToShow);
      output = iter?.output || this.getIterationOutput(iterToShow);
    }

    const outputLines = output ? output.split('\n') : [];
    const contentHeight = height - 4; // Account for header and borders
    const contentWidth = width - 4; // Account for borders and padding

    // Calculate scroll position
    const isViewingCurrent =
      (this.selectedIteration === 0 ||
        this.selectedIteration === this.state.currentIteration) &&
      this.state.iterations.get(this.state.currentIteration)?.status ===
        'running';

    let effectiveOffset = this.outputScrollOffset;
    if (isViewingCurrent && outputLines.length > contentHeight) {
      effectiveOffset = Math.max(0, outputLines.length - contentHeight);
    }

    // Calculate scroll percentage
    let scrollPct = 100;
    if (outputLines.length > contentHeight) {
      const maxOffset = outputLines.length - contentHeight;
      const currentOffset = isViewingCurrent ? maxOffset : effectiveOffset;
      scrollPct = Math.min(
        100,
        Math.round(((currentOffset + contentHeight) / outputLines.length) * 100)
      );
    }

    const scrollIndicator =
      outputLines.length > contentHeight
        ? ` ${colors.dim}[${scrollPct}%]${colors.reset}`
        : '';
    lines.push(
      `${colors.bold}${colors.white} ${header}${colors.reset}${scrollIndicator}`
    );

    // Get visible lines
    const visibleLines = outputLines.slice(
      effectiveOffset,
      effectiveOffset + contentHeight
    );

    const content: string[] = [];
    if (visibleLines.length === 0) {
      content.push(`${colors.dim}No output yet...${colors.reset}`);
    } else {
      for (const line of visibleLines) {
        content.push(truncateLine(line, contentWidth));
      }
    }

    // Pad to fill height
    while (content.length < contentHeight) {
      content.push('');
    }

    lines.push(...drawBox(content, width));
    return lines;
  }

  private renderStatusBar(width: number): string[] {
    const shortcuts = `${colors.dim}[↑/↓] Navigate  [q] Quit  [p] Pause  [r] Resume  [?] Help${colors.reset}`;

    let statusText: string;
    let statusColor: string;
    if (this.state.paused) {
      statusText = 'PAUSED';
      statusColor = colors.yellow;
    } else if (this.state.completed) {
      statusText =
        this.state.completionReason === 'marker_detected'
          ? 'COMPLETE'
          : this.state.completionReason.toUpperCase();
      statusColor =
        this.state.completionReason === 'marker_detected'
          ? colors.green
          : colors.yellow;
    } else {
      statusText = 'RUNNING';
      statusColor = colors.green;
    }

    const elapsed = Math.floor((Date.now() - this.state.startTime) / 1000);
    const rightInfo = `${statusColor}${colors.bold}${statusText}${colors.reset} | ${formatDuration(elapsed)} | ${this.state.currentIteration}/${this.state.maxIterations}`;

    // Calculate spacing
    const shortcutsLen = shortcuts.replace(/\x1b\[[0-9;]*m/g, '').length;
    const rightInfoLen = rightInfo.replace(/\x1b\[[0-9;]*m/g, '').length;
    const innerWidth = width - 4;
    const spacing = Math.max(1, innerWidth - shortcutsLen - rightInfoLen);

    const content = [`${shortcuts}${' '.repeat(spacing)}${rightInfo}`];
    return drawBox(content, width);
  }

  private renderHelpOverlay(width: number, height: number): string[] {
    const overlayWidth = Math.min(60, width - 10);
    const overlayHeight = 14;
    const leftPad = Math.floor((width - overlayWidth) / 2);
    const topPad = Math.floor((height - overlayHeight) / 2);

    const shortcuts = [
      ['↑/k, ↓/j', 'Navigate iterations'],
      ['g', 'Jump to first iteration'],
      ['G', 'Jump to current iteration'],
      ['PgUp/PgDn', 'Scroll output'],
      ['p', 'Pause execution'],
      ['r', 'Resume execution'],
      ['q', 'Quit'],
      ['?', 'Toggle this help'],
    ];

    const lines: string[] = [];

    // Draw overlay with double border
    lines.push(
      `${colors.yellow}╔${'═'.repeat(overlayWidth - 2)}╗${colors.reset}`
    );
    lines.push(
      `${colors.yellow}║${colors.reset}${' '.repeat(Math.floor((overlayWidth - 20) / 2))}${colors.bold}${colors.yellow}KEYBOARD SHORTCUTS${colors.reset}${' '.repeat(Math.ceil((overlayWidth - 20) / 2))}${colors.yellow}║${colors.reset}`
    );
    lines.push(
      `${colors.yellow}╠${'═'.repeat(overlayWidth - 2)}╣${colors.reset}`
    );

    for (const [key, desc] of shortcuts) {
      const keyPadded = key.padEnd(14);
      const content = `  ${colors.bold}${keyPadded}${colors.reset}${desc}`;
      const stripped = content.replace(/\x1b\[[0-9;]*m/g, '');
      const padding = overlayWidth - 2 - stripped.length;
      lines.push(
        `${colors.yellow}║${colors.reset}${content}${' '.repeat(Math.max(0, padding))}${colors.yellow}║${colors.reset}`
      );
    }

    lines.push(
      `${colors.yellow}╠${'═'.repeat(overlayWidth - 2)}╣${colors.reset}`
    );
    const closeMsg = 'Press any key to close...';
    const closePad = Math.floor((overlayWidth - 2 - closeMsg.length) / 2);
    lines.push(
      `${colors.yellow}║${colors.reset}${' '.repeat(closePad)}${colors.dim}${closeMsg}${colors.reset}${' '.repeat(overlayWidth - 2 - closePad - closeMsg.length)}${colors.yellow}║${colors.reset}`
    );
    lines.push(
      `${colors.yellow}╚${'═'.repeat(overlayWidth - 2)}╝${colors.reset}`
    );

    // Position the overlay
    const result: string[] = [];
    for (let i = 0; i < topPad; i++) {
      result.push('');
    }
    for (const line of lines) {
      result.push(' '.repeat(leftPad) + line);
    }

    return result;
  }

  private render(): void {
    const { width, height } = this.getTerminalSize();
    const leftPanelWidth = Math.floor(width / 4);
    const rightPanelWidth = width - leftPanelWidth;
    const contentHeight = height - 5; // Reserve space for status bar

    // Build left panel
    const currentIterPanel = this.renderCurrentIterationPanel(leftPanelWidth);
    const historyMaxItems = Math.max(1, contentHeight - currentIterPanel.length - 3);
    const historyPanel = this.renderIterationHistory(
      leftPanelWidth,
      historyMaxItems
    );

    // Build right panel
    const outputPanel = this.renderOutputPanel(rightPanelWidth, contentHeight);

    // Build status bar
    const statusBar = this.renderStatusBar(width);

    // Combine panels side by side
    const leftLines = [...currentIterPanel, ...historyPanel];
    const rightLines = outputPanel;

    // Pad panels to same height
    const maxPanelHeight = Math.max(leftLines.length, rightLines.length);
    while (leftLines.length < maxPanelHeight) {
      leftLines.push(' '.repeat(leftPanelWidth));
    }
    while (rightLines.length < maxPanelHeight) {
      rightLines.push(' '.repeat(rightPanelWidth));
    }

    // Combine into full screen
    const screen: string[] = [];
    for (let i = 0; i < maxPanelHeight; i++) {
      const left = leftLines[i] || '';
      const right = rightLines[i] || '';
      // Pad left panel to exact width
      const leftStripped = left.replace(/\x1b\[[0-9;]*m/g, '');
      const leftPadding = Math.max(0, leftPanelWidth - leftStripped.length);
      screen.push(left + ' '.repeat(leftPadding) + right);
    }

    // Add status bar
    screen.push(...statusBar);

    // Handle help overlay
    if (this.showHelp) {
      const overlay = this.renderHelpOverlay(width, height);
      // Overlay on top of existing content
      for (let i = 0; i < overlay.length && i < screen.length; i++) {
        if (overlay[i]) {
          screen[i] = overlay[i];
        }
      }
    }

    // Render completion message if done
    if (this.state.completed && !this.showHelp) {
      const msg = ` Session complete. Press q to exit... `;
      const msgPad = Math.floor((width - msg.length) / 2);
      const msgY = Math.floor(height / 2);
      if (msgY < screen.length) {
        screen[msgY] =
          ' '.repeat(msgPad) +
          `${colors.bold}${colors.inverse}${msg}${colors.reset}`;
      }
    }

    // Render to terminal
    this.diffy.render(() => trim(screen.join('\n')));
  }

  // --------------------------------------------------------------------------
  // Input Handling
  // --------------------------------------------------------------------------

  private setupInput(): void {
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
    }
    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    process.stdin.on('data', (key: string) => {
      this.handleKey(key);
    });
  }

  private handleKey(key: string): void {
    // Help overlay - any key closes it
    if (this.showHelp) {
      this.showHelp = false;
      this.render();
      return;
    }

    // Quit
    if (key === 'q' || key === 'Q' || key === '\x03' /* Ctrl+C */) {
      this.stop();
      this.cleanup();
      return;
    }

    // Help toggle
    if (key === '?') {
      this.showHelp = true;
      this.render();
      return;
    }

    // Pause/Resume
    if (key === 'p' || key === 'P') {
      this.pause();
      return;
    }
    if (key === 'r' || key === 'R') {
      this.resume();
      return;
    }

    // Navigation - UP (newer iteration)
    if (key === '\x1b[A' || key === 'k') {
      if (
        this.selectedIteration === 0
          ? this.state.currentIteration > 0
          : this.selectedIteration < this.state.currentIteration
      ) {
        this.selectedIteration =
          this.selectedIteration === 0
            ? this.state.currentIteration
            : this.selectedIteration + 1;
        this.outputScrollOffset = 0;
        this.render();
      }
      return;
    }

    // Navigation - DOWN (older iteration)
    if (key === '\x1b[B' || key === 'j') {
      const current =
        this.selectedIteration || this.state.currentIteration;
      if (current > 1) {
        this.selectedIteration = current - 1;
        this.outputScrollOffset = 0;
        this.render();
      }
      return;
    }

    // Jump to first
    if (key === 'g') {
      if (this.state.currentIteration > 0) {
        this.selectedIteration = 1;
        this.outputScrollOffset = 0;
        this.render();
      }
      return;
    }

    // Jump to last (current)
    if (key === 'G') {
      this.selectedIteration = this.state.currentIteration;
      this.outputScrollOffset = 0;
      this.render();
      return;
    }

    // Page Up - scroll output
    if (key === '\x1b[5~') {
      this.outputScrollOffset = Math.max(0, this.outputScrollOffset - 10);
      this.render();
      return;
    }

    // Page Down - scroll output
    if (key === '\x1b[6~') {
      const { height } = this.getTerminalSize();
      const contentHeight = height - 9;
      const iterToShow = this.selectedIteration || this.state.currentIteration;
      const iter = this.state.iterations.get(iterToShow);
      const output = iter?.output || '';
      const totalLines = output.split('\n').length;
      const maxOffset = Math.max(0, totalLines - contentHeight);
      this.outputScrollOffset = Math.min(
        maxOffset,
        this.outputScrollOffset + 10
      );
      this.render();
      return;
    }
  }

  // --------------------------------------------------------------------------
  // Agent Orchestration
  // --------------------------------------------------------------------------

  private getIterationOutput(iteration: number): string {
    const outputFile = path.join(this.stateDir, `${iteration}-output.txt`);
    if (fs.existsSync(outputFile)) {
      return fs.readFileSync(outputFile, 'utf-8');
    }
    return '';
  }

  private updateIteration(id: number, updates: Partial<Iteration>): void {
    const existing = this.state.iterations.get(id) || {
      id,
      status: 'pending' as IterationStatus,
      duration: 0,
      tokens: 0,
      output: '',
    };
    this.state.iterations.set(id, { ...existing, ...updates });
  }

  private createEnhancedPrompt(iteration: number, originalPrompt: string): string {
    const elapsed = Math.floor((Date.now() - this.state.startTime) / 1000);
    const elapsedMin = Math.floor(elapsed / 60);
    const elapsedSec = elapsed % 60;
    const percentage = Math.floor(
      (iteration * 100) / this.config.maxIterations
    );

    let eta = 'N/A';
    if (iteration > 1) {
      const avgTime = elapsed / (iteration - 1);
      const remaining = this.config.maxIterations - iteration;
      const etaSeconds = Math.floor(avgTime * remaining);
      eta = `${Math.floor(etaSeconds / 60)}m`;
    }

    return `<!-- RALPH ORCHESTRATION CONTEXT -->
## Session: ${this.state.sessionId}
Iteration: ${iteration}/${this.config.maxIterations} (${percentage}%)
Elapsed: ${elapsedMin}m ${elapsedSec}s
ETA: ${eta} (estimated)

## Current Objective
Complete the task below. When finished, include one of these markers:
- \`- [x] TASK_COMPLETE\` (markdown checkbox)
- \`RALPH_COMPLETE\` (magic string)

<!-- END RALPH CONTEXT -->

${originalPrompt}`;
  }

  private async runIteration(
    iteration: number,
    prompt: string
  ): Promise<{ output: string; success: boolean }> {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const outputFile = path.join(this.stateDir, `${iteration}-output.txt`);
      let output = '';

      this.updateIteration(iteration, {
        status: 'running',
        startTime,
      });

      if (this.config.dryRun) {
        // Simulate agent execution
        const simulateProgress = (step: number) => {
          if (step > 5 || !this.running) {
            output += `\n[DRY RUN] Iteration ${iteration} complete.`;
            const duration = Math.floor((Date.now() - startTime) / 1000);
            const tokens = Math.floor(Math.random() * 500) + 500;

            fs.writeFileSync(outputFile, output);
            this.updateIteration(iteration, {
              status: 'completed',
              endTime: Date.now(),
              duration,
              tokens,
              output,
            });
            resolve({ output, success: true });
            return;
          }

          output += `[DRY RUN] Step ${step}/5 - Simulated agent output for iteration ${iteration}\n`;
          output += `Working on the task... Progress: ${iteration}/${this.config.maxIterations}\n`;
          this.updateIteration(iteration, {
            duration: Math.floor((Date.now() - startTime) / 1000),
            tokens: output.length / 4,
            output,
          });
          setTimeout(() => simulateProgress(step + 1), 500);
        };
        simulateProgress(1);
        return;
      }

      // Real agent invocation
      const enhancedPrompt = this.createEnhancedPrompt(iteration, prompt);
      const child = spawn(
        'opencode',
        ['run', '--agent', this.config.agentName, enhancedPrompt],
        {
          stdio: ['ignore', 'pipe', 'pipe'],
          cwd: process.cwd(),
        }
      );

      this.agentProcess = child;

      child.stdout?.on('data', (data: Buffer) => {
        const chunk = data.toString();
        output += chunk;

        const now = Date.now();
        const duration = Math.floor((now - startTime) / 1000);
        const tokens = Math.floor(output.length / 4);

        this.updateIteration(iteration, {
          duration,
          tokens,
          output,
        });
      });

      child.stderr?.on('data', (data: Buffer) => {
        output += data.toString();
      });

      child.on('close', (code) => {
        this.agentProcess = null;
        const endTime = Date.now();
        const duration = Math.floor((endTime - startTime) / 1000);
        const tokens = Math.floor(output.length / 4);
        const status: IterationStatus = code === 0 ? 'completed' : 'failed';

        fs.writeFileSync(outputFile, output);
        this.updateIteration(iteration, {
          status,
          endTime,
          duration,
          tokens,
          output,
        });

        resolve({ output, success: code === 0 });
      });

      child.on('error', (err) => {
        this.agentProcess = null;
        output += `\nError: ${err.message}`;
        this.updateIteration(iteration, {
          status: 'failed',
          endTime: Date.now(),
          duration: Math.floor((Date.now() - startTime) / 1000),
          output,
        });
        resolve({ output, success: false });
      });
    });
  }

  private detectInfiniteLoop(output: string): boolean {
    const hash = hashOutput(output);
    this.outputHashes.push(hash);

    if (this.outputHashes.length > 3) {
      this.outputHashes = this.outputHashes.slice(-3);
    }

    if (this.outputHashes.length >= 3) {
      const [a, b, c] = this.outputHashes;
      if (a === b && b === c) {
        return true;
      }
    }

    return false;
  }

  private pause(): void {
    this.state.paused = true;
    if (this.agentProcess) {
      this.agentProcess.kill('SIGSTOP');
    }
  }

  private resume(): void {
    this.state.paused = false;
    if (this.agentProcess) {
      this.agentProcess.kill('SIGCONT');
    }
  }

  private stop(): void {
    this.running = false;
    if (this.agentProcess) {
      this.agentProcess.kill('SIGTERM');
    }
    this.state.completed = true;
    this.state.completionReason = 'user_quit';
  }

  private cleanup(): void {
    if (this.renderInterval) {
      clearInterval(this.renderInterval);
    }
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(false);
    }
    this.diffy.render(() => ''); // Clear screen
    process.exit(0);
  }

  // --------------------------------------------------------------------------
  // Main Loop
  // --------------------------------------------------------------------------

  async run(): Promise<void> {
    // Check TTY
    if (!process.stdin.isTTY) {
      console.error('Error: ralph requires an interactive terminal (TTY).');
      process.exit(1);
    }

    // Setup input handling
    this.setupInput();

    // Start render loop
    this.renderInterval = setInterval(() => {
      this.spinnerFrame = (this.spinnerFrame + 1) % SPINNER_FRAMES.length;
      this.render();
    }, RENDER_INTERVAL_MS);

    // Initial render
    this.render();

    // Load prompt
    const loadPrompt = (): string => {
      if (this.config.promptText) {
        return this.config.promptText;
      }
      if (this.config.promptFile && fs.existsSync(this.config.promptFile)) {
        return fs.readFileSync(this.config.promptFile, 'utf-8');
      }
      return 'No prompt provided';
    };

    const originalPrompt = loadPrompt();

    // Main orchestration loop
    for (
      let i = 1;
      i <= this.config.maxIterations && this.running;
      i++
    ) {
      // Check timeout
      const elapsed = Date.now() - this.state.startTime;
      if (elapsed >= this.config.timeout * 1000) {
        this.state.completed = true;
        this.state.completionReason = 'timeout';
        break;
      }

      // Wait while paused
      while (this.state.paused && this.running) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      if (!this.running) break;

      // Initialize iteration
      this.updateIteration(i, { status: 'pending' });
      this.state.currentIteration = i;

      // Auto-select current iteration if following
      if (
        this.selectedIteration === 0 ||
        this.selectedIteration === i - 1
      ) {
        this.selectedIteration = i;
      }

      // Run the iteration
      const { output, success } = await this.runIteration(i, originalPrompt);

      if (!this.running) break;

      // Check for completion markers
      if (detectCompletion(output)) {
        this.state.completed = true;
        this.state.completionReason = 'marker_detected';
        break;
      }

      // Check for infinite loop
      if (this.detectInfiniteLoop(output)) {
        this.state.completed = true;
        this.state.completionReason = 'infinite_loop';
        break;
      }

      // Sleep between iterations
      if (i < this.config.maxIterations) {
        await new Promise((resolve) =>
          setTimeout(resolve, ITERATION_DELAY_MS)
        );
      }
    }

    // Check if we hit max iterations
    if (
      this.running &&
      !this.state.completed &&
      this.state.currentIteration >= this.config.maxIterations
    ) {
      this.state.completed = true;
      this.state.completionReason = 'max_iterations';
    }

    // Keep rendering until user quits
    this.render();
  }
}

// ============================================================================
// Entry Point
// ============================================================================

const config = parseArgs();
const tui = new RalphTUI(config);
tui.run().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
