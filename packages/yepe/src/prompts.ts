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
}

/**
 * Prompts the user for project information
 */
export async function promptProjectInfo(): Promise<ProjectInfo> {
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

  console.log('\n📝 Let\'s customize this blueprint for your project!\n');
  console.log('Press Enter to skip any optional fields.\n');

  try {
    // Required fields
    const name = await question('Project name: ');
    if (!name) {
      throw new Error('Project name is required');
    }

    const purpose = await question('Project purpose (1-2 sentences): ');
    if (!purpose) {
      throw new Error('Project purpose is required');
    }

    // Tech stack
    console.log('\nTech stack (comma-separated, e.g., "TypeScript, React, Node.js"):');
    const techStackInput = await question('> ');
    const techStack = techStackInput
      ? techStackInput.split(',').map(t => t.trim()).filter(Boolean)
      : [];

    // Optional but recommended
    const codeStyle = await question('\nCode style & formatting (e.g., "Prettier, ESLint, 2-space indent"): ');
    const architecture = await question('Architecture patterns (e.g., "Clean Architecture, DDD, Microservices"): ');
    const testing = await question('Testing strategy (e.g., "Jest unit tests, Playwright E2E, 80% coverage"): ');
    const gitWorkflow = await question('Git workflow (e.g., "trunk-based", "GitFlow", "feature branches"): ');

    // Domain context
    const domain = await question('\nDomain context (what should AI know about your business domain?): ');

    // Constraints
    const constraints = await question('Important constraints (technical, business, or regulatory): ');

    // External dependencies
    const dependencies = await question('Key external dependencies (APIs, services, systems): ');

    // Beads prefix
    console.log('\nBeads prefix (2-4 characters for issue IDs, e.g., "app", "api", "web"):');
    const beadsPrefix = await question('> ');
    if (!beadsPrefix || beadsPrefix.length < 2 || beadsPrefix.length > 4) {
      throw new Error('Beads prefix must be 2-4 characters');
    }

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

Always open \`@/openspec/AGENTS.md\` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use \`@/openspec/AGENTS.md\` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

# ${info.name} - Agent Instructions

This project uses **bd** (beads) for issue tracking. Run \`bd onboard\` to get started.

## Project Overview

**Purpose:** ${info.purpose}

**Tech Stack:** ${info.techStack.join(', ') || 'See openspec/project.md'}

${info.domain ? `**Domain Context:** ${info.domain}\n` : ''}
${info.constraints ? `**Key Constraints:** ${info.constraints}\n` : ''}
`;
}
