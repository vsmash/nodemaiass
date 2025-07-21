// Git branch detection and information extraction utility
import { execSync } from 'child_process';
import colors from './colors.js';
import { SYMBOLS } from './symbols.js';

/**
 * Git information object structure
 * @typedef {Object} GitInfo
 * @property {string} branch - Current branch name
 * @property {string} author - Git author name
 * @property {string} email - Git author email
 * @property {string|null} jiraTicket - JIRA ticket number if found in branch name
 * @property {boolean} isFeatureBranch - True if this is a feature branch
 * @property {boolean} isReleaseBranch - True if this is a release branch
 * @property {boolean} isMasterBranch - True if this is master/main branch
 * @property {boolean} isDevelopBranch - True if this is develop branch
 * @property {boolean} isStagingBranch - True if this is staging branch
 * @property {string} branchType - Branch type classification
 * @property {Object} remote - Remote repository information
 */

/**
 * Execute git command safely
 * @param {string} command - Git command to execute
 * @param {boolean} silent - Whether to suppress errors
 * @returns {string|null} Command output or null if failed
 */
function executeGitCommand(command, silent = false) {
  try {
    return execSync(command, { 
      encoding: 'utf8', 
      stdio: silent ? 'pipe' : ['pipe', 'pipe', 'ignore']
    }).trim();
  } catch (error) {
    if (!silent) {
      console.error(`Git command failed: ${command}`);
      console.error(error.message);
    }
    return null;
  }
}

/**
 * Check if we're in a git repository
 * @returns {boolean} True if in a git repository
 */
export function isGitRepository() {
  return executeGitCommand('git rev-parse --is-inside-work-tree', true) === 'true';
}

/**
 * Get current git branch name
 * @returns {string|null} Current branch name or null if not in git repo
 */
export function getCurrentBranch() {
  return executeGitCommand('git rev-parse --abbrev-ref HEAD', true);
}

/**
 * Get git author information
 * @returns {Object} Author information with name and email
 */
export function getGitAuthor() {
  const name = executeGitCommand('git config user.name', true) || 'Unknown';
  const email = executeGitCommand('git config user.email', true) || 'unknown@example.com';
  
  return { name, email };
}

/**
 * Extract JIRA ticket number from branch name
 * Pattern matches: feature/ABC-123, bugfix/XYZ-456, etc.
 * Looks for pattern after last slash: [A-Z]+-[0-9]+
 * @param {string} branchName - Branch name to analyze
 * @returns {string|null} JIRA ticket number or null if not found
 */
export function extractJiraTicket(branchName) {
  if (!branchName) return null;
  
  // Match JIRA pattern after the last slash: [A-Z]+-[0-9]+
  // Examples: feature/ABC-123, bugfix/XYZ-456, hotfix/DEF-789
  const jiraPattern = /.*\/([A-Z]+-[0-9]+)/;
  const match = branchName.match(jiraPattern);
  
  return match ? match[1] : null;
}

/**
 * Classify branch type based on name and patterns
 * @param {string} branchName - Branch name to classify
 * @param {Object} branchConfig - Branch configuration from environment
 * @returns {Object} Branch classification information
 */
export function classifyBranch(branchName, branchConfig = {}) {
  if (!branchName) return { type: 'unknown', isSpecial: false };
  
  const {
    developBranch = 'develop',
    stagingBranch = 'staging', 
    masterBranch = 'master'
  } = branchConfig;
  
  const lowerBranch = branchName.toLowerCase();
  
  // Check for exact matches first
  if (branchName === masterBranch || branchName === 'main') {
    return { type: 'master', isSpecial: true, isMaster: true };
  }
  
  if (branchName === developBranch) {
    return { type: 'develop', isSpecial: true, isDevelop: true };
  }
  
  if (branchName === stagingBranch) {
    return { type: 'staging', isSpecial: true, isStaging: true };
  }
  
  // Check for pattern-based matches
  if (lowerBranch.startsWith('feature/') || lowerBranch.startsWith('feat/')) {
    return { type: 'feature', isSpecial: false, isFeature: true };
  }
  
  if (lowerBranch.startsWith('bugfix/') || lowerBranch.startsWith('bug/') || lowerBranch.startsWith('fix/')) {
    return { type: 'bugfix', isSpecial: false, isBugfix: true };
  }
  
  if (lowerBranch.startsWith('hotfix/')) {
    return { type: 'hotfix', isSpecial: true, isHotfix: true };
  }
  
  if (lowerBranch.startsWith('release/') || lowerBranch.startsWith('releases/')) {
    return { type: 'release', isSpecial: true, isRelease: true };
  }
  
  if (lowerBranch.startsWith('chore/')) {
    return { type: 'chore', isSpecial: false, isChore: true };
  }
  
  if (lowerBranch.startsWith('docs/') || lowerBranch.startsWith('doc/')) {
    return { type: 'documentation', isSpecial: false, isDocs: true };
  }
  
  return { type: 'other', isSpecial: false, isOther: true };
}

/**
 * Get remote repository information
 * @returns {Object} Remote repository information
 */
