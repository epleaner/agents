import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { mkdirSync, rmSync, existsSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';
import { validatePrerequisites, ValidationError } from './validate.js';

const TEST_DIR = '/tmp/yepe-test-validate';

describe('validate', () => {
  const originalCwd = process.cwd();

  beforeEach(() => {
    // Clean up and create test directory
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true });
    }
    mkdirSync(TEST_DIR, { recursive: true });
    process.chdir(TEST_DIR);
  });

  afterEach(() => {
    // Return to original directory and clean up
    process.chdir(originalCwd);
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true });
    }
  });

  describe('validatePrerequisites', () => {
    it('should auto-initialize git repository if not present', async () => {
      assert.ok(!existsSync('.git'), 'Should not have .git initially');
      
      await validatePrerequisites();
      
      assert.ok(existsSync('.git'), 'Should have .git after validation');
    });

    it('should pass with clean git repository', async () => {
      // Initialize git repo with initial commit
      execSync('git init', { stdio: 'ignore' });
      execSync('git config user.email "test@test.com"', { stdio: 'ignore' });
      execSync('git config user.name "Test"', { stdio: 'ignore' });
      writeFileSync('README.md', '# Test');
      execSync('git add .', { stdio: 'ignore' });
      execSync('git commit -m "initial"', { stdio: 'ignore' });

      // Should not throw
      await validatePrerequisites();
    });

    it('should throw ValidationError for dirty working tree', async () => {
      // Initialize git repo with initial commit
      execSync('git init', { stdio: 'ignore' });
      execSync('git config user.email "test@test.com"', { stdio: 'ignore' });
      execSync('git config user.name "Test"', { stdio: 'ignore' });
      writeFileSync('README.md', '# Test');
      execSync('git add .', { stdio: 'ignore' });
      execSync('git commit -m "initial"', { stdio: 'ignore' });

      // Create uncommitted changes
      writeFileSync('dirty.txt', 'uncommitted');

      await assert.rejects(
        async () => validatePrerequisites(),
        (err: Error) => {
          assert.ok(err instanceof ValidationError);
          assert.ok(err.message.includes('not clean'));
          return true;
        }
      );
    });

    it('should throw ValidationError for staged but uncommitted changes', async () => {
      // Initialize git repo with initial commit
      execSync('git init', { stdio: 'ignore' });
      execSync('git config user.email "test@test.com"', { stdio: 'ignore' });
      execSync('git config user.name "Test"', { stdio: 'ignore' });
      writeFileSync('README.md', '# Test');
      execSync('git add .', { stdio: 'ignore' });
      execSync('git commit -m "initial"', { stdio: 'ignore' });

      // Create staged but uncommitted changes
      writeFileSync('staged.txt', 'staged');
      execSync('git add staged.txt', { stdio: 'ignore' });

      await assert.rejects(
        async () => validatePrerequisites(),
        (err: Error) => {
          assert.ok(err instanceof ValidationError);
          return true;
        }
      );
    });
  });

  describe('ValidationError', () => {
    it('should include remediation message', () => {
      const error = new ValidationError('Test error', 'Try this fix');
      
      assert.strictEqual(error.message, 'Test error');
      assert.strictEqual(error.remediation, 'Try this fix');
      assert.strictEqual(error.name, 'ValidationError');
    });
  });
});
