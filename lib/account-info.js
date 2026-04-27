// Account info functionality for nodemaiass
// Port of bashmaiass --account-info command

import { log } from './logger.js';
import { SYMBOLS } from './symbols.js';
import { loadEnvironmentConfig } from './config.js';
import { generateMachineFingerprint } from './machine-fingerprint.js';
import { retrieveSecureVariable, storeSecureVariable, removeSecureVariable } from './secure-storage.js';
import { getClientName, getClientVersion } from './client-info.js';
import { getSingleCharInput } from './input-utils.js';
import fs from 'fs';
import path from 'path';

/**
 * Mask a sensitive token (show start and end only)
 * @param {string} token - Token to mask
 * @returns {string} Masked token
 */
function maskToken(token) {
  if (!token) return 'none';
  const n = token.length;
  if (n <= 10) {
    return `${token.substring(0, 1)}***${token.substring(n - 1)}`;
  } else {
    return `${token.substring(0, 6)}***${token.substring(n - 4)}`;
  }
}

/**
 * Create anonymous subscription if needed
 * @returns {Promise<string|null>} API token or null
 */
async function createAnonymousSubscriptionIfNeeded() {
  const debugMode = process.env.MAIASS_DEBUG === 'true';
  
  try {
    log.info(SYMBOLS.INFO, 'Generating machine fingerprint...');
    const machineFingerprint = generateMachineFingerprint();
    
    const endpoint = process.env.MAIASS_AI_HOST || 'https://pound.maiass.net';
    
    if (debugMode) {
      log.debug(SYMBOLS.INFO, `[MAIASS DEBUG] Creating anonymous subscription at: ${endpoint}/v1/token`);
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
      
      log.error(SYMBOLS.CROSS, `Failed to create anonymous subscription: ${errorData.error || response.statusText}`);
      return null;
    }

    const data = await response.json();
    
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
        log.info(SYMBOLS.INFO, `   API Key: [stored securely]`);
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
      
      return apiKey;
    }
    
    return null;
  } catch (error) {
    log.error(SYMBOLS.CROSS, `Error creating anonymous subscription: ${error.message}`);
    return null;
  }
}

/**
 * Query account info from the API
 * @param {string} apiKey - API key to use
 * @returns {Promise<Object>} Account info response
 */
async function queryAccountInfo(apiKey) {
  const clientVersion = getClientVersion();
  const clientName = 'nodemaiass';
  const baseHost = process.env.MAIASS_AI_HOST || 'https://pound.maiass.net';
  const debugMode = process.env.MAIASS_DEBUG === 'true';
  
  // Try multiple endpoints with fallbacks
  const endpoints = [
    `${baseHost}/account-info`,
    `${baseHost}/v1/account-info`
  ];
  
  for (const endpoint of endpoints) {
    if (debugMode) {
      log.debug(SYMBOLS.INFO, `[MAIASS DEBUG] Querying account info at: ${endpoint}`);
    }
    
    try {
      // Try GET first
      let response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'X-Client-Name': clientName,
          'X-Client-Version': clientVersion
        }
      });
      
      if (debugMode) {
        log.debug(SYMBOLS.INFO, `[MAIASS DEBUG] GET ${endpoint} - Status: ${response.status}`);
      }
      
      // If GET fails, try POST
      if (!response.ok && response.status !== 404) {
        if (debugMode) {
          log.debug(SYMBOLS.INFO, `[MAIASS DEBUG] Retrying with POST to ${endpoint}`);
        }
        
        response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Client-Name': clientName,
            'X-Client-Version': clientVersion
          },
          body: JSON.stringify({ api_key: apiKey })
        });
        
        if (debugMode) {
          log.debug(SYMBOLS.INFO, `[MAIASS DEBUG] POST ${endpoint} - Status: ${response.status}`);
        }
      }
      
      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          data,
          status: response.status,
          endpoint
        };
      }
      
      // If this endpoint fails, collect error info and try the next one
      let errorText = '';
      let errorData = null;
      try {
        errorText = await response.text();
        errorData = JSON.parse(errorText);
      } catch (e) {
        // Not JSON, use raw text
      }
      
      if (debugMode) {
        log.debug(SYMBOLS.WARNING, `[MAIASS DEBUG] ${endpoint} failed: ${response.status} ${errorText}`);
      }
      
      // If this is a 403 error, return it immediately for handling
      if (response.status === 403) {
        return {
          success: false,
          error: errorData?.error || errorText || 'Invalid API key',
          status: 403,
          endpoint
        };
      }
      
    } catch (error) {
      if (debugMode) {
        log.debug(SYMBOLS.WARNING, `[MAIASS DEBUG] ${endpoint} error: ${error.message}`);
      }
    }
  }
  
  return {
    success: false,
    error: 'All endpoints failed',
    status: 'unknown'
  };
}