export function getRemoteInfo() {
  const remoteUrl = executeGitCommand('git remote get-url origin', true);
  
  if (!remoteUrl) {
    return { url: null, provider: null, owner: null, repo: null };
  }
  
  // Parse GitHub URLs
  const githubMatch = remoteUrl.match(/github\.com[:/]([^/]+)\/([^/\.]+)/);
  if (githubMatch) {
    return {
      url: remoteUrl,
      provider: 'github',
      owner: githubMatch[1],
      repo: githubMatch[2]
    };
  }
  
  // Parse Bitbucket URLs  
  const bitbucketMatch = remoteUrl.match(/bitbucket\.org[:/]([^/]+)\/([^/\.]+)/);
  if (bitbucketMatch) {
    return {
      url: remoteUrl,
      provider: 'bitbucket',
      owner: bitbucketMatch[1],
      repo: bitbucketMatch[2]
    };
  }
  
  // Parse GitLab URLs
  const gitlabMatch = remoteUrl.match(/gitlab\.com[:/]([^/]+)\/([^/\.]+)/);
  if (gitlabMatch) {
    return {
      url: remoteUrl,
      provider: 'gitlab',
      owner: gitlabMatch[1],
      repo: gitlabMatch[2]
    };
  }
  
  return {
    url: remoteUrl,
    provider: 'unknown',
    owner: null,
    repo: null
  };
}

/**
 * Get comprehensive git information
 * @param {Object} options - Configuration options
 * @returns {GitInfo|null} Complete git information or null if not in git repo
 */
export function getGitInfo(options = {}) {
  if (!isGitRepository()) {
    return null;
  }
  
  const branch = getCurrentBranch();
  if (!branch) {
    return null;
  }
  
  const author = getGitAuthor();
  const jiraTicket = extractJiraTicket(branch);
  const remote = getRemoteInfo();
  
  // Get branch configuration from environment or options
  const branchConfig = {
    developBranch: process.env.MAIASS_DEVELOPBRANCH || options.developBranch || 'develop',
    stagingBranch: process.env.MAIASS_STAGINGBRANCH || options.stagingBranch || 'staging',
    masterBranch: process.env.MAIASS_MASTERBRANCH || options.masterBranch || 'master'
  };
  
  const classification = classifyBranch(branch, branchConfig);
  
  return {
    branch,
    author: author.name,
    email: author.email,
    jiraTicket,
    branchType: classification.type,
    isFeatureBranch: classification.isFeature || false,
    isReleaseBranch: classification.isRelease || false,
    isMasterBranch: classification.isMaster || false,
    isDevelopBranch: classification.isDevelop || false,
    isStagingBranch: classification.isStaging || false,
    isBugfixBranch: classification.isBugfix || false,
    isHotfixBranch: classification.isHotfix || false,
    isSpecialBranch: classification.isSpecial || false,
    remote,
    branchConfig
  };
}

/**
 * Display git information in a formatted way
 * @param {GitInfo} gitInfo - Git information to display
 * @param {Object} options - Display options
 */
export function displayGitInfo(gitInfo, options = {}) {
  const { showRemote = true, showAuthor = true } = options;
  
  if (!gitInfo) {
    console.log(colors.Red(SYMBOLS.CROSS + ' Not in a git repository'));
    return;
  }
  
  console.log(colors.BCyan(SYMBOLS.GEAR + ' Git Information'));
  console.log();
  
  // Branch information
  const branchColor = gitInfo.isSpecialBranch ? colors.BYellow : colors.BGreen;
  console.log(`  ${colors.BBlue('Current Branch:')} ${branchColor(gitInfo.branch)}`);
  console.log(`  ${colors.BBlue('Branch Type:')}   ${colors.White(gitInfo.branchType)}`);
  
  // JIRA ticket if found
  if (gitInfo.jiraTicket) {
    console.log(`  ${colors.BBlue('JIRA Ticket:')}   ${colors.BPurple(gitInfo.jiraTicket)}`);
  }
  
  // Author information
  if (showAuthor) {
    console.log(`  ${colors.BBlue('Author:')}       ${colors.White(gitInfo.author)}`);
    console.log(`  ${colors.BBlue('Email:')}        ${colors.Gray(gitInfo.email)}`);
  }
  
  // Remote information
  if (showRemote && gitInfo.remote.url) {
    console.log(`  ${colors.BBlue('Remote:')}       ${colors.Cyan(gitInfo.remote.provider || 'unknown')} ${colors.Gray('(' + gitInfo.remote.url + ')')}`);
    if (gitInfo.remote.owner && gitInfo.remote.repo) {
      console.log(`  ${colors.BBlue('Repository:')}   ${colors.White(gitInfo.remote.owner + '/' + gitInfo.remote.repo)}`);
    }
  }
  
  console.log();
}

/**
 * Validate branch for operations (similar to branchDetection in maiass.sh)
 * @param {GitInfo} gitInfo - Git information
 * @returns {Object} Validation result with warnings and recommendations
 */
export function validateBranchForOperations(gitInfo) {
  if (!gitInfo) {
    return {
      valid: false,
      error: 'Not in a git repository',
      warnings: [],
      recommendations: []
    };
  }
  
  const warnings = [];
  const recommendations = [];
  let valid = true;
  
  // Check if on master/main branch
  if (gitInfo.isMasterBranch) {
    warnings.push(`You are on the ${gitInfo.branch} branch`);
    recommendations.push(`Consider switching to ${gitInfo.branchConfig.developBranch} for development work`);
  }
  
  // Check if on release branch
  if (gitInfo.isReleaseBranch) {
    warnings.push(`You are on a release branch: ${gitInfo.branch}`);
    recommendations.push('Release branches should only be used for release preparation');
  }
  
  // Check if on staging branch
  if (gitInfo.isStagingBranch) {
    warnings.push(`You are on the ${gitInfo.branch} branch`);
    recommendations.push(`Consider switching to ${gitInfo.branchConfig.developBranch} for development work`);
  }
  
  return {
    valid,
    warnings,
    recommendations,
    gitInfo
  };
}

// Export all functions as default object
export default {
  isGitRepository,
  getCurrentBranch,
  getGitAuthor,
  extractJiraTicket,
  classifyBranch,
  getRemoteInfo,
  getGitInfo,
  displayGitInfo,
  validateBranchForOperations
};
