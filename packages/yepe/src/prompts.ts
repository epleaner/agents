import { createInterface } from 'readline';

export interface ProjectInfo {
  name: string;
  purpose: string;
  techStack: string[];
  codeStyle: string;
  architecture: string;
  testing: string;
  gitWorkflow: string;
  domain: string;
  constraints: string;
  dependencies: string;
  beadsPrefix: string;
  selectedSkills: string[];
}

export interface SkillInfo {
  name: string;
  description: string;
}

/**
 * Discovers available skills from the blueprint
 */
export function discoverSkills(blueprintDir: string): SkillInfo[] {
  const { readdirSync, existsSync, readFileSync, statSync } = require('fs');
  const { join } = require('path');
  
  const skillsDir = join(blueprintDir, '.opencode/skill');
  if (!existsSync(skillsDir)) {
    return [];
  }

  const skills: SkillInfo[] = [];
  const entries = readdirSync(skillsDir);

  for (const entry of entries) {
    const skillPath = join(skillsDir, entry);
    const stat = statSync(skillPath);
    
    if (stat.isDirectory()) {
      const skillMdPath = join(skillPath, 'SKILL.md');
      if (existsSync(skillMdPath)) {
        try {
          const content = readFileSync(skillMdPath, 'utf-8');
          // Extract description from frontmatter
          const descMatch = content.match(/description:\s*(.+)/);
          const description = descMatch ? descMatch[1].trim() : 'No description available';
          
          skills.push({
            name: entry,
            description,
          });
        } catch (error) {
          // Skip skills that can't be read
        }
      }
    }
  }

  return skills.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Prompts the user to select skills
 */
async function promptSkillSelection(skills: SkillInfo[], question: (prompt: string) => Promise<string>): Promise<string[]> {
  if (skills.length === 0) {
    return [];
  }

  console.log('\n📦 Available skills:');
  console.log('   (These are specialized capabilities for external integrations)\n');
  
  skills.forEach((skill, index) => {
    console.log(`   ${index + 1}. ${skill.name}`);
    console.log(`      ${skill.description}`);
  });

  console.log('\n   0. None (skip all skills)');
  console.log('   a. All skills\n');

  const answer = await question('Select skills (comma-separated numbers, "a" for all, "0" for none): ');
  
  if (answer.toLowerCase() === 'a') {
    return skills.map(s => s.name);
  }
  
  if (answer === '0' || answer === '') {
    return [];
  }

  const selections = answer.split(',').map(s => s.trim());
  const selectedSkills: string[] = [];

  for (const selection of selections) {
    const index = parseInt(selection, 10) - 1;
    if (index >= 0 && index < skills.length) {
      selectedSkills.push(skills[index].name);
    }
  }

  return selectedSkills;
}

/**
 * Prompts the user for project information
 */
export async function promptProjectInfo(blueprintDir: string): Promise<ProjectInfo> {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (prompt: string): Promise<string> => {
    return new Promise((resolve) => {
      rl.question(prompt, (answer) => {
        resolve(answer.trim());
      });
    });
  };

  console.log('\nProject configuration (required fields marked with *):\n');

  try {
    // Required: Project name
    let name = '';
    while (!name) {
      name = await question('* Project name: ');
      if (!name) {
        console.log('  ❌ Project name is required\n');
      }
    }

    // Required: Purpose
    let purpose = '';
    while (!purpose) {
      purpose = await question('* Project purpose (1-2 sentences): ');
      if (!purpose) {
        console.log('  ❌ Project purpose is required\n');
      }
    }

    // Optional: Tech stack
    console.log('\nTech stack (comma-separated, e.g., "TypeScript, React, Node.js"):');
    const techStackInput = await question('> ');
    const techStack = techStackInput
      ? techStackInput.split(',').map(t => t.trim()).filter(Boolean)
      : [];

    // Optional: Code style
    const codeStyle = await question('\nCode style & formatting (e.g., "Prettier, ESLint, 2-space indent"): ');
    
    // Optional: Architecture
    const architecture = await question('Architecture patterns (e.g., "Clean Architecture, DDD, Microservices"): ');
    
    // Optional: Testing
    const testing = await question('Testing strategy (e.g., "Jest unit tests, Playwright E2E, 80% coverage"): ');
    
    // Optional: Git workflow
    const gitWorkflow = await question('Git workflow (e.g., "trunk-based", "GitFlow", "feature branches"): ');

    // Optional: Domain context
    const domain = await question('\nDomain context (what should AI know about your business domain?): ');

    // Optional: Constraints
    const constraints = await question('Important constraints (technical, business, or regulatory): ');

    // Optional: External dependencies
    const dependencies = await question('Key external dependencies (APIs, services, systems): ');

    // Required: Beads prefix
    let beadsPrefix = '';
    while (!beadsPrefix) {
      console.log('\n* Beads prefix (2-4 characters for issue IDs, e.g., "app", "api", "web"):');
      beadsPrefix = await question('> ');
      if (!beadsPrefix) {
        console.log('  ❌ Beads prefix is required\n');
      } else if (beadsPrefix.length < 2 || beadsPrefix.length > 4) {
        console.log('  ❌ Beads prefix must be 2-4 characters\n');
        beadsPrefix = '';
      }
    }

    // Optional: Skill selection
    const skills = discoverSkills(blueprintDir);
    const selectedSkills = await promptSkillSelection(skills, question);

    rl.close();

    return {
      name,
      purpose,
      techStack,
      codeStyle,
      architecture,
      testing,
      gitWorkflow,
      domain,
      constraints,
      dependencies,
      beadsPrefix,
      selectedSkills,
    };
  } catch (error) {
    rl.close();
    throw error;
  }
}

/**
 * Generates customized project.md content
 */
export function generateProjectMd(info: ProjectInfo): string {
  const techStackList = info.techStack.length > 0
    ? info.techStack.map(tech => `- ${tech}`).join('\n')
    : '- [Add your technologies here]';

  return `# Project Context

## Purpose
${info.purpose}

## Tech Stack
${techStackList}

## Project Conventions

### Code Style
${info.codeStyle || '[Describe your code style preferences, formatting rules, and naming conventions]'}

### Architecture Patterns
${info.architecture || '[Document your architectural decisions and patterns]'}

### Testing Strategy
${info.testing || '[Explain your testing approach and requirements]'}

### Git Workflow
${info.gitWorkflow || '[Describe your branching strategy and commit conventions]'}

## Domain Context
${info.domain || '[Add domain-specific knowledge that AI assistants need to understand]'}

## Important Constraints
${info.constraints || '[List any technical, business, or regulatory constraints]'}

## External Dependencies
${info.dependencies || '[Document key external services, APIs, or systems]'}
`;
}

/**
 * Generates customized AGENTS.md header section
 */
export function generateAgentsMdHeader(info: ProjectInfo): string {
  return `<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open \`@/.opencode/openspec/AGENTS.md\` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use \`@/.opencode/openspec/AGENTS.md\` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

# ${info.name} - Agent Instructions

This project uses **bd** (beads) for issue tracking. Run \`bd onboard\` to get started.

## Project Overview

**Purpose:** ${info.purpose}

**Tech Stack:** ${info.techStack.join(', ') || 'See .opencode/openspec/project.md'}

${info.domain ? `**Domain Context:** ${info.domain}\n` : ''}
${info.constraints ? `**Key Constraints:** ${info.constraints}\n` : ''}
`;
}
