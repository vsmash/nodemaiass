// Changelog management for MAIASS - matches bashmaiass implementation
import { execSync } from 'child_process';
import fs from 'fs/promises';
import { log } from './logger.js';
import { SYMBOLS } from './symbols.js';

/**
 * Execute git command and return output
 * @param {string} command - Git command to execute
 * @returns {string|null} Command output or null if failed
 */
function executeGitCommand(command) {
  try {
    return execSync(command, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
  } catch {
    return null;
  }
}

/**
 * Get the last changelog commit hash
 * @param {string} changelogPath - Path to changelog file
 * @returns {string|null} Commit hash or null
 */
function getLastChangelogCommit(changelogPath) {
  try {
    const content = execSync(`cat "${changelogPath}"`, { encoding: 'utf8' });
    const match = content.match(/^## (.+)$/m);
    if (match) {
      const lastVersion = match[1].trim();
      const hash = executeGitCommand(`git log -1 --format="%H" -S"## ${lastVersion}" -- "${changelogPath}"`);
      if (hash) return hash;
    }
  } catch {}
  
  // Fallback to first commit
  return executeGitCommand('git rev-list --max-parents=0 HEAD');
}

/**
 * Update changelog files with new version and commits
 * @param {string} changelogPath - Directory containing changelog
 * @param {string} version - New version number
 * @returns {Promise<void>}
 */
export async function updateChangelog(changelogPath = '.', version) {
  const changelogName = process.env.MAIASS_CHANGELOG_NAME || 'CHANGELOG.md';
  const changelogInternalName = process.env.MAIASS_CHANGELOG_INTERNAL_NAME || '.CHANGELOG_internal.md';
  const changelogInternalPath = process.env.MAIASS_CHANGELOG_INTERNAL_PATH || changelogPath;
  
  const changelogFile = `${changelogPath}/${changelogName}`;
  const changelogInternalFile = `${changelogInternalPath}/${changelogInternalName}`;
  
  // Get last changelog commit
  let lastChangelogCommit = null;
  try {
    await fs.access(changelogFile);
    lastChangelogCommit = getLastChangelogCommit(changelogFile);
  } catch {}
  
  if (!lastChangelogCommit) {
    lastChangelogCommit = executeGitCommand('git rev-list --max-parents=0 HEAD');
  }
  
  if (!lastChangelogCommit) {
    log.info(SYMBOLS.INFO, 'No commits found, skipping changelog');
    return;
  }
  
  const logRange = `${lastChangelogCommit}..HEAD`;
  
  // Get commits for main changelog (remove JIRA tickets, filter out merges/bumps)
  const rawCommits = executeGitCommand(`git log ${logRange} --pretty=format:"%B"`);
  
  let changelog = '';
  if (rawCommits) {
    // Process commits: filter and format
    const commits = rawCommits.split('\n\n').filter(commit => {
      const firstLine = commit.split('\n')[0].toLowerCase();
      return !firstLine.match(/^(ncl|merge|bump|fixing merge conflicts)/i);
    });
    
    const formattedCommits = commits.map(commit => {
      // Remove JIRA ticket from start
      const cleaned = commit.replace(/^\[?[A-Z]+-[0-9]+\]?[\s:—-]+/gm, '');
      const lines = cleaned.split('\n').filter(l => l.trim());
      
      if (lines.length === 0) return '';
      
      // First line as bullet, rest as indented sub-bullets
      let result = `- ${lines[0]}`;
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
          result += `\n\t${lines[i]}`;
        }
      }
      return result;
    }).filter(c => c);
    
    changelog = formattedCommits.join('\n');
  }
  
  // Get commits for internal changelog (with author names)
  const rawInternalCommits = executeGitCommand(`git log ${logRange} --pretty=format:"%an%n%B"`);
  
  let changelogInternal = '';
  if (rawInternalCommits) {
    // Process internal commits with author
    const commitBlocks = rawInternalCommits.split('\n\n').filter(block => {
      const lines = block.split('\n');
      if (lines.length < 2) return false;
      const subject = lines[1].toLowerCase();
      return !subject.match(/^(ncl|merge|bump|fixing merge conflicts)/i);
    });
    
    const formattedInternal = commitBlocks.map(block => {
      const lines = block.split('\n').filter(l => l.trim());
      if (lines.length < 2) return '';
      
      const author = lines[0];
      const subject = lines[1].replace(/^\[?[A-Z]+-[0-9]+\]?[\s:—-]+/, '');
      
      let result = `- ${author}: ${subject}`;
      for (let i = 2; i < lines.length; i++) {
        if (lines[i].trim()) {
          result += `\n\t${lines[i]}`;
        }
      }
      return result;
    }).filter(c => c);
    
    changelogInternal = formattedInternal.join('\n');
  }
  
  // Get current date
  const now = new Date();
  const humanDate = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const longHumanDate = now.toLocaleDateString('en-GB', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric',
    weekday: 'long'
  });
  
  // Update main changelog
  if (!changelog) {
    log.info(SYMBOLS.INFO, 'No changelog to add');
  } else {
    try {
      let existingContent = '';
      try {
        existingContent = await fs.readFile(changelogFile, 'utf8');
      } catch {}
      
      if (existingContent) {
        const lines = existingContent.split('\n');
        const firstVersion = lines[0]?.match(/^## (.+)$/)?.[1];
        const secondLine = lines[1];
        
        // Check if we're updating the same minor version on the same date
        const currentMinor = version.split('.').slice(0, 2).join('.');
        const existingMinor = firstVersion?.split('.').slice(0, 2).join('.');
        
        if (currentMinor === existingMinor && secondLine === humanDate) {
          // Replace existing entry
          const newContent = `## ${version}\n${humanDate}\n\n${changelog}\n${lines.slice(3).join('\n')}`;
          await fs.writeFile(changelogFile, newContent, 'utf8');
        } else {
          // Add new entry
          const newContent = `## ${version}\n${humanDate}\n\n${changelog}\n\n${existingContent}`;
          await fs.writeFile(changelogFile, newContent, 'utf8');
        }
      } else {
        // Create new file
        await fs.writeFile(changelogFile, `## ${version}\n${humanDate}\n\n${changelog}\n`, 'utf8');
      }
      
      log.success(SYMBOLS.CHECKMARK, `Updated ${changelogName}`);
    } catch (error) {
      log.error(SYMBOLS.CROSS, `Failed to update ${changelogName}: ${error.message}`);
    }
  }
  
  // Update internal changelog
  if (!changelogInternal) {
    log.info(SYMBOLS.INFO, 'No commits for internal changelog - updating version header only');
  }
  
  try {
    await fs.access(changelogInternalFile);
    
    let existingContent = await fs.readFile(changelogInternalFile, 'utf8');
    const lines = existingContent.split('\n');
    const firstVersion = lines[0]?.match(/^## (.+)$/)?.[1];
    const secondLine = lines[1];
    
    // Check if we're updating the same minor version on the same date
    const currentMinor = version.split('.').slice(0, 2).join('.');
    const existingMinor = firstVersion?.split('.').slice(0, 2).join('.');
    
    const contentToAdd = changelogInternal || '';
    
    if (currentMinor === existingMinor && secondLine === longHumanDate) {
      // Replace existing entry
      const newContent = `## ${version}\n${longHumanDate}\n\n${contentToAdd}\n${lines.slice(3).join('\n')}`;
      await fs.writeFile(changelogInternalFile, newContent, 'utf8');
    } else {
      // Add new entry
      const newContent = `## ${version}\n${longHumanDate}\n\n${contentToAdd}\n\n${existingContent}`;
      await fs.writeFile(changelogInternalFile, newContent, 'utf8');
    }
    
    log.success(SYMBOLS.CHECKMARK, `Updated ${changelogInternalName}`);
  } catch (error) {
    log.info(SYMBOLS.INFO, `Internal changelog ${changelogInternalFile} does not exist, skipping`);
  }
}

export default { updateChangelog };
