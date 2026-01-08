#!/usr/bin/env node

import { existsSync, readFileSync } from 'fs';
import { init, InitOptions } from './init.js';
import { validatePrerequisites } from './validate.js';

function parseArgs(): InitOptions {
  const args = process.argv.slice(2);
  const options: InitOptions = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--non-interactive' || arg === '-n') {
      options.nonInteractive = true;
    } else if (arg === '--config' || arg === '-c') {
      const configPath = args[++i];
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
      printHelp();
      process.exit(0);
    }
  }

  return options;
}

function printHelp(): void {
  console.log(`
yepe - Initialize AI agent blueprint in your project

Usage:
  npx @yepe/init [options]

Options:
  -n, --non-interactive    Run without prompts (uses defaults or config file)
  -c, --config <path>      Path to JSON config file for non-interactive mode
  -h, --help               Show this help message

Config file format:
  {
    "name": "my-project",
    "purpose": "A brief description",
    "techStack": ["TypeScript", "React"],
    "beadsPrefix": "app",
    "selectedSkills": ["research", "qa"]
  }

Examples:
  npx @yepe/init                           # Interactive mode
  npx @yepe/init -n                        # Non-interactive with defaults
  npx @yepe/init -n -c yepe.config.json    # Non-interactive with config
`);
}

async function main() {
  try {
    const options = parseArgs();
    
    // Validate prerequisites before running
    await validatePrerequisites();
    
    // Run the initialization
    await init(options);
    
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
