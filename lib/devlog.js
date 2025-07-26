// Development logging utility for MAIASSNODE
// Node.js equivalent of the devlog.sh integration from maiass.sh
import { execSync } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';
import colors from './colors.js';

/**
 * Check if devlog.sh script exists and is executable
 * @returns {boolean} True if devlog.sh is available
 */
function isDevlogAvailable() {
  try {
    // Check if devlog.sh is in PATH
    execSync('which devlog.sh', { stdio: 'ignore' });
    return true;
  } catch (error) {
    // Check if devlog.sh exists in common locations
    const commonPaths = [
      '/usr/local/bin/devlog.sh',
      '/usr/bin/devlog.sh',
      path.join(process.env.HOME || '', 'bin/devlog.sh'),
      path.join(process.env.HOME || '', '.local/bin/devlog.sh')
    ];
    
    return commonPaths.some(path => existsSync(path));
  }
}

/**
 * Log a message using devlog.sh (equivalent to logthis function in maiass.sh)
 * @param {string} message - The message to log
 * @param {Object} options - Logging options
 * @param {string} options.project - Project name (default: MAIASSS)
 * @param {string} options.client - Client name (default: VVelvary)
 * @param {string} options.jiraTicket - JIRA ticket number (default: Ddevops)
 * @param {string} options.type - Log type (default: c for commit)
 * @returns {string|null} Debug message from devlog.sh or null if not available
 */
export function logThis(message, options = {}) {
  const {
    project = process.env.MAIASS_DEVLOG_PROJECT || 'MAIASSS',
    client = process.env.MAIASS_DEVLOG_CLIENT || 'VVelvary',
    jiraTicket = process.env.MAIASS_DEVLOG_JIRA_TICKET || 'Ddevops',
    type = 'c'
  } = options;

  // If devlog.sh is not available, return null (equivalent to empty function in bash)
  if (!isDevlogAvailable()) {
    if (process.env.MAIASS_DEBUG === 'true') {
      console.log(colors.Gray(`[DEBUG] devlog.sh not available, skipping log: ${message}`));
    }
    return null;
  }

  try {
    // Escape the message for shell execution
    const escapedMessage = message.replace(/"/g, '\\"').replace(/\n/g, '; ');
    
    // Execute devlog.sh with the same parameters as the bash version
    const command = `devlog.sh "${escapedMessage}" "${type}" "${project}" "${client}" "${jiraTicket}"`;
    if (process.env.MAIASS_DEBUG === 'true') {
      console.log(colors.Gray(`[DEBUG] Executing devlog.sh command: ${command}`));  
      const debugMsg = execSync(command, { 
        encoding: 'utf8',
        stdio: 'pipe'
      }).trim();
      console.log(colors.Gray(`[DEBUG] Logged to devlog.sh: ${escapedMessage}`));
      if (debugMsg) {
        console.log(colors.Gray(`[DEBUG] devlog.sh response: ${debugMsg}`));
      }
      return debugMsg;
    }else{
      const debugMsg = execSync(command, { 
        encoding: 'utf8',
        stdio: 'ignore'
      });
      return debugMsg;
    }   
  } catch (error) {
    if (process.env.MAIASS_DEBUG === 'true') {
      console.error(colors.Red(`[DEBUG] devlog.sh error: ${error.message}`));
    }
    return null;
  }
}

/**
 * Log a commit message (specific use case from maiass.sh)
 * @param {string} commitMessage - The commit message to log
 * @param {string} jiraTicket - Optional JIRA ticket number
 * @returns {string|null} Debug message from devlog.sh
 */
export function logCommit(commitMessage, jiraTicket = null) {
  // Clean up commit message (remove newlines, replace with semicolons)
  const cleanMessage = commitMessage.replace(/\n/g, '; ');
  
  const options = {
    type: 'c' // 'c' for commit
  };
  
  if (jiraTicket) {
    options.jiraTicket = jiraTicket;
  }
  
  return logThis(cleanMessage, options);
}

/**
 * Log a merge operation (specific use case from maiass.sh)
 * @param {string} sourceBranch - Source branch name
 * @param {string} targetBranch - Target branch name
 * @param {string} operation - Operation type (e.g., "Merged", "Created pull request")
 * @returns {string|null} Debug message from devlog.sh
 */
export function logMerge(sourceBranch, targetBranch, operation = 'Merged') {
  const message = `${operation} ${sourceBranch} into ${targetBranch}`;
  return logThis(message, { type: 'c' });
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
