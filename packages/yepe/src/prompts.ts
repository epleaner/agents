import { createInterface } from 'readline';
import { basename } from 'path';

export interface ProjectInfo {
  name: string;
  description: string;
  beadsPrefix: string;
  selectedSkills: string[];
}

export interface PromptOptions {
  nonInteractive?: boolean;
  config?: Partial<ProjectInfo>;
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
 * Get default project info based on current directory
 */
function getDefaultProjectInfo(): ProjectInfo {
  const cwd = process.cwd();
  const dirName = basename(cwd);
  
  return {
    name: dirName,
    description: `${dirName} project`,
    beadsPrefix: dirName.substring(0, 3).toLowerCase(),
    selectedSkills: [],
  };
}

/**
 * Prompts the user for project information
 */
export async function promptProjectInfo(blueprintDir: string, options: PromptOptions = {}): Promise<ProjectInfo> {
  // Non-interactive mode: use config or defaults
  if (options.nonInteractive) {
    const defaults = getDefaultProjectInfo();
    const config = options.config || {};
    
    const projectInfo: ProjectInfo = {
      name: config.name || defaults.name,
      description: config.description || defaults.description,
      beadsPrefix: config.beadsPrefix || defaults.beadsPrefix,
      selectedSkills: config.selectedSkills || defaults.selectedSkills,
    };
    
    console.log(`Using non-interactive mode with:`);
    console.log(`  • Name: ${projectInfo.name}`);
    console.log(`  • Description: ${projectInfo.description}`);
    console.log(`  • Beads prefix: ${projectInfo.beadsPrefix}`);
    if (projectInfo.selectedSkills.length > 0) {
      console.log(`  • Skills: ${projectInfo.selectedSkills.join(', ')}`);
    }
    console.log('');
    
    return projectInfo;
  }

  // Interactive mode
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

  console.log('\nProject configuration:\n');

  try {
    // Required: Project name
    let name = '';
    while (!name) {
      name = await question('Project name: ');
      if (!name) {
        console.log('  ❌ Project name is required\n');
      }
    }

    // Required: Description
    let description = '';
    console.log('\nProject description (include relevant details like tech stack, architecture,');
    console.log('testing strategy, domain context, constraints, or external dependencies):');
    while (!description) {
      description = await question('> ');
      if (!description) {
        console.log('  ❌ Project description is required\n');
      }
    }

    // Required: Beads prefix
    let beadsPrefix = '';
    while (!beadsPrefix) {
      console.log('\nBeads prefix (2-4 characters for issue IDs, e.g., "app", "api", "web"):');
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
      description,
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
  return `# Project Context

## Description
${info.description}
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

${info.description}
`;
}
