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
import { updateChangelog as updateChangelogNew } from './changelog.js';
import { displayHeader } from './header.js';
import { checkForUpdates } from './update-check.js';
import { createPullRequest } from './pull-request.js';
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

/**
 * Get color for credit display based on remaining credits (matches bashmaiass)
 * @param {number} credits - Remaining credits
 * @returns {Function} Chalk color function
 */
function getCreditColor(credits) {
  if (credits >= 1000) {
    return chalk.hex('#00AA00'); // Green
  } else if (credits > 600) {
    const ratio = (credits - 600) / 400;
    const r = Math.round(0 + (255 - 0) * (1 - ratio));
    const g = Math.round(170 + (255 - 170) * (1 - ratio));
    return chalk.hex(`#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}00`);
  } else if (credits > 300) {
    const ratio = (credits - 300) / 300;
    const g = Math.round(165 + (255 - 165) * ratio);
    return chalk.hex(`#FF${g.toString(16).padStart(2, '0')}00`);
  } else {
    const ratio = credits / 300;
    const g = Math.round(0 + 165 * ratio);
    return chalk.hex(`#FF${g.toString(16).padStart(2, '0')}00`);
  }
}

// Get nodemaiass's own version from its package.json
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const maiassPackageJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8')
);
const MAIASS_VERSION = maiassPackageJson.version;

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
  const mainBranch = process.env.MAIASS_MAINBRANCH || 'main';
  const stagingBranch = process.env.MAIASS_STAGINGBRANCH || 'staging';
  
  // Classify current branch
  const branchClassification = classifyBranch(currentBranch, {
    developBranch,
    mainBranch,
    stagingBranch
  });
  
  // Handle different branch scenarios
  if (currentBranch === mainBranch || branchClassification.isRelease) {
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
    mainBranch,
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
  
  // If no current branch (new repo with no commits), skip merge
  if (!currentBranch || currentBranch === 'null') {
    log.blue(SYMBOLS.INFO, 'New repository with no branch yet, skipping merge workflow');
    return { success: true, skipped: true, newRepo: true };
  }
  
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

  // autoMerge (-a): skip prompts and proceed with merge. If direct merge is
  // blocked, fall back to opening a PR in the browser (auto mode = "do whatever
  // is needed without asking").
  const autoMerge = process.env.MAIASS_AUTO_MERGE_TO_DEVELOP === 'true';

  // PR flow: if MAIASS_DEVELOP_PULLREQUESTS=on, push source and open a PR URL
  // instead of doing a direct merge. The pipeline ends here — the user merges
  // the PR on the platform, then re-runs maiass on develop for the version bump.
  if (process.env.MAIASS_DEVELOP_PULLREQUESTS === 'on') {
    log.blue(SYMBOLS.INFO, `MAIASS_DEVELOP_PULLREQUESTS=on — opening PR instead of direct merge`);
    const prResult = createPullRequest({
      source: currentBranch,
      target: developBranch,
      title: `Merge ${currentBranch} into ${developBranch}`
    });
    if (!prResult.success) {
      log.error(SYMBOLS.CROSS, `Failed to create pull request: ${prResult.error}`);
      return { success: false, error: prResult.error };
    }
    log.success(SYMBOLS.CHECKMARK, `Pull request opened in browser`);
    log.blue(SYMBOLS.INFO, `${prResult.url}`);
    log.blue(SYMBOLS.INFO, `After merging the PR, re-run maiass on ${developBranch} to bump the version.`);
    return { success: true, pullRequest: true, url: prResult.url };
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
    
    const autoMerge = process.env.MAIASS_AUTO_MERGE_TO_DEVELOP === 'true';
    if (silent || autoMerge) {
      console.log(colors.BCyan(mergePrompt) + colors.BGreen('Y'));
      if (autoMerge) {
        log.info(SYMBOLS.INFO, 'MAIASS_AUTO_MERGE_TO_DEVELOP=true: Automatically merging to develop');
      }
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

  // Detect blocked direct push (e.g. branch protection requires PR).
  // Run a dry-run push — if it fails, the eventual push will fail too. Only do
  // this when the remote actually exists; otherwise there's nothing to dry-run.
  if (remoteExists()) {
    const dryRun = executeGitCommand(`git push --dry-run origin ${developBranch}`, true);
    if (!dryRun.success) {
      log.warning(SYMBOLS.WARNING, `Direct push to ${developBranch} appears blocked (likely branch protection)`);

      // Decide whether to fall back to PR flow:
      // - autoMerge (-am): yes, automatically — that's exactly what -am promises
      // - interactive: prompt the user
      let useFallback = autoMerge;
      if (!autoMerge) {
        const reply = await getSingleCharInput(`Open a pull request instead? [Y/n] `);
        useFallback = reply !== 'n';
      } else {
        log.info(SYMBOLS.INFO, '-am mode — falling back to PR flow');
      }

      if (useFallback) {
        // Roll back the local merge so the working copy is back to clean develop,
        // then return to the original branch so we push the right ref for the PR
        executeGitCommand(`git reset --hard HEAD~1`);
        await switchToBranch(originalBranch || currentBranch);

        const prResult = createPullRequest({
          source: currentBranch,
          target: developBranch,
          title: `Merge ${currentBranch} into ${developBranch}`
        });
        if (!prResult.success) {
          log.error(SYMBOLS.CROSS, `Failed to create pull request: ${prResult.error}`);
          return { success: false, error: prResult.error };
        }
        log.success(SYMBOLS.CHECKMARK, `Pull request opened in browser`);
        log.blue(SYMBOLS.INFO, `${prResult.url}`);
        log.blue(SYMBOLS.INFO, `After merging the PR, re-run maiass on ${developBranch} to bump the version.`);
        return { success: true, pullRequest: true, url: prResult.url };
      }
      // User declined PR fallback — continue and let the later push fail with a clear error
      log.warning(SYMBOLS.WARNING, `Continuing with direct merge — push may fail at version bump stage`);
    }
  }

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
  const patchReleases = process.env.MAIASS_PATCH_RELEASES || '';
  
  // CLI flag overrides everything
  if (forceTag) {
    return { shouldTag: true, reason: 'CLI flag', needsPrompt: false };
  }
  
  // Major and minor releases are always tagged
  if (versionBump === 'major' || versionBump === 'minor') {
    return { shouldTag: true, reason: 'major/minor release', needsPrompt: false };
  }
  
  // Handle patch releases based on MAIASS_PATCH_RELEASES configuration
  // Options: blank/no (skip release branch - default), 'ask' (prompt user), 'always' (create release)
  switch (patchReleases.toLowerCase()) {
    case 'always':
      return { shouldTag: true, reason: 'MAIASS_PATCH_RELEASES=always', needsPrompt: false };
    case 'ask':
      return { shouldTag: false, reason: 'patch release', needsPrompt: true };
    case 'no':
    case '':
    default:
      return { shouldTag: false, reason: 'MAIASS_PATCH_RELEASES=no (skip release branch)', needsPrompt: false };
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
  const { versionBump, versionBumpExplicit = false, dryRun = false, tag = false, force = false, silent = false, originalGitInfo = null } = options;
  const { developBranch } = branchInfo;

  logger.header(SYMBOLS.INFO, 'Version Management Phase');

  // Must be on develop branch for version management — check before reading version files.
  // If the user explicitly asked for a bump (passed major/minor/patch), this is an error.
  // Otherwise it's a graceful skip — they may have run maiass on a feature branch without
  // intending a version bump, or the merge was deferred to a PR.
  const currentBranch = getCurrentBranch();
  if (currentBranch !== developBranch) {
    if (versionBumpExplicit) {
      console.error(colors.Red(`${SYMBOLS.CROSS} Version management must be done on ${developBranch} branch`));
      console.error(colors.Red(`${SYMBOLS.CROSS} Current branch: ${currentBranch}`));
      return { success: false, error: `Not on ${developBranch} branch` };
    }
    log.blue(SYMBOLS.INFO, `Skipping version management — on ${currentBranch}, not ${developBranch}`);
    return { success: true, skipped: true, reason: 'not on develop' };
  }

  // Pull latest develop from remote before reading version files.
  // This ensures we bump from the correct base even if remote has been updated
  // since our last fetch (e.g. a GH Actions bump from a recently merged PR).
  if (remoteExists()) {
    logger.info(SYMBOLS.PULLING, `Pulling latest ${developBranch} before version bump...`);
    const pullResult = executeGitCommand(`git pull origin ${developBranch}`);
    if (!pullResult.success) {
      logger.error(SYMBOLS.CROSS, 'Git operation failed: pull before version bump');
      logger.error(SYMBOLS.CROSS, 'Please resolve any conflicts and try again');
      return { success: false, error: pullResult.error };
    }
  }

  // Read version files after pull so we have the freshest version on disk
  const versionInfo = await getCurrentVersion();

  if (!versionInfo.hasVersionFiles) {
    // Only warn if the user explicitly asked for a version bump
    if (versionBumpExplicit) {
      log.warning(SYMBOLS.WARNING, 'No version files detected');
    }
    logger.debug('No version files — skipping version management');
    return { success: true, skipped: true };
  }

  // Determine new version
  const newVersion = bumpVersion(versionInfo.current, versionBump);
  if (!newVersion) {
    console.error(colors.Red(`${SYMBOLS.CROSS} Failed to determine new version`));
    return { success: false, error: 'Version calculation failed' };
  }
  
  log.branded(`Setting version based on argument: ${versionBump}`, colors.White);
  log.branded(`Current version: ${versionInfo.current}`, colors.White);
  logger.success(SYMBOLS.CHECKMARK, `New version: ${newVersion}`);
  
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
    const changelogPath = process.env.MAIASS_CHANGELOG_PATH || '.';
    await updateChangelogNew(changelogPath, newVersion);
    
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
    
    logger.success(SYMBOLS.CHECKMARK, `Version updated to ${newVersion} on ${developBranch}`);
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
    const changelogPath = process.env.MAIASS_CHANGELOG_PATH || '.';
    await updateChangelogNew(changelogPath, newVersion);
    
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

    // Return to the user's original branch unless they started on develop or
    // a release branch. Mirrors handleSimpleVersionBump so the user isn't left
    // stranded on develop after a release runs from a feature branch.
    const originalBranch = originalGitInfo?.currentBranch;
    if (originalBranch && originalBranch !== developBranch && !originalBranch.startsWith('release/')) {
      logger.info(SYMBOLS.INFO, `Returning to original branch: ${originalBranch}`);
      const switched = await switchToBranch(originalBranch);
      if (!switched) {
        logger.warning(SYMBOLS.WARNING, `Failed to switch back to ${originalBranch}`);
      }
    }

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
 * Main MAIASS pipeline orchestrator
 * @param {Object} options - Pipeline options
 * @returns {Promise<Object>} Pipeline result
 */
export async function runMaiassPipeline(options = {}) {
  const {
    commitsOnly = false,
    autoStage = false,
    versionBump = null,
    versionBumpExplicit = false,
    dryRun = false,
    tag = false,
    force = false,
    silent = false
  } = options;
  
  // Display branded header with MAIASS's own version (not project version)
  displayHeader(MAIASS_VERSION);

  // Kick off update check in the background immediately so the network request
  // runs concurrently with the rest of the pipeline — result shown at the end
  const updateCheckPromise = checkForUpdates(MAIASS_VERSION);
  
  // Get git info early to show current branch
  const originalGitInfo = getGitInfo();
  // Use console.log directly to bypass verbosity filtering (always show branch like bashmaiass)
  console.log(`${colors.BSoftPink('|))')} ${colors.White(`Currently on branch: ${colors.BWhite(originalGitInfo.currentBranch)}`)}`);
  console.log();
  
  // Get PROJECT version for version management (not MAIASS version)
  const versionInfo = await getCurrentVersion();
  const currentVersion = versionInfo?.current || 'unknown';
  
  // Display project version info in debug mode only
  logger.debug('Project Version Information', { current: currentVersion, source: versionInfo.source });
  logger.debug('MAIASS Version', MAIASS_VERSION);
  
  try {
    // CRITICAL: originalGitInfo captures the JIRA ticket from the initial branch (e.g., feature/VEL-405_something)
    // before we switch to develop/release branches that don't have JIRA tickets
    
    // Phase 1: Branch Detection and Validation
    logger.debug('Phase 1: Branch Detection and Validation');
    const branchInfo = await validateAndHandleBranching({ force, autoSwitch: !commitsOnly });
    
    if (!branchInfo.success) {
      return branchInfo;
    }
    
    // Phase 2: Commit Workflow
    logger.debug('Phase 2: Commit Workflow');
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

    // If PR flow was used, the merge will happen on the platform — stop the
    // pipeline here. Version management will run on the next maiass invocation
    // after the user merges the PR.
    if (mergeResult.pullRequest) {
      console.log();
      logger.info(SYMBOLS.INFO, 'Thank you for using MAIASS!');
      return { success: true, pullRequest: true, url: mergeResult.url };
    }
    
    console.log('');
    
    // Phase 4: Version Management
    log.blue(SYMBOLS.INFO, 'Phase 4: Version Management');
    const versionResult = await handleVersionManagement(branchInfo, mergeResult, {
      versionBump,
      versionBumpExplicit,
      dryRun,
      tag,
      force,
      silent,
      originalGitInfo
    });
    
    if (!versionResult.success) {
      return versionResult;
    }
    
    // Cache branch info to avoid multiple git calls that might hang
    const finalBranch = getCurrentBranch();
    const originalBranch = branchInfo.originalBranch;
    
    console.log('');
    // Match bashmaiass colors: green checkmark, aqua text, bold white branch
    console.log(`${colors.BSoftPink('|))')}  ${colors.BGreen('✅ Done!')} ${colors.Aqua('You are on')} ${colors.BWhite(finalBranch)} ${colors.Aqua('branch')}`);
    
    // Display thank you message
    console.log(colors.Cyan('═'.repeat(40)));
    console.log(`${colors.BSoftPink('|))')}  Thank you for using MAIASS! ✨`);
    console.log(colors.Cyan('═'.repeat(40)));

    // Show credit balance — use post-AI value if available, else initial subscription value
    const subscriptionId = process.env.MAIASS_SUBSCRIPTION_ID;
    const creditsRemaining = commitResult?.creditsRemaining ?? (
      process.env.MAIASS_CREDITS_REMAINING !== undefined
        ? parseFloat(process.env.MAIASS_CREDITS_REMAINING)
        : undefined
    );
    if (creditsRemaining !== undefined) {
      const creditColor = getCreditColor(creditsRemaining);
      console.log(`${creditColor(`💳 Credits remaining: ${creditsRemaining}`)}`);
    }

    // Show top-up link for anonymous subscriptions
    if (subscriptionId && subscriptionId.startsWith('sub_anon_')) {
      const topupEndpoint = process.env.MAIASS_TOPUP_ENDPOINT || 'https://maiass.net/top-up';
      console.log(`${colors.BMagenta('Credit top-up link:')} ${colors.Blue(`${topupEndpoint}/${subscriptionId}`)}`);
    }

    // Show update notice if a newer version was found (check started at pipeline top)
    const updateInfo = await updateCheckPromise;
    if (updateInfo.updateAvailable) {
      console.log('');
      console.log(colors.Yellow(`  ⬆  Update available: ${updateInfo.currentVersion} → ${updateInfo.latestVersion}`));
      console.log(colors.Gray(`     Run: npm install -g maiass`));
    }

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
