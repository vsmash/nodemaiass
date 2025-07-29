// Commit functionality for MAIASS - port of maiass.sh commit behavior
import { execSync } from 'child_process';
import { log } from './logger.js';
import { SYMBOLS } from './symbols.js';
import { getGitInfo, getGitStatus } from './git-info.js';
import readline from 'readline';
import { loadEnvironmentConfig } from './config.js';
import { logCommit } from './devlog.js';

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
    log.warning(SYMBOLS.WARNING, 'No AI token configured. Set MAIASS_AI_TOKEN in your .env.maiass file');
    return null;
  }
  
  // Enhanced token validation
  if (!openaiToken) {
    log.error(SYMBOLS.WARNING, 'No AI token provided');
    log.info(SYMBOLS.INFO, 'Please set MAIASS_AI_TOKEN in your .env.maiass file');
    log.info(SYMBOLS.INFO, 'Example: MAIASS_AI_TOKEN=your_token_here');
    return null;
  }

  // Log token info for debugging (masked)
  const tokenPrefix = openaiToken.substring(0, 5);
  const tokenSuffix = openaiToken.length > 10 ? openaiToken.substring(openaiToken.length - 4) : '****';
  log.debug('Using AI Token', {
    tokenLength: openaiToken.length,
    tokenStartsWith: tokenPrefix,
    tokenEndsWith: tokenSuffix,
    endpoint: openaiEndpoint
  });

  // Validate token format
  const isTokenValid = /^[a-zA-Z0-9_\-.]{20,}$/.test(openaiToken);
  if (!isTokenValid) {
    log.error(SYMBOLS.WARNING, 'Invalid AI token format');
    log.info(SYMBOLS.INFO, 'Token should be at least 20 characters long and only contain letters, numbers, underscores, hyphens, or periods');
    log.info(SYMBOLS.INFO, 'Example format: sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
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
    
    // Enhanced request logging with timing
    const startTime = Date.now();
    let response;
    
    try {
      // Log the full request in debug mode
      log.debug('AI API Request', {
        endpoint: openaiEndpoint,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiToken ? '***' + openaiToken.slice(-4) : 'none'}`
        },
        body: {
          ...requestBody,
          // Redact the actual token and content from logs
          messages: requestBody.messages.map(msg => ({
            ...msg,
            content: msg.content ? msg.content.substring(0, 100) + '...' : 'empty'
          }))
        },
        timestamp: new Date().toISOString()
      });
      
      // Make the actual request with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      // Token info already logged above, no need to log again
      
      // Set up request headers
      const requestHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiToken}`
      };
      
      response = await fetch(openaiEndpoint, {
        method: 'POST',
        headers: requestHeaders,
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
    } catch (error) {
      const elapsed = Date.now() - startTime;
      log.debug('AI API Request Failed', {
        error: {
          name: error.name,
          message: error.message,
          code: error.code,
          stack: error.stack ? error.stack.split('\n') : 'No stack trace'
        },
        elapsedMs: elapsed,
        endpoint: openaiEndpoint,
        timestamp: new Date().toISOString()
      });
      
      // Re-throw with more context
      if (error.name === 'AbortError') {
        throw new Error(`Request to ${openaiEndpoint} timed out after 30 seconds`);
      } else if (error.code === 'ENOTFOUND') {
        throw new Error(`Could not resolve host for ${openaiEndpoint}. Check your network connection.`);
      } else if (error.code === 'ECONNREFUSED') {
        throw new Error(`Connection refused by ${openaiEndpoint}. The service may be down.`);
      } else if (error.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE') {
        throw new Error(`SSL certificate verification failed for ${openaiEndpoint}. Check your system's certificate store.`);
      }
      
      throw error; // Re-throw the original error if we don't have a specific handler
    }
    
    // Get response text for debugging before parsing as JSON
    let responseText;
    let responseData;
    
    try {
      responseText = await response.text();
      
      // Log the raw response for debugging
      log.debug('Raw AI API Response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: responseText.length > 1000 ? responseText.substring(0, 1000) + '... [truncated]' : responseText,
        elapsedMs: Date.now() - startTime,
        timestamp: new Date().toISOString()
      });
      
      // Try to parse JSON, but handle cases where response might not be JSON
      try {
        responseData = responseText ? JSON.parse(responseText) : {};
      } catch (e) {
        log.debug('Failed to parse API response as JSON', { error: e.message });
        responseData = { error: { message: 'Invalid JSON response from server' } };
      }
      
      if (!response.ok) {
        const errorMessage = responseData?.error?.message || response.statusText || 'Unknown error';
        const errorType = responseData?.error?.type || 'API Error';
        const errorCode = responseData?.error?.code || '';
        
        // Enhanced error handling with specific guidance for each error type
        switch (response.status) {
          case 400:
            log.error(SYMBOLS.CROSS, `Bad request: ${errorMessage}`);
            log.info(SYMBOLS.INFO, 'The request was malformed or missing required parameters');
            break;
            
          case 401:
          case 403:
            log.error(SYMBOLS.CROSS, `Authentication failed (${response.status}): ${errorMessage}`);
            log.info(SYMBOLS.INFO, 'Possible issues:');
            log.info(SYMBOLS.INFO, '1. Your API key may be invalid or expired');
            log.info(SYMBOLS.INFO, '2. The token might not have the required permissions');
            log.info(SYMBOLS.INFO, '3. The endpoint URL might be incorrect');
            log.info(SYMBOLS.INFO, '4. The token format might not match what the server expects');
            
            // Provide more specific guidance based on token format
            if (openaiToken.startsWith('sk-')) {
              log.info(SYMBOLS.INFO, 'Note: This looks like an OpenAI API key. Make sure you\'re using the correct endpoint.');
            } else if (openaiToken.startsWith('mai_')) {
              log.info(SYMBOLS.INFO, 'Note: This looks like a MAIASS token. Ensure your local AI service is running and accessible.');
            }
            
            log.info(SYMBOLS.INFO, 'Check your .env.maiass file for MAIASS_AI_TOKEN and MAIASS_AI_ENDPOINT');
            break;
            
          case 404:
            log.error(SYMBOLS.CROSS, `Endpoint not found: ${openaiEndpoint}`);
            log.info(SYMBOLS.INFO, 'Please verify the MAIASS_AI_ENDPOINT in your .env.maiass file');
            log.info(SYMBOLS.INFO, 'For local AI services, ensure the service is running at the specified URL');
            break;
            
          case 422:
            log.error(SYMBOLS.CROSS, `Validation error: ${errorMessage}`);
            log.info(SYMBOLS.INFO, 'The request was well-formed but contained invalid data');
            break;
            
          case 429:
            log.error(SYMBOLS.CROSS, `Rate limit exceeded: ${errorMessage}`);
            log.info(SYMBOLS.INFO, 'Please wait before making more requests or check your rate limits');
            break;
            
          case 500:
          case 502:
          case 503:
          case 504:
            log.error(SYMBOLS.CROSS, `AI service error (${response.status}): ${errorMessage}`);
            log.info(SYMBOLS.INFO, 'The AI service may be temporarily unavailable or experiencing issues');
            log.info(SYMBOLS.INFO, 'Please try again in a few minutes');
            break;
            
          default:
            log.error(SYMBOLS.CROSS, `API request failed (${response.status}): ${errorMessage}`);
            log.info(SYMBOLS.INFO, 'Please check your configuration and try again');
        }
        
        log.debug('Full error details:', { 
          status: response.status, 
          error: responseData?.error || 'No error details',
          endpoint: openaiEndpoint,
          tokenStartsWith: openaiToken.substring(0, 5) + '...',
          tokenLength: openaiToken.length
        });
        
        return null;
      }
      
      // Log successful response in debug mode
      log.debug('AI API Response:', {
        status: response.status,
        statusText: response.statusText,
        body: responseData,
        elapsedMs: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        endpoint: openaiEndpoint,
        model: openaiModel,
        tokenConfigured: !!openaiToken,
        tokenPrefix: openaiToken ? `${openaiToken.substring(0, 5)}...` : 'none',
        tokenLength: openaiToken ? openaiToken.length : 0,
        responseHeaders: Object.fromEntries(response.headers.entries())
      });
      
      try {
        // Process successful response
        if (responseData.choices && responseData.choices.length > 0) {
          let suggestion = responseData.choices[0].message.content.trim();
          
          // Clean up any quotes that might wrap the entire response
          if ((suggestion.startsWith("'") && suggestion.endsWith("'")) || 
              (suggestion.startsWith('"') && suggestion.endsWith('"'))) {
            suggestion = suggestion.slice(1, -1).trim();
          }
          
          // Log token usage if available
          if (responseData.usage) {
            log.debug('Token usage:', {
              promptTokens: responseData.usage.prompt_tokens,
              completionTokens: responseData.usage.completion_tokens,
              totalTokens: responseData.usage.total_tokens
            });
          }
          
          return suggestion;
        } else {
          log.warning(SYMBOLS.WARNING, 'No choices returned from AI API');
          log.debug('Unexpected response format:', responseData);
          return null;
        }
      } catch (error) {
        // Handle any errors that occur during response processing
        log.error(SYMBOLS.CROSS, `Error processing AI response: ${error.message}`);
        log.debug('Error details:', {
          error: error.stack ? error.stack.split('\n') : 'No stack trace',
          elapsedMs: Date.now() - startTime,
          timestamp: new Date().toISOString()
        });
        return null;
      }
    } catch (error) {
      // Handle network errors and other exceptions
      log.error(SYMBOLS.CROSS, `Error communicating with AI service: ${error.message}`);
      log.debug('Error details:', {
        error: error.stack ? error.stack.split('\n') : 'No stack trace',
        endpoint: openaiEndpoint,
        elapsedMs: Date.now() - startTime,
        timestamp: new Date().toISOString()
      });
      
      // Provide additional guidance for common errors
      if (error.name === 'AbortError') {
        log.info(SYMBOLS.INFO, 'Request timed out. The AI service may be slow or unavailable.');
      } else if (error.code === 'ENOTFOUND') {
        log.info(SYMBOLS.INFO, `Could not resolve host: ${new URL(openaiEndpoint).hostname}`);
        log.info(SYMBOLS.INFO, 'Please check your internet connection and MAIASS_AI_ENDPOINT setting');
      } else if (error.code === 'ECONNREFUSED') {
        log.info(SYMBOLS.INFO, `Connection refused by ${openaiEndpoint}`);
        log.info(SYMBOLS.INFO, 'The AI service may not be running or is not accessible');
      }
      
      return null;
    }
  } catch (error) {
    // Enhanced error message with more context
    let errorMessage = `AI suggestion failed: ${error.message}`;
    
    // Handle specific error codes with more helpful messages
    switch (error.code) {
      case 'ENOTFOUND':
        errorMessage = `Cannot connect to AI service: ${openaiEndpoint} - Host not found. Check your internet connection.`;
        break;
      case 'ECONNREFUSED':
        errorMessage = `Connection refused by AI service at ${openaiEndpoint}. The service might be down.`;
        break;
      case 'ETIMEDOUT':
        errorMessage = `Connection to AI service timed out. Please check your network connection.`;
        break;
      case 'EAI_AGAIN':
        errorMessage = `Temporary DNS resolution failure while trying to reach ${openaiEndpoint}.`;
        break;
      case 'UNABLE_TO_VERIFY_LEAF_SIGNATURE':
        errorMessage = `SSL certificate verification failed for ${openaiEndpoint}. Check your system's certificate store.`;
        break;
    }
    
    log.error(SYMBOLS.WARNING, errorMessage);
    
    // Always show network-related info, not just in debug mode
    log.info(SYMBOLS.INFO, `Endpoint: ${openaiEndpoint}`);
    log.info(SYMBOLS.INFO, `Token configured: ${!!openaiToken ? 'Yes' : 'No'}`);
    
    // Detailed debug info
    const debugInfo = {
      name: error.name,
      code: error.code,
      endpoint: openaiEndpoint,
      tokenConfigured: !!openaiToken,
      tokenPrefix: openaiToken ? `${openaiToken.substring(0, 5)}...` : 'none',
      tokenLength: openaiToken ? openaiToken.length : 0,
      nodeVersion: process.version,
      platform: process.platform,
      stack: error.stack
    };
    
    log.debug('AI Suggestion Error Details:', debugInfo);
    
    // If we have a network error, suggest common solutions
    if (['ENOTFOUND', 'ECONNREFUSED', 'ETIMEDOUT', 'EAI_AGAIN'].includes(error.code)) {
      log.info(SYMBOLS.INFO, 'Troubleshooting steps:');
      log.info(SYMBOLS.INFO, '1. Check your internet connection');
      log.info(SYMBOLS.INFO, '2. Verify the endpoint URL is correct');
      log.info(SYMBOLS.INFO, '3. Try pinging the endpoint to check connectivity');
      log.info(SYMBOLS.INFO, '4. If behind a proxy, ensure it is properly configured');
    }
    
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
  log.info('', 'Enter multiple lines (press Enter three times to finish):');
  
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
      log.success(SYMBOLS.CHECKMARK, 'AI suggested commit message:');
      log.aisuggestion('', aiSuggestion);
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
  
  log.info(SYMBOLS.INFO, 'Staged changes detected:');
  
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
    // Use echo and pipe to handle multi-line commit messages properly
    const commitCommand = `echo ${JSON.stringify(commitMessage)} | git commit -F -`;
    const result = executeGitCommand(commitCommand, quietMode);
    
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
        log.info('', 'Do you want to push this commit to remote? [y/N] y');
        reply = 'y';
      } else {
        reply = await getSingleCharInput('Do you want to push this commit to remote? [y/N] ');
      }
      
      if (reply === 'y') {
        const pushResult = executeGitCommand(`git push --set-upstream origin '${gitInfo.branch}'`, false);
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
  
  // Handle unstaged changes
  if (status.unstagedCount > 0 || status.untrackedCount > 0) {
    log.warning(SYMBOLS.WARNING, 'There are uncommitted changes in your working directory');
    
    if (status.unstagedCount > 0) {
      log.info('', `  Unstaged: ${status.unstagedCount} file${status.unstagedCount === 1 ? '' : 's'}`);
    }
    if (status.untrackedCount > 0) {
      log.info('', `  Untracked: ${status.untrackedCount} file${status.untrackedCount === 1 ? '' : 's'}`);
    }
    
    if (!autoStage) {
      let reply;
      if (silent) {
        log.info('', `Do you want to stage and commit them? [y/N] y`);
        reply = 'y';
      } else {
        reply = await getSingleCharInput('Do you want to stage and commit them? [y/N] ');
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
          return await handleStagedCommit(gitInfo, { silent });
        }
        
        // Handle the case where user declined to stage and there are no staged changes
        if (commitsOnly) {
          // In commits-only mode, it's OK to have unstaged changes
          log.success('', 'Commit process completed. Thank you for using MAIASS.');
          return true;
        } else {
          // In pipeline mode, we cannot proceed with unstaged changes
          log.success('', 'Commit process completed.');
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
