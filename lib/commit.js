// Commit functionality for MAIASS - port of maiass.sh commit behavior
import { execSync } from 'child_process';
import { log } from './logger.js';
import { SYMBOLS } from './symbols.js';
import { getGitInfo, getGitStatus } from './git-info.js';
import readline from 'readline';
import { loadEnvironmentConfig } from './config.js';
import { logCommit } from './devlog.js';
import { generateMachineFingerprint } from './machine-fingerprint.js';
import { getSingleCharInput, getMultiLineInput } from './input-utils.js';

/**
 * Execute git command with proper error handling
 * @param {string} command - Git command to execute
 * @param {boolean} silent - Whether to suppress output
 * @returns {string|null} Command output or null if failed
 */
function executeGitCommand(command, silent = false) {
  try {
    const result = execSync(command, { 
      encoding: 'utf8', 
      stdio: silent ? 'pipe' : 'inherit'
    });
    return typeof result === 'string' ? result.trim() : '';
  } catch (error) {
    if (!silent) {
      log.error(SYMBOLS.CROSS, `Git command failed: ${command}\n${error.message}`);
    }
    return null;
  }
}

/**
 * Check if remote exists
 * @param {string} remoteName - Name of remote (default: origin)
 * @returns {boolean} True if remote exists
 */
function remoteExists(remoteName = 'origin') {
  const result = executeGitCommand(`git remote get-url ${remoteName}`, true);
  return result !== null;
}

/**
 * Create anonymous subscription automatically if no API key exists
 * @returns {Promise<string|null>} API key or null if failed
 */
async function createAnonymousSubscriptionIfNeeded() {
  const config = loadEnvironmentConfig();
  const existingToken = process.env.MAIASS_AI_TOKEN;
  
  if (existingToken) {
    return existingToken; // Already have API key
  }

  const { logger } = await import('./logger.js');
  const colors = await import('./colors.js');
  
  try {
    // Check if we already created one for this machine
    const { getConfigPaths, readConfig } = await import('./config-manager.js');
    const paths = getConfigPaths();
    const config = readConfig(paths.global);
    
    if (config.MAIASS_AI_TOKEN || config.ANONYMOUS_SUBSCRIPTION_ID) {
      return config.MAIASS_AI_TOKEN; // Already configured
    }

    log.info(SYMBOLS.INFO, 'No AI API key found. Creating anonymous subscription...');
    
    const machineFingerprint = generateMachineFingerprint();
    const endpoint = process.env.MAIASS_AI_ENDPOINT || 'https://pound.maiass.net';
    
    const response = await fetch(`${endpoint}/anonymous-subscription`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        machine_fingerprint: machineFingerprint,
        credits: 10000 // Default amount
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      log.error(SYMBOLS.CROSS, `Failed to create anonymous subscription: ${errorData.error || response.statusText}`);
      return null;
    }

    const data = await response.json();
    
    // Save the API key and subscription info
    const { setConfigValue } = await import('./config-manager.js');
    await setConfigValue('MAIASS_AI_TOKEN', data.api_key, { global: true });
    await setConfigValue('ANONYMOUS_SUBSCRIPTION_ID', data.subscription_id, { global: true });
    await setConfigValue('ANONYMOUS_TOP_UP_URL', data.top_up_url, { global: true });
    
    // Display success message with key info
    console.log('\n' + colors.default.BBlueOnWhite(' ANONYMOUS SUBSCRIPTION CREATED '));
    console.log(colors.default.Green('✓ API Key:'), colors.default.Cyan(data.api_key.substring(0, 12) + '...'));
    console.log(colors.default.Green('✓ Credits:'), colors.default.White(data.credits.toLocaleString()));
    console.log(colors.default.Yellow('💡 Top-up URL saved locally for adding more credits'));
    console.log(colors.default.Gray('   No personal data required • Machine-based identity\n'));
    
    return data.api_key;
    
  } catch (error) {
    log.error(SYMBOLS.CROSS, `Failed to create anonymous subscription: ${error.message}`);
    return null;
  }
}

/**
 * Get AI commit message suggestion
 * @param {Object} gitInfo - Git information object
 * @returns {Promise<string|null>} AI suggested commit message or null
 */
