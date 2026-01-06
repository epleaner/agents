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

  // Step 8: Print summary
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

  for (const blueprintPath of BLUEPRINT_FILES) {
    const sourcePath = join(STAGING_DIR, blueprintPath);
    
    if (!existsSync(sourcePath)) {
      continue;
    }

    const stat = statSync(sourcePath);
    
    if (stat.isDirectory()) {
      // Process directory recursively
      processDirectory(sourcePath, blueprintPath, changes, conflicts, selectedSkills);
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

  console.log(`✓ Analysis complete: ${report.summary.added} to add, ${report.summary.conflicts} conflicts, ${report.summary.skipped} skipped\n`);

  return report;
}

function processDirectory(sourcePath: string, blueprintPath: string, changes: FileChange[], conflicts: string[], selectedSkills?: Set<string>): void {
  const entries = readdirSync(sourcePath);

  for (const entry of entries) {
    // Skip git directory and node_modules
    if (entry === '.git' || entry === 'node_modules') {
      continue;
    }

    // Skip skills that weren't selected
    if (selectedSkills && blueprintPath.includes('.opencode/skill/')) {
      const skillName = blueprintPath.split('.opencode/skill/')[1]?.split('/')[0] || entry;
      if (!selectedSkills.has(skillName)) {
        continue;
      }
    }

    const entrySourcePath = join(sourcePath, entry);
    const entryBlueprintPath = blueprintPath.endsWith('/') 
      ? `${blueprintPath}${entry}`
      : `${blueprintPath}/${entry}`;

    const stat = statSync(entrySourcePath);

    if (stat.isDirectory()) {
      processDirectory(entrySourcePath, entryBlueprintPath, changes, conflicts, selectedSkills);
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

      // Check if this is a learnings file - use template instead of copying
      if (targetPath.startsWith('learnings/') && targetPath.endsWith('.md')) {
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

  // Customize openspec/project.md if it was added (not conflicted)
  const projectMdPath = 'openspec/project.md';
  const projectMdChange = report.changes.find(c => c.path === projectMdPath);
  
  if (projectMdChange && projectMdChange.status === 'added') {
    const content = generateProjectMd(projectInfo);
    writeFileSync(projectMdPath, content);
    customized++;
  }

  // Customize AGENTS.md header if it was added (not conflicted)
  const agentsMdPath = 'AGENTS.md';
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
  if (existsSync('openspec')) {
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
