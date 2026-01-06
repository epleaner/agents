import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, statSync, copyFileSync } from 'fs';
import { join, dirname, relative } from 'path';
import { execSync } from 'child_process';
import { ValidationError } from './validate.js';

const BLUEPRINT_REPO = 'https://github.com/anomalyco/agents.git';
const STAGING_DIR = '.opencode/.yepe-tmp';
const REPORT_FILE = '.yepe-report.json';

interface FileChange {
  path: string;
  status: 'added' | 'conflict' | 'skipped';
  reason?: string;
}

interface Report {
  version: string;
  timestamp: string;
  changes: FileChange[];
  conflicts: string[];
  summary: {
    added: number;
    conflicts: number;
    skipped: number;
  };
}

/**
 * Blueprint files to copy from the source repository
 */
const BLUEPRINT_FILES = [
  'AGENTS.md',
  '.opencode/agent/',
  '.opencode/command/',
  '.opencode/skill/',
  '.opencode/templates/',
  '.opencode/package.json',
  '.opencode/.gitignore',
  'openspec/AGENTS.md',
  'openspec/project.md',
  'learnings/',
  'bin/review-learnings',
];

export async function init(): Promise<void> {
  console.log('🚀 Initializing yepe blueprint...\n');

  // Step 1: Clone/download blueprint assets
  await downloadBlueprint();

  // Step 2: Detect conflicts and stage files
  const report = await stageFiles();

  // Step 3: Copy non-conflicting files
  await copyFiles(report);

  // Step 4: Generate report
  await generateReport(report);

  // Step 5: Cleanup
  cleanup();

  // Step 6: Print summary
  printSummary(report);
}

async function downloadBlueprint(): Promise<void> {
  console.log('📥 Downloading blueprint from repository...');

  // Create staging directory
  if (existsSync(STAGING_DIR)) {
    execSync(`rm -rf ${STAGING_DIR}`, { stdio: 'ignore' });
  }
  mkdirSync(STAGING_DIR, { recursive: true });

  try {
    // Clone the repository (shallow clone for speed)
    execSync(
      `git clone --depth 1 ${BLUEPRINT_REPO} ${STAGING_DIR}`,
      { stdio: 'ignore' }
    );
    console.log('✓ Blueprint downloaded\n');
  } catch (error) {
    throw new ValidationError(
      'Failed to download blueprint',
      `Ensure you have internet connection and git is installed`
    );
  }
}

async function stageFiles(): Promise<Report> {
  console.log('🔍 Analyzing files...');

  const changes: FileChange[] = [];
  const conflicts: string[] = [];

  for (const blueprintPath of BLUEPRINT_FILES) {
    const sourcePath = join(STAGING_DIR, blueprintPath);
    
    if (!existsSync(sourcePath)) {
      continue;
    }

    const stat = statSync(sourcePath);
    
    if (stat.isDirectory()) {
      // Process directory recursively
      processDirectory(sourcePath, blueprintPath, changes, conflicts);
    } else {
      // Process single file
      processFile(sourcePath, blueprintPath, changes, conflicts);
    }
  }

  const report: Report = {
    version: getBlueprintVersion(),
    timestamp: new Date().toISOString(),
    changes,
    conflicts,
    summary: {
      added: changes.filter(c => c.status === 'added').length,
      conflicts: conflicts.length,
      skipped: changes.filter(c => c.status === 'skipped').length,
    },
  };

  console.log(`✓ Analysis complete: ${report.summary.added} to add, ${report.summary.conflicts} conflicts\n`);

  return report;
}

function processDirectory(sourcePath: string, blueprintPath: string, changes: FileChange[], conflicts: string[]): void {
  const entries = readdirSync(sourcePath);

  for (const entry of entries) {
    // Skip git directory and node_modules
    if (entry === '.git' || entry === 'node_modules') {
      continue;
    }

    const entrySourcePath = join(sourcePath, entry);
    const entryBlueprintPath = blueprintPath.endsWith('/') 
      ? `${blueprintPath}${entry}`
      : `${blueprintPath}/${entry}`;

    const stat = statSync(entrySourcePath);

    if (stat.isDirectory()) {
      processDirectory(entrySourcePath, entryBlueprintPath, changes, conflicts);
    } else {
      processFile(entrySourcePath, entryBlueprintPath, changes, conflicts);
    }
  }
}

function processFile(sourcePath: string, targetPath: string, changes: FileChange[], conflicts: string[]): void {
  // Check if file already exists in target
  if (existsSync(targetPath)) {
    // File exists - mark as conflict
    changes.push({
      path: targetPath,
      status: 'conflict',
      reason: 'File already exists',
    });
    conflicts.push(targetPath);
  } else {
    // File doesn't exist - safe to add
    changes.push({
      path: targetPath,
      status: 'added',
    });
  }
}

async function copyFiles(report: Report): Promise<void> {
  console.log('📋 Copying files...');

  let copied = 0;

  for (const change of report.changes) {
    if (change.status === 'added') {
      const sourcePath = join(STAGING_DIR, change.path);
      const targetPath = change.path;

      // Create directory if it doesn't exist
      const targetDir = dirname(targetPath);
      if (!existsSync(targetDir)) {
        mkdirSync(targetDir, { recursive: true });
      }

      // Copy file
      copyFileSync(sourcePath, targetPath);
      copied++;
    }
  }

  console.log(`✓ Copied ${copied} files\n`);
}

async function generateReport(report: Report): Promise<void> {
  writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2));
  console.log(`✓ Report saved to ${REPORT_FILE}\n`);
}

function cleanup(): void {
  if (existsSync(STAGING_DIR)) {
    execSync(`rm -rf ${STAGING_DIR}`, { stdio: 'ignore' });
  }
}

function getBlueprintVersion(): string {
  try {
    const packagePath = join(STAGING_DIR, 'package.json');
    if (existsSync(packagePath)) {
      const pkg = JSON.parse(readFileSync(packagePath, 'utf-8'));
      return pkg.version || 'unknown';
    }
  } catch (error) {
    // Ignore errors
  }
  return 'unknown';
}

function printSummary(report: Report): void {
  console.log('📊 Summary:');
  console.log(`   • Added: ${report.summary.added} files`);
  console.log(`   • Conflicts: ${report.summary.conflicts} files`);
  console.log(`   • Skipped: ${report.summary.skipped} files`);

  if (report.conflicts.length > 0) {
    console.log('\n⚠️  Conflicts detected:');
    report.conflicts.forEach(path => {
      console.log(`   • ${path}`);
    });
    console.log('\nReview these files manually and merge as needed.');
  }

  console.log('\n✨ Next steps:');
  console.log('   1. Review changes: git status');
  console.log('   2. Review conflicts in .yepe-report.json');
  if (existsSync('openspec')) {
    console.log('   3. Initialize OpenSpec: (already exists)');
  } else {
    console.log('   3. Initialize OpenSpec: openspec init');
  }
  if (existsSync('.beads')) {
    console.log('   4. Initialize beads: (already exists)');
  } else {
    console.log('   4. Initialize beads: bd init');
  }
  console.log('   5. Commit changes: git add . && git commit -m "Add yepe blueprint"\n');
}
