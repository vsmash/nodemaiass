// Commit functionality for MAIASS - port of maiass.sh commit behavior
import { execSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { log, redact } from './logger.js';
import { SYMBOLS } from './symbols.js';
import { getGitInfo, getGitStatus } from './git-info.js';
import readline from 'readline';
import { loadEnvironmentConfig } from './config.js';
import { generateMachineFingerprint } from './machine-fingerprint.js';
import { storeSecureVariable, retrieveSecureVariable } from './secure-storage.js';
import { getClientName, getClientVersion } from './client-info.js';
import { getSingleCharInput, getMultiLineInput } from './input-utils.js';
import { logCommit } from './devlog.js';
import colors from './colors.js';
import chalk from 'chalk';

/**
 * Simple spinner for AI API calls
 */
class Spinner {
  constructor(message = 'Working') {
    this.message = message;
    this.frames = ['\u280b', '\u2819', '\u2839', '\u2838', '\u283c', '\u2834', '\u2826', '\u2827', '\u2807', '\u280f'];
    this.frameIndex = 0;
    this.intervalId = null;
    this.isSpinning = false;
  }

  start() {
    if (this.isSpinning) return;
    this.isSpinning = true;
    
    // Hide cursor
    process.stderr.write('\x1B[?25l');
    
    this.intervalId = setInterval(() => {
      const frame = this.frames[this.frameIndex];
      process.stderr.write(`\r${colors.BYellow(frame)} ${this.message}...`);
      this.frameIndex = (this.frameIndex + 1) % this.frames.length;
    }, 100);
  }

  stop(success = true) {
    if (!this.isSpinning) return;
    this.isSpinning = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    // Clear line and show cursor
    process.stderr.write('\r' + ' '.repeat(100) + '\r');
    process.stderr.write('\x1B[?25h');
    
    if (success) {
      process.stderr.write(`${colors.BGreen('\u2713')} Done\n`);
    }
  }
}

/**
 * Get color for credit display based on remaining credits (matches bashmaiass)
 * @param {number} credits - Remaining credits
 * @returns {Function} Chalk color function
 */
function getCreditColor(credits) {
  if (credits >= 1000) {
    return chalk.hex('#00AA00'); // Green
  } else if (credits > 600) {
    // Interpolate green to yellow
    const ratio = (credits - 600) / 400;
    const r = Math.round(0 + (255 - 0) * (1 - ratio));
    const g = Math.round(170 + (255 - 170) * (1 - ratio));
    return chalk.hex(`#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}00`);
  } else if (credits > 300) {
    // Interpolate yellow to orange
    const ratio = (credits - 300) / 300;
    const g = Math.round(165 + (255 - 165) * ratio);
    return chalk.hex(`#FF${g.toString(16).padStart(2, '0')}00`);
  } else {
    // Interpolate orange to red
    const ratio = credits / 300;
    const g = Math.round(0 + 165 * ratio);
    return chalk.hex(`#FF${g.toString(16).padStart(2, '0')}00`);
  }
}

/**
 * Print gradient line (matches bashmaiass)
 * Gradient from soft pink (#f7b2c4) to burgundy (#6b0022)
 * @param {number} length - Length of line
 */
function printGradientLine(length = 50) {
  // Create gradient from soft pink to burgundy
  const startColor = { r: 0xf7, g: 0xb2, b: 0xc4 }; // soft pink
  const endColor = { r: 0x6b, g: 0x00, b: 0x22 };   // burgundy
  
  let line = '';
  for (let i = 0; i < length; i++) {
    const ratio = length > 1 ? i / (length - 1) : 0;
    const r = Math.round(startColor.r + (endColor.r - startColor.r) * ratio);
    const g = Math.round(startColor.g + (endColor.g - startColor.g) * ratio);
    const b = Math.round(startColor.b + (endColor.b - startColor.b) * ratio);
    line += chalk.hex(`#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`)('═');
  }
  console.log(line);
}

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
  const debugMode = process.env.MAIASS_DEBUG === 'true';
  
  try {
    // Check if we already have a token in environment (from secure storage or config files)
    if (process.env.MAIASS_AI_TOKEN) {
      if (debugMode) {
        log.debug(SYMBOLS.INFO, '[MAIASS DEBUG] Using existing MAIASS_AI_TOKEN from environment');
      }
      return process.env.MAIASS_AI_TOKEN;
    }

    // Check if we have an anonymous token in secure storage
    const existingToken = retrieveSecureVariable('MAIASS_AI_TOKEN');
    if (existingToken) {
      if (debugMode) {
        log.debug(SYMBOLS.INFO, '[MAIASS DEBUG] Using existing anonymous token from secure storage');
      }
      // Set in environment for this session
      process.env.MAIASS_AI_TOKEN = existingToken;
      return existingToken;
    }

    log.info(SYMBOLS.INFO, 'Generating machine fingerprint...');
    const machineFingerprint = generateMachineFingerprint();
    
    const endpoint = process.env.MAIASS_AI_HOST || 'https://pound.maiass.net';
    
    if (debugMode) {
      log.debug(SYMBOLS.INFO, `[MAIASS DEBUG] Creating anonymous subscription at: ${endpoint}/v1/token`);
      log.trace(SYMBOLS.INFO, `[MAIASS TRACE] Machine fingerprint: ${JSON.stringify(machineFingerprint, null, 2)}`);
    }
    
    log.info(SYMBOLS.INFO, 'Requesting anonymous subscription...');
    
    const response = await fetch(`${endpoint}/v1/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Client-Name': getClientName(),
        'X-Client-Version': getClientVersion()
      },
      body: JSON.stringify({
        machine_fingerprint: machineFingerprint
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData = {};
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { error: errorText };
      }
      
      if (debugMode) {
        log.debug(SYMBOLS.WARNING, `[MAIASS DEBUG] Anonymous subscription failed: ${response.status} ${response.statusText}`);
        log.debug(SYMBOLS.WARNING, `[MAIASS DEBUG] Error response: ${errorText}`);
      }
      
      log.error(SYMBOLS.CROSS, `Failed to create anonymous subscription: ${errorData.error || response.statusText}`);
      return null;
    }

    const data = await response.json();
    
    if (debugMode) {
      log.debug(SYMBOLS.INFO, `[MAIASS DEBUG] Anonymous subscription: api_key=${redact(data.apiKey || data.api_key || data.token)}, credits=${data.creditsRemaining || data.credits_remaining || data.credits}`);
      log.trace(SYMBOLS.INFO, `[MAIASS TRACE] Anonymous subscription response: ${JSON.stringify(data, null, 2)}`);
    }
    
    // Extract fields - try multiple field names for compatibility
    const apiKey = data.apiKey || data.api_key || data.token;
    const subscriptionId = data.id || data.subscription_id;
    const credits = data.creditsRemaining || data.credits_remaining || data.credits;
    const purchaseUrl = data.purchaseUrl || data.payment_url || data.top_up_url;
    
    if (apiKey) {
      // Store the token in secure storage
      const stored = storeSecureVariable('MAIASS_AI_TOKEN', apiKey);
      
      if (subscriptionId) {
        storeSecureVariable('MAIASS_SUBSCRIPTION_ID', subscriptionId);
      }
      
      if (stored) {
        log.success(SYMBOLS.CHECKMARK, 'Anonymous subscription created and stored securely');
        log.info(SYMBOLS.INFO, `   API Key: ${apiKey.substring(0, 8)}...`);
        log.info(SYMBOLS.INFO, `   Credits: ${credits || 'N/A'}`);
        
        if (subscriptionId) {
          log.info(SYMBOLS.INFO, `   Subscription ID: ${subscriptionId.substring(0, 12)}...`);
        }
        
        // Warn if zero credits
        if (!credits || credits === 0) {
          log.warning(SYMBOLS.WARNING, '⚠️  Your anonymous API key has zero credits. Please purchase credits to use AI features.');
          if (purchaseUrl) {
            log.info(SYMBOLS.INFO, `   Purchase credits here: ${purchaseUrl}`);
          }
        }
      } else {
        log.warning(SYMBOLS.WARNING, 'Anonymous subscription created but could not store securely');
      }
      
      // Set in environment for this session
      process.env.MAIASS_AI_TOKEN = apiKey;
      if (subscriptionId) {
        process.env.MAIASS_SUBSCRIPTION_ID = subscriptionId;
      }
      if (credits !== undefined && credits !== null) {
        process.env.MAIASS_CREDITS_REMAINING = String(credits);
      }
      
      return apiKey;
    }
    
    return null;
    
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
  
  // Enhanced debug logging: output the diff and parameters when debug or verbose
  const debugMode = process.env.MAIASS_DEBUG === 'true' || (process.env.MAIASS_VERBOSITY && ['debug','verbose'].includes(process.env.MAIASS_VERBOSITY));
  
  if (debugMode) {
    log.debug(SYMBOLS.INFO, '[MAIASS DEBUG] --- AI Commit Suggestion Starting ---');
  }
  
  // Try to get existing token or create anonymous subscription
  let maiassToken = await createAnonymousSubscriptionIfNeeded();
  
  const aiHost = process.env.MAIASS_AI_HOST || 'https://pound.maiass.net';
  const aiPath = process.env.MAIASS_AI_PATH || '/proxy';
  const aiEndpoint = aiHost + aiPath;
  const aiModel = process.env.MAIASS_AI_MODEL || 'gpt-3.5-turbo';
  const aiTemperature = parseFloat(process.env.MAIASS_AI_TEMPERATURE || '0.7');
  const commitMessageStyle = process.env.MAIASS_AI_COMMIT_MESSAGE_STYLE || 'bullet';
  const maxCharacters = parseInt(process.env.MAIASS_AI_MAX_CHARACTERS || '8000');
  
  if (debugMode) {
    log.debug(SYMBOLS.INFO, `[MAIASS DEBUG] AI Host: ${aiHost}`);
    log.debug(SYMBOLS.INFO, `[MAIASS DEBUG] AI Endpoint: ${aiEndpoint}`);
    log.debug(SYMBOLS.INFO, `[MAIASS DEBUG] Token available: ${maiassToken ? 'Yes' : 'No'}`);
    if (maiassToken) {
      log.debug(SYMBOLS.INFO, `[MAIASS DEBUG] Token: ${redact(maiassToken)}`);
    }
  }
  
  if (!maiassToken) {
    if (debugMode) {
      log.debug(SYMBOLS.WARNING, '[MAIASS DEBUG] No AI token available - cannot proceed with AI suggestion');
    }
    return null;
  }
  
  try {
    // Get changelog filenames from environment or use defaults
    const changelogName = process.env.MAIASS_CHANGELOG_NAME || 'CHANGELOG.md';
    const internalChangelogName = process.env.MAIASS_CHANGELOG_INTERNAL_NAME || '.CHANGELOG_internal.md';
    
    // Build git diff command - first try with exclusions, then fallback to all files
    const gitDiffCommand = `git diff --cached`;
    
    if (debugMode) {
      log.debug(SYMBOLS.INFO, `[MAIASS DEBUG] Git diff command: ${gitDiffCommand}`);
    }
    
    // Get git diff for staged changes
    let gitDiff = executeGitCommand(gitDiffCommand, true);
    
    if (debugMode) {
      log.debug(SYMBOLS.INFO, `[MAIASS DEBUG] Raw git diff length: ${gitDiff ? gitDiff.length : 0} characters`);
    }
    
    // If we have a diff, filter out changelog content manually
    if (gitDiff) {
      // Split diff into file sections and filter out changelog files
      const diffSections = gitDiff.split(/^diff --git /m);
      const filteredSections = diffSections.filter(section => {
        if (!section.trim()) return false;
        // Check if this section is for a changelog file
        const isChangelog = section.includes(`a/${changelogName}`) || 
                           section.includes(`b/${changelogName}`) ||
                           section.includes(`a/${internalChangelogName}`) || 
                           section.includes(`b/${internalChangelogName}`);
        return !isChangelog;
      });
      
      // Reconstruct the diff
      if (filteredSections.length > 1) {
        gitDiff = 'diff --git ' + filteredSections.slice(1).join('diff --git ');
      } else if (filteredSections.length === 1 && filteredSections[0].trim()) {
        gitDiff = filteredSections[0];
      } else {
        gitDiff = '';
      }
      
      if (debugMode) {
        log.debug(SYMBOLS.INFO, `[MAIASS DEBUG] Filtered git diff length: ${gitDiff.length} characters`);
        log.debug(SYMBOLS.INFO, `[MAIASS DEBUG] Excluded changelog files: ${changelogName}, ${internalChangelogName}`);
      }
    }
    if (!gitDiff) {
      if (debugMode) {
        log.debug(SYMBOLS.WARNING, '[MAIASS DEBUG] No git diff found for staged changes - cannot generate AI suggestion');
      }
      return null;
    }

    // Truncate git diff if it exceeds character limit (matching bash script behavior)
    if (gitDiff.length > maxCharacters) {
      gitDiff = gitDiff.substring(0, maxCharacters) + '...[truncated]';
      log.info(SYMBOLS.INFO, `Git diff truncated to ${maxCharacters} characters`);
    }

    if (debugMode) {
      log.debug(SYMBOLS.INFO, '[MAIASS DEBUG] --- AI Commit Suggestion Context ---');
      log.debug(SYMBOLS.INFO, `[MAIASS DEBUG] Model: ${aiModel}`);
      log.debug(SYMBOLS.INFO, `[MAIASS DEBUG] Temperature: ${aiTemperature}`);
      log.debug(SYMBOLS.INFO, `[MAIASS DEBUG] Commit Message Style: ${commitMessageStyle}`);
      log.debug(SYMBOLS.INFO, `[MAIASS DEBUG] Max Characters: ${maxCharacters}`);
      log.debug(SYMBOLS.INFO, `[MAIASS DEBUG] Git diff length: ${gitDiff.length} characters`);
      log.debug(SYMBOLS.INFO, '[MAIASS DEBUG] --- GIT DIFF FED TO AI ---');
      log.debug(SYMBOLS.INFO, gitDiff);
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
      model: aiModel,
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
      temperature: aiTemperature
    };
    
    if (debugMode) {
      log.debug(SYMBOLS.INFO, '[MAIASS DEBUG] --- Making AI API Request ---');
      log.debug(SYMBOLS.INFO, `[MAIASS DEBUG] Request URL: ${aiEndpoint}`);
      log.debug(SYMBOLS.INFO, `[MAIASS DEBUG] Request model=${requestBody.model} max_tokens=${requestBody.max_tokens}`);
      log.trace(SYMBOLS.INFO, `[MAIASS TRACE] Request body: ${JSON.stringify(requestBody, null, 2)}`);
    }

    // Set timeout for API call (default 30 seconds)
    const timeout = parseInt(process.env.MAIASS_AI_TIMEOUT || '30') * 1000;
    
    if (debugMode) {
      log.debug(SYMBOLS.INFO, `[MAIASS DEBUG] API timeout set to ${timeout/1000} seconds`);
    }

    // Start spinner (unless in debug mode)
    const spinner = !debugMode ? new Spinner('Waiting for AI response') : null;
    if (spinner) spinner.start();

    try {
      // Fetch with timeout using AbortController
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(aiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${maiassToken}`,
          'X-Machine-Fingerprint': generateMachineFingerprint(),
          'X-Client-Name': getClientName(),
          'X-Client-Version': getClientVersion(),
          'X-Subscription-ID': process.env.MAIASS_SUBSCRIPTION_ID || ''
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      // Stop spinner on success
      if (spinner) spinner.stop(true);
      
      if (debugMode) {
        log.debug(SYMBOLS.INFO, `[MAIASS DEBUG] Response status: ${response.status} ${response.statusText}`);
        log.trace(SYMBOLS.INFO, `[MAIASS TRACE] Response headers: ${JSON.stringify(Object.fromEntries(response.headers), null, 2)}`);
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        if (debugMode) {
          log.debug(SYMBOLS.WARNING, `[MAIASS DEBUG] Response error body: ${errorText}`);
        }
        log.error(SYMBOLS.WARNING, `AI API request failed: ${response.status} ${response.statusText}`);
        return null;
      }
      
      // Parse JSON response inside the same try block
      const data = await response.json();
      
      if (debugMode) {
        log.debug(SYMBOLS.INFO, `[MAIASS DEBUG] Response status: ${data.choices?.length || 0} choices, model=${data.model || 'unknown'}`);
        log.trace(SYMBOLS.INFO, `[MAIASS TRACE] Response data: ${JSON.stringify(data, null, 2)}`);
      }
      
      if (data.choices && data.choices.length > 0) {
        let suggestion = data.choices[0].message.content.trim();

        // Enhanced debug logging: output the suggestion returned by AI
        if (debugMode) {
          log.debug(SYMBOLS.INFO, '[MAIASS DEBUG] --- AI SUGGESTION RETURNED ---');
          log.debug(SYMBOLS.INFO, suggestion);
        }
        
        // Clean up any quotes that might wrap the entire response
        if ((suggestion.startsWith("'") && suggestion.endsWith("'")) || 
            (suggestion.startsWith('"') && suggestion.endsWith('"'))) {
          suggestion = suggestion.slice(1, -1).trim();
        }
        
        // Extract credit information from billing data
        let creditsUsed, creditsRemaining;
        if (data.billing) {
          creditsUsed = data.billing.credits_used;
          creditsRemaining = data.billing.credits_remaining;
          
          // Show warnings if available
          if (data.billing.warning) {
            log.warning(SYMBOLS.WARNING, data.billing.warning);
          }
          
          // Display proxy messages if available
          if (data.messages && Array.isArray(data.messages)) {
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
          }
        } else if (data.usage) {
          // Fallback to legacy token display
          const totalTokens = data.usage.total_tokens || 0;
          const promptTokens = data.usage.prompt_tokens || 0;
          const completionTokens = data.usage.completion_tokens || 0;
          log.info(SYMBOLS.INFO, `Total Tokens: ${totalTokens} (${promptTokens} + ${completionTokens})`);
        }
        
        // Keep env updated so pipeline end can always read current balance
        if (creditsRemaining !== undefined) {
          process.env.MAIASS_CREDITS_REMAINING = String(creditsRemaining);
        }

        return {
          suggestion,
          creditsUsed,
          creditsRemaining
        };
      }
      
      if (debugMode) {
        log.debug(SYMBOLS.WARNING, '[MAIASS DEBUG] No valid AI response received - no choices in response data');
      }
      return null;
    } catch (error) {
      // Stop spinner on error
      if (spinner) spinner.stop(false);
      
      if (error.name === 'AbortError') {
        log.error(SYMBOLS.WARNING, `AI request timed out after ${timeout/1000} seconds`);
        log.info(SYMBOLS.INFO, 'The AI service might be slow or unresponsive. Try again or increase MAIASS_AI_TIMEOUT.');
        return null;
      }
      
      if (debugMode) {
        log.debug(SYMBOLS.WARNING, `[MAIASS DEBUG] AI suggestion error details: ${error.stack || error.message}`);
      }
      log.error(SYMBOLS.WARNING, `AI suggestion failed: ${error.message}`);
      return null;
    }
  } catch (error) {
    if (debugMode) {
      log.debug(SYMBOLS.WARNING, `[MAIASS DEBUG] AI suggestion error details: ${error.stack || error.message}`);
    }
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
  
  // Load environment config to ensure tokens are loaded from secure storage
  loadEnvironmentConfig();
  
  const aiMode = process.env.MAIASS_AI_MODE || 'ask';
  const maiassToken = process.env.MAIASS_AI_TOKEN;
  const jiraTicket = gitInfo.jiraTicket;
  
  // Display JIRA ticket if found
  if (jiraTicket) {
    log.info(SYMBOLS.INFO, `Jira Ticket Number: ${jiraTicket}`);
  }
  
  let useAI = false;
  let aiSuggestion = null;
  
  // Handle AI commit message modes
  switch (aiMode) {
    case 'ask':
      if (maiassToken) {
        let reply;
        const autoApprove = process.env.MAIASS_AUTO_APPROVE_AI_SUGGESTIONS === 'true';
        if (silent || autoApprove) {
          log.info('', 'Would you like to use AI to suggest a commit message? [y/N] y');
          if (autoApprove) {
            log.info(SYMBOLS.INFO, 'MAIASS_AUTO_APPROVE_AI_SUGGESTIONS=true: Automatically using AI');
          }
          reply = 'y';
        } else {
          reply = await getSingleCharInput('Would you like to use AI to suggest a commit message? [y/N] ');
        }
        useAI = reply === 'y';
      } else {
        // No token found - try to create anonymous subscription (matches bashmaiass behavior)
        const debugMode = process.env.MAIASS_DEBUG === 'true';
        if (debugMode) {
          log.debug(SYMBOLS.INFO, '[MAIASS DEBUG] No AI token found, attempting to create anonymous subscription...');
        }
        const anonToken = await createAnonymousSubscriptionIfNeeded();
        if (anonToken) {
          // Token created successfully, now ask if they want to use AI
          let reply;
          const autoApprove = process.env.MAIASS_AUTO_APPROVE_AI_SUGGESTIONS === 'true';
          if (silent || autoApprove) {
            log.info('', 'Would you like to use AI to suggest a commit message? [y/N] y');
            if (autoApprove) {
              log.info(SYMBOLS.INFO, 'MAIASS_AUTO_APPROVE_AI_SUGGESTIONS=true: Automatically using AI');
            }
            reply = 'y';
          } else {
            reply = await getSingleCharInput('Would you like to use AI to suggest a commit message? [y/N] ');
          }
          useAI = reply === 'y';
        } else {
          log.warning(SYMBOLS.WARNING, 'Failed to create anonymous subscription. AI features will be disabled.');
        }
      }
      break;
    case 'autosuggest':
      if (maiassToken) {
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
    const aiResult = await getAICommitSuggestion(gitInfo);
    
    if (aiResult && aiResult.suggestion) {
      aiSuggestion = aiResult.suggestion;
      
      // Display AI suggestion with gradient lines (matching bashmaiass)
      console.log(`${colors.BSoftPink('|))')} ${colors.BMagenta('Commit message suggestion from MAIASS:')}`);
      printGradientLine(60);
      console.log(chalk.bold.inverse(aiSuggestion));
      printGradientLine(60);
      
      let reply;
      const autoApprove = process.env.MAIASS_AUTO_APPROVE_AI_SUGGESTIONS === 'true';
      if (silent || autoApprove) {
        log.info('', 'Use this AI suggestion? [Y/n/e=edit] Y');
        if (autoApprove) {
          log.info(SYMBOLS.INFO, 'MAIASS_AUTO_APPROVE_AI_SUGGESTIONS=true: Automatically accepting AI suggestion');
        }
        reply = 'Y';
      } else {
        reply = await getSingleCharInput('Use this AI suggestion? [Y/n/e=edit] ');
      }
      
      switch (reply.toLowerCase()) {
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
    // Ensure JIRA ticket is always prepended if present and not already
    let finalCommitMessage = commitMessage;
    const jiraTicket = gitInfo && gitInfo.jiraTicket;
    if (jiraTicket && finalCommitMessage && !finalCommitMessage.startsWith(jiraTicket)) {
      finalCommitMessage = `${jiraTicket} ${finalCommitMessage}`;
    }
    // Write commit message to a temp file on all platforms — avoids shell quoting and injection risks
    {
      const tmpFile = path.join(os.tmpdir(), `maiass-commit-msg-${Date.now()}.txt`);
      fs.writeFileSync(tmpFile, finalCommitMessage, { encoding: 'utf8' });
      result = executeGitCommand(`git commit -F "${tmpFile}"`, quietMode);
      fs.unlinkSync(tmpFile);
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
      const autoPush = process.env.MAIASS_AUTO_PUSH_COMMITS === 'true';
      const pushAbstracts = process.env.MAIASS_PUSH_ABSTRACTS_TO_REMOTE || '';
      
      // Handle MAIASS_PUSH_ABSTRACTS_TO_REMOTE: 'always', 'never', or blank/'ask'
      if (pushAbstracts === 'always' || autoPush) {
        log.info('', 'Do you want to push this commit to remote? [y/N] y');
        reply = 'y';
        if (pushAbstracts === 'always') {
          console.log('🔄 |)) Automatically pushing to remote (MAIASS_PUSH_ABSTRACTS_TO_REMOTE=always)');
        } else if (autoPush) {
          console.log('🔄 |)) Automatically pushing to remote (MAIASS_AUTO_PUSH_COMMITS=true)');
        }
      } else if (pushAbstracts === 'never') {
        log.info('', 'Do you want to push this commit to remote? [y/N] n');
        console.log('⏭️  |)) Skipping push to remote (MAIASS_PUSH_ABSTRACTS_TO_REMOTE=never)');
        reply = 'n';
      } else if (silent) {
        log.info('', 'Do you want to push this commit to remote? [y/N] y');
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
  
  // Handle case where status might be null (shouldn't happen but defensive)
  if (!status) {
    log.error(SYMBOLS.CROSS, 'Unable to get git status');
    return false;
  }
  
  // Check if there are any changes
  if (status.isClean) {
    log.success(SYMBOLS.CHECKMARK, 'No changes found. Working directory is clean.');
    if (commitsOnly) {
      log.info('', 'Thank you for using MAIASS.');
    }
    return true;
  }

  // Display status message matching bashmaiass style
  if (status.unstagedCount > 0 || status.untrackedCount > 0) {
    log.warning(SYMBOLS.WARNING, 'There are unstaged changes in your working directory');
  }

  // Handle unstaged/untracked changes first
  if (status.unstagedCount > 0 || status.untrackedCount > 0) {
    if (!autoStage) {
      let reply;
      const autoStage = process.env.MAIASS_AUTO_STAGE_UNSTAGED === 'true';
      if (silent || autoStage) {
        reply = 'y';
        if (autoStage) {
          console.log('🔄 |)) Automatically staging changes (MAIASS_AUTO_STAGE_UNSTAGED=true)');
        } else {
          console.log('🔄 |)) Automatically staging changes (silent mode)');
        }
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
  createAnonymousSubscriptionIfNeeded,
  getCommitMessage,
  handleStagedCommit,
  getAICommitSuggestion,
  executeGitCommand,
  remoteExists
};
