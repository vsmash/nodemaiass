// Commit functionality for MAIASSNODE - port of maiass.sh commit behavior
import { execSync } from 'child_process';
import colors from './colors.js';
import { SYMBOLS } from './symbols.js';
import { getGitInfo, getGitStatus } from './git-info.js';
import readline from 'readline';
import { loadEnvironmentConfig } from './config.js';

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
      console.error(colors.Red(`${SYMBOLS.CROSS} Git command failed: ${command}`));
      console.error(colors.Red(error.message));
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
 * Get AI commit message suggestion
 * @param {Object} gitInfo - Git information object
 * @returns {Promise<string|null>} AI suggested commit message or null
 */
async function getAICommitSuggestion(gitInfo) {
  const config = loadEnvironmentConfig();
  const openaiToken = process.env.MAIASS_AI_TOKEN;
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
      console.log(colors.Gray(`${SYMBOLS.INFO} Git diff truncated to ${maxCharacters} characters`));
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
        'Authorization': `Bearer ${openaiToken}`
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      console.error(colors.Red(`${SYMBOLS.WARNING} AI API request failed: ${response.status} ${response.statusText}`));
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
      
      // Display token usage if available
      if (data.usage) {
        const totalTokens = data.usage.total_tokens || 0;
        const promptTokens = data.usage.prompt_tokens || 0;
        const completionTokens = data.usage.completion_tokens || 0;
        console.log(colors.Gray(`${SYMBOLS.INFO} Total Tokens : ${totalTokens}`));
      }
      
      return suggestion;
    }
    
    return null;
  } catch (error) {
    console.error(colors.Red(`${SYMBOLS.WARNING} AI suggestion failed: ${error.message}`));
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
    rl.question(prompt, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

/**
 * Get single character input from user
 * @param {string} prompt - Prompt to display
 * @returns {Promise<string>} Single character input
 */
function getSingleCharInput(prompt) {
  return new Promise((resolve) => {
    // Check if stdin is a TTY (interactive terminal)
    if (process.stdin.isTTY) {
      // Interactive mode - use raw mode for single character input
      process.stdout.write(prompt);
      process.stdin.setRawMode(true);
      process.stdin.resume();
      process.stdin.once('data', (key) => {
        process.stdin.setRawMode(false);
        process.stdin.pause();
        const char = key.toString().toLowerCase();
        console.log(); // New line after input
        resolve(char);
      });
    } else {
      // Non-interactive mode (piped input) - use readline
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      rl.question(prompt, (answer) => {
        rl.close();
        const char = answer.trim().toLowerCase() || 'n'; // Default to 'n' if empty
        resolve(char);
      });
    }
  });
}

/**
 * Get multi-line commit message from user
 * @param {string} jiraTicket - JIRA ticket number to prepend
 * @returns {Promise<string>} Multi-line commit message
 */
async function getMultiLineCommitMessage(jiraTicket) {
  console.log(colors.BCyan('Enter multiple lines (press Enter three times to finish):'));
  
  const lines = [];
  let emptyLineCount = 0;
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    const promptForLine = () => {
      rl.question('', (line) => {
        if (line === '') {
          emptyLineCount++;
          if (emptyLineCount >= 3) {
            rl.close();
            const message = lines.join('\n');
            resolve(message);
            return;
          }
        } else {
          emptyLineCount = 0;
          lines.push(line);
        }
        promptForLine();
      });
    };
    
    promptForLine();
  });
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
    console.log(colors.BBlue(`${SYMBOLS.INFO} Jira Ticket Number: ${colors.BWhite(jiraTicket)}`));
  }
  
  let useAI = false;
  let aiSuggestion = null;
  
  // Handle AI commit message modes
  switch (openaiMode) {
    case 'ask':
      if (openaiToken) {
        let reply;
        if (silent) {
          console.log(colors.BYellow('Would you like to use AI to suggest a commit message? [y/N] ') + colors.BGreen('y'));
          reply = 'y';
        } else {
          reply = await getSingleCharInput(colors.BYellow('Would you like to use AI to suggest a commit message? [y/N] '));
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
    console.log(colors.BBlue(`${SYMBOLS.INFO} Getting AI commit message suggestion...`));
    aiSuggestion = await getAICommitSuggestion(gitInfo);
    
    if (aiSuggestion) {
      console.log(colors.BGreen(`${SYMBOLS.CHECKMARK} AI suggested commit message:`));
      console.log(colors.BMagenta(aiSuggestion));
      console.log();
      
      let reply;
      if (silent) {
        console.log(colors.BCyan('Use this AI suggestion? [Y/n/e=edit] ') + colors.BGreen('Y'));
        reply = 'Y';
      } else {
        reply = await getSingleCharInput(colors.BCyan('Use this AI suggestion? [Y/n/e=edit] '));
      }
      
      switch (reply) {
        case 'n':
          console.log(colors.BBlue(`${SYMBOLS.INFO} AI suggestion declined, entering manual mode`));
          useAI = false;
          break;
        case 'e':
          console.log(colors.BBlue(`${SYMBOLS.INFO} Edit mode: You can modify the AI suggestion`));
          console.log(colors.BCyan('Current AI suggestion:'));
          console.log(colors.BWhite(aiSuggestion));
          console.log();
          console.log(colors.BCyan('Enter your modified commit message (press Enter three times when finished, or just Enter to keep AI suggestion):'));
          
          const editedMessage = await getMultiLineCommitMessage(jiraTicket);
          const finalEditedMessage = editedMessage || aiSuggestion;
          
          // Prepend JIRA ticket if found and not already present
          if (jiraTicket && finalEditedMessage && !finalEditedMessage.startsWith(jiraTicket)) {
            return `${jiraTicket} ${finalEditedMessage}`;
          }
          return finalEditedMessage;
        default:
          // Accept AI suggestion - prepend JIRA ticket if needed
          if (jiraTicket && aiSuggestion && !aiSuggestion.startsWith(jiraTicket)) {
            return `${jiraTicket} ${aiSuggestion}`;
          }
          return aiSuggestion;
      }
    } else {
      console.log(colors.BYellow(`${SYMBOLS.WARNING} AI suggestion failed, falling back to manual entry`));
      useAI = false;
    }
  }
  
  // Manual commit message entry
  if (jiraTicket) {
    console.log(colors.BBlue(`${SYMBOLS.INFO} Enter a commit message ${colors.BWhite(`(Jira ticket ${jiraTicket} will be prepended)`)}`));
  } else {
    console.log(colors.BBlue(`${SYMBOLS.INFO} Enter a commit message ${colors.BWhite('(starting with Jira Ticket# when relevant)')}`));
    console.log(colors.BBlue(`${SYMBOLS.INFO} Please enter a ticket number or 'fix:' or 'feature:' or 'devops:' to start the commit message`));
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
    console.log(colors.BYellow(`${SYMBOLS.INFO} Nothing to commit, working tree clean`));
    return true;
  }
  
  // Show staged changes
  const stagedOutput = executeGitCommand('git diff --cached --name-status', true);
  if (!stagedOutput) {
    console.log(colors.BYellow(`${SYMBOLS.INFO} No staged changes to show`));
    return true;
  }
  
  console.log(colors.BBlue(`${SYMBOLS.INFO} Staged changes detected:`));
  
  // Display the staged changes
  console.log(stagedOutput);
  
  // Get commit message
  const commitMessage = await getCommitMessage(gitInfo, { silent });
  if (!commitMessage) {
    console.log(colors.Red(`${SYMBOLS.CROSS} No commit message provided`));
    return false;
  }
  
  // Commit changes
  const verbosity = process.env.MAIASS_VERBOSITY || 'brief';
  const quietMode = verbosity !== 'debug';
  
  try {
    // Use echo and pipe to handle multi-line commit messages properly
    const commitCommand = `echo ${JSON.stringify(commitMessage)} | git commit -F -`;
    const result = executeGitCommand(commitCommand, quietMode);
    
    if (result === null) {
      console.log(colors.Red(`${SYMBOLS.CROSS} Commit failed`));
      return false;
    }
    
    console.log(colors.BGreen(`${SYMBOLS.CHECKMARK} Changes committed successfully`));
    
    // Ask about pushing to remote
    if (remoteExists('origin')) {
      let reply;
      if (silent) {
        console.log(colors.BYellow('Do you want to push this commit to remote? [y/N] ') + colors.BGreen('y'));
        reply = 'y';
      } else {
        reply = await getSingleCharInput(colors.BYellow('Do you want to push this commit to remote? [y/N] '));
      }
      
      if (reply === 'y') {
        const pushResult = executeGitCommand(`git push --set-upstream origin '${gitInfo.branch}'`, false);
        if (pushResult !== null) {
          console.log(colors.BGreen(`${SYMBOLS.CHECKMARK} Commit pushed.`));
        } else {
          console.log(colors.Red(`${SYMBOLS.CROSS} Push failed`));
          return false;
        }
      }
    } else {
      console.log(colors.BYellow(`${SYMBOLS.WARNING} No remote found.`));
    }
    
    return true;
  } catch (error) {
    console.log(colors.Red(`${SYMBOLS.CROSS} Commit failed: ${error.message}`));
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
    console.log(colors.Red(`${SYMBOLS.CROSS} Not in a git repository`));
    return false;
  }
  
  console.log(colors.BCyan(`${SYMBOLS.GEAR} Checking for Changes`));
  console.log();
  
  const status = gitInfo.status;
  
  // Check if there are any changes
  if (status.isClean) {
    console.log(colors.BGreen(`${SYMBOLS.CHECKMARK} No changes found. Working directory is clean.`));
    if (commitsOnly) {
      console.log(colors.BGreen(`Thank you for using MAIASSNODE.`));
    }
    return true;
  }
  
  // Handle unstaged changes
  if (status.unstagedCount > 0 || status.untrackedCount > 0) {
    console.log(colors.BYellow(`${SYMBOLS.WARNING} There are uncommitted changes in your working directory`));
    
    if (status.unstagedCount > 0) {
      console.log(colors.White(`  Unstaged: ${status.unstagedCount} file${status.unstagedCount === 1 ? '' : 's'}`));
    }
    if (status.untrackedCount > 0) {
      console.log(colors.White(`  Untracked: ${status.untrackedCount} file${status.untrackedCount === 1 ? '' : 's'}`));
    }
    
    if (!autoStage) {
      let reply;
      if (silent) {
        console.log(colors.BYellow(`Do you want to ${colors.BRed('stage and commit')} them? [y/N] `) + colors.BGreen('y'));
        reply = 'y';
      } else {
        reply = await getSingleCharInput(colors.BYellow(`Do you want to ${colors.BRed('stage and commit')} them? [y/N] `));
      }
      
      if (reply === 'y') {
        // Stage all changes
        const stageResult = executeGitCommand('git add -A', false);
        if (stageResult === null) {
          console.log(colors.Red(`${SYMBOLS.CROSS} Failed to stage changes`));
          return false;
        }
        
        // Refresh git info to get updated status
        const updatedGitInfo = getGitInfo();
        return await handleStagedCommit(updatedGitInfo, { silent });
      } else {
        // Check if there are staged changes to commit
        if (status.stagedCount > 0) {
          return await handleStagedCommit(gitInfo, { silent });
        }
        
        // Handle the case where user declined to stage and there are no staged changes
        if (commitsOnly) {
          // In commits-only mode, it's OK to have unstaged changes
          console.log(colors.BGreen(`Commit process completed. Thank you for using MAIASSNODE.`));
          return true;
        } else {
          // In pipeline mode, we cannot proceed with unstaged changes
          console.log(colors.BGreen(`Commit process completed.`));
          console.log(colors.Red(`${SYMBOLS.CROSS} Cannot proceed on release/changelog pipeline with uncommitted changes`));
          console.log(colors.BGreen(`Thank you for using MAIASSNODE.`));
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
    // Only staged changes present
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
