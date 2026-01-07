import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

export class ValidationError extends Error {
  constructor(message: string, public remediation?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export async function validatePrerequisites(): Promise<void> {
  // Check if we're in a git repository, auto-initialize if not
  if (!existsSync('.git')) {
    console.log('📦 Initializing git repository...');
    try {
      execSync('git init', { stdio: 'ignore' });
      console.log('✓ Git repository initialized\n');
    } catch (error) {
      throw new ValidationError(
        'Failed to initialize git repository',
        'Ensure git is installed and you have write permissions'
      );
    }
  }

  // Check if working tree is clean
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf-8' });
    if (status.trim()) {
      throw new ValidationError(
        'Working tree is not clean',
        'Commit or stash your changes before running yepe:\n  git add .\n  git commit -m "Your changes"\n  # or\n  git stash'
      );
    }
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new ValidationError(
      'Failed to check git status',
      'Ensure git is installed and working properly'
    );
  }

  console.log('✓ Prerequisites validated\n');
}
