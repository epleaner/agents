import { existsSync, readFileSync } from 'fs';
import { basename, join } from 'path';

export interface DetectedProject {
  name?: string;
  description?: string;
  techStack?: string[];
}

/**
 * Main detection function that aggregates all detection sources
 */
export function detectProject(): DetectedProject {
  return {
    name: detectProjectName(),
    description: detectProjectDescription(),
    techStack: detectTechStack(),
  };
}

/**
 * Detect project name from common project files
 * Priority: package.json > Cargo.toml > pyproject.toml > directory name
 */
export function detectProjectName(): string | undefined {
  // 1. Check package.json
  const packageJsonName = readPackageJsonField('name');
  if (packageJsonName) return packageJsonName;

  // 2. Check Cargo.toml
  const cargoName = readCargoTomlField('name');
  if (cargoName) return cargoName;

  // 3. Check pyproject.toml
  const pyprojectName = readPyprojectTomlField('name');
  if (pyprojectName) return pyprojectName;

  // 4. Fallback to directory name
  return basename(process.cwd());
}

/**
 * Detect project description from common project files
 * Priority: package.json > Cargo.toml > pyproject.toml > README.md first paragraph
 */
export function detectProjectDescription(): string | undefined {
  // 1. Check package.json
  const packageJsonDesc = readPackageJsonField('description');
  if (packageJsonDesc) return packageJsonDesc;

  // 2. Check Cargo.toml
  const cargoDesc = readCargoTomlField('description');
  if (cargoDesc) return cargoDesc;

  // 3. Check pyproject.toml
  const pyprojectDesc = readPyprojectTomlField('description');
  if (pyprojectDesc) return pyprojectDesc;

  // 4. Check README.md first paragraph
  const readmeDesc = extractReadmeDescription();
  if (readmeDesc) return readmeDesc;

  return undefined;
}

/**
 * Detect tech stack from project dependencies
 * Returns array of detected frameworks/libraries
 */
export function detectTechStack(): string[] {
  const techStack: string[] = [];

  // Detect from package.json
  const npmTech = detectNpmTechStack();
  techStack.push(...npmTech);

  // Detect from Cargo.toml
  const cargoTech = detectCargoTechStack();
  techStack.push(...cargoTech);

  // Detect from pyproject.toml
  const pythonTech = detectPythonTechStack();
  techStack.push(...pythonTech);

  return [...new Set(techStack)]; // Deduplicate
}

// ============= Helper Functions =============

/**
 * Safely read and parse package.json
 */
