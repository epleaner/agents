import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { mkdirSync, rmSync, existsSync, writeFileSync } from 'fs';
import { join } from 'path';

const TEST_DIR = '/tmp/yepe-test-detect';

describe('detect module', () => {
  const originalCwd = process.cwd();

  beforeEach(() => {
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true });
    }
    mkdirSync(TEST_DIR, { recursive: true });
    process.chdir(TEST_DIR);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true });
    }
  });

  describe('detectProjectName', () => {
    it('should detect name from package.json', async () => {
      writeFileSync('package.json', JSON.stringify({
        name: 'my-node-project',
        version: '1.0.0'
      }));

      const { detectProjectName } = await import('./detect.js');
      const name = detectProjectName();
      assert.strictEqual(name, 'my-node-project');
    });

    it('should detect name from Cargo.toml', async () => {
      writeFileSync('Cargo.toml', `
[package]
name = "my-rust-project"
version = "0.1.0"
`);

      const { detectProjectName } = await import('./detect.js');
      const name = detectProjectName();
      assert.strictEqual(name, 'my-rust-project');
    });

    it('should detect name from pyproject.toml [project] section', async () => {
      writeFileSync('pyproject.toml', `
[project]
name = "my-python-project"
version = "0.1.0"
`);

      const { detectProjectName } = await import('./detect.js');
      const name = detectProjectName();
      assert.strictEqual(name, 'my-python-project');
    });

    it('should detect name from pyproject.toml [tool.poetry] section', async () => {
      writeFileSync('pyproject.toml', `
[tool.poetry]
name = "my-poetry-project"
version = "0.1.0"
`);

      const { detectProjectName } = await import('./detect.js');
      const name = detectProjectName();
      assert.strictEqual(name, 'my-poetry-project');
    });

    it('should fallback to directory name when no project files exist', async () => {
      const { detectProjectName } = await import('./detect.js');
      const name = detectProjectName();
      // Should return directory name (yepe-test-detect)
      assert.ok(name);
      assert.ok(typeof name === 'string');
    });

    it('should prefer package.json over Cargo.toml', async () => {
      writeFileSync('package.json', JSON.stringify({ name: 'node-project' }));
      writeFileSync('Cargo.toml', `[package]\nname = "rust-project"`);

      const { detectProjectName } = await import('./detect.js');
      const name = detectProjectName();
      assert.strictEqual(name, 'node-project');
    });
  });

  describe('detectProjectDescription', () => {
    it('should detect description from package.json', async () => {
      writeFileSync('package.json', JSON.stringify({
        name: 'test',
        description: 'A test project description'
      }));

      const { detectProjectDescription } = await import('./detect.js');
      const desc = detectProjectDescription();
      assert.strictEqual(desc, 'A test project description');
    });

    it('should detect description from Cargo.toml', async () => {
      writeFileSync('Cargo.toml', `
[package]
name = "test"
description = "A Rust project description"
`);

      const { detectProjectDescription } = await import('./detect.js');
      const desc = detectProjectDescription();
      assert.strictEqual(desc, 'A Rust project description');
    });

    it('should detect description from README.md first paragraph', async () => {
      writeFileSync('README.md', `# My Project

This is the first paragraph of the README which describes the project.

## Features

Some features here.
`);

      const { detectProjectDescription } = await import('./detect.js');
      const desc = detectProjectDescription();
      assert.strictEqual(desc, 'This is the first paragraph of the README which describes the project.');
    });

    it('should skip badges in README.md', async () => {
      writeFileSync('README.md', `# My Project

[![Build Status](https://example.com/badge.svg)](https://example.com)
![Coverage](https://example.com/coverage.svg)

This is the actual description.
`);

      const { detectProjectDescription } = await import('./detect.js');
      const desc = detectProjectDescription();
      assert.strictEqual(desc, 'This is the actual description.');
    });

    it('should return undefined when no description found', async () => {
      const { detectProjectDescription } = await import('./detect.js');
      const desc = detectProjectDescription();
      assert.strictEqual(desc, undefined);
    });
  });

  describe('detectTechStack', () => {
    it('should detect React from package.json dependencies', async () => {
      writeFileSync('package.json', JSON.stringify({
        name: 'test',
        dependencies: { 'react': '^18.0.0' }
      }));

      const { detectTechStack } = await import('./detect.js');
      const stack = detectTechStack();
      assert.ok(stack.includes('React'));
    });

    it('should detect TypeScript from devDependencies', async () => {
      writeFileSync('package.json', JSON.stringify({
        name: 'test',
        devDependencies: { 'typescript': '^5.0.0' }
      }));

      const { detectTechStack } = await import('./detect.js');
      const stack = detectTechStack();
      assert.ok(stack.includes('TypeScript'));
    });

    it('should detect multiple technologies', async () => {
      writeFileSync('package.json', JSON.stringify({
        name: 'test',
        dependencies: { 
          'next': '^14.0.0',
          'react': '^18.0.0',
          'tailwindcss': '^3.0.0'
        },
        devDependencies: {
          'typescript': '^5.0.0',
          'vitest': '^1.0.0'
        }
      }));

      const { detectTechStack } = await import('./detect.js');
      const stack = detectTechStack();
      assert.ok(stack.includes('Next.js'));
      assert.ok(stack.includes('React'));
      assert.ok(stack.includes('TypeScript'));
      assert.ok(stack.includes('Tailwind CSS'));
      assert.ok(stack.includes('Vitest'));
    });

    it('should detect Rust and common crates from Cargo.toml', async () => {
      writeFileSync('Cargo.toml', `
[package]
name = "test"

[dependencies]
tokio = { version = "1.0", features = ["full"] }
axum = "0.7"
`);

      const { detectTechStack } = await import('./detect.js');
      const stack = detectTechStack();
      assert.ok(stack.includes('Rust'));
      assert.ok(stack.includes('Tokio'));
      assert.ok(stack.includes('Axum'));
    });

    it('should detect Python and common packages from pyproject.toml', async () => {
      writeFileSync('pyproject.toml', `
[project]
name = "test"
dependencies = [
  "fastapi>=0.100.0",
  "sqlalchemy>=2.0.0",
]
`);

      const { detectTechStack } = await import('./detect.js');
      const stack = detectTechStack();
      assert.ok(stack.includes('Python'));
      assert.ok(stack.includes('FastAPI'));
      assert.ok(stack.includes('SQLAlchemy'));
    });

    it('should return empty array when no project files exist', async () => {
      const { detectTechStack } = await import('./detect.js');
      const stack = detectTechStack();
      assert.ok(Array.isArray(stack));
    });

    it('should deduplicate tech stack entries', async () => {
      writeFileSync('package.json', JSON.stringify({
        name: 'test',
        dependencies: { 'react': '^18.0.0' },
        devDependencies: { 'react': '^18.0.0' }
      }));

      const { detectTechStack } = await import('./detect.js');
      const stack = detectTechStack();
      const reactCount = stack.filter(t => t === 'React').length;
      assert.strictEqual(reactCount, 1);
    });
  });

  describe('detectProject', () => {
    it('should return combined detection results', async () => {
      writeFileSync('package.json', JSON.stringify({
        name: 'my-project',
        description: 'My awesome project',
        dependencies: { 'react': '^18.0.0' },
        devDependencies: { 'typescript': '^5.0.0' }
      }));

      const { detectProject } = await import('./detect.js');
      const result = detectProject();
      
      assert.strictEqual(result.name, 'my-project');
      assert.strictEqual(result.description, 'My awesome project');
      assert.ok(result.techStack?.includes('React'));
      assert.ok(result.techStack?.includes('TypeScript'));
    });

    it('should handle missing files gracefully', async () => {
      const { detectProject } = await import('./detect.js');
      const result = detectProject();
      
      // Should not throw, should return partial results
      assert.ok(typeof result === 'object');
      assert.ok('name' in result);
      assert.ok('description' in result);
      assert.ok('techStack' in result);
    });

    it('should handle malformed JSON gracefully', async () => {
      writeFileSync('package.json', '{ invalid json }');

      const { detectProject } = await import('./detect.js');
      const result = detectProject();
      
      // Should not throw
      assert.ok(typeof result === 'object');
    });

    it('should handle malformed TOML gracefully', async () => {
      writeFileSync('Cargo.toml', 'this is not valid toml [[[');

      const { detectProject } = await import('./detect.js');
      const result = detectProject();
      
      // Should not throw
      assert.ok(typeof result === 'object');
    });
  });
});
