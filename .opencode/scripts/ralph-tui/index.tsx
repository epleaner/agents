#!/usr/bin/env npx tsx
import React from 'react';
import { render } from 'ink';
import meow from 'meow';
import * as fs from 'fs';
import * as path from 'path';
import { App } from './App.js';
import type { AgentConfig } from './types.js';

const cli = meow(
  `
  Usage
    $ ralph-tui "inline prompt" [options]
    $ ralph-tui --prompt <file> [options]

  Options
    --prompt, -p        Path to prompt file
    --max-iterations    Maximum iterations (default: 50)
    --timeout           Timeout in seconds (default: 7200)
    --checkpoint        Checkpoint interval (default: 10)
    --agent             Agent name (default: orchestrator)
    --dry-run           Simulate execution
    --verbose           Verbose output
    --resume            Resume session ID

  Examples
    $ ralph-tui "Implement user authentication"
    $ ralph-tui --prompt task.md --max-iterations 30
    $ ralph-tui "Fix the bug" --dry-run
`,
  {
    importMeta: import.meta,
    flags: {
      prompt: {
        type: 'string',
        shortFlag: 'p',
      },
      maxIterations: {
        type: 'number',
        default: 50,
      },
      timeout: {
        type: 'number',
        default: 7200,
      },
      checkpoint: {
        type: 'number',
        default: 10,
      },
      agent: {
        type: 'string',
        default: 'orchestrator',
      },
      dryRun: {
        type: 'boolean',
        default: false,
      },
      verbose: {
        type: 'boolean',
        default: false,
      },
      resume: {
        type: 'string',
      },
      help: {
        type: 'boolean',
        shortFlag: 'h',
      },
    },
  }
);

// Get inline prompt from positional argument
const inlinePrompt = cli.input[0];

// Validate prompt
if (!inlinePrompt && !cli.flags.prompt && !cli.flags.resume) {
  console.error('Error: Prompt required. Provide inline text or use --prompt <file>');
  console.error('Use --help for usage information.');
  process.exit(1);
}

// Validate prompt file exists
if (cli.flags.prompt && !fs.existsSync(cli.flags.prompt)) {
  console.error(`Error: Prompt file not found: ${cli.flags.prompt}`);
  process.exit(1);
}

const config: AgentConfig = {
  promptFile: cli.flags.prompt,
  promptText: inlinePrompt,
  maxIterations: cli.flags.maxIterations,
  timeout: cli.flags.timeout,
  checkpointInterval: cli.flags.checkpoint,
  agentName: cli.flags.agent,
  dryRun: cli.flags.dryRun,
  verbose: cli.flags.verbose,
  resumeSession: cli.flags.resume,
};

// Check if we're in a TTY environment
if (!process.stdin.isTTY) {
  console.error('Error: ralph-tui requires an interactive terminal (TTY).');
  console.error('Run this command directly in a terminal, not through a pipe or script.');
  process.exit(1);
}

// Render the TUI
const { waitUntilExit } = render(<App config={config} />, {
  exitOnCtrlC: false,
});

waitUntilExit().then(() => {
  process.exit(0);
});
