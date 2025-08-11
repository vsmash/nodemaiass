import { log, logger } from './logger.js';
import colors from './colors.js';
import { SYMBOLS } from './symbols.js';
import { 
  getGitInfo, 
  getCurrentBranch, 
  isGitRepository,
  getGitStatus,
  classifyBranch
} from './git-info.js';
import { commitThis } from './commit.js';
import { logMerge } from './devlog.js';
import { getCurrentVersion, detectVersionFiles, bumpVersion, updateVersionFiles } from './version-manager.js';
import { handleVersionCommand } from './version-command.js';
import { getSingleCharInput, getLineInput } from './input-utils.js';
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

/**
 * Check if a git remote exists
 * @param {string} remoteName - Name of the remote (e.g., 'origin')
 * @returns {Promise<boolean>} Whether remote exists
 */
async function checkRemoteExists(remoteName) {
  try {
    const result = execSync(`git remote get-url ${remoteName}`, { 
      encoding: 'utf8', 
      stdio: ['pipe', 'pipe', 'ignore'] 
    });
    return result.trim().length > 0;
  } catch {
    return false;
  }
}

/**
 * Update changelog with new version and commit messages
 * @param {string} newVersion - New version number
 * @param {string} currentVersion - Current version (to get commits since this tag)
 */
async function updateChangelog(newVersion, currentVersion) {
  const changelogPath = process.env.MAIASS_CHANGELOG_PATH || 'CHANGELOG.md';
  const changelogName = process.env.MAIASS_CHANGELOG_NAME || 'CHANGELOG.md';
  const fs = await import('fs/promises');
  
  try {
    // Determine the latest version from the top of the changelog file (not git tags)
    let lastVersion = null;
    let changelogLines = [];
    try {
      await fs.access(changelogPath);
      const changelogContent = await fs.readFile(changelogPath, 'utf8');
      changelogLines = changelogContent.split('\n');
      for (const line of changelogLines) {
        const match = line.match(/^##\s+(\d+\.\d+\.\d+)/);
        if (match) {
          lastVersion = match[1];
          break;
        }
      }
    } catch {
      // changelog does not exist yet
    }
    if (!lastVersion) {
      // Fallback: try package.json or all commits
      try {
        const pkg = JSON.parse(await fs.readFile('package.json', 'utf8'));
        if (pkg.version) lastVersion = pkg.version;
      } catch {}
    }
    log.blue(SYMBOLS.GEAR, lastVersion ? `Getting commits since last changelog version: ${lastVersion}` : 'No previous version found, getting all commits');
    // Get commit messages since last version for main changelog
    const gitLogCommand = lastVersion 
      ? `git log ${lastVersion}..HEAD --pretty=format:"%B"` 
      : `git log --pretty=format:"%B"`;
    const mainLogResult = executeGitCommand(gitLogCommand, true);
    let hasCommits = mainLogResult.success && mainLogResult.output.trim();
    
    if (!hasCommits) {
      log.warning(SYMBOLS.INFO, 'No commits found since last release');
      // Still proceed to update changelog with version entry
    }
    
    // Get commit messages for internal changelog (with author info, no JIRA filtering)
    const internalGitLogCommand = lastVersion 
      ? `git log ${lastVersion}..HEAD --pretty=format:"(%an) %s"` 
      : `git log --pretty=format:"(%an) %s"`;
    const internalLogResult = executeGitCommand(internalGitLogCommand, true);
    if (!internalLogResult.success) {
      log.warning(SYMBOLS.WARNING, 'Failed to get commits for internal changelog');
    }
    
    let commitMessages = [];
    let internalCommitMessages = [];
    
    // Only process commits if we have any
    if (hasCommits) {
      // Process main changelog commits (filter irrelevant + strip JIRA tickets)
      commitMessages = mainLogResult.output
        .split('\n\n') // Split by double newlines (commit boundaries)
        .map(commit => {
          // Remove JIRA ticket numbers anywhere in the line (e.g. DEVOPS-123, ABC-456)
          return commit.trim().replace(/\b[A-Z]+-[0-9]+\b:? ?/g, '');
        })
        .filter(commit => {
          if (!commit) return false;
          const firstLine = commit.split('\n')[0].toLowerCase();
          // Filter out commits that start with irrelevant phrases (matching bash script)
          return !(/^(ncl|merge|bump|fixing merge conflicts|version bump)/i.test(firstLine));
        })
        .filter(commit => commit.length > 0)
        .map(commit => {
          // Clean up each commit - remove empty lines and ensure no trailing newlines
          return commit.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .join('\n');
        });
    }
    
    // Process internal changelog commits (filter irrelevant but keep JIRA tickets)
    if (hasCommits && internalLogResult.success) {
      internalCommitMessages = internalLogResult.output
        .split('\n')
        .filter(line => {
          if (!line.trim()) return false;
          const lowerLine = line.toLowerCase();
          // Filter out irrelevant commits but keep JIRA tickets
          // Format is: "(author) subject" so check if subject contains merge/bump keywords
          return !(/\)\s+(ncl|merge|bump|bumping|fixing merge conflicts|version bump|merged)\b/i.test(line));
        })
        .filter(line => line.length > 0);
    }
    
    // Format commit messages with proper bullets (matching bash script logic)
    let formattedCommits = '';
    let shouldUpdateChangelog = true;
    
    if (commitMessages.length === 0) {
      log.warning(SYMBOLS.INFO, 'No relevant commits found for changelog - updating version header only');
      // Don't add any commit entries when no meaningful commits exist
      formattedCommits = '';
      shouldUpdateChangelog = true;
    } else {
      formattedCommits = commitMessages.map(commit => {
        const lines = commit.split('\n').filter(line => line.trim());
        if (lines.length === 0) return '';
        
        const firstLine = lines[0].trim();
        
        // Check if it's a single-line commit or multi-line commit
        if (lines.length === 1) {
          // Single line commit - just add main bullet if needed
          return firstLine.startsWith('- ') ? firstLine : `- ${firstLine}`;
        }
        
        // Multi-line commit - handle differently based on format
        if (firstLine.startsWith('- ')) {
          // AI commit with bullets - treat first line as main subject, rest as sub-bullets
          const subject = firstLine;
          const bodyLines = lines.slice(1);
          
          const formattedBody = bodyLines.map(line => {
            const trimmed = line.trim();
            if (!trimmed) return '';
            
            // If line already starts with bullet, just indent it
            if (trimmed.startsWith('- ')) {
              return `\t${trimmed}`;
            } else {
              // Non-bullet line, just indent without adding bullet
              return `\t${trimmed}`;
            }
          }).filter(line => line);
          
          return [subject, ...formattedBody].join('\n');
        } else {
          // Manual commit - add bullets to all lines
          return lines.map((line, index) => {
            const trimmed = line.trim();
            if (index === 0) {
              return `- ${trimmed}`; // Main bullet for subject
            } else if (trimmed) {
              // Check if line already has bullet to avoid double bullets
              if (trimmed.startsWith('- ')) {
                return `\t${trimmed}`; // Just indent, don't add extra bullet
              } else {
                return `\t- ${trimmed}`; // Add indented bullet
              }
            }
            return '';
          }).filter(line => line).join('\n');
        }
      }).filter(commit => commit).join('\n');
    }
    
    // Create date string (matching bash script format)
    const date = new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    // Handle existing changelog or create new one
    let updatedContent;
    try {
      await fs.access(changelogPath);
      const currentContent = await fs.readFile(changelogPath, 'utf8');
      
      // Split current content into lines for slicing
      const lines = currentContent.split('\n');
      // Find the index of the second version heading (previous version)
      let restStartIdx = -1;
      for (let i = 1; i < lines.length; ++i) {
        if (/^##\s+\d+\.\d+\.\d+/.test(lines[i])) {
          restStartIdx = i;
          break;
        }
      }
      const restOfContent = restStartIdx !== -1 ? lines.slice(restStartIdx).join('\n') : '';
      // Always prepend new entry, never duplicate previous section
      if (formattedCommits.trim()) {
        updatedContent = `## ${newVersion}\n${date}\n\n${formattedCommits}\n\n${restOfContent}`;
      } else {
        updatedContent = `## ${newVersion}\n${date}\n\n${restOfContent}`;
      }
    } catch (error) {
      // Changelog doesn't exist - create new one
      if (formattedCommits.trim()) {
        updatedContent = `## ${newVersion}\n${date}\n\n${formattedCommits}\n`;
      } else {
        updatedContent = `## ${newVersion}\n${date}\n`;
      }
    }
    
    // Replace all newlines with OS-specific line endings for cross-platform compatibility
    const os = await import('os');
    const finalContent = updatedContent.replace(/\n/g, os.EOL);
    await fs.writeFile(changelogPath, finalContent, 'utf8');
    log.success(SYMBOLS.CHECKMARK, `Updated ${changelogName}`);
    
    // Also create/update internal changelog
    await updateInternalChangelog(newVersion, internalCommitMessages, date);
    
  } catch (error) {
    log.warning(SYMBOLS.WARNING, `Failed to update changelog: ${error.message}`);
  }
}

