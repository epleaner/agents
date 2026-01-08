import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, statSync, copyFileSync } from 'fs';
import { join, dirname, basename } from 'path';
import { execSync } from 'child_process';
import { ValidationError } from './validate.js';
import { getLearningsTemplate } from './learnings-templates.js';

const BLUEPRINT_REPO = 'https://github.com/epleaner/agents.git';
const STAGING_DIR = '.opencode/.yepe-tmp';
const REPORT_FILE = '.yepe-report.json';
const PROJECT_MD_PATH = '.opencode/openspec/project.md';

export interface PullOptions {
  nonInteractive?: boolean;
}

interface FileChange {
  path: string;
  status: 'added' | 'updated' | 'conflict' | 'skipped';
  reason?: string;
}

interface Report {
  version: string;
  timestamp: string;
  changes: FileChange[];
  conflicts: string[];
  summary: {
    added: number;
    updated: number;
    conflicts: number;
    skipped: number;
  };
}

/**
 * Source to target path mapping for blueprint files
 */
const BLUEPRINT_MAP: Record<string, string> = {
  'AGENTS.md': '.opencode/AGENTS.md',
  '.opencode/agent/': '.opencode/agent/',
  '.opencode/command/': '.opencode/command/',
  '.opencode/skill/': '.opencode/skill/',
  '.opencode/templates/': '.opencode/templates/',
  '.opencode/package.json': '.opencode/package.json',
  '.opencode/.gitignore': '.opencode/.gitignore',
  '.opencode/openspec/AGENTS.md': '.opencode/openspec/AGENTS.md',
  // Note: project.md is NOT included - pull preserves existing project.md
  '.opencode/learnings/': '.opencode/learnings/',
};

/**
 * Directories that support custom additions (merge, don't replace)
 */
const MERGEABLE_DIRS = ['agent', 'skill', 'command'];

/**
 * Pull command - updates existing yepe setup without onboarding prompts
 */
export async function pull(options: PullOptions = {}): Promise<void> {
  console.log('🔄 Pulling blueprint updates...\n');

  // Step 1: Validate project is already initialized
  validateInitialized();

  // Step 2: Download blueprint assets
  await downloadBlueprint();

  // Step 3: Detect conflicts and stage files
  const report = await stageFiles();

  // Step 4: Copy/update non-conflicting files
  await copyFiles(report);

  // Step 5: Generate report
  await generateReport(report);

  // Step 6: Cleanup
  cleanup();

  // Step 7: Re-apply learnings via agent
  await reapplyLearnings();

  // Step 8: Print summary
  printSummary(report);
}

/**
 * Validate that the project has been initialized with yepe
 */
function validateInitialized(): void {
  if (!existsSync(PROJECT_MD_PATH)) {
    throw new ValidationError(
      'Project not initialized',
      `Run 'npx @yepe/init' first to set up the project.\nThe 'pull' command is for updating existing setups.`
    );
  }
  console.log('✓ Project initialized\n');
}

