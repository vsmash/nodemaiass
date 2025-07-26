// Development logging utility for MAIASSNODE
// Node.js equivalent of the devlog.sh integration from maiass.sh
import { exec } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';
import colors from './colors.js';
import { getGitInfo } from './git-info.js';

/**
 * Check if devlog.sh script exists and is executable
 * @returns {boolean} True if devlog.sh is available
 */
function isDevlogAvailable() {
  // Check if devlog.sh exists in common locations (sync check for immediate availability)
  const commonPaths = [
    '/usr/local/bin/devlog.sh',
    '/usr/bin/devlog.sh',
    path.join(process.env.HOME || '', 'bin/devlog.sh'),
    path.join(process.env.HOME || '', '.local/bin/devlog.sh')
  ];
  
  // Quick sync check for file existence
  if (commonPaths.some(path => existsSync(path))) {
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
  const project = remote.repo || process.env.MAIASS_DEVLOG_PROJECT || 'unknown-project';
  const client = remote.owner || process.env.MAIASS_DEVLOG_CLIENT || 'unknown-client';
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
    type = 'c'
  } = options;

  // If devlog.sh is not available, return null (equivalent to empty function in bash)
  if (!isDevlogAvailable()) {
    if (process.env.MAIASS_DEBUG === 'true') {
      console.log(colors.Gray(`[DEBUG] devlog.sh not available, skipping log: ${message}`));
    }
    return null;
  }

  // If explicitly disabled, return null
  if (process.env.MAIASS_DEVLOG_ENABLED === 'false') {
    return null;
  }

  // Escape the message for shell execution
  const escapedMessage = message.replace(/"/g, '\\"').replace(/\n/g, '; ');
  
  // Execute devlog.sh with the same parameters as the bash version (async, non-blocking)
  const command = `devlog.sh "${escapedMessage}" "" "${project}" "${client}" "${jiraTicket}"`;
  
  if (process.env.MAIASS_DEBUG === 'true') {
    console.log(colors.Gray(`[DEBUG] Executing devlog.sh command: ${command}`));
  }
  
  // Execute asynchronously - don't block the main workflow (fire-and-forget)
  exec(command, { encoding: 'utf8' }, (error, stdout, stderr) => {
    if (error) {
      if (process.env.MAIASS_DEBUG === 'true') {
        console.error(colors.Red(`[DEBUG] devlog.sh error: ${error.message}`));
      }
      return;
    }
    
    if (process.env.MAIASS_DEBUG === 'true') {
      console.log(colors.Gray(`[DEBUG] Logged to devlog.sh: ${escapedMessage}`));
      if (stdout && stdout.trim()) {
        console.log(colors.Gray(`[DEBUG] devlog.sh response: ${stdout.trim()}`));
      }
    }
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
    jiraTicket: context.jiraTicket
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
    jiraTicket: context.jiraTicket
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