/**
 * Prompt user to update or delete API key
 * @param {string} currentKey - Current API key
 * @returns {Promise<string|null>} New API key or null if deleted
 */
async function promptApiKeyManagement(currentKey) {
  const maskedKey = maskToken(currentKey);
  
  console.log('');
  log.warning(SYMBOLS.WARNING, `Current API key is invalid: ${maskedKey}`);
  console.log('');
  console.log('What would you like to do?');
  console.log('  [u] Update API key');
  console.log('  [d] Delete API key (will create anonymous subscription)');
  console.log('  [q] Quit');
  console.log('');
  
  const choice = await getSingleCharInput('Choose an option [u/d/q]: ');
  
  switch (choice.toLowerCase()) {
    case 'u':
      // Update API key
      const readline = await import('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      return new Promise((resolve) => {
        rl.question('Enter new API key: ', (newKey) => {
          rl.close();
          if (newKey.trim()) {
            // Store the new key
            const stored = storeSecureVariable('MAIASS_AI_TOKEN', newKey.trim());
            if (stored) {
              log.success(SYMBOLS.CHECKMARK, 'API key updated and stored securely');
              process.env.MAIASS_AI_TOKEN = newKey.trim();
              resolve(newKey.trim());
            } else {
              log.warning(SYMBOLS.WARNING, 'API key updated but could not store securely');
              process.env.MAIASS_AI_TOKEN = newKey.trim();
              resolve(newKey.trim());
            }
          } else {
            log.warning(SYMBOLS.WARNING, 'No API key entered');
            resolve(null);
          }
        });
      });
      
    case 'd':
      // Delete API key
      const removed = removeSecureVariable('MAIASS_AI_TOKEN');
      removeSecureVariable('MAIASS_SUBSCRIPTION_ID'); // Also remove subscription ID
      delete process.env.MAIASS_AI_TOKEN;
      delete process.env.MAIASS_SUBSCRIPTION_ID;
      
      if (removed) {
        log.success(SYMBOLS.CHECKMARK, 'API key deleted from secure storage');
      } else {
        log.warning(SYMBOLS.WARNING, 'Could not delete API key from secure storage');
      }
      
      log.info(SYMBOLS.INFO, 'Will create new anonymous subscription...');
      return null;
      
    case 'q':
    default:
      log.info(SYMBOLS.INFO, 'Exiting...');
      process.exit(0);
  }
}

/**
 * Handle account info command
 * @param {Object} options - Command options
 */
