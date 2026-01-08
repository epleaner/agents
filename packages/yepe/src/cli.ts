#!/usr/bin/env node

import { existsSync, readFileSync } from 'fs';
import { init, InitOptions } from './init.js';
import { pull, PullOptions } from './pull.js';
import { validatePrerequisites } from './validate.js';

type Command = 'init' | 'pull';

interface ParsedArgs {
  command: Command;
  options: InitOptions | PullOptions;
}

function parseArgs(): ParsedArgs {
  const args = process.argv.slice(2);
  
  // Determine command - default to 'init' for backward compatibility
  let command: Command = 'init';
  let optionArgs = args;
  
  if (args[0] === 'init') {
    command = 'init';
    optionArgs = args.slice(1);
  } else if (args[0] === 'pull') {
    command = 'pull';
    optionArgs = args.slice(1);
  } else if (args[0] === '--help' || args[0] === '-h') {
    printHelp();
    process.exit(0);
  }
  
  const options: InitOptions = {};

  for (let i = 0; i < optionArgs.length; i++) {
    const arg = optionArgs[i];
    
    if (arg === '--non-interactive' || arg === '-n') {
      options.nonInteractive = true;
    } else if (arg === '--config' || arg === '-c') {
      const configPath = optionArgs[++i];
      if (!configPath) {
        console.error('❌ --config requires a path argument');
        process.exit(1);
      }
      if (!existsSync(configPath)) {
        console.error(`❌ Config file not found: ${configPath}`);
        process.exit(1);
      }
      try {
        options.config = JSON.parse(readFileSync(configPath, 'utf-8'));
      } catch (error) {
        console.error(`❌ Invalid JSON in config file: ${configPath}`);
        process.exit(1);
      }
    } else if (arg === '--help' || arg === '-h') {
      if (command === 'pull') {
        printPullHelp();
      } else {
        printInitHelp();
      }
      process.exit(0);
    }
  }

  return { command, options };
}

function printHelp(): void {
  console.log(`
yepe - AI agent blueprint scaffolding tool

Usage:
  npx @yepe/init [command] [options]

Commands:
  init     Initialize a new project with the blueprint (default)
  pull     Update existing setup without onboarding prompts

Run 'npx @yepe/init <command> --help' for command-specific help.

Examples:
  npx @yepe/init                # Initialize new project (interactive)
  npx @yepe/init init           # Same as above
  npx @yepe/init pull           # Update existing setup
  npx @yepe/init -n             # Initialize with defaults (non-interactive)
`);
}

function printInitHelp(): void {
  console.log(`
yepe init - Initialize AI agent blueprint in your project

Usage:
  npx @yepe/init [init] [options]

Description:
  Sets up a new project with the yepe blueprint. Prompts for project
  information and copies agent configurations, skills, and commands.
  
  Auto-detects project metadata from package.json, Cargo.toml, 
  pyproject.toml, or README.md when available.

Options:
  -n, --non-interactive    Run without prompts (uses detected values or config)
  -c, --config <path>      Path to JSON config file
  -h, --help               Show this help message

Config file format:
  {
    "name": "my-project",
    "description": "A brief description",
    "beadsPrefix": "app",
    "selectedSkills": ["research", "qa"]
  }

Detection sources (in priority order):
  Project name:        package.json > Cargo.toml > pyproject.toml > directory
  Description:         package.json > Cargo.toml > pyproject.toml > README.md
  Tech stack:          Inferred from dependencies

Examples:
  npx @yepe/init                           # Interactive mode
  npx @yepe/init -n                        # Non-interactive with detection
  npx @yepe/init -n -c yepe.config.json    # Non-interactive with config
`);
}

function printPullHelp(): void {
  console.log(`
yepe pull - Update existing yepe setup

Usage:
  npx @yepe/init pull [options]

Description:
  Updates an existing yepe setup by pulling the latest blueprint files.
  Skips all onboarding prompts - uses existing project.md configuration.
  
  Preserves:
  - Your project.md configuration
  - Custom agents/skills you've added
  - Learnings with existing entries
  
  After update, re-applies promoted learnings to restore customizations.

Options:
  -n, --non-interactive    Run without prompts
  -h, --help               Show this help message

Prerequisites:
  Project must already be initialized with 'npx @yepe/init'.
  Looks for .opencode/openspec/project.md to verify initialization.

Examples:
  npx @yepe/init pull              # Update existing setup
  npx @yepe/init pull -n           # Update in CI/CD pipeline
`);
}

async function main() {
  try {
    const { command, options } = parseArgs();
    
    // Validate prerequisites before running
    await validatePrerequisites();
    
    // Run the appropriate command
    if (command === 'pull') {
      await pull(options as PullOptions);
    } else {
      await init(options as InitOptions);
    }
    
    process.exit(0);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`\n❌ Error: ${error.message}\n`);
    } else {
      console.error(`\n❌ An unexpected error occurred\n`);
    }
    process.exit(1);
  }
}

main();