/**
 * Update internal changelog with raw commit messages (matching bash script)
 * @param {string} newVersion - New version number
 * @param {Array} internalCommitMessages - Array of commit messages with author info
 * @param {string} date - Formatted date string
 */
async function updateInternalChangelog(newVersion, internalCommitMessages, date) {
  const internalChangelogName = process.env.MAIASS_CHANGELOG_INTERNAL_NAME || '.CHANGELOG_internal.md';
  const internalChangelogPath = path.join(process.cwd(), internalChangelogName);
  const fs = await import('fs/promises');
  
  try {
    let formattedCommits;
    if (!internalCommitMessages || internalCommitMessages.length === 0) {
      log.warning(SYMBOLS.INFO, 'No commits for internal changelog - updating version header only');
      // Don't add any commit entries when no meaningful commits exist
      formattedCommits = '';
    } else {
      // Format commit messages for internal changelog (with author info, keep JIRA tickets)
      // Internal format should be: "- hash subject (author)" - already has proper format from git log
      formattedCommits = internalCommitMessages.map(commit => `- ${commit}`).join('\n');
      formattedCommits = formattedCommits.split('   -').join('\n\t-');
    }
    
    // Handle existing changelog or create new one (same logic as main changelog)
    let updatedContent;
    try {
      await fs.access(internalChangelogPath);
      const currentContent = await fs.readFile(internalChangelogPath, 'utf8');
      
      // Check if we need to update existing version entry
      const lines = currentContent.split('\n');
      const firstLine = lines[0] || '';
      const secondLine = lines[1] || '';
      
      const currentVersionMatch = firstLine.match(/^## (.+)$/);
      if (currentVersionMatch) {
        const currentVersion = currentVersionMatch[1];
        const currentMajorMinor = currentVersion.split('.').slice(0, 2).join('.');
        const newMajorMinor = newVersion.split('.').slice(0, 2).join('.');
        
        if (currentMajorMinor === newMajorMinor && secondLine === date) {
          // Same version and date - replace the entry
          const restOfContent = lines.slice(3).join('\n');
          if (formattedCommits.trim()) {
            updatedContent = `## ${newVersion}\n${date}\n\n${formattedCommits}\n\n${restOfContent}`;
          } else {
            updatedContent = `## ${newVersion}\n${date}\n\n${restOfContent}`;
          }
        } else {
          // Different version or date - prepend new entry
          if (formattedCommits.trim()) {
            updatedContent = `## ${newVersion}\n${date}\n\n${formattedCommits}\n\n${currentContent}`;
          } else {
            updatedContent = `## ${newVersion}\n${date}\n\n${currentContent}`;
          }
        }
      } else {
        // No version header - prepend new entry
        if (formattedCommits.trim()) {
          updatedContent = `## ${newVersion}\n${date}\n\n${formattedCommits}\n\n${currentContent}`;
        } else {
          updatedContent = `## ${newVersion}\n${date}\n\n${currentContent}`;
        }
      }
    } catch (error) {
      // Changelog doesn't exist - skip creating it
      log.info(SYMBOLS.INFO, `${internalChangelogName} does not exist - skipping internal changelog update`);
      return;
    }
    await fs.writeFile(internalChangelogPath, updatedContent, 'utf8');
    log.success(SYMBOLS.CHECKMARK, `Updated ${internalChangelogName}`);
    
  } catch (error) {
    log.warning(SYMBOLS.WARNING, `Failed to update internal changelog: ${error.message}`);
  }
}

/**
 * Execute git command safely
 * @param {string} command - Git command to execute
 * @param {boolean} silent - Whether to suppress errors
 * @returns {Object} Command result
 */
function executeGitCommand(command, silent = false) {
  try {
    // In brief mode, always pipe output to avoid showing git details
    const verbosity = process.env.MAIASS_VERBOSITY || 'normal';
    const shouldPipeOutput = silent || verbosity === 'brief';
    
    const result = execSync(command, { 
      encoding: 'utf8', 
      stdio: shouldPipeOutput ? 'pipe' : ['pipe', 'pipe', 'ignore']
    });
    
    // Log git output for debugging even in brief mode
    logger.debug(`Git command: ${command}`);
    if (result.trim()) {
      logger.debug(`Git output: ${result.trim()}`);
    }
    
    return {
      success: true,
      output: result.trim(),
      error: null
    };
  } catch (error) {
    logger.debug(`Git command failed: ${command}`);
    logger.debug(`Git error: ${error.message}`);
    if (error.stdout) {
      logger.debug(`Git stdout: ${error.stdout}`);
    }
    if (error.stderr) {
      logger.debug(`Git stderr: ${error.stderr}`);
    }
    
    if (!silent) {
      logger.error(SYMBOLS.CROSS, `Git command failed: ${command}`);
      logger.error(SYMBOLS.CROSS, `Error: ${error.message}`);
    }
    return {
      success: false,
      output: '',
      error: error.message
    };
  }
}

/**
 * Check if a git branch exists locally
 * @param {string} branchName - Name of branch to check
 * @returns {boolean} True if branch exists
 */
function branchExists(branchName) {
  const result = executeGitCommand(`git branch --list ${branchName}`, true);
    logger.debug(`DEBUG: branchExists(${branchName}) - success: ${result.success}, output: '${result.output}', trimmed: '${result.output.trim()}'`);
  return result.success && result.output.trim() !== '';
}

/**
 * Check if a git remote exists
 * @param {string} remoteName - Name of remote to check
 * @returns {boolean} True if remote exists
 */
function remoteExists(remoteName = 'origin') {
  const result = executeGitCommand(`git remote get-url ${remoteName}`, true);
  return result.success;
}

/**
 * Switch to a different git branch
 * @param {string} branchName - Name of branch to switch to
 * @returns {Promise<boolean>} True if switch was successful
 */
async function switchToBranch(branchName) {
  logger.info(SYMBOLS.GEAR, `Switching to ${branchName} branch...`);
  
  const result = executeGitCommand(`git checkout ${branchName}`);
  
  if (result.success) {
    logger.success(SYMBOLS.CHECKMARK, `Switched to ${branchName} branch`);
    return true;
  } else {
    console.error(colors.Red(`${SYMBOLS.CROSS} Failed to switch to ${branchName}: ${result.error}`));
    return false;
  }
}

/**
 * Validate and handle branch strategy for MAIASS workflow
 * @param {Object} options - Pipeline options
 * @returns {Promise<Object>} Branch validation result
 */
async function validateAndHandleBranching(options = {}) {
  const { force = false, autoSwitch = true } = options;
  
  
  // Get current git information
  const gitInfo = await getGitInfo();
  
  if (!gitInfo.isRepository) {
    console.error(colors.Red(`${SYMBOLS.CROSS} Not in a git repository`));
    return { success: false, error: 'Not in git repository' };
  }
  
  const currentBranch = gitInfo.currentBranch;
  const developBranch = process.env.MAIASS_DEVELOPBRANCH || 'develop';
  const masterBranch = process.env.MAIASS_MASTERBRANCH || 'master';
  const stagingBranch = process.env.MAIASS_STAGINGBRANCH || 'staging';
  
  // Only show branch information if we're doing version management (not commits-only)
  if (autoSwitch) {
    console.log(`  ${colors.BWhite('Current Branch:')} ${colors.White(currentBranch)}`);
  }
  
  // Classify current branch
  const branchClassification = classifyBranch(currentBranch, {
    developBranch,
    masterBranch,
    stagingBranch
  });
  
  // Handle different branch scenarios
  if (currentBranch === masterBranch || branchClassification.isRelease) {
    log.warning(SYMBOLS.WARNING, `You are currently on the ${currentBranch} branch`);
    log.space();
    
    if (!force) {
      const reply = await getSingleCharInput(`Do you want to continue on ${developBranch}? [y/N] `);
      if (reply !== 'y') {
        log.warning(SYMBOLS.INFO, 'Operation cancelled by user');
        return { success: false, cancelled: true };
      }
    }
    
    // Switch to develop branch
    if (autoSwitch) {
      const switched = await switchToBranch(developBranch);
      if (!switched) {
        return { success: false, error: `Failed to switch to ${developBranch}` };
      }
    }
  } else if (currentBranch === stagingBranch) {
    log.blue(SYMBOLS.GEAR, `Currently on staging branch, switching to ${developBranch}...`);
    
    if (autoSwitch) {
      const switched = await switchToBranch(developBranch);
      if (!switched) {
        return { success: false, error: `Failed to switch to ${developBranch}` };
      }
    }
  } else if (currentBranch !== developBranch) {
    // On feature branch or other branch
    log.blue(SYMBOLS.INFO, `Currently on feature branch: ${currentBranch}`);
    log.blue(SYMBOLS.INFO, 'MAIASS workflow will proceed on current branch');
    // Only show version management note if we're doing version management
    log.space();
  }
  
  return {
    success: true,
    originalBranch: currentBranch,
    currentBranch: getCurrentBranch(),
    developBranch,
    masterBranch,
    stagingBranch,
    branchClassification
  };
}

/**
 * Handle the commit workflow phase
 * @param {Object} branchInfo - Branch information from validation
 * @param {Object} options - Pipeline options
 * @returns {Promise<Object>} Commit result
 */
async function handleCommitWorkflow(branchInfo, options = {}) {
  const { commitsOnly = false, autoStage = false, silent = false } = options;
  
  logger.header(SYMBOLS.INFO, 'Commit Workflow Phase');
  
  try {
    // Run the commit workflow
    const commitSuccess = await commitThis({
      autoStage,
      commitsOnly,
      silent
    });
    
    // Check if commit workflow succeeded
    if (!commitSuccess) {
      return { success: false, cancelled: true, error: 'Commit workflow cancelled by user' };
    }

    // After commit workflow, check if working directory is clean for version management
    // If we're not in commits-only mode, we need a clean working directory to proceed
    if (!commitsOnly) {
      const postCommitGitInfo = getGitInfo();
      const postCommitStatus = postCommitGitInfo.status;
      
      if (postCommitStatus.unstagedCount > 0 || postCommitStatus.untrackedCount > 0) {
        // Working directory is not clean, cannot proceed with version management
        console.log();
        log.warning(SYMBOLS.WARNING, 'Working directory has uncommitted changes');
        log.info(SYMBOLS.INFO, 'Cannot proceed with version management - pipeline stopped');
        log.info(SYMBOLS.INFO, `Current branch: ${getCurrentBranch()}`);
        log.success('', 'Thank you for using MAIASS.');
        return { success: true, stoppedDueToUncommittedChanges: true };
      }
    }

    return { success: true };
  } catch (error) {
    console.error(colors.Red(`${SYMBOLS.CROSS} Commit workflow failed: ${error.message}`));
    return { success: false, error: error.message };
  }
}

/**
 * Handle the merge to develop workflow
 * @param {Object} branchInfo - Branch information from validation
 * @param {Object} commitResult - Result from commit workflow
 * @param {Object} options - Pipeline options
 * @returns {Promise<Object>} Merge result
 */
async function handleMergeToDevelop(branchInfo, commitResult, options = {}) {
  const { force = false, silent = false, originalGitInfo = null, autoSwitch = true, versionBump = null, tag = false } = options;
  const { currentBranch, developBranch, originalBranch } = branchInfo;
  
  // If we're already on develop or this was commits-only, skip merge
  if (currentBranch === developBranch || originalBranch === developBranch) {
    log.blue(SYMBOLS.INFO, `Already on ${developBranch} branch, skipping merge`);
    return { success: true, skipped: true };
  }
  
  
  // Check if develop branch exists
  if (!branchExists(developBranch)) {
    log.warning(SYMBOLS.WARNING, `Branch '${developBranch}' does not exist`);
    log.blue(SYMBOLS.INFO, `Using simplified workflow on current branch: ${currentBranch}`);
    return { success: true, simplified: true };
  }

  // Determine tagging strategy for this version bump
  const taggingDecision = shouldTagRelease(versionBump, tag);
  
  // Prompt user for merge (and tagging if needed)
  if (!force) {
    log.blue(SYMBOLS.INFO, `Ready to merge changes to ${developBranch} branch`);
    // Only show branch details if we're doing version management
    if (autoSwitch) {
      logger.BWhite(`  ${colors.Gray('Current branch:')} ${colors.White(currentBranch)}`);
    }
    
    let mergePrompt = `Merge to ${developBranch} for version management? [Y/n] `;
    let tagPrompt = null;
    
    // If this is a patch that needs prompting for tagging, ask about it
    if (taggingDecision.needsPrompt && versionBump === 'patch') {
      tagPrompt = `Create release branch and tag for this patch version? [y/N] `;
    }

    let reply;
    let tagReply = 'n'; // Default to no tagging for patches
    
    if (silent) {
      console.log(colors.BCyan(mergePrompt) + colors.BGreen('Y'));
      reply = 'Y';
      if (tagPrompt) {
        console.log(colors.BCyan(tagPrompt) + colors.BGreen('N'));
        tagReply = 'n';
      }
    } else {
      reply = await getSingleCharInput(mergePrompt);
      if (reply !== 'n' && tagPrompt) {
        tagReply = await getSingleCharInput(tagPrompt);
      }
    }
    
    if (reply === 'n') {
      log.warning(SYMBOLS.INFO, `Merge cancelled - staying on ${currentBranch}`);
      return { success: true, cancelled: true };
    }

    // Update tagging decision based on user response
    if (taggingDecision.needsPrompt) {
      taggingDecision.shouldTag = tagReply === 'y';
      taggingDecision.reason = tagReply === 'y' ? 'user requested' : 'user declined';
      taggingDecision.needsPrompt = false;
    }
  }
  
  // Perform merge
  // change this to use logger
  logger.info(SYMBOLS.MERGING, `Merging ${currentBranch} into ${developBranch}...`);
  
  // Switch to develop
  const switched = await switchToBranch(developBranch);
  if (!switched) {
    return { success: false, error: `Failed to switch to ${developBranch}` };
  }
  
  // Pull latest changes if remote exists
  if (remoteExists()) {
    logger.info(SYMBOLS.PULLING, 'Pulling latest changes from remote...');
    const pullResult = executeGitCommand(`git pull origin ${developBranch}`);
    if (!pullResult.success) {
      logger.error(SYMBOLS.CROSS, `Git operation failed: pull`);
      logger.error(SYMBOLS.CROSS, `Please resolve any conflicts or issues before proceeding`);
      return { success: false, error: pullResult.error };
    }
  }
  
  // Merge feature branch
  logger.info(SYMBOLS.MERGING, `Merging ${currentBranch} into ${developBranch}...`);
  const mergeResult = executeGitCommand(`git merge --no-ff ${currentBranch}`);
  if (!mergeResult.success) {
    console.error(colors.Red(`${SYMBOLS.CROSS} Git operation failed: merge`));
    console.error(colors.Red(`${SYMBOLS.CROSS} Please resolve any conflicts or issues before proceeding`));
    return { success: false, error: mergeResult.error };
  }
  
  log.success(SYMBOLS.CHECKMARK, `Successfully merged ${currentBranch} into ${developBranch}`);
  
  // Log the merge to devlog.sh (equivalent to logthis in maiass.sh)
  logMerge(currentBranch, developBranch, originalGitInfo, 'Merged');
  
  return { 
    success: true, 
    merged: true, 
    taggingDecision: taggingDecision 
  };
}

/**
 * Determine if a version should be tagged based on version bump type and configuration
 * @param {string} versionBump - Type of version bump (major, minor, patch)
 * @param {boolean} forceTag - CLI flag to force tagging
 * @returns {Object} Tagging decision and reason
 */
function shouldTagRelease(versionBump, forceTag = false) {
  const tagReleases = process.env.MAIASS_TAG_RELEASES || 'ask';
  
  // CLI flag overrides everything
  if (forceTag) {
    return { shouldTag: true, reason: 'CLI flag', needsPrompt: false };
  }
  
  // Major and minor releases are always tagged
  if (versionBump === 'major' || versionBump === 'minor') {
    return { shouldTag: true, reason: 'major/minor release', needsPrompt: false };
  }
  
  // Handle patch releases based on configuration
  switch (tagReleases.toLowerCase()) {
    case 'all':
      return { shouldTag: true, reason: 'MAIASS_TAG_RELEASES=all', needsPrompt: false };
    case 'none':
      return { shouldTag: false, reason: 'MAIASS_TAG_RELEASES=none', needsPrompt: false };
    case 'ask':
    default:
      return { shouldTag: false, reason: 'patch release', needsPrompt: true };
  }
}

/**
 * Handle version management phase - create release branch, bump version, merge back
 * @param {Object} branchInfo - Branch information
 * @param {Object} mergeResult - Merge operation result
 * @param {Object} options - Version management options
 * @returns {Promise<Object>} Version management result
 */
async function handleVersionManagement(branchInfo, mergeResult, options = {}) {
  const { versionBump, dryRun = false, tag = false, force = false, silent = false, originalGitInfo = null } = options;
  const { developBranch } = branchInfo;
  
  logger.header(SYMBOLS.INFO, 'Version Management Phase');
  
  // Check if we have version files
  const versionInfo = await getCurrentVersion();
  
  if (!versionInfo.hasVersionFiles) {
    log.warning(SYMBOLS.WARNING, 'No version files detected');
    log.blue(SYMBOLS.INFO, 'Skipping version management');
    return { success: true, skipped: true };
  }
  
  // Must be on develop branch for version management
  const currentBranch = getCurrentBranch();
  if (currentBranch !== developBranch) {
    console.error(colors.Red(`${SYMBOLS.CROSS} Version management must be done on ${developBranch} branch`));
    console.error(colors.Red(`${SYMBOLS.CROSS} Current branch: ${currentBranch}`));
    return { success: false, error: `Not on ${developBranch} branch` };
  }
  
  console.log(`  ${colors.BWhite('Current Version:')} ${colors.White(versionInfo.current || '(none)')}`);  
  console.log(`  ${colors.BWhite('Bump Type:')} ${colors.White(versionBump)}`);  
  console.log();
  
  // Determine new version
  const newVersion = bumpVersion(versionInfo.current, versionBump);
  if (!newVersion) {
    console.error(colors.Red(`${SYMBOLS.CROSS} Failed to determine new version`));
    return { success: false, error: 'Version calculation failed' };
  }
  
  console.log(`  ${colors.BWhite('New Version:')} ${colors.BGreen(newVersion)}`);
  console.log();
  
  if (dryRun) {
    console.log(colors.BBlue(`${SYMBOLS.INFO} Dry run - version management skipped`));
    return { success: true, dryRun: true, version: newVersion };
  }

  // Determine if we should use release branch workflow or simple version bump
  const taggingDecision = mergeResult.taggingDecision || shouldTagRelease(versionBump, tag);
  const useReleaseBranch = taggingDecision.shouldTag;

  if (useReleaseBranch) {
    // Full release branch workflow with tagging
    logger.info(SYMBOLS.INFO, `Using release branch workflow (${taggingDecision.reason})`);
    return await handleReleaseBranchWorkflow(newVersion, versionInfo, developBranch, originalGitInfo);
  } else {
    // Simple version bump without release branch
    logger.info(SYMBOLS.INFO, `Using simple version bump (${taggingDecision.reason})`);
    return await handleSimpleVersionBump(newVersion, versionInfo, developBranch, branchInfo.originalBranch);
  }
}

/**
 * Handle simple version bump without release branch or tagging
 * @param {string} newVersion - New version to set
 * @param {Object} versionInfo - Current version information
 * @param {string} developBranch - Name of develop branch
 * @param {string} originalBranch - Original branch to return to
 * @returns {Promise<Object>} Version bump result
 */
async function handleSimpleVersionBump(newVersion, versionInfo, developBranch, originalBranch) {
  try {
    // Update version files directly on develop
    logger.info(SYMBOLS.INFO, 'Updating version files...');
    const versionResult = await updateVersionFiles(newVersion, versionInfo.files);
    if (!versionResult.success) {
      logger.error(SYMBOLS.CROSS, 'Failed to update version files');
      return { success: false, error: 'Version file update failed' };
    }
    
    // Update changelog
    logger.info(SYMBOLS.INFO, 'Updating changelog...');
    await updateChangelog(newVersion, versionInfo.current);
    
    // Commit version changes
    logger.info(SYMBOLS.GEAR, 'Committing version changes...');
    const addResult = executeGitCommand('git add -A');
    if (!addResult.success) {
      logger.error(SYMBOLS.CROSS, 'Git operation failed: add -A');
      return { success: false, error: 'Git add failed' };
    }
    
    const { success: committed } = executeGitCommand(`git commit -m "Bumped version to ${newVersion}"`);
    if (!committed) {
      logger.error(SYMBOLS.CROSS, 'Git operation failed: commit');
      return { success: false, error: 'Version commit failed' };
    }
    
    // Push to remote if exists
    const hasRemote = await checkRemoteExists('origin');
    if (hasRemote) {
      logger.info(SYMBOLS.PUSHING, `Pushing version update to remote...`);
      const { success: pushed } = executeGitCommand(`git push origin ${developBranch}`);
      if (!pushed) {
        logger.warning(SYMBOLS.WARNING, 'Failed to push to remote, but version update succeeded locally');
      } else {
        logger.success(SYMBOLS.CHECKMARK, `Pushed version update to remote`);
      }
    }
    
    // Return to original branch
    if (originalBranch !== developBranch) {
      logger.info(SYMBOLS.INFO, `Returning to original branch: ${originalBranch}`);
      const switched = await switchToBranch(originalBranch);
      if (!switched) {
        logger.warning(SYMBOLS.WARNING, `Failed to switch back to ${originalBranch}`);
      } else {
        logger.success(SYMBOLS.CHECKMARK, `Switched back to ${originalBranch}`);
      }
    }
    
    logger.success(SYMBOLS.CHECKMARK, `Simple version bump completed: ${versionInfo.current} → ${newVersion}`);
    return {
      success: true,
      version: newVersion,
      previousVersion: versionInfo.current,
      workflow: 'simple'
    };
    
  } catch (error) {
    logger.error(SYMBOLS.CROSS, `Simple version bump failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Handle full release branch workflow with tagging
 * @param {string} newVersion - New version to set
 * @param {Object} versionInfo - Current version information
 * @param {string} developBranch - Name of develop branch
 * @param {Object} originalGitInfo - Original git information
 * @returns {Promise<Object>} Release workflow result
 */
async function handleReleaseBranchWorkflow(newVersion, versionInfo, developBranch, originalGitInfo) {
  try {
    // Create release branch
    const releaseBranch = `release/${newVersion}`;
    logger.info(SYMBOLS.INFO, `Creating release branch: ${releaseBranch}`);
    
    // Create and switch to release branch
    const { success: branchCreated } = executeGitCommand(`git checkout -b ${releaseBranch}`);
    if (!branchCreated) {
      logger.error(SYMBOLS.CROSS, 'Git operation failed: checkout -b');
      return { success: false, error: 'Release branch creation failed' };
    }
    logger.success(SYMBOLS.CHECKMARK, `Created and switched to ${releaseBranch}`);
    
    // Update version files on release branch
    logger.info(SYMBOLS.INFO, 'Updating version files...');
    const versionResult = await updateVersionFiles(newVersion, versionInfo.files);
    if (!versionResult.success) {
      logger.error(SYMBOLS.CROSS, 'Failed to update version files');
      return { success: false, error: 'Version file update failed' };
    }
    
    // Update changelog
    logger.info(SYMBOLS.INFO, 'Updating changelog...');
    await updateChangelog(newVersion, versionInfo.current);
    
    // Commit version changes
    logger.info(SYMBOLS.GEAR, 'Committing version changes...');
    const addResult = executeGitCommand('git add -A');
    if (!addResult.success) {
      logger.error(SYMBOLS.CROSS, 'Git operation failed: add -A');
      return { success: false, error: 'Git add failed' };
    }
    
    const { success: committed } = executeGitCommand(`git commit -m "Bumped version to ${newVersion}"`);
    if (!committed) {
      logger.error(SYMBOLS.CROSS, 'Git operation failed: commit');
      return { success: false, error: 'Version commit failed' };
    }
    
    // Create version tag
    logger.info(SYMBOLS.GEAR, `Creating version tag...`);
    const { success: tagged } = executeGitCommand(`git tag -a ${newVersion} -m "Release version ${newVersion}"`);
    if (!tagged) {
      logger.error(SYMBOLS.CROSS, 'Git operation failed: tag');
      return { success: false, error: 'Git tag failed' };
    }
    logger.success(SYMBOLS.CHECKMARK, `Tagged release as ${newVersion}`);
    
    // Push release branch if remote exists
    const hasRemote = await checkRemoteExists('origin');
    if (hasRemote) {
      logger.info(SYMBOLS.PUSHING, `Pushing release branch to remote...`);
      const { success: pushed } = executeGitCommand(`git push --set-upstream origin ${releaseBranch}`);
      if (!pushed) {
        logger.error(SYMBOLS.CROSS, 'Git operation failed: push');
        return { success: false, error: 'Git push failed' };
      }
      logger.success(SYMBOLS.CHECKMARK, `Pushed ${releaseBranch} to remote`);
    }
    
    // Switch back to develop and merge release
    logger.info(SYMBOLS.MERGING, `Merging release back to ${developBranch}...`);
    const { success: switchedToDevelop } = executeGitCommand(`git checkout ${developBranch}`);
    if (!switchedToDevelop) {
      logger.error(SYMBOLS.CROSS, `Git operation failed: checkout ${developBranch}`);
      return { success: false, error: 'Failed to switch to develop' };
    }
    
    // Pull latest develop if remote exists
    if (hasRemote) {
      logger.info(SYMBOLS.PULLING, `Pulling latest ${developBranch}...`);
      const pullResult = executeGitCommand(`git pull origin ${developBranch}`);
      if (!pullResult.success) {
        logger.error(SYMBOLS.CROSS, 'Git operation failed: pull');
        return { success: false, error: 'Git pull failed' };
      }
    }
    
    // Merge release branch back to develop
    const { success: merged } = executeGitCommand(`git merge --no-ff ${releaseBranch}`);
    if (!merged) {
      logger.error(SYMBOLS.CROSS, 'Git operation failed: merge --no-ff');
      return { success: false, error: 'Release merge failed' };
    }
    
    logger.success(SYMBOLS.CHECKMARK, `Merged ${releaseBranch} back to ${developBranch}`);
    
    // Log the release merge to devlog.sh
    logMerge(releaseBranch, developBranch, originalGitInfo, 'Merged');
    
    // Push updated develop and tags if remote exists
    if (hasRemote) {
      logger.info(SYMBOLS.PUSHING, `Pushing updated ${developBranch}...`);
      const { success: pushedDevelop } = await executeGitCommand(`git push origin ${developBranch}`);
      if (pushedDevelop) {
        logger.success(SYMBOLS.CHECKMARK, `Pushed updated ${developBranch} to remote`);
      }
      
      // Push tags
      await executeGitCommand('git push --tags');
      logger.success(SYMBOLS.CHECKMARK, `Pushed tags to remote`);
    }

    logger.success(SYMBOLS.CHECKMARK, `Release workflow completed: ${versionInfo.current} → ${newVersion}`);
    return {
      success: true,
      version: newVersion,
      releaseBranch,
      previousVersion: versionInfo.current,
      workflow: 'release-branch'
    };
    
  } catch (error) {
    logger.error(SYMBOLS.CROSS, `Release workflow failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Check for MAIASS version updates from npm registry
 * @param {string} currentVersion - Current version to compare against
 * @returns {Promise<Object>} Update check result
 */
async function checkForUpdates(currentVersion) {
  try {
    // Set a timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

    const response = await fetch('https://registry.npmjs.org/maiass-dev', {
      headers: {
        'Accept': 'application/vnd.npm.install-v1+json',
        'User-Agent': 'MAIASS-Version-Checker'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return { updateAvailable: false, error: `HTTP ${response.status}` };
    }

    const registryData = await response.json();
    const latestVersion = registryData['dist-tags']?.latest;
    const releaseUrl = 'https://www.npmjs.com/package/maiass-dev';

    if (!latestVersion) {
      return { updateAvailable: false, error: 'No latest version found in npm registry' };
    }

    // Simple version comparison (assumes semantic versioning)
    const current = currentVersion.split('.').map(num => parseInt(num, 10));
    const latest = latestVersion.split('.').map(num => parseInt(num, 10));

    let updateAvailable = false;
    for (let i = 0; i < Math.max(current.length, latest.length); i++) {
      const currentPart = current[i] || 0;
      const latestPart = latest[i] || 0;
      if (latestPart > currentPart) {
        updateAvailable = true;
        break;
      } else if (latestPart < currentPart) {
        break;
      }
    }

    return {
      updateAvailable,
      currentVersion,
      latestVersion,
      releaseUrl,
      error: null
    };
  } catch (error) {
    // Handle timeout and other errors gracefully
    const errorMsg = error.name === 'AbortError' ? 'Request timeout' : error.message;
    return { updateAvailable: false, error: errorMsg };
  }
}

/**
 * Display version information and update status
 * @param {string} currentVersion - Current MAIASS version
 */
async function displayVersionInfo(currentVersion) {
  // Display current version
  logger.info(SYMBOLS.INFO, `MAIASS ${colors.Cyan(currentVersion)}`);
  
  // Check for updates (only if not disabled)
  if (process.env.MAIASS_DISABLE_UPDATE_CHECK !== 'true') {
    const updateCheck = await checkForUpdates(currentVersion);
    
    if (updateCheck.updateAvailable) {
      logger.warning(SYMBOLS.WARNING, `Update available: ${colors.Green(updateCheck.latestVersion)} (current: ${colors.Yellow(updateCheck.currentVersion)})`);
      logger.info(SYMBOLS.INFO, `View release: ${colors.Blue(updateCheck.releaseUrl)}`);
    } else if (updateCheck.error) {
      // Only show error in debug mode to avoid cluttering output
      if (process.env.MAIASS_DEBUG === 'true') {
        logger.info(SYMBOLS.WARNING, `Version check failed: ${updateCheck.error}`);
      }
    } else {
      logger.info(SYMBOLS.CHECKMARK, `You're running the latest version`);
    }
  }
}

/**
 * Main MAIASS pipeline orchestrator
 * @param {Object} options - Pipeline options
 * @returns {Promise<Object>} Pipeline result
 */
export async function runMaiassPipeline(options = {}) {
  const {
    commitsOnly = false,
    autoStage = false,
    versionBump = null,
    dryRun = false,
    tag = false,
    force = false,
    silent = false
  } = options;
  
  // Get current version - ensure we get just the version string
  const versionInfo = await getCurrentVersion();
  const currentVersion = versionInfo?.current || 'unknown';
  
  log.critical(SYMBOLS.GEAR, 'MAIASS Pipeline Starting');
  
  // Display version information and check for updates
  await displayVersionInfo(currentVersion);
  console.log();
  
  try {
    // CRITICAL: Get git info from ORIGINAL branch before any switching
    // This captures the JIRA ticket from the initial branch (e.g., feature/VEL-405_something)
    // before we switch to develop/release branches that don't have JIRA tickets
    const originalGitInfo = getGitInfo();
    
    // Phase 1: Branch Detection and Validation
    // change this to use logger
    logger.blue(SYMBOLS.INFO, 'Phase 1: Branch Detection and Validation');
    const branchInfo = await validateAndHandleBranching({ force, autoSwitch: !commitsOnly });
    
    if (!branchInfo.success) {
      return branchInfo;
    }
    
    console.log();
    
    // Phase 2: Commit Workflow
    log.blue(SYMBOLS.INFO, 'Phase 2: Commit Workflow');
    const commitResult = await handleCommitWorkflow(branchInfo, { commitsOnly, autoStage, silent });
    
    if (!commitResult.success) {
      // Check if it was cancelled by user vs actual failure
      if (commitResult.cancelled) {
        // User chose not to proceed - this is not an error
        return { success: true, cancelled: true, phase: 'commit-cancelled' };
      }
      return commitResult;
    }
    
    // If commit workflow stopped due to uncommitted changes, exit gracefully
    if (commitResult.stoppedDueToUncommittedChanges) {
      return { success: true, phase: 'stopped-dirty-working-directory' };
    }
    
    // If commits-only mode, stop here
    if (commitsOnly) {
      console.log();
      console.log(colors.BGreen(`${SYMBOLS.CHECKMARK} Commits-only mode completed successfully`));
      console.log(colors.BBlue(`${SYMBOLS.INFO} Current branch: ${getCurrentBranch()}`));
      return { success: true, phase: 'commits-only' };
    }
    
    console.log();
    
    // Phase 3: Merge to Develop    
    log.blue(SYMBOLS.INFO, 'Phase 3: Merge to Develop');
    const mergeResult = await handleMergeToDevelop(branchInfo, commitResult, { 
      force, 
      silent, 
      originalGitInfo, 
      autoSwitch: !commitsOnly,
      versionBump,
      tag
    });
    
    if (!mergeResult.success) {
      return mergeResult;
    }
    
    // If merge was cancelled by user, stop here gracefully
    if (mergeResult.cancelled) {
      console.log();
      logger.success(SYMBOLS.CHECKMARK, `Workflow completed on ${getCurrentBranch()}`);
      logger.info(SYMBOLS.INFO, 'Thank you for using MAIASS!');
      return { success: true, cancelled: true, phase: 'merge-cancelled' };
    }
    
    console.log('');
    
    // Phase 4: Version Management
    log.blue(SYMBOLS.INFO, 'Phase 4: Version Management');
    const versionResult = await handleVersionManagement(branchInfo, mergeResult, { 
      versionBump, 
      dryRun, 
      tag, 
      force, 
      silent,
      originalGitInfo 
    });
    
    if (!versionResult.success) {
      return versionResult;
    }
    
    console.log('');
    log.success(SYMBOLS.CHECKMARK, `MAIASS Pipeline completed successfully!`);
    
    // Cache branch info to avoid multiple git calls that might hang
    const finalBranch = getCurrentBranch();
    const originalBranch = branchInfo.originalBranch;
    
    log.info(SYMBOLS.INFO, `Current branch: ${finalBranch}`);
    log.info(SYMBOLS.INFO, `Current version: ${versionResult.version || '(none)'}`);

    // Return to original branch if we switched during the pipeline
    // For simple workflow, we already returned to original branch
    // For release workflow, we need to return from develop
    if (finalBranch !== originalBranch && !commitsOnly && versionResult.workflow === 'release-branch') {
      log.info(SYMBOLS.INFO, `Returning to original branch: ${originalBranch}`);
      const switched = await switchToBranch(originalBranch);
      if (switched) {
        log.success(SYMBOLS.CHECKMARK, `Switched back to ${originalBranch}`);
        // Update final branch after switch
        const currentBranch = getCurrentBranch();
        log.info(SYMBOLS.INFO, `Final branch: ${currentBranch}`);
      } else {
        log.warning(SYMBOLS.WARNING, `Failed to switch back to ${originalBranch}`);
        log.info(SYMBOLS.INFO, `Final branch: ${finalBranch}`);
      }
    } else {
      log.info(SYMBOLS.INFO, `Final branch: ${finalBranch}`);
    }
    
    log.info(SYMBOLS.INFO, `Final version: ${versionResult.version || '(none)'}`);
    log.info(SYMBOLS.INFO, `Workflow used: ${versionResult.workflow || 'unknown'}`);
    
    return {
      success: true,
      branchInfo,
      commitResult,
      mergeResult,
      versionResult
    };
    
  } catch (error) {
    log.error(SYMBOLS.CROSS, `Pipeline failed: ${error.message}`);
    if (process.env.MAIASS_DEBUG === 'true') {
      log.error(SYMBOLS.GRAY, error.stack);
    }
    
    // Write debug file when pipeline fails
    try {
      const { writeDebugFile } = await import('./logger.js');
      const debugFile = writeDebugFile();
      if (debugFile) {
        log.error(SYMBOLS.INFO, `Debug information written to: ${debugFile}`);
      }
    } catch (debugError) {
      // Don't let debug file writing block pipeline completion
      log.warning(SYMBOLS.WARNING, `Failed to write debug file: ${debugError.message}`);
    }
    
    return { success: false, error: error.message };
  }
}