async function downloadBlueprint(): Promise<void> {
  console.log('📥 Downloading blueprint from repository...');

  if (existsSync(STAGING_DIR)) {
    execSync(`rm -rf ${STAGING_DIR}`, { stdio: 'ignore' });
  }
  mkdirSync(STAGING_DIR, { recursive: true });

  try {
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

  const hasExistingLearnings = checkExistingLearnings();

  for (const [sourceBlueprintPath, targetPath] of Object.entries(BLUEPRINT_MAP)) {
    const sourcePath = join(STAGING_DIR, sourceBlueprintPath);
    
    if (!existsSync(sourcePath)) {
      continue;
    }

    // Skip learnings if target has existing entries
    if (hasExistingLearnings && targetPath.includes('.opencode/learnings/')) {
      changes.push({
        path: targetPath,
        status: 'skipped',
        reason: 'Existing learnings preserved',
      });
      continue;
    }

    const stat = statSync(sourcePath);
    
    if (stat.isDirectory()) {
      const dirName = basename(targetPath.replace(/\/$/, ''));
      const isMergeable = MERGEABLE_DIRS.includes(dirName);
      processDirectory(sourcePath, sourceBlueprintPath, targetPath, changes, conflicts, isMergeable);
    } else {
      processFile(sourcePath, targetPath, changes, conflicts);
    }
  }

  const report: Report = {
    version: getBlueprintVersion(),
    timestamp: new Date().toISOString(),
    changes,
    conflicts,
    summary: {
      added: changes.filter(c => c.status === 'added').length,
      updated: changes.filter(c => c.status === 'updated').length,
      conflicts: conflicts.length,
      skipped: changes.filter(c => c.status === 'skipped').length,
    },
  };

  console.log(`✓ Analysis complete: ${report.summary.added} to add, ${report.summary.updated} to update, ${report.summary.conflicts} conflicts, ${report.summary.skipped} skipped\n`);

  return report;
}

function checkExistingLearnings(): boolean {
  const indexPath = '.opencode/learnings/index.md';
  if (!existsSync(indexPath)) return false;
  
  const content = readFileSync(indexPath, 'utf-8');
  return !content.includes('_No entries yet_') && 
         (content.includes('| ML-') || content.includes('| RT-') || 
          content.includes('| FR-') || content.includes('| CA-'));
}

function processDirectory(
  sourcePath: string, 
  sourceBlueprintPath: string, 
  targetBasePath: string, 
  changes: FileChange[], 
  conflicts: string[], 
  isMergeable: boolean
): void {
  const entries = readdirSync(sourcePath);

  for (const entry of entries) {
    if (entry === '.git' || entry === 'node_modules') {
      continue;
    }

    const entrySourcePath = join(sourcePath, entry);
    const entrySourceBlueprintPath = sourceBlueprintPath.endsWith('/') 
      ? `${sourceBlueprintPath}${entry}`
      : `${sourceBlueprintPath}/${entry}`;
    const entryTargetPath = targetBasePath.endsWith('/')
      ? `${targetBasePath}${entry}`
      : `${targetBasePath}/${entry}`;

    const stat = statSync(entrySourcePath);

    if (stat.isDirectory()) {
      processDirectory(entrySourcePath, entrySourceBlueprintPath, entryTargetPath, changes, conflicts, isMergeable);
    } else {
      if (isMergeable) {
        processFileWithMerge(entrySourcePath, entryTargetPath, changes);
      } else {
        processFile(entrySourcePath, entryTargetPath, changes, conflicts);
      }
    }
  }
}

function processFileWithMerge(sourcePath: string, targetPath: string, changes: FileChange[]): void {
  if (existsSync(targetPath)) {
    changes.push({
      path: targetPath,
      status: 'updated',
      reason: 'Base file updated from blueprint',
    });
  } else {
    changes.push({
      path: targetPath,
      status: 'added',
    });
  }
}

function processFile(sourcePath: string, targetPath: string, changes: FileChange[], conflicts: string[]): void {
  if (existsSync(targetPath)) {
    // For pull, existing non-mergeable files are conflicts
    changes.push({
      path: targetPath,
      status: 'conflict',
      reason: 'File already exists',
    });
    conflicts.push(targetPath);
  } else {
    changes.push({
      path: targetPath,
      status: 'added',
    });
  }
}

async function copyFiles(report: Report): Promise<void> {
  console.log('📋 Copying files...');

  let copied = 0;
  let updated = 0;

  for (const change of report.changes) {
    if (change.status === 'added' || change.status === 'updated') {
      const targetPath = change.path;
      
      let sourcePath = '';
      for (const [source, target] of Object.entries(BLUEPRINT_MAP)) {
        if (targetPath.startsWith(target.replace(/\/$/, ''))) {
          const relativePart = targetPath.substring(target.replace(/\/$/, '').length);
          sourcePath = join(STAGING_DIR, source.replace(/\/$/, '') + relativePart);
          break;
        }
      }
      
      if (!sourcePath || !existsSync(sourcePath)) {
        continue;
      }

      const targetDir = dirname(targetPath);
      if (!existsSync(targetDir)) {
        mkdirSync(targetDir, { recursive: true });
      }

      // Check if this is a learnings file - use template instead of copying
      if (targetPath.includes('.opencode/learnings/') && targetPath.endsWith('.md')) {
        const filename = basename(targetPath);
        const template = getLearningsTemplate(filename);
        
        if (template) {
          writeFileSync(targetPath, template);
          if (change.status === 'updated') {
            updated++;
          } else {
            copied++;
          }
          continue;
        }
      }

      copyFileSync(sourcePath, targetPath);
      if (change.status === 'updated') {
        updated++;
      } else {
        copied++;
      }
    }
  }

  console.log(`✓ Copied ${copied} new files, updated ${updated} files\n`);
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

async function reapplyLearnings(): Promise<void> {
  const learningsDir = '.opencode/learnings';
  const indexPath = join(learningsDir, 'index.md');
  
  if (!existsSync(indexPath)) {
    return;
  }
  
  const content = readFileSync(indexPath, 'utf-8');
  const hasPromotedEntries = content.includes('| promoted |');
  
  if (!hasPromotedEntries) {
    return;
  }
  
  console.log('🔄 Re-applying promoted learnings...');
  
  const prompt = `Read all entries with "Status: promoted" in .opencode/learnings/.
For each promoted entry:
1. Read the "Recommended Action" field
2. Read the "Follow-up Links" field to identify which files were modified
3. Re-apply the recommended action to those files

This ensures project-specific customizations survive base config updates.
Only modify files mentioned in Follow-up Links. Be precise and minimal.`;

  try {
    execSync(`opencode run "${prompt.replace(/"/g, '\\"')}"`, { 
      stdio: 'inherit',
      timeout: 120000
    });
    console.log('✓ Learnings re-applied\n');
  } catch (error) {
    console.log('⚠️  Could not re-apply learnings automatically.');
    console.log('   Run manually: opencode run "Re-apply promoted learnings from .opencode/learnings/"\n');
  }
}

function getBlueprintVersion(): string {
  try {
    const packagePath = join(STAGING_DIR, 'package.json');
    if (existsSync(packagePath)) {
      const pkg = JSON.parse(readFileSync(packagePath, 'utf-8'));
      return pkg.version || 'unknown';
    }
  } catch {
    // Ignore errors
  }
  return 'unknown';
}

function printSummary(report: Report): void {
  console.log('📊 Summary:');
  console.log(`   • Added: ${report.summary.added} files`);
  console.log(`   • Updated: ${report.summary.updated} files`);
  console.log(`   • Conflicts: ${report.summary.conflicts} files`);
  console.log(`   • Skipped: ${report.summary.skipped} files`);

  if (report.conflicts.length > 0) {
    console.log('\n⚠️  Conflicts detected:');
    report.conflicts.forEach(path => {
      console.log(`   • ${path}`);
    });
    console.log('\nReview these files manually and merge as needed.');
  }

  console.log('\n✨ Update complete!');
  console.log('   1. Review changes: git status');
  console.log('   2. Review conflicts in .yepe-report.json');
  console.log('   3. Commit changes: git add . && git commit -m "Update yepe blueprint"\n');
}