function readPackageJson(): Record<string, unknown> | null {
  const packageJsonPath = join(process.cwd(), 'package.json');
  if (!existsSync(packageJsonPath)) return null;

  try {
    const content = readFileSync(packageJsonPath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

/**
 * Read a specific field from package.json
 */
function readPackageJsonField(field: string): string | undefined {
  const pkg = readPackageJson();
  if (!pkg) return undefined;

  const value = pkg[field];
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

/**
 * Safely read Cargo.toml content
 */
function readCargoToml(): string | null {
  const cargoPath = join(process.cwd(), 'Cargo.toml');
  if (!existsSync(cargoPath)) return null;

  try {
    return readFileSync(cargoPath, 'utf-8');
  } catch {
    return null;
  }
}

/**
 * Read a specific field from Cargo.toml [package] section
 */
function readCargoTomlField(field: string): string | undefined {
  const content = readCargoToml();
  if (!content) return undefined;

  // Simple TOML parsing for [package] section
  const packageMatch = content.match(/\[package\]([\s\S]*?)(?=\n\[|$)/);
  if (!packageMatch) return undefined;

  const packageSection = packageMatch[1];
  const fieldMatch = packageSection.match(new RegExp(`^${field}\\s*=\\s*"([^"]*)"`, 'm'));
  
  return fieldMatch?.[1]?.trim() || undefined;
}

/**
 * Safely read pyproject.toml content
 */
function readPyprojectToml(): string | null {
  const pyprojectPath = join(process.cwd(), 'pyproject.toml');
  if (!existsSync(pyprojectPath)) return null;

  try {
    return readFileSync(pyprojectPath, 'utf-8');
  } catch {
    return null;
  }
}

/**
 * Read a specific field from pyproject.toml
 * Checks both [project] and [tool.poetry] sections
 */
function readPyprojectTomlField(field: string): string | undefined {
  const content = readPyprojectToml();
  if (!content) return undefined;

  // Try [project] section first
  const projectMatch = content.match(/\[project\]([\s\S]*?)(?=\n\[|$)/);
  if (projectMatch) {
    const projectSection = projectMatch[1];
    const fieldMatch = projectSection.match(new RegExp(`^${field}\\s*=\\s*"([^"]*)"`, 'm'));
    if (fieldMatch?.[1]?.trim()) return fieldMatch[1].trim();
  }

  // Try [tool.poetry] section
  const poetryMatch = content.match(/\[tool\.poetry\]([\s\S]*?)(?=\n\[|$)/);
  if (poetryMatch) {
    const poetrySection = poetryMatch[1];
    const fieldMatch = poetrySection.match(new RegExp(`^${field}\\s*=\\s*"([^"]*)"`, 'm'));
    if (fieldMatch?.[1]?.trim()) return fieldMatch[1].trim();
  }

  return undefined;
}

/**
 * Extract description from README.md first non-heading paragraph
 */
function extractReadmeDescription(): string | undefined {
  const readmePath = join(process.cwd(), 'README.md');
  if (!existsSync(readmePath)) return undefined;

  try {
    const content = readFileSync(readmePath, 'utf-8');
    const lines = content.split('\n');
    
    let foundHeading = false;
    const paragraphLines: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      
      // Skip empty lines before first content
      if (!trimmed && paragraphLines.length === 0) continue;
      
      // Skip headings
      if (trimmed.startsWith('#')) {
        foundHeading = true;
        // If we already collected paragraph content, stop
        if (paragraphLines.length > 0) break;
        continue;
      }

      // Skip badges (common at top of READMEs)
      if (trimmed.startsWith('[![') || trimmed.startsWith('![')) continue;
      
      // Skip HTML comments
      if (trimmed.startsWith('<!--')) continue;

      // If we hit an empty line after collecting content, we're done
      if (!trimmed && paragraphLines.length > 0) break;

      // Collect paragraph content
      if (trimmed) {
        paragraphLines.push(trimmed);
      }
    }

    if (paragraphLines.length === 0) return undefined;

    const description = paragraphLines.join(' ');
    // Limit length for usability
    return description.length > 200 ? description.substring(0, 200) + '...' : description;
  } catch {
    return undefined;
  }
}

/**
 * Detect tech stack from npm dependencies
 */
function detectNpmTechStack(): string[] {
  const pkg = readPackageJson();
  if (!pkg) return [];

  const tech: string[] = [];
  const deps = {
    ...(typeof pkg.dependencies === 'object' ? pkg.dependencies : {}),
    ...(typeof pkg.devDependencies === 'object' ? pkg.devDependencies : {}),
  } as Record<string, string>;

  // Framework detection
  const frameworkMap: Record<string, string> = {
    'react': 'React',
    'next': 'Next.js',
    'vue': 'Vue',
    'nuxt': 'Nuxt',
    '@angular/core': 'Angular',
    'svelte': 'Svelte',
    'express': 'Express',
    'fastify': 'Fastify',
    'koa': 'Koa',
    'nest': 'NestJS',
    '@nestjs/core': 'NestJS',
    'hono': 'Hono',
    'electron': 'Electron',
    'react-native': 'React Native',
    'remix': 'Remix',
    '@remix-run/node': 'Remix',
    'gatsby': 'Gatsby',
    'astro': 'Astro',
  };

  // Language/build tool detection
  const toolMap: Record<string, string> = {
    'typescript': 'TypeScript',
    'vite': 'Vite',
    'webpack': 'Webpack',
    'esbuild': 'esbuild',
    'rollup': 'Rollup',
    'tailwindcss': 'Tailwind CSS',
    'prisma': 'Prisma',
    '@prisma/client': 'Prisma',
    'drizzle-orm': 'Drizzle',
    'sequelize': 'Sequelize',
    'mongoose': 'Mongoose',
    'jest': 'Jest',
    'vitest': 'Vitest',
    'mocha': 'Mocha',
    'playwright': 'Playwright',
    'cypress': 'Cypress',
  };

  // Check frameworks first (higher priority)
  for (const [dep, name] of Object.entries(frameworkMap)) {
    if (deps[dep]) {
      tech.push(name);
    }
  }

  // Check tools
  for (const [dep, name] of Object.entries(toolMap)) {
    if (deps[dep]) {
      tech.push(name);
    }
  }

  return tech;
}

/**
 * Detect tech stack from Cargo.toml dependencies
 */
function detectCargoTechStack(): string[] {
  const content = readCargoToml();
  if (!content) return [];

  const tech: string[] = ['Rust'];

  // Common Rust crates/frameworks
  const crateMap: Record<string, string> = {
    'tokio': 'Tokio',
    'actix-web': 'Actix',
    'axum': 'Axum',
    'rocket': 'Rocket',
    'warp': 'Warp',
    'diesel': 'Diesel',
    'sqlx': 'SQLx',
    'sea-orm': 'SeaORM',
    'serde': 'Serde',
    'clap': 'Clap',
    'tauri': 'Tauri',
    'bevy': 'Bevy',
    'yew': 'Yew',
    'leptos': 'Leptos',
    'dioxus': 'Dioxus',
  };

  for (const [crate, name] of Object.entries(crateMap)) {
    // Simple check for crate in dependencies
    if (content.includes(`${crate} =`) || content.includes(`${crate}=`)) {
      tech.push(name);
    }
  }

  return tech;
}

/**
 * Detect tech stack from pyproject.toml dependencies
 */
function detectPythonTechStack(): string[] {
  const content = readPyprojectToml();
  if (!content) return [];

  const tech: string[] = ['Python'];

  // Common Python packages/frameworks
  const packageMap: Record<string, string> = {
    'fastapi': 'FastAPI',
    'django': 'Django',
    'flask': 'Flask',
    'starlette': 'Starlette',
    'aiohttp': 'aiohttp',
    'sqlalchemy': 'SQLAlchemy',
    'alembic': 'Alembic',
    'pydantic': 'Pydantic',
    'pytest': 'pytest',
    'numpy': 'NumPy',
    'pandas': 'pandas',
    'scikit-learn': 'scikit-learn',
    'tensorflow': 'TensorFlow',
    'pytorch': 'PyTorch',
    'torch': 'PyTorch',
    'langchain': 'LangChain',
    'openai': 'OpenAI',
    'celery': 'Celery',
    'redis': 'Redis',
  };

  for (const [pkg, name] of Object.entries(packageMap)) {
    // Check in dependencies sections (handles various formats)
    if (content.includes(`"${pkg}"`) || content.includes(`'${pkg}'`) || 
        content.includes(`${pkg} =`) || content.includes(`${pkg}=`) ||
        content.includes(`${pkg}>=`) || content.includes(`${pkg}<=`) ||
        content.includes(`${pkg}[`)) {
      tech.push(name);
    }
  }

  return tech;
}
