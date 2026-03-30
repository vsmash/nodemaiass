// Development logging utility for MAIASS
// Node.js equivalent of the devlog.sh integration from maiass.sh
import { exec } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';
import colors from './colors.js';
import { getGitInfo } from './git-info.js';
import { logger } from './logger.js';

/**
 * Get the path to devlog.ps1 on Windows via MAIASS_DEVLOG_SCRIPT env var
 * @returns {string|null} Full path to devlog.ps1, or null if not found/set
 */
function getDevlogPs1Path() {
  const scriptPath = process.env.MAIASS_DEVLOG_SCRIPT;
  if (scriptPath && existsSync(scriptPath)) return scriptPath;
  return null;
}

/**
 * Check if devlog script exists and is available
 * @returns {boolean} True if devlog.sh (unix) or devlog.ps1 (windows) is available
 */
function isDevlogAvailable() {
  if (process.platform === 'win32') {
    return getDevlogPs1Path() !== null;
  }
  // Check if devlog.sh exists in common locations (sync check for immediate availability)
  const commonPaths = [
    '/usr/local/bin/devlog.sh',
    '/usr/bin/devlog.sh',
    path.join(process.env.HOME || '', 'bin/devlog.sh'),
    path.join(process.env.HOME || '', '.local/bin/devlog.sh')
  ];
  if (commonPaths.some(p => existsSync(p))) {
    return true;
  }
  // For PATH check, we'll assume it's available and let the async call handle errors
  return true;
}

/**
 * Extract devlog context from gitInfo object
 * @param {Object} gitInfo - Git information object
 * @returns {Object} Context with project, client, and jiraTicket
 */
function extractDevlogContext(gitInfo) {
  const remote = gitInfo?.remote || {};
  const project = process.env.MAIASS_DEVLOG_PROJECT || remote.repo || 'unknown-project';
  const client = process.env.MAIASS_DEVLOG_CLIENT || remote.owner || 'unknown-client';
  const subClient = process.env.MAIASS_DEVLOG_SUBCLIENT || client;
  const jiraTicket = gitInfo?.jiraTicket || process.env.MAIASS_DEVLOG_JIRA_TICKET || 'no-ticket';



  
  return { project, client, jiraTicket };
}

/**
 * Log a message using devlog.sh (equivalent to logthis function in maiass.sh)
 * @param {string} message - The message to log
 * @param {Object} options - Logging options
 * @param {string} options.project - Project name (from repo name)
 * @param {string} options.client - Client name (from repo owner/workspace)
 * @param {string} options.jiraTicket - JIRA ticket number (from branch or fallback)
 * @param {string} options.type - Log type (default: c for commit)
 * @returns {string|null} Debug message from devlog.sh or null if not available
 */
export function logThis(message, options = {}) {
  const {
    project = process.env.MAIASS_DEVLOG_PROJECT || 'unknown-project',
    client = process.env.MAIASS_DEVLOG_CLIENT || 'unknown-client',
    jiraTicket = process.env.MAIASS_DEVLOG_JIRA_TICKET || 'no-ticket',
    subClient = process.env.MAIASS_DEVLOG_SUBCLIENT || client,
    type = 'c'
  } = options;

  // If devlog.sh is not available, return null (equivalent to empty function in bash)
  if (!isDevlogAvailable()) {
    logger.debug(`devlog not available, skipping log: ${message}`);
    return null;
  }

  // If explicitly disabled, return null
  if (process.env.MAIASS_DEVLOG_ENABLED === 'false') {
    return null;
  }

  // Escape the message for shell execution
  const escapedMessage = message.replace(/"/g, '\\"').replace(/\n/g, '; ');

  let command;
  if (process.platform === 'win32') {
    const ps1Path = getDevlogPs1Path();
    // Args in order: message minutes project client ticket subclient
    // -s = silent (no interactive prompts when called from maiass)
    command = `powershell.exe -ExecutionPolicy Bypass -NonInteractive -File "${ps1Path}" -s "${escapedMessage}" "?" "${project}" "${client}" "${jiraTicket}" "${subClient}"`;
  } else {
    command = `devlog.sh "${escapedMessage}" "?" "${project}" "${client}" "${jiraTicket}" "${subClient}"`;
  }

  logger.debug(`Executing devlog command: ${command}`);
  
  // Execute asynchronously - don't block the main workflow (fire-and-forget)
  exec(command, { encoding: 'utf8' }, (error, stdout, stderr) => {
    if (error) {
      
      if (process.env.MAIASS_DEBUG === 'true') {
        logger.error(`devlog.sh error: ${error.message}`);
      }
      return;
    }
    
    // Only log success confirmation, not the verbose stdout output

      logger.debug(`Logged to devlog: ${escapedMessage}`);
  });
  
  // Return immediately (don't wait for devlog.sh to complete)
  return null;
}

/**
 * Log a commit message (specific use case from maiass.sh)
 * @param {string} commitMessage - The commit message to log
 * @param {Object} gitInfo - Git information object (already extracted)
 * @returns {string|null} Debug message from devlog.sh
 */
export function logCommit(commitMessage, gitInfo) {
  // Clean up commit message (remove newlines, replace with semicolons)
  const cleanMessage = commitMessage.replace(/\n/g, '; ');
  
  // Extract context from already-available gitInfo
  const context = extractDevlogContext(gitInfo);
  
  const options = {
    type: 'c', // 'c' for commit
    project: context.project,
    client: context.client,
    jiraTicket: context.jiraTicket,
    subClient: context.subClient
  };
  
  return logThis(cleanMessage, options);
}

/**
 * Log a merge operation (specific use case from maiass.sh)
 * @param {string} sourceBranch - Source branch name
 * @param {string} targetBranch - Target branch name
 * @param {Object} gitInfo - Git information object (already extracted)
 * @param {string} operation - Operation type (e.g., "Merged", "Created pull request")
 * @returns {string|null} Debug message from devlog.sh
 */
export function logMerge(sourceBranch, targetBranch, gitInfo, operation = 'Merged') {
  const message = `${operation} ${sourceBranch} into ${targetBranch}`;
  
  // Extract context from already-available gitInfo
  const context = extractDevlogContext(gitInfo);
  
  const options = {
    type: 'c', // 'c' for commit/merge
    project: context.project,
    client: context.client,
    jiraTicket: context.jiraTicket,
    subClient: context.subClient
  };
  
  return logThis(message, options);
}

/**
 * Log a pull request creation
 * @param {string} version - Version or branch name
 * @returns {string|null} Debug message from devlog.sh
 */
export function logPullRequest(version) {
  const message = `Created pull request for ${version}`;
  return logThis(message, { type: 'c' });
}

/**
 * Check if devlog functionality is enabled
 * @returns {boolean} True if devlog should be used
 */
export function isDevlogEnabled() {
  // Check if explicitly disabled
  if (process.env.MAIASS_DEVLOG_ENABLED === 'false') {
    return false;
  }
  
  // Check if devlog.sh is available
  return isDevlogAvailable();
}

export default {
  logThis,
  logCommit,
  logMerge,
  logPullRequest,
  isDevlogEnabled,
  isDevlogAvailable
};