async function getAICommitSuggestion(gitInfo) {
  const config = loadEnvironmentConfig();
  
  // Try to get existing token or create anonymous subscription
  let openaiToken = await createAnonymousSubscriptionIfNeeded();
  
  const openaiEndpoint = process.env.MAIASS_AI_ENDPOINT || 'https://pound.maiass.net/v1/chat/completions';
  const openaiModel = process.env.MAIASS_AI_MODEL || 'gpt-3.5-turbo';
  const openaiTemperature = parseFloat(process.env.MAIASS_AI_TEMPERATURE || '0.7');
  const commitMessageStyle = process.env.MAIASS_AI_COMMIT_MESSAGE_STYLE || 'bullet';
  const maxCharacters = parseInt(process.env.MAIASS_AI_MAX_CHARACTERS || '8000');
  
  if (!openaiToken) {
    return null;
  }
  
  try {
    // Get git diff for staged changes
    let gitDiff = executeGitCommand('git diff --cached', true);
    if (!gitDiff) {
      return null;
    }
    
    // Truncate git diff if it exceeds character limit (matching bash script behavior)
    if (gitDiff.length > maxCharacters) {
      gitDiff = gitDiff.substring(0, maxCharacters) + '...[truncated]';
      log.info(SYMBOLS.INFO, `Git diff truncated to ${maxCharacters} characters`);
    }
    
    // Create AI prompt based on commit message style
    let prompt;
    if (commitMessageStyle === 'bullet') {
      prompt = `Analyze the following git diff and create a commit message with bullet points. Format as:
Brief summary title
  - feat: add user authentication
  - fix(api): resolve syntax error
  - docs: update README

Use past tense verbs. No blank line between title and bullets. Keep concise. Do not wrap the response in quotes.

Git diff:
${gitDiff}`;
    } else {
      prompt = `Analyze the following git diff and create a concise, descriptive commit message. Use conventional commit format when appropriate (feat:, fix:, docs:, etc.). Keep it under 72 characters for the first line.

Git diff:
${gitDiff}`;
    }
    
    // Make API request
    const requestBody = {
      model: openaiModel,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that writes concise, descriptive git commit messages based on code changes.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 150,
      temperature: openaiTemperature
    };
    
    const response = await fetch(openaiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiToken}`,
        'X-Machine-Fingerprint': generateMachineFingerprint()
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      log.error(SYMBOLS.WARNING, `AI API request failed: ${response.status} ${response.statusText}`);
      return null;
    }
    
    const data = await response.json();
    
    if (data.choices && data.choices.length > 0) {
      let suggestion = data.choices[0].message.content.trim();
      
      // Clean up any quotes that might wrap the entire response
      if ((suggestion.startsWith("'") && suggestion.endsWith("'")) || 
          (suggestion.startsWith('"') && suggestion.endsWith('"'))) {
        suggestion = suggestion.slice(1, -1).trim();
      }
      
      // Display enhanced usage information from credit-based system
      if (data.billing) {
        const billing = data.billing;
        const remaining = billing.credits_remaining || 0;
        const used = billing.credits_used || 0;
        const total = used + remaining;
        const usagePercent = total > 0 ? Math.round((used / total) * 100) : 0;
        
        log.info(SYMBOLS.INFO, `Credits Used: ${used} (${billing.model || 'Unknown Model'})`);
        log.info(SYMBOLS.INFO, `Credits Remaining: ${remaining} (${usagePercent}% used)`);
        
        // Show token breakdown if available
        const promptTokens = billing.prompt_tokens || 0;
        const completionTokens = billing.completion_tokens || 0;
        const totalTokens = billing.total_tokens || (promptTokens + completionTokens);
        
        if (totalTokens > 0) {
          log.info(SYMBOLS.INFO, `Tokens: ${totalTokens} (${promptTokens} + ${completionTokens})`);
        }
        
        // Show warnings if available
        if (billing.warning) {
          log.warning(SYMBOLS.WARNING, billing.warning);
        }
        
        // Display proxy messages if available
        if (data.messages && Array.isArray(data.messages)) {
          console.log(); // Add spacing before messages
          data.messages.forEach(message => {
            const icon = message.icon || '';
            const text = message.text || '';
            
            switch (message.type) {
              case 'error':
                log.error(icon, text);
                break;
              case 'warning':
                log.warning(icon, text);
                break;
              case 'info':
                log.info(icon, text);
                break;
              case 'notice':
                log.blue(icon, text);
                break;
              case 'success':
                log.success(icon, text);
                break;
              default:
                log.plain(`${icon} ${text}`);
            }
          });
          console.log(); // Add spacing after messages
        }
      } else if (data.usage) {
        // Fallback to legacy token display
        const totalTokens = data.usage.total_tokens || 0;
        const promptTokens = data.usage.prompt_tokens || 0;
        const completionTokens = data.usage.completion_tokens || 0;
        log.info(SYMBOLS.INFO, `Total Tokens: ${totalTokens} (${promptTokens} + ${completionTokens})`);
      }
      
      return suggestion;
    }
    
    return null;
  } catch (error) {
    log.error(SYMBOLS.WARNING, `AI suggestion failed: ${error.message}`);
    return null;
  }
}

/**
 * Get user input using readline
 * @param {string} prompt - Prompt to display
 * @returns {Promise<string>} User input
 */
function getUserInput(prompt) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    rl.on('SIGINT', () => {
      rl.close();
      log.warning(SYMBOLS.WARNING, 'Operation cancelled by user (Ctrl+C)');
      process.exit(0);
    });
    
    rl.question(prompt, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

/**
 * Get multi-line commit message from user
 * @param {string} jiraTicket - JIRA ticket number to prepend
 * @returns {Promise<string>} Multi-line commit message
 */
async function getMultiLineCommitMessage(jiraTicket) {
  const prompt = 'Enter multiple lines (press Enter three times to finish):';
  return await getMultiLineInput(prompt);
}

/**
 * Get commit message with AI integration and JIRA ticket handling
 * @param {Object} gitInfo - Git information object
 * @param {Object} options - Commit options
 * @returns {Promise<string>} Final commit message
 */
async function getCommitMessage(gitInfo, options = {}) {
  const { silent = false } = options;
  const openaiMode = process.env.MAIASS_AI_MODE || 'ask';
  const openaiToken = process.env.MAIASS_AI_TOKEN;
  const jiraTicket = gitInfo.jiraTicket;
  
  // Display JIRA ticket if found
  if (jiraTicket) {
    log.info(SYMBOLS.INFO, `Jira Ticket Number: ${jiraTicket}`);
  }
  
  let useAI = false;
  let aiSuggestion = null;
  
  // Handle AI commit message modes
  switch (openaiMode) {
    case 'ask':
      if (openaiToken) {
        let reply;
        if (silent) {
          log.info('', 'Would you like to use AI to suggest a commit message? [y/N] y');
          reply = 'y';
        } else {
          reply = await getSingleCharInput('Would you like to use AI to suggest a commit message? [y/N] ');
        }
        useAI = reply === 'y';
      }
      break;
    case 'autosuggest':
      if (openaiToken) {
        useAI = true;
      }
      break;
    case 'off':
    default:
      useAI = false;
      break;
  }
  
  // Try to get AI suggestion if requested
  if (useAI) {
    log.info(SYMBOLS.BRAIN, 'Getting AI commit message suggestion...');
    aiSuggestion = await getAICommitSuggestion(gitInfo);
    
    if (aiSuggestion) {
      log.blueOnWhite(SYMBOLS.WARNING, 'Always review AI suggestions before committing!');
      log.success(SYMBOLS.BRAIN, 'AI suggested commit message:', true);
      log.aisuggestion('', aiSuggestion);
      console.log();
      console.log();
      
      let reply;
      if (silent) {
        log.info('', 'Use this AI suggestion? [Y/n/e=edit] Y');
        reply = 'Y';
      } else {
        reply = await getSingleCharInput('Use this AI suggestion? [Y/n/e=edit] ');
      }
      
      switch (reply) {
        case 'n':
          log.info(SYMBOLS.INFO, 'AI suggestion declined, entering manual mode');
          useAI = false;
          break;
        case 'e':
          log.info(SYMBOLS.INFO, 'Edit mode: You can modify the AI suggestion');
          log.info('', 'Current AI suggestion:');
          log.aisuggestion('', aiSuggestion);
          console.log();
          log.info('', 'Enter your modified commit message (press Enter three times when finished, or just Enter to keep AI suggestion):');
          
          const editedMessage = await getMultiLineCommitMessage(jiraTicket);
          const finalEditedMessage = (editedMessage || aiSuggestion).trim();
          
          // Prepend JIRA ticket if found and not already present
          if (jiraTicket && finalEditedMessage && !finalEditedMessage.startsWith(jiraTicket)) {
            return `${jiraTicket} ${finalEditedMessage}`;
          }
          return finalEditedMessage;
        case 'y':
        case '':
          // Accept AI suggestion - prepend JIRA ticket if needed and trim whitespace
          const trimmedSuggestion = aiSuggestion.trim();
          if (jiraTicket && trimmedSuggestion && !trimmedSuggestion.startsWith(jiraTicket)) {
            return `${jiraTicket} ${trimmedSuggestion}`;
          }
          return trimmedSuggestion;
        default:
          log.info(SYMBOLS.INFO, `Invalid input '${reply}'. AI suggestion declined, entering manual mode`);
          useAI = false;
          break;
      }
    } else {
      log.warning(SYMBOLS.WARNING, 'AI suggestion failed, falling back to manual entry');
      useAI = false;
    }
  }
  
  // Manual commit message entry
  if (jiraTicket) {
    log.info(SYMBOLS.INFO, `Enter a commit message (Jira ticket ${jiraTicket} will be prepended)`);
  } else {
    log.info(SYMBOLS.INFO, 'Enter a commit message (starting with Jira Ticket# when relevant)');
    log.info(SYMBOLS.INFO, 'Please enter a ticket number or \'fix:\' or \'feature:\' or \'devops:\' to start the commit message');
  }
  
  const manualMessage = await getMultiLineCommitMessage(jiraTicket);
  
  // Prepend JIRA ticket if found and not already present
  if (jiraTicket && manualMessage && !manualMessage.startsWith(jiraTicket)) {
    return `${jiraTicket} ${manualMessage}`;
  }
  
  return manualMessage;
}

/**
 * Handle staged commit process
 * @param {Object} gitInfo - Git information object
 * @param {Object} options - Commit options
 * @returns {Promise<boolean>} True if commit was successful
 */
async function handleStagedCommit(gitInfo, options = {}) {
  const { silent = false } = options;
  // Check if there are actually staged changes
  if (!gitInfo.status || gitInfo.status.stagedCount === 0) {
    log.warning(SYMBOLS.INFO, 'Nothing to commit, working tree clean');
    return true;
  }
  
  // Show staged changes
  const stagedOutput = executeGitCommand('git diff --cached --name-status', true);
  if (!stagedOutput) {
    log.warning(SYMBOLS.INFO, 'No staged changes to show');
    return true;
  }
  
  log.critical(SYMBOLS.INFO, 'Staged changes detected:');
  
  // Display the staged changes
  console.log(stagedOutput);
  
  // Get commit message
  const commitMessage = await getCommitMessage(gitInfo, { silent });
  if (!commitMessage) {
    log.error(SYMBOLS.CROSS, 'No commit message provided');
    return false;
  }
  
  // Commit changes
  const verbosity = process.env.MAIASS_VERBOSITY || 'brief';
  const quietMode = verbosity !== 'debug';
  
  try {
    // Cross-platform commit message handling
    let commitCommand, result;
    if (process.platform === 'win32') {
      // Write commit message to a temporary file to avoid quoting/newline issues
      const fs = (await import('fs')).default;
      const os = (await import('os')).default;
      const path = (await import('path')).default;
      const tmpFile = path.join(os.tmpdir(), `maiass-commit-msg-${Date.now()}.txt`);
      fs.writeFileSync(tmpFile, commitMessage, { encoding: 'utf8' });
      commitCommand = `git commit -F "${tmpFile}"`;
      result = executeGitCommand(commitCommand, quietMode);
      fs.unlinkSync(tmpFile);
    } else {
      // Use echo/pipe for non-Windows
      commitCommand = `echo ${JSON.stringify(commitMessage)} | git commit -F -`;
      result = executeGitCommand(commitCommand, quietMode);
    }
    
    if (result === null) {
      log.error(SYMBOLS.CROSS, 'Commit failed');
      return false;
    }
    
    log.success(SYMBOLS.CHECKMARK, 'Changes committed successfully');
    
    // Log the commit to devlog.sh (equivalent to logthis in maiass.sh)
    logCommit(commitMessage, gitInfo);
    
    // Ask about pushing to remote
    if (remoteExists('origin')) {
      let reply;
      if (silent) {
        // In silent mode, automatically push
        reply = 'y';
        console.log('🔄 |)) Automatically pushing to remote (silent mode)');
      } else {
        reply = await getSingleCharInput('Do you want to push this commit to remote? [y/N] ');
      }
      
      if (reply === 'y') {
        
        const pushResult = executeGitCommand(`git push --set-upstream origin ${gitInfo.branch}`, false);
        if (pushResult !== null) {
          log.success(SYMBOLS.CHECKMARK, 'Commit pushed.');
        } else {
          log.error(SYMBOLS.CROSS, 'Push failed');
          return false;
        }
      }
    } else {
      log.warning(SYMBOLS.WARNING, 'No remote found.');
    }
    
    return true;
  } catch (error) {
    log.error(SYMBOLS.CROSS, `Commit failed: ${error.message}`);
    return false;
  }
}

/**
 * Main commit function - checks for changes and handles commit workflow
 * @param {Object} options - Commit options
 * @returns {Promise<boolean>} True if process completed successfully
 */
export async function commitThis(options = {}) {
  const { autoStage = false, commitsOnly = false, silent = false } = options;
  
  // Get git information
  const gitInfo = getGitInfo();
  if (!gitInfo) {
    log.error(SYMBOLS.CROSS, 'Not in a git repository');
    return false;
  }
  
  log.info(SYMBOLS.GEAR, 'Checking for Changes\n');
  
  const status = gitInfo.status;
  
  // Check if there are any changes
  if (status.isClean) {
    log.success(SYMBOLS.CHECKMARK, 'No changes found. Working directory is clean.');
    if (commitsOnly) {
      log.info('', 'Thank you for using MAIASS.');
    }
    return true;
  }

  // Display comprehensive status with better formatting
  log.critical(SYMBOLS.INFO, 'Git Status:');
  
  // Show staged changes in green
  if (status.stagedCount > 0) {
    log.success('', `  Staged: ${status.stagedCount} file${status.stagedCount === 1 ? '' : 's'}`);
  }
  
  // Show unstaged changes in yellow/orange
  if (status.unstagedCount > 0) {
    log.warning('', `  Unstaged: ${status.unstagedCount} file${status.unstagedCount === 1 ? '' : 's'}`);
  }
  
  // Show untracked changes in blue
  if (status.untrackedCount > 0) {
    log.blue('', `  Untracked: ${status.untrackedCount} file${status.untrackedCount === 1 ? '' : 's'}`);
  }
  
  console.log(); // Add spacing

  // Handle unstaged/untracked changes first
  if (status.unstagedCount > 0 || status.untrackedCount > 0) {
    if (!autoStage) {
      let reply;
      if (silent) {
        // In silent mode, automatically stage
        reply = 'y';
        console.log('🔄 |)) Automatically staging changes (silent mode)');
      } else {
        reply = await getSingleCharInput('Do you want to stage unstaged/untracked files? [y/N] ');
      }
      if (reply === 'y') {
        // Stage all changes
        const stageResult = executeGitCommand('git add -A', false);
        if (stageResult === null) {
          log.error(SYMBOLS.CROSS, 'Failed to stage changes');
          return false;
        }
        
        // Refresh git info to get updated status
        const updatedGitInfo = getGitInfo();
        return await handleStagedCommit(updatedGitInfo, { silent });
      } else {
        // Check if there are staged changes to commit
        if (status.stagedCount > 0) {
          log.info(SYMBOLS.INFO, 'Proceeding with staged changes only');
          return await handleStagedCommit(gitInfo, { silent });
        }
        
        // Handle the case where user declined to stage and there are no staged changes
        if (commitsOnly) {
          // In commits-only mode, it's OK to have unstaged changes
          log.info('', 'No changes staged for commit.');
          log.success('', 'Thank you for using MAIASS.');
          return true;
        } else {
          // In pipeline mode, we cannot proceed with unstaged changes
          log.warning('', 'No changes staged for commit.');
          log.error(SYMBOLS.CROSS, 'Cannot proceed on release/changelog pipeline with uncommitted changes');
          log.success('', 'Thank you for using MAIASS.');
          return false;
        }
      }
    } else {
      // Auto-stage all changes
      const stageResult = executeGitCommand('git add -A', false);
      if (stageResult === null) {
        console.log(colors.Red(`${SYMBOLS.CROSS} Failed to stage changes`));
        return false;
      }
      
      // Refresh git info and commit
      const updatedGitInfo = getGitInfo();
      return await handleStagedCommit(updatedGitInfo, { silent });
    }
  } else if (status.stagedCount > 0) {
    // Only staged changes present, proceed directly to commit
    return await handleStagedCommit(gitInfo, { silent });
  }
  
  return true;
}

// Export individual functions for testing and reuse
export {
  getCommitMessage,
  handleStagedCommit,
  getAICommitSuggestion,
  executeGitCommand,
  remoteExists
};
