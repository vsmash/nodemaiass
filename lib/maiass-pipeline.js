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
import { getCurrentVersion, detectVersionFiles, bumpVersion, updateVersionFiles } from './version-manager.js';
import { handleVersionCommand } from './version-command.js';
import { getSingleCharInput, getLineInput } from './input-utils.js';
import { execSync } from 'child_process';
import path from 'path';

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
    // Use the current version as the baseline tag (much more reliable than git describe)
    const lastTag = currentVersion;
    
    if (!lastTag) {
      console.log(colors.BYellow(`${SYMBOLS.INFO} No current version provided - skipping changelog update`));
      return;
    }
    
    console.log(colors.BBlue(`${SYMBOLS.INFO} Getting commits since last tag: ${lastTag}`));
    
    // Get commit messages since last tag for main changelog (with JIRA filtering)
    const mainLogResult = executeGitCommand(`git log "${lastTag}"..HEAD --pretty=format:"%B"`, true);
    if (!mainLogResult.success || !mainLogResult.output.trim()) {
      console.log(colors.BYellow(`${SYMBOLS.INFO} No commits found since last release`));
      return;
    }
    
    // Get commit messages for internal changelog (with author info, no JIRA filtering)
    const internalLogResult = executeGitCommand(`git log "${lastTag}"..HEAD --pretty=format:"%h %s (%an)"`, true);
    if (!internalLogResult.success) {
      console.log(colors.BYellow(`${SYMBOLS.WARNING} Failed to get commits for internal changelog`));
    }
    
    // Process main changelog commits (filter irrelevant + strip JIRA tickets)
    const commitMessages = mainLogResult.output
      .split('\n\n') // Split by double newlines (commit boundaries)
      .map(commit => {
        // Strip JIRA ticket numbers from commit messages (matching bash script: sed -E 's/^[A-Z]+-[0-9]+ //')
        return commit.trim().replace(/^[A-Z]+-[0-9]+ /gm, '');
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
    
    // Process internal changelog commits (filter irrelevant but keep JIRA tickets)
    const internalCommitMessages = internalLogResult.success ? internalLogResult.output
      .split('\n')
      .filter(line => {
        if (!line.trim()) return false;
        const lowerLine = line.toLowerCase();
        // Filter out irrelevant commits but keep JIRA tickets
        return !(/^[a-f0-9]+ (ncl|merge|bump|fixing merge conflicts|version bump)/i.test(lowerLine));
      })
      .filter(line => line.length > 0) : [];
    
    if (commitMessages.length === 0) {
      console.log(colors.BYellow(`${SYMBOLS.INFO} No relevant commits found for changelog`));
      return;
    }
    
    // Format commit messages with proper bullets (matching bash script logic)
    const formattedCommits = commitMessages.map(commit => {
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
    
    if (!formattedCommits) {
      console.log(colors.BYellow(`${SYMBOLS.INFO} No formatted commits for changelog`));
      return;
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
      
      // Check if we need to update existing version entry (matching bash script logic)
      const lines = currentContent.split('\n');
      const firstLine = lines[0] || '';
      const secondLine = lines[1] || '';
      
      // Check if first line is same major.minor version
      const currentVersionMatch = firstLine.match(/^## (.+)$/);
      if (currentVersionMatch) {
        const currentVersion = currentVersionMatch[1];
        const currentMajorMinor = currentVersion.split('.').slice(0, 2).join('.');
        const newMajorMinor = newVersion.split('.').slice(0, 2).join('.');
        
        if (currentMajorMinor === newMajorMinor && secondLine === date) {
          // Same version and date - replace the entry
          const restOfContent = lines.slice(3).join('\n');
          updatedContent = `## ${newVersion}\n${date}\n\n${formattedCommits}\n\n${restOfContent}`;
        } else {
          // Different version or date - prepend new entry
          updatedContent = `## ${newVersion}\n${date}\n\n${formattedCommits}\n\n${currentContent}`;
        }
      } else {
        // No version header - prepend new entry
        updatedContent = `## ${newVersion}\n${date}\n\n${formattedCommits}\n\n${currentContent}`;
      }
    } catch (error) {
      // Changelog doesn't exist - create new one
      updatedContent = `## ${newVersion}\n${date}\n\n${formattedCommits}\n`;
    }
    
    // Write updated changelog
    await fs.writeFile(changelogPath, updatedContent, 'utf8');
    console.log(colors.BGreen(`${SYMBOLS.CHECKMARK} Updated ${changelogName}`));
    
    // Also create/update internal changelog
    await updateInternalChangelog(newVersion, internalCommitMessages, date);
    
  } catch (error) {
    console.log(colors.BYellow(`${SYMBOLS.WARNING} Failed to update changelog: ${error.message}`));
  }
}

/**
 * Update internal changelog with raw commit messages (matching bash script)
 * @param {string} newVersion - New version number
 * @param {Array} internalCommitMessages - Array of commit messages with author info
 * @param {string} date - Formatted date string
 */
async function updateInternalChangelog(newVersion, internalCommitMessages, date) {
  const internalChangelogName = process.env.MAIASS_CHANGELOG_INTERNAL_NAME || 'CHANGELOG_internal.md';
  const internalChangelogPath = path.join(process.cwd(), internalChangelogName);
  const fs = await import('fs/promises');
  
  try {
    if (!internalCommitMessages || internalCommitMessages.length === 0) {
      console.log(colors.BYellow(`${SYMBOLS.INFO} No commits for internal changelog`));
      return;
    }
    // Format commit messages for internal changelog (with author info, keep JIRA tickets)
    // Internal format should be: "- hash subject (author)" - already has proper format from git log
    let formattedCommits = internalCommitMessages.map(commit => `- ${commit}`).join('\n');
    formattedCommits = formattedCommits.split('   -').join('\n\t-');
    const newEntry = `## ${newVersion}\n${date}\n\n${formattedCommits}\n\n`;
    
    let content = '';
    try {
      content = await fs.readFile(internalChangelogPath, 'utf8');
    } catch (error) {
      // File doesn't exist, will be created
    }
    
    const updatedContent = newEntry + content;
    await fs.writeFile(internalChangelogPath, updatedContent, 'utf8');
    console.log(colors.BGreen(`${SYMBOLS.CHECKMARK} Updated ${internalChangelogName}`));
    
  } catch (error) {
    console.log(colors.BYellow(`${SYMBOLS.WARNING} Failed to update internal changelog: ${error.message}`));
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
    const result = execSync(command, { 
      encoding: 'utf8', 
      stdio: silent ? 'pipe' : ['pipe', 'pipe', 'ignore']
    });
    
    return {
      success: true,
      output: result.trim(),
      error: null
    };
  } catch (error) {
    if (!silent) {
      console.error(colors.Red(`${SYMBOLS.CROSS} Git command failed: ${command}`));
      console.error(colors.Red(`${SYMBOLS.CROSS} Error: ${error.message}`));
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
  console.log(`DEBUG: branchExists(${branchName}) - success: ${result.success}, output: '${result.output}', trimmed: '${result.output.trim()}'`);
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
  console.log(colors.BBlue(`${SYMBOLS.INFO} Switching to ${branchName} branch...`));
  
  const result = executeGitCommand(`git checkout ${branchName}`);
  
  if (result.success) {
    console.log(colors.BGreen(`${SYMBOLS.CHECKMARK} Switched to ${branchName} branch`));
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
  
  console.log(colors.BCyan(`${SYMBOLS.INFO} Branch Detection and Validation`));
  console.log();
  
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
  
  console.log(`  ${colors.BWhite('Current Branch:')} ${colors.White(currentBranch)}`);
  console.log(`  ${colors.BWhite('Target Branch:')} ${colors.White(developBranch)}`);
  console.log();
  
  // Classify current branch
  const branchClassification = classifyBranch(currentBranch, {
    developBranch,
    masterBranch,
    stagingBranch
  });
  
  // Handle different branch scenarios
  if (currentBranch === masterBranch || branchClassification.isRelease) {
    console.log(colors.BYellow(`${SYMBOLS.WARNING} You are currently on the ${currentBranch} branch`));
    console.log();
    
    if (!force) {
      const reply = await getSingleCharInput(colors.BCyan(`Do you want to continue on ${developBranch}? [y/N] `));
      if (reply !== 'y') {
        console.log(colors.BYellow(`${SYMBOLS.INFO} Operation cancelled by user`));
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
    console.log(colors.BBlue(`${SYMBOLS.INFO} Currently on staging branch, switching to ${developBranch}...`));
    
    if (autoSwitch) {
      const switched = await switchToBranch(developBranch);
      if (!switched) {
        return { success: false, error: `Failed to switch to ${developBranch}` };
      }
    }
  } else if (currentBranch !== developBranch) {
    // On feature branch or other branch
    console.log(colors.BBlue(`${SYMBOLS.INFO} Currently on feature branch: ${currentBranch}`));
    console.log(colors.BBlue(`${SYMBOLS.INFO} MAIASS workflow will proceed on current branch`));
    console.log(colors.BYellow(`${SYMBOLS.WARNING} Note: Version management typically happens on ${developBranch}`));
    console.log();
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
  const { commitsOnly = false, autoStage = false } = options;
  
  console.log(colors.BCyan(`${SYMBOLS.INFO} Commit Workflow Phase`));
  console.log();
  
  try {
    // Run the commit workflow
    const commitSuccess = await commitThis({
      autoStage,
      commitsOnly
    });
    
    // Check if commit workflow succeeded
    if (!commitSuccess) {
      return { success: false, error: 'Commit workflow failed or was cancelled' };
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
  const { force = false } = options;
  const { currentBranch, developBranch, originalBranch } = branchInfo;
  
  // If we're already on develop or this was commits-only, skip merge
  if (currentBranch === developBranch || originalBranch === developBranch) {
    console.log(colors.BBlue(`${SYMBOLS.INFO} Already on ${developBranch} branch, skipping merge`));
    return { success: true, skipped: true };
  }
  
  console.log(colors.BCyan(`${SYMBOLS.INFO} Merge to Develop Phase`));
  console.log();
  
  // Check if develop branch exists
  if (!branchExists(developBranch)) {
    console.log(colors.BYellow(`${SYMBOLS.WARNING} Branch '${developBranch}' does not exist`));
    console.log(colors.BBlue(`${SYMBOLS.INFO} Using simplified workflow on current branch: ${currentBranch}`));
    return { success: true, simplified: true };
  }
  
  // Prompt user for merge
  if (!force) {
    console.log(colors.BBlue(`${SYMBOLS.INFO} Ready to merge changes to ${developBranch} branch`));
    console.log(`  ${colors.Gray('Current branch:')} ${colors.White(currentBranch)}`);
    console.log(`  ${colors.Gray('Target branch:')} ${colors.White(developBranch)}`);
    console.log();
    
    const reply = await getSingleCharInput(colors.BCyan(`Merge to ${developBranch} for version management? [Y/n] `));
    if (reply === 'n') {
      console.log(colors.BYellow(`${SYMBOLS.INFO} Merge cancelled - staying on ${currentBranch}`));
      return { success: true, cancelled: true };
    }
  }
  
  // Perform merge
  console.log(colors.BBlue(`${SYMBOLS.INFO} Merging ${currentBranch} into ${developBranch}...`));
  
  // Switch to develop
  const switched = await switchToBranch(developBranch);
  if (!switched) {
    return { success: false, error: `Failed to switch to ${developBranch}` };
  }
  
  // Pull latest changes if remote exists
  if (remoteExists()) {
    console.log(colors.BBlue(`${SYMBOLS.INFO} Pulling latest changes from remote...`));
    const pullResult = executeGitCommand(`git pull origin ${developBranch}`);
    if (!pullResult.success) {
      console.error(colors.Red(`${SYMBOLS.CROSS} Git operation failed: pull`));
      console.error(colors.Red(`${SYMBOLS.CROSS} Please resolve any conflicts or issues before proceeding`));
      return { success: false, error: pullResult.error };
    }
  }
  
  // Merge feature branch
  console.log(colors.BBlue(`${SYMBOLS.INFO} Merging ${currentBranch} into ${developBranch}...`));
  const mergeResult = executeGitCommand(`git merge --no-ff ${currentBranch}`);
  if (!mergeResult.success) {
    console.error(colors.Red(`${SYMBOLS.CROSS} Git operation failed: merge`));
    console.error(colors.Red(`${SYMBOLS.CROSS} Please resolve any conflicts or issues before proceeding`));
    return { success: false, error: mergeResult.error };
  }
  
  console.log(colors.BGreen(`${SYMBOLS.CHECKMARK} Successfully merged ${currentBranch} into ${developBranch}`));
  return { success: true, merged: true };
}

/**
 * Handle version management phase - create release branch, bump version, merge back
 * @param {Object} branchInfo - Branch information
 * @param {Object} mergeResult - Merge operation result
 * @param {Object} options - Version management options
 * @returns {Promise<Object>} Version management result
 */
async function handleVersionManagement(branchInfo, mergeResult, options = {}) {
  const { versionBump, dryRun = false, tag = false } = options;
  const { developBranch } = branchInfo;
  
  console.log(colors.BCyan(`${SYMBOLS.INFO} Version Management Phase`));
  console.log();
  
  // Check if we have version files
  const versionInfo = await getCurrentVersion();
  
  if (!versionInfo.hasVersionFiles) {
    console.log(colors.BYellow(`${SYMBOLS.WARNING} No version files detected`));
    console.log(colors.BBlue(`${SYMBOLS.INFO} Skipping version management`));
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
  
  // Create release branch
  const releaseBranch = `release/${newVersion}`;
  console.log(colors.BBlue(`${SYMBOLS.INFO} Creating release branch: ${releaseBranch}`));
  
  try {
    // Create and switch to release branch
    const { success: branchCreated } = executeGitCommand(`git checkout -b ${releaseBranch}`);
    if (!branchCreated) {
      console.error(colors.Red(`${SYMBOLS.CROSS} Git operation failed: checkout -b`));
      console.error(colors.Red(`${SYMBOLS.CROSS} Please resolve any conflicts or issues before proceeding`));
      return { success: false, error: 'Release branch creation failed' };
    }
    
    console.log(colors.BGreen(`${SYMBOLS.CHECKMARK} Created and switched to ${releaseBranch}`));
    
    // Update version files on release branch
    console.log(colors.BBlue(`${SYMBOLS.INFO} Updating version files...`));
    const versionResult = await updateVersionFiles(newVersion, versionInfo.files);
    if (!versionResult.success) {
      console.error(colors.Red(`${SYMBOLS.CROSS} Failed to update version files`));
      return { success: false, error: 'Version file update failed' };
    }
    
    // Update changelog if it exists
    console.log(colors.BBlue(`${SYMBOLS.INFO} Updating changelog...`));
    await updateChangelog(newVersion, versionInfo.current);
    
    // Commit version changes
    console.log(colors.BBlue(`${SYMBOLS.INFO} Committing version changes...`));
    const addResult = executeGitCommand('git add -A');
    if (!addResult.success) {
      console.error(colors.Red(`${SYMBOLS.CROSS} Git operation failed: add -A`));
      console.error(colors.Red(`${SYMBOLS.CROSS} Please resolve any conflicts or issues before proceeding`));
      return { success: false, error: 'Git add failed' };
    }
    
    const { success: committed } = executeGitCommand(`git commit -m "Bumped version to ${newVersion}"`);
    if (!committed) {
      console.error(colors.Red(`${SYMBOLS.CROSS} Git operation failed: commit`));
      console.error(colors.Red(`${SYMBOLS.CROSS} Please resolve any conflicts or issues before proceeding`));
      return { success: false, error: 'Version commit failed' };
    }
    
    // Handle version tagging (prompt or automatic based on config)
    const autoTagReleases = process.env.MAIASS_AUTO_TAG_RELEASES === 'true';
    let shouldTag = true; // CLI flag takes precedence
    
    // if (!shouldTag) {
    //   if (autoTagReleases) {
    //     shouldTag = true;
    //     console.log(colors.BBlue(`${SYMBOLS.INFO} Auto-tagging enabled - creating version tag...`));
    //   } else {
    //     // Prompt user for tagging
    //     console.log();
    //     const tagResponse = await getSingleCharInput(
    //       colors.BBlue(`${SYMBOLS.INFO} Tag this release version ${newVersion}? [Y/n] `),
    //       'Y'
    //     );
    //     shouldTag = tagResponse.toLowerCase() !== 'n';
    //   }
    // }
    
    if (shouldTag) {
      console.log(colors.BBlue(`${SYMBOLS.INFO} Creating version tag...`));
      const { success: tagged } = executeGitCommand(`git tag -a ${newVersion} -m "Release version ${newVersion}"`);
      if (!tagged) {
        console.error(colors.Red(`${SYMBOLS.CROSS} Git operation failed: tag`));
        console.error(colors.Red(`${SYMBOLS.CROSS} Please resolve any conflicts or issues before proceeding`));
        return { success: false, error: 'Git tag failed' };
      }
      console.log(colors.BGreen(`${SYMBOLS.CHECKMARK} Tagged release as ${newVersion}`));
    } else {
      console.log(colors.BYellow(`${SYMBOLS.INFO} Skipping version tag creation`));
    }
    
    // Push release branch if remote exists
    const hasRemote = await checkRemoteExists('origin');
    if (hasRemote) {
      console.log(colors.BBlue(`${SYMBOLS.INFO} Pushing release branch to remote...`));
      const { success: pushed } = executeGitCommand(`git push --set-upstream origin ${releaseBranch}`);
      if (!pushed) {
        console.error(colors.Red(`${SYMBOLS.CROSS} Git operation failed: push`));
        console.error(colors.Red(`${SYMBOLS.CROSS} Please resolve any conflicts or issues before proceeding`));
        return { success: false, error: 'Git push failed' };
      }
      console.log(colors.BGreen(`${SYMBOLS.CHECKMARK} Pushed ${releaseBranch} to remote`));
    }
    
    // Switch back to develop and merge release
    console.log(colors.BBlue(`${SYMBOLS.INFO} Merging release back to ${developBranch}...`));
    const { success: switchedToDevelop } = executeGitCommand(`git checkout ${developBranch}`);
    if (!switchedToDevelop) {
      console.error(colors.Red(`${SYMBOLS.CROSS} Git operation failed: checkout ${developBranch}`));
      console.error(colors.Red(`${SYMBOLS.CROSS} Please resolve any conflicts or issues before proceeding`));
      return { success: false, error: 'Failed to switch to develop' };
    }
    
    // Pull latest develop if remote exists
    if (hasRemote) {
      console.log(colors.BBlue(`${SYMBOLS.INFO} Pulling latest ${developBranch}...`));
      const pullResult = executeGitCommand(`git pull origin ${developBranch}`);
      if (!pullResult.success) {
        console.error(colors.Red(`${SYMBOLS.CROSS} Git operation failed: pull`));
        console.error(colors.Red(`${SYMBOLS.CROSS} Please resolve any conflicts or issues before proceeding`));
        return { success: false, error: 'Git pull failed' };
      }
    }
    
    // Merge release branch back to develop
    const { success: merged } = executeGitCommand(`git merge --no-ff ${releaseBranch}`);
    if (!merged) {
      console.error(colors.Red(`${SYMBOLS.CROSS} Git operation failed: merge --no-ff`));
      console.error(colors.Red(`${SYMBOLS.CROSS} Please resolve any conflicts or issues before proceeding`));
      return { success: false, error: 'Release merge failed' };
    }
    
    console.log(colors.BGreen(`${SYMBOLS.CHECKMARK} Merged ${releaseBranch} back to ${developBranch}`));
    
    // Push updated develop if remote exists
    if (hasRemote) {
      console.log(colors.BBlue(`${SYMBOLS.INFO} Pushing updated ${developBranch}...`));
      const { success: pushedDevelop } = await executeGitCommand(`git push origin ${developBranch}`);
      if (pushedDevelop) {
        console.log(colors.BGreen(`${SYMBOLS.CHECKMARK} Pushed updated ${developBranch} to remote`));
      }
      
      // Push tags if created
      if (tag) {
        await executeGitCommand('git push --tags');
      }
    }
    
    console.log(colors.BGreen(`${SYMBOLS.CHECKMARK} Version management completed: ${versionInfo.current} → ${newVersion}`));
    return { 
      success: true, 
      version: newVersion, 
      releaseBranch,
      previousVersion: versionInfo.current
    };
    
  } catch (error) {
    console.error(colors.Red(`${SYMBOLS.CROSS} Version management failed: ${error.message}`));
    return { success: false, error: error.message };
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
    force = false
  } = options;
  
  console.log(colors.BCyan(`${SYMBOLS.GEAR} MAIASS Pipeline Starting`));
  console.log();
  
  try {
    // Phase 1: Branch Detection and Validation
    console.log(colors.BBlue(`${SYMBOLS.INFO} Phase 1: Branch Detection and Validation`));
    const branchInfo = await validateAndHandleBranching({ force, autoSwitch: !commitsOnly });
    
    if (!branchInfo.success) {
      return branchInfo;
    }
    
    console.log();
    
    // Phase 2: Commit Workflow
    console.log(colors.BBlue(`${SYMBOLS.INFO} Phase 2: Commit Workflow`));
    const commitResult = await handleCommitWorkflow(branchInfo, { commitsOnly, autoStage });
    
    if (!commitResult.success) {
      return commitResult;
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
    console.log(colors.BBlue(`${SYMBOLS.INFO} Phase 3: Merge to Develop`));
    const mergeResult = await handleMergeToDevelop(branchInfo, commitResult, { force });
    
    if (!mergeResult.success) {
      return mergeResult;
    }
    
    console.log();
    
    // Phase 4: Version Management
    console.log(colors.BBlue(`${SYMBOLS.INFO} Phase 4: Version Management`));
    const versionResult = await handleVersionManagement(branchInfo, mergeResult, { 
      versionBump, 
      dryRun, 
      tag 
    });
    
    if (!versionResult.success) {
      return versionResult;
    }
    
    console.log();
    console.log(colors.BGreen(`${SYMBOLS.CHECKMARK} MAIASS Pipeline completed successfully!`));
    
    // Return to original branch if we switched during the pipeline
    const finalBranch = getCurrentBranch();
    const originalBranch = branchInfo.originalBranch;
    
    if (finalBranch !== originalBranch && !commitsOnly) {
      console.log(colors.BBlue(`${SYMBOLS.INFO} Returning to original branch: ${originalBranch}`));
      const switched = await switchToBranch(originalBranch);
      if (switched) {
        console.log(colors.BGreen(`${SYMBOLS.CHECKMARK} Switched back to ${originalBranch}`));
      } else {
        console.log(colors.BYellow(`${SYMBOLS.WARNING} Failed to switch back to ${originalBranch}`));
      }
    }
    
    console.log(colors.BBlue(`${SYMBOLS.INFO} Current branch: ${getCurrentBranch()}`));
    
    return {
      success: true,
      branchInfo,
      commitResult,
      mergeResult,
      versionResult
    };
    
  } catch (error) {
    console.error(colors.Red(`${SYMBOLS.CROSS} Pipeline failed: ${error.message}`));
    if (process.env.MAIASS_DEBUG === 'true') {
      console.error(colors.Gray(error.stack));
    }
    return { success: false, error: error.message };
  }
}
