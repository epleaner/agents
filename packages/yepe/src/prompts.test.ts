import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'fs';
import { join } from 'path';
import { discoverSkills, generateProjectMd, generateAgentsMdHeader } from './prompts.js';

const TEST_DIR = '/tmp/yepe-test-prompts';

describe('prompts', () => {
  beforeEach(() => {
    // Clean up and create test directory
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true });
    }
    mkdirSync(TEST_DIR, { recursive: true });
  });

  afterEach(() => {
    // Clean up test directory
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true });
    }
  });

  describe('discoverSkills', () => {
    it('should return empty array when skills directory does not exist', () => {
      const skills = discoverSkills(TEST_DIR);
      assert.deepStrictEqual(skills, []);
    });

    it('should return empty array when skills directory is empty', () => {
      mkdirSync(join(TEST_DIR, '.opencode/skill'), { recursive: true });
      const skills = discoverSkills(TEST_DIR);
      assert.deepStrictEqual(skills, []);
    });

    it('should discover skills with SKILL.md files', () => {
      const skillDir = join(TEST_DIR, '.opencode/skill/test-skill');
      mkdirSync(skillDir, { recursive: true });
      writeFileSync(
        join(skillDir, 'SKILL.md'),
        '---\ndescription: A test skill for testing\n---\n\n# Test Skill'
      );

      const skills = discoverSkills(TEST_DIR);
      
      assert.strictEqual(skills.length, 1);
      assert.strictEqual(skills[0].name, 'test-skill');
      assert.strictEqual(skills[0].description, 'A test skill for testing');
    });

    it('should skip directories without SKILL.md', () => {
      const skillDir = join(TEST_DIR, '.opencode/skill/no-skill-md');
      mkdirSync(skillDir, { recursive: true });
      writeFileSync(join(skillDir, 'README.md'), '# Not a skill');

      const skills = discoverSkills(TEST_DIR);
      assert.deepStrictEqual(skills, []);
    });

    it('should handle multiple skills and sort alphabetically', () => {
      const skillsDir = join(TEST_DIR, '.opencode/skill');
      
      // Create skills in non-alphabetical order
      for (const name of ['zebra', 'alpha', 'middle']) {
        const dir = join(skillsDir, name);
        mkdirSync(dir, { recursive: true });
        writeFileSync(
          join(dir, 'SKILL.md'),
          `---\ndescription: ${name} skill\n---`
        );
      }

      const skills = discoverSkills(TEST_DIR);
      
      assert.strictEqual(skills.length, 3);
      assert.strictEqual(skills[0].name, 'alpha');
      assert.strictEqual(skills[1].name, 'middle');
      assert.strictEqual(skills[2].name, 'zebra');
    });

    it('should use default description when not found in SKILL.md', () => {
      const skillDir = join(TEST_DIR, '.opencode/skill/no-desc');
      mkdirSync(skillDir, { recursive: true });
      writeFileSync(join(skillDir, 'SKILL.md'), '# Just a title');

      const skills = discoverSkills(TEST_DIR);
      
      assert.strictEqual(skills.length, 1);
      assert.strictEqual(skills[0].description, 'No description available');
    });
  });

  describe('generateProjectMd', () => {
    it('should generate project.md with description', () => {
      const content = generateProjectMd({
        name: 'test-project',
        description: 'A test project for testing purposes',
        beadsPrefix: 'tst',
        selectedSkills: [],
      });

      assert.ok(content.includes('# Project Context'));
      assert.ok(content.includes('A test project for testing purposes'));
    });
  });

  describe('generateAgentsMdHeader', () => {
    it('should generate AGENTS.md header with project name', () => {
      const content = generateAgentsMdHeader({
        name: 'my-awesome-project',
        description: 'An awesome project',
        beadsPrefix: 'map',
        selectedSkills: [],
      });

      assert.ok(content.includes('# my-awesome-project - Agent Instructions'));
      assert.ok(content.includes('An awesome project'));
      assert.ok(content.includes('<!-- OPENSPEC:START -->'));
      assert.ok(content.includes('<!-- OPENSPEC:END -->'));
    });

    it('should include beads onboarding instruction', () => {
      const content = generateAgentsMdHeader({
        name: 'test',
        description: 'test',
        beadsPrefix: 'tst',
        selectedSkills: [],
      });

      assert.ok(content.includes('bd onboard'));
    });
  });
});
