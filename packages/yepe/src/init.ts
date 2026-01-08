import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, statSync, copyFileSync } from 'fs';
import { join, dirname, relative, basename } from 'path';
import { execSync } from 'child_process';
import { ValidationError } from './validate.js';
import { promptProjectInfo, generateProjectMd, generateAgentsMdHeader } from './prompts.js';
import { getLearningsTemplate } from './learnings-templates.js';

const BLUEPRINT_REPO = 'https://github.com/epleaner/agents.git';
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
 * Source to target path mapping for blueprint files
 * Source paths are relative to the blueprint repo
 * Target paths are relative to the target repo
 */
const BLUEPRINT_MAP: Record<string, string> = {
  // AGENTS.md from root goes into .opencode/
  'AGENTS.md': '.opencode/AGENTS.md',
  // .opencode contents copy directly
  '.opencode/agent/': '.opencode/agent/',
  '.opencode/command/': '.opencode/command/',
  '.opencode/skill/': '.opencode/skill/',
  '.opencode/templates/': '.opencode/templates/',
  '.opencode/package.json': '.opencode/package.json',
  '.opencode/.gitignore': '.opencode/.gitignore',
  // openspec and learnings are now inside .opencode
  '.opencode/openspec/AGENTS.md': '.opencode/openspec/AGENTS.md',
  '.opencode/openspec/project.md': '.opencode/openspec/project.md',
  '.opencode/learnings/': '.opencode/learnings/',
};

/**
 * Directories that support custom additions (merge, don't replace)
 */
const MERGEABLE_DIRS = ['agent', 'skill', 'command'];

export async function init(): Promise<void> {
  console.log('🚀 Initializing yepe blueprint...\n');

  // Step 1: Clone/download blueprint assets first (needed for skill discovery)
  await downloadBlueprint();

  // Step 2: Gather project information (including skill selection)
  const projectInfo = await promptProjectInfo(STAGING_DIR);

  // Step 3: Detect conflicts and stage files
  const report = await stageFiles(projectInfo);

  // Step 4: Copy non-conflicting files
  await copyFiles(report);

  // Step 5: Customize configuration files
  await customizeFiles(projectInfo, report);

  // Step 6: Generate report
  await generateReport(report);

  // Step 7: Cleanup
  cleanup();

  // Step 8: Re-apply learnings via agent
  await reapplyLearnings();

  // Step 9: Print summary
  printSummary(report, projectInfo);
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

async function stageFiles(projectInfo: any): Promise<Report> {
  console.log('🔍 Analyzing files...');

  const changes: FileChange[] = [];
  const conflicts: string[] = [];
  const selectedSkills = new Set<string>(projectInfo.selectedSkills);

  // Check if learnings has existing entries (should be preserved)
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
      // Check if this is a mergeable directory
      const dirName = basename(targetPath.replace(/\/$/, ''));
      const isMergeable = MERGEABLE_DIRS.includes(dirName);
      
      // Process directory recursively
      processDirectory(sourcePath, sourceBlueprintPath, targetPath, changes, conflicts, selectedSkills, isMergeable);
    } else {
      // Process single file
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
      conflicts: conflicts.length,
      skipped: changes.filter(c => c.status === 'skipped').length,
    },
  };

  console.log(`✓ Analysis complete: ${report.summary.added} to add, ${report.summary.conflicts} conflicts, ${report.summary.skipped} skipped\n`);

  return report;
}

/**
 * Check if target repo has existing learnings with real entries
 */
function checkExistingLearnings(): boolean {
  const indexPath = '.opencode/learnings/index.md';
  if (!existsSync(indexPath)) return false;
  
  const content = readFileSync(indexPath, 'utf-8');
  // Check if entries table has real entries (not just template placeholder)
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
  selectedSkills?: Set<string>,
  isMergeable?: boolean
): void {
  const entries = readdirSync(sourcePath);

  for (const entry of entries) {
    // Skip git directory and node_modules
    if (entry === '.git' || entry === 'node_modules') {
      continue;
    }

    // Skip skills that weren't selected
    if (selectedSkills && sourceBlueprintPath.includes('.opencode/skill/')) {
      const skillName = sourceBlueprintPath.split('.opencode/skill/')[1]?.split('/')[0] || entry;
      if (!selectedSkills.has(skillName)) {
        continue;
      }
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
      processDirectory(entrySourcePath, entrySourceBlueprintPath, entryTargetPath, changes, conflicts, selectedSkills, isMergeable);
    } else {
      // For mergeable directories, always update base files (overwrite allowed)
      if (isMergeable) {
        processFileWithMerge(entrySourcePath, entryTargetPath, changes);
      } else {
        processFile(entrySourcePath, entryTargetPath, changes, conflicts);
      }
    }
  }
}

/**
 * Process file in a mergeable directory - always update base files
 */
