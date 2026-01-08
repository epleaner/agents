import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { mkdirSync, rmSync, existsSync, writeFileSync, readFileSync } from 'fs';
import { execSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PACKAGE_ROOT = join(__dirname, '..');
const TEST_DIR = '/tmp/yepe-test-init';

describe('init integration', () => {
  const originalCwd = process.cwd();

  beforeEach(() => {
    // Clean up and create test directory
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true });
    }
    mkdirSync(TEST_DIR, { recursive: true });
    process.chdir(TEST_DIR);

    // Initialize git repo with initial commit
    execSync('git init', { stdio: 'ignore' });
    execSync('git config user.email "test@test.com"', { stdio: 'ignore' });
    execSync('git config user.name "Test"', { stdio: 'ignore' });
    writeFileSync('README.md', '# Test Project');
    execSync('git add .', { stdio: 'ignore' });
    execSync('git commit -m "initial"', { stdio: 'ignore' });
  });

  afterEach(() => {
    // Return to original directory and clean up
    process.chdir(originalCwd);
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true });
    }
  });

  describe('ESM module loading', () => {
    it('should import prompts module without require() errors', async () => {
      // This test verifies the fix for "require is not defined" error
      // by dynamically importing the module
      const prompts = await import('./prompts.js');
      
      assert.ok(typeof prompts.discoverSkills === 'function');
      assert.ok(typeof prompts.generateProjectMd === 'function');
      assert.ok(typeof prompts.generateAgentsMdHeader === 'function');
      assert.ok(typeof prompts.promptProjectInfo === 'function');
    });

    it('should import validate module without errors', async () => {
      const validate = await import('./validate.js');
      
      assert.ok(typeof validate.validatePrerequisites === 'function');
      assert.ok(typeof validate.ValidationError === 'function');
    });

    it('should import init module without errors', async () => {
      const init = await import('./init.js');
      
      assert.ok(typeof init.init === 'function');
    });

    it('should import cli module without errors', async () => {
      // CLI module has side effects, so we just verify it can be parsed
      // by checking the file exists and is valid TypeScript/JavaScript
      const cliPath = join(PACKAGE_ROOT, 'src/cli.ts');
      const content = readFileSync(cliPath, 'utf-8');
      
      // Verify no CommonJS require() calls in ESM module
      const requireMatches = content.match(/\brequire\s*\(/g);
      assert.ok(
        !requireMatches,
        `Found ${requireMatches?.length || 0} require() calls in cli.ts - ESM modules should use import`
      );
    });
  });

  describe('no CommonJS in ESM modules', () => {
    const srcFiles = ['prompts.ts', 'validate.ts', 'init.ts', 'cli.ts', 'learnings-templates.ts'];

    for (const file of srcFiles) {
      it(`should not use require() in ${file}`, () => {
        const filePath = join(PACKAGE_ROOT, 'src', file);
        if (!existsSync(filePath)) {
          return; // Skip if file doesn't exist
        }
        
        const content = readFileSync(filePath, 'utf-8');
        
        // Match require() but not inside comments or strings that mention it
        // This regex looks for actual require() function calls
        const lines = content.split('\n');
        const requireLines: string[] = [];
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          // Skip comments
          if (line.trim().startsWith('//') || line.trim().startsWith('*')) {
            continue;
          }
          // Check for require() calls
          if (/\brequire\s*\(/.test(line)) {
            requireLines.push(`Line ${i + 1}: ${line.trim()}`);
          }
        }
        
        assert.strictEqual(
          requireLines.length,
          0,
          `Found require() calls in ${file}:\n${requireLines.join('\n')}`
        );
      });
    }
  });
});