export async function handleAccountInfoCommand(options = {}) {
  const { json = false } = options;
  const debugMode = process.env.MAIASS_DEBUG === 'true';
  
  try {
    // Load configuration to get tokens
    loadEnvironmentConfig();
    
    // Get API key from environment or secure storage
    let apiKey = process.env.MAIASS_AI_TOKEN;
    
    if (!apiKey) {
      // Try to get from secure storage
      apiKey = retrieveSecureVariable('MAIASS_AI_TOKEN');
      if (apiKey) {
        process.env.MAIASS_AI_TOKEN = apiKey;
      }
    }
    
    // If still no API key and AI mode is not off, create anonymous subscription
    if (!apiKey || apiKey === 'DISABLED') {
      const aiMode = process.env.MAIASS_AI_MODE || 'ask';
      if (aiMode !== 'off') {
        if (debugMode) {
          log.debug(SYMBOLS.INFO, '[MAIASS DEBUG] No AI token found, creating anonymous subscription...');
        }
        apiKey = await createAnonymousSubscriptionIfNeeded();
        if (!apiKey) {
          log.error(SYMBOLS.CROSS, 'Failed to create anonymous subscription');
          process.exit(1);
        }
      } else {
        log.warning(SYMBOLS.WARNING, 'AI mode is off. Skipping AI token setup.');
        process.exit(1);
      }
    }
    
    // Query account info
    const result = await queryAccountInfo(apiKey);
    
    if (!result.success) {
      // Check if it's an invalid API key error (403)
      if (result.status === 403 || (result.error && result.error.includes('Invalid API key'))) {
        // Offer to update or delete the API key
        const newApiKey = await promptApiKeyManagement(apiKey);
        
        if (newApiKey) {
          // Retry with new API key
          const retryResult = await queryAccountInfo(newApiKey);
          if (retryResult.success) {
            // Continue with successful result
            result.success = true;
            result.data = retryResult.data;
            result.status = retryResult.status;
          } else {
            log.error(SYMBOLS.CROSS, `New API key also failed: ${retryResult.error}`);
            process.exit(1);
          }
        } else {
          // API key was deleted, create anonymous subscription
          apiKey = await createAnonymousSubscriptionIfNeeded();
          if (!apiKey) {
            log.error(SYMBOLS.CROSS, 'Failed to create anonymous subscription');
            process.exit(1);
          }
          
          // Retry with anonymous subscription
          const retryResult = await queryAccountInfo(apiKey);
          if (retryResult.success) {
            result.success = true;
            result.data = retryResult.data;
            result.status = retryResult.status;
          } else {
            log.error(SYMBOLS.CROSS, `Anonymous subscription also failed: ${retryResult.error}`);
            process.exit(1);
          }
        }
      } else {
        log.error(SYMBOLS.CROSS, `Failed to query account info: ${result.error}`);
        process.exit(1);
      }
    }
    
    const data = result.data;
    
    // If JSON requested, output JSON (without exposing full token)
    if (json) {
      const safeData = {
        tokens_used: data.tokens_used || data.credits_used || '-',
        tokens_remaining: data.tokens_remaining || data.credits_remaining || '-',
        quota: data.quota || '-',
        subscription_type: data.subscription_type || '-',
        customer_email: data.customer_email || '-',
        status: data.status || result.status
      };
      console.log(JSON.stringify(safeData, null, 2));
      return;
    }
    
    // Human-readable summary (default)
    const tokensUsed = data.tokens_used || data.credits_used || '-';
    const tokensRemaining = data.tokens_remaining || data.credits_remaining || '-';
    const quota = data.quota || '-';
    const subType = data.subscription_type || '-';
    const custEmail = data.customer_email || '-';
    const statusField = data.status || result.status;
    
    const credit = 'Nugét';

    console.log('');
    console.log('Account Info');
    console.log('------------');
    console.log(`API Token:        [stored securely]`);
    
    const subscriptionId = process.env.MAIASS_SUBSCRIPTION_ID;
    if (subscriptionId) {
      console.log(`Subscription ID:  ${subscriptionId}`);
    }
    
    console.log(`Type:             ${subType}`);
    console.log(`Email:            ${custEmail}`);
    console.log(`${credit}s Used:     ${tokensUsed}`);
    console.log(`${credit}s Remaining:${tokensRemaining}`);
    console.log(`Quota:            ${quota}`);
    
    // Explain status codes clearly
    if (result.status === 403 || statusField === 403) {
      console.log('Status:          403 Forbidden');
      console.log('Explanation:     Your token was rejected. Ensure it is correct, not expired, and associated with an active subscription.');
    } else if (result.status === 401 || statusField === 401) {
      console.log('Status:          401 Unauthorized');
      console.log('Explanation:     Missing or invalid credentials. Try updating your token with \'nma config --global maiass_token=your_token\'.');
    } else if (result.status >= 200 && result.status < 300) {
      console.log(`Status:          ${result.status} OK`);
    } else {
      console.log(`Status:          ${result.status || 'unknown'}`);
    }

    if (subscriptionId && subscriptionId.startsWith('sub_anon_')) {
      const topupEndpoint = process.env.MAIASS_TOPUP_ENDPOINT || 'https://maiass.net/top-up';
      console.log(`Top-up link:      ${topupEndpoint}/${subscriptionId}`);
    }

    console.log('');

  } catch (error) {
    if (debugMode) {
      log.debug(SYMBOLS.WARNING, `[MAIASS DEBUG] Account info error: ${error.stack || error.message}`);
    }
    log.error(SYMBOLS.CROSS, `Account info failed: ${error.message}`);
    process.exit(1);
  }
}

export default {
  handleAccountInfoCommand,
  maskToken,
  getClientVersion
};