function processFileWithMerge(sourcePath: string, targetPath: string, changes: FileChange[]): void {
  if (existsSync(targetPath)) {
    // File exists - will be updated (not a conflict for mergeable dirs)
    changes.push({
      path: targetPath,
      status: 'added', // Mark as added so it gets copied/updated
      reason: 'Base file updated',
    });
  } else {
    changes.push({
      path: targetPath,
      status: 'added',
    });
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

  // Build reverse map for source lookup
  const targetToSource: Record<string, string> = {};
  for (const [source, target] of Object.entries(BLUEPRINT_MAP)) {
    targetToSource[target] = source;
  }

  for (const change of report.changes) {
    if (change.status === 'added') {
      const targetPath = change.path;
      
      // Find the source path by matching against the map
      let sourcePath = '';
      for (const [source, target] of Object.entries(BLUEPRINT_MAP)) {
        if (targetPath.startsWith(target.replace(/\/$/, ''))) {
          // Calculate the relative part after the mapped prefix
          const relativePart = targetPath.substring(target.replace(/\/$/, '').length);
          sourcePath = join(STAGING_DIR, source.replace(/\/$/, '') + relativePart);
          break;
        }
      }
      
      if (!sourcePath || !existsSync(sourcePath)) {
        continue;
      }

      // Create directory if it doesn't exist
      const targetDir = dirname(targetPath);
      if (!existsSync(targetDir)) {
        mkdirSync(targetDir, { recursive: true });
      }

      // Check if this is a learnings file - use template instead of copying
      if (targetPath.includes('.opencode/learnings/') && targetPath.endsWith('.md')) {
        const filename = basename(targetPath);
        const template = getLearningsTemplate(filename);
        
        if (template) {
          // Write template instead of copying
          writeFileSync(targetPath, template);
          copied++;
          continue;
        }
      }

      // Copy file normally
      copyFileSync(sourcePath, targetPath);
      copied++;
    }
  }

  console.log(`✓ Copied ${copied} files\n`);
}

async function customizeFiles(projectInfo: any, report: Report): Promise<void> {
  console.log('✏️  Customizing configuration files...');

  let customized = 0;

  // Customize .opencode/openspec/project.md if it was added (not conflicted)
  const projectMdPath = '.opencode/openspec/project.md';
  const projectMdChange = report.changes.find(c => c.path === projectMdPath);
  
  if (projectMdChange && projectMdChange.status === 'added') {
    const content = generateProjectMd(projectInfo);
    writeFileSync(projectMdPath, content);
    customized++;
  }

  // Customize .opencode/AGENTS.md header if it was added (not conflicted)
  const agentsMdPath = '.opencode/AGENTS.md';
  const agentsMdChange = report.changes.find(c => c.path === agentsMdPath);
  
  if (agentsMdChange && agentsMdChange.status === 'added') {
    // Read the template AGENTS.md
    const templateContent = readFileSync(agentsMdPath, 'utf-8');
    
    // Find the section after the OpenSpec block (after <!-- OPENSPEC:END -->)
    const openspecEndMarker = '<!-- OPENSPEC:END -->';
    const openspecEndIndex = templateContent.indexOf(openspecEndMarker);
    
    if (openspecEndIndex !== -1) {
      // Find the start of "## Quick Reference" or similar section
      const quickRefMatch = templateContent.match(/\n## (Quick Reference|Beads Performance|Meta-Learnings|Using Beads)/);
      
      if (quickRefMatch && quickRefMatch.index) {
        // Replace the header section between OPENSPEC:END and the first ## section
        const beforeHeader = templateContent.substring(0, openspecEndIndex + openspecEndMarker.length);
        const afterHeader = templateContent.substring(quickRefMatch.index);
        
        const customHeader = generateAgentsMdHeader(projectInfo);
        // Extract just the custom header part (after OPENSPEC:END)
        const customHeaderPart = customHeader.substring(customHeader.indexOf(openspecEndMarker) + openspecEndMarker.length);
        
        const newContent = beforeHeader + customHeaderPart + afterHeader;
        writeFileSync(agentsMdPath, newContent);
        customized++;
      }
    }
  }

  console.log(`✓ Customized ${customized} configuration files\n`);
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

/**
 * Re-apply promoted learnings to updated base config via agent
 */
async function reapplyLearnings(): Promise<void> {
  const learningsDir = '.opencode/learnings';
  const indexPath = join(learningsDir, 'index.md');
  
  // Check if there are promoted learnings to re-apply
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
      timeout: 120000 // 2 minute timeout
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
  } catch (error) {
    // Ignore errors
  }
  return 'unknown';
}

function printSummary(report: Report, projectInfo: any): void {
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
  if (existsSync('.opencode/openspec')) {
    console.log('   3. Initialize OpenSpec: (already exists)');
  } else {
    console.log('   3. Initialize OpenSpec: openspec init');
  }
  if (existsSync('.beads')) {
    console.log(`   4. Initialize beads: (already exists with prefix "${projectInfo.beadsPrefix}")`);
  } else {
    console.log(`   4. Initialize beads: bd init ${projectInfo.beadsPrefix}`);
  }
  console.log('   5. Commit changes: git add . && git commit -m "Add yepe blueprint"\n');
}
