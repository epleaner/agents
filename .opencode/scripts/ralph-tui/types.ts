// Types for Ralph TUI

export type IterationStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface Iteration {
  id: number;
  status: IterationStatus;
  startTime?: number;
  endTime?: number;
  duration: number; // seconds
  tokens: number;
  outputFile?: string;
  output: string;
}

export interface SessionState {
  sessionId: string;
  startTime: number;
  maxIterations: number;
  timeout: number;
  paused: boolean;
  completed: boolean;
  completionReason: string;
  currentIteration: number;
  selectedIteration: number;
  iterations: Map<number, Iteration>;
}

export interface AgentConfig {
  promptFile?: string;
  promptText?: string;
  maxIterations: number;
  timeout: number;
  checkpointInterval: number;
  agentName: string;
  dryRun: boolean;
  verbose: boolean;
  resumeSession?: string;
}

export interface TUIState {
  showHelp: boolean;
  outputScrollOffset: number;
  terminalWidth: number;
  terminalHeight: number;
}

export type KeyAction =
  | 'navigate_up'
  | 'navigate_down'
  | 'scroll_up'
  | 'scroll_down'
  | 'scroll_page_up'
  | 'scroll_page_down'
  | 'jump_first'
  | 'jump_last'
  | 'pause'
  | 'resume'
  | 'toggle_help'
  | 'quit';
