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
import { getCurrentVersion, detectVersionFiles } from './version-manager.js';
import { handleVersionCommand } from './version-command.js';
import { getSingleCharInput, getLineInput } from './input-utils.js';
import { execSync } from 'child_process';

/**
 * Execute git command safely
 * @param {string} command - Git command to execute
 * @param {boolean} silent - Whether to suppress errors
 * @returns {Object} Command result
 */
function executeGitCommand(command, silent = false) {
  try {
    const result = execSync(`git ${command}`, { 
      encoding: 'utf8', 
      stdio: silent ? 'pipe' : ['pipe', 'pipe', 'ignore']
    });
    
    return {
      success: true,
      output: result.trim(),
      error: null
    };
  } catch (error) {
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
  const result = executeGitCommand(`branch --list ${branchName}`, true);
  return result.success && result.output.trim() !== '';
}

/**
 * Check if a git remote exists
 * @param {string} remoteName - Name of remote to check
 * @returns {boolean} True if remote exists
 */
function remoteExists(remoteName = 'origin') {
  const result = executeGitCommand(`remote get-url ${remoteName}`, true);
  return result.success;
}

/**
 * Switch to a different branch
 * @param {string} branchName - Name of branch to switch to
 * @returns {Promise<boolean>} True if successful
 */
async function switchToBranch(branchName) {
  console.log(colors.BBlue(`${SYMBOLS.INFO} Switching to ${branchName} branch...`));
  
  const result = executeGitCommand(`checkout ${branchName}`);
  
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
    const pullResult = executeGitCommand(`pull origin ${developBranch}`);
    if (!pullResult.success) {
      console.log(colors.BYellow(`${SYMBOLS.WARNING} Failed to pull from remote: ${pullResult.error}`));
    }
  }
  
  // Merge feature branch
  const mergeResult = executeGitCommand(`merge --no-ff ${currentBranch}`);
  if (mergeResult.success) {
    console.log(colors.BGreen(`${SYMBOLS.CHECKMARK} Successfully merged ${currentBranch} into ${developBranch}`));
    return { success: true, merged: true };
  } else {
    console.error(colors.Red(`${SYMBOLS.CROSS} Failed to merge: ${mergeResult.error}`));
    return { success: false, error: mergeResult.error };
  }
}

/**
 * Handle the version management phase
 * @param {Object} branchInfo - Branch information from validation
 * @param {Object} mergeResult - Result from merge workflow
 * @param {Object} options - Pipeline options
 * @returns {Promise<Object>} Version management result
 */
async function handleVersionManagement(branchInfo, mergeResult, options = {}) {
  const { versionBump, dryRun = false, tag = false } = options;
  const { currentBranch, developBranch } = branchInfo;
  
  console.log(colors.BCyan(`${SYMBOLS.INFO} Version Management Phase`));
  console.log();
  
  // Check if we have version files
  const versionInfo = await getCurrentVersion();
  
  if (!versionInfo.hasVersionFiles) {
    console.log(colors.BYellow(`${SYMBOLS.WARNING} No version files detected`));
    console.log(colors.BBlue(`${SYMBOLS.INFO} Skipping version management`));
    return { success: true, skipped: true };
  }
  
  // Ensure we're on develop branch for version management
  const actualCurrentBranch = getCurrentBranch();
  if (actualCurrentBranch !== developBranch) {
    console.log(colors.BYellow(`${SYMBOLS.WARNING} Version management should be performed on ${developBranch} branch`));
    console.log(colors.BBlue(`${SYMBOLS.INFO} Current branch: ${actualCurrentBranch}`));
    
    const reply = await getSingleCharInput(colors.BCyan(`Switch to ${developBranch} for version management? [Y/n] `));
    if (reply !== 'n') {
      const switched = await switchToBranch(developBranch);
      if (!switched) {
        return { success: false, error: `Failed to switch to ${developBranch}` };
      }
    }
  }
  
  // Determine version bump type
  let bumpType = versionBump;
  if (!bumpType) {
    console.log(colors.BBlue(`${SYMBOLS.INFO} Current version: ${colors.BWhite(versionInfo.current || 'none')}`));
    console.log();
    console.log(colors.BCyan('Select version bump type:'));
    console.log('  1. patch (1.0.0 → 1.0.1) - Bug fixes');
    console.log('  2. minor (1.0.0 → 1.1.0) - New features');
    console.log('  3. major (1.0.0 → 2.0.0) - Breaking changes');
    console.log('  4. custom - Enter specific version');
    console.log('  5. skip - Skip version management');
    console.log();
    
    const choice = await getLineInput(colors.BCyan('Enter choice [1-5]: '));
    
    switch (choice) {
      case '1':
        bumpType = 'patch';
        break;
      case '2':
        bumpType = 'minor';
        break;
      case '3':
        bumpType = 'major';
        break;
      case '4':
        bumpType = await getLineInput(colors.BCyan('Enter specific version (e.g., 2.1.0): '));
        break;
      case '5':
        console.log(colors.BYellow(`${SYMBOLS.INFO} Skipping version management`));
        return { success: true, skipped: true };
      default:
        console.log(colors.BYellow(`${SYMBOLS.INFO} Invalid choice, defaulting to patch`));
        bumpType = 'patch';
        break;
    }
  }
  
  // Execute version bump
  try {
    // Auto-proceed when on develop branch (merge to develop scenario)
    const autoForce = currentBranch === developBranch;
    
    await handleVersionCommand({
      _: [bumpType],
      'dry-run': dryRun,
      tag,
      force: autoForce
    });
    
    return { success: true, bumpType };
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
