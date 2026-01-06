#!/usr/bin/env node

import { init } from './init.js';
import { validatePrerequisites } from './validate.js';

async function main() {
  try {
    // Validate prerequisites before running
    await validatePrerequisites();
    
    // Run the initialization
    await init();
    
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
