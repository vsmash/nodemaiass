// Secure storage functionality for nodemaiass
// Uses OS keychain (macOS) or secret-tool (Linux) for sensitive data storage
// Compatible with bashmaiass approach but uses NODEMAIASS service names

import { execSync } from 'child_process';
import os from 'os';
import { log, logger } from './logger.js';

/**
 * Get environment-specific service name for secure storage
 * Uses NODEMAIASS prefix to differentiate from bashmaiass
 * @returns {string} Service name for secure storage
 */
export function getSecureServiceName() {
  const env = process.env.MAIASS_AI_HOST || '';
  let envSuffix = '';
  
  if (env.includes('localhost') || env.includes('127.0.0.1')) {
    envSuffix = '_localhost';
  } else if (env.includes('preview') || env.includes('staging')) {
    envSuffix = '_preview';
  }
  // Production uses no suffix
  
  // Use 'maiass' (not 'nodemaiass') to share keychain with bashmaiass
  return `maiass${envSuffix}`;
}

/**
 * Store a sensitive variable in OS secure storage
 * @param {string} varName - Variable name (e.g., 'MAIASS_AI_TOKEN')
 * @param {string} varValue - Variable value
 * @returns {boolean} Success status
 */
export function storeSecureVariable(varName, varValue) {
  const serviceName = getSecureServiceName();
  const debugMode = process.env.MAIASS_DEBUG === 'true';
  
  if (debugMode) {
    logger.debug(`Storing ${varName} in secure storage service: ${serviceName}`);
  }
  
  try {
    if (os.platform() === 'darwin') {
      // macOS: Use keychain via security command
      execSync(`security add-generic-password -U -s "${serviceName}" -a "${varName}" -w "${varValue}"`, {
        stdio: 'pipe'
      });
    } else {
      // Linux: Use secret-tool if available
      try {
        execSync('which secret-tool', { stdio: 'pipe' });
        execSync(`echo -n "${varValue}" | secret-tool store --label="NODEMAIASS ${varName} (${serviceName})" service "${serviceName}" key "${varName}"`, {
          stdio: 'pipe',
          shell: true
        });
      } catch (error) {
        if (debugMode) {
          logger.debug('secret-tool not available, secure storage not supported on this system');
        }
        return false;
      }
    }
    
    if (debugMode) {
      logger.debug(`Successfully stored ${varName} in secure storage`);
    }
    return true;
  } catch (error) {
    if (debugMode) {
      logger.debug(`Failed to store ${varName} in secure storage: ${error.message}`);
    }
    return false;
  }
}

/**
 * Retrieve a sensitive variable from OS secure storage
 * @param {string} varName - Variable name (e.g., 'MAIASS_AI_TOKEN')
 * @returns {string|null} Variable value or null if not found
 */
export function retrieveSecureVariable(varName) {
  const serviceName = getSecureServiceName();
  const debugMode = process.env.MAIASS_DEBUG === 'true';
  
  if (debugMode) {
    logger.debug(`Retrieving ${varName} from secure storage service: ${serviceName}`);
  }
  
  try {
    let value = null;
    
    if (os.platform() === 'darwin') {
      // macOS: Use keychain via security command
      value = execSync(`security find-generic-password -s "${serviceName}" -a "${varName}" -w`, {
        stdio: 'pipe',
        encoding: 'utf8'
      }).trim();
    } else {
      // Linux: Use secret-tool if available
      try {
        execSync('which secret-tool', { stdio: 'pipe' });
        value = execSync(`secret-tool lookup service "${serviceName}" key "${varName}"`, {
          stdio: 'pipe',
          encoding: 'utf8'
        }).trim();
      } catch (error) {
        if (debugMode) {
          logger.debug('secret-tool not available, secure storage not supported on this system');
        }
        return null;
      }
    }
    
    if (debugMode && value) {
      logger.debug(`Successfully retrieved ${varName} from secure storage`);
    }
    
    return value || null;
  } catch (error) {
    if (debugMode) {
      logger.debug(`${varName} not found in secure storage (this is normal for first run)`);
    }
    return null;
  }
}

/**
 * Remove a sensitive variable from OS secure storage
 * @param {string} varName - Variable name (e.g., 'MAIASS_AI_TOKEN')
 * @returns {boolean} Success status
 */
export function removeSecureVariable(varName) {
  const serviceName = getSecureServiceName();
  const debugMode = process.env.MAIASS_DEBUG === 'true';
  
  if (debugMode) {
    logger.debug(`Removing ${varName} from secure storage service: ${serviceName}`);
  }
  
  try {
    if (os.platform() === 'darwin') {
      // macOS: Use keychain via security command
      execSync(`security delete-generic-password -s "${serviceName}" -a "${varName}"`, {
        stdio: 'pipe'
      });
    } else {
      // Linux: secret-tool doesn't have direct delete, but we can try to clear it
      try {
        execSync('which secret-tool', { stdio: 'pipe' });
        // secret-tool doesn't have a delete command, so we store an empty value
        execSync(`echo -n "" | secret-tool store --label="NODEMAIASS ${varName} (${serviceName})" service "${serviceName}" key "${varName}"`, {
          stdio: 'pipe',
          shell: true
        });
      } catch (error) {
        if (debugMode) {
          logger.debug('secret-tool not available, secure storage not supported on this system');
        }
        return false;
      }
    }
    
    if (debugMode) {
      logger.debug(`Successfully removed ${varName} from secure storage`);
    }
    return true;
  } catch (error) {
    if (debugMode) {
      logger.debug(`Failed to remove ${varName} from secure storage: ${error.message}`);
    }
    return false;
  }
}

/**
 * Load secure variables into environment
 * Loads MAIASS_AI_TOKEN and MAIASS_SUBSCRIPTION_ID from secure storage
 */
export function loadSecureVariables() {
  const secureVars = ['MAIASS_AI_TOKEN', 'MAIASS_SUBSCRIPTION_ID'];
  const debugMode = process.env.MAIASS_DEBUG === 'true';
  const serviceName = getSecureServiceName();
  
  if (debugMode) {
    const host = process.env.MAIASS_AI_HOST || 'https://pound.maiass.net';
    logger.debug(`Using secure storage service name: ${serviceName} (host: ${host})`);
  }
  
  secureVars.forEach(varName => {
    const envValue = process.env[varName];
    
    if (debugMode) {
      logger.debug(`Checking ${varName}: value="${envValue}", type=${typeof envValue}, empty=${!envValue || envValue.trim() === ''}`);
    }
    
    // Check if we should prefer secure storage over environment variable
    let preferSecure = false;
    if (varName === 'MAIASS_AI_TOKEN' && envValue) {
      // Check if the existing token looks invalid
      if (/^invalid_|^test_|_test$/.test(envValue) || envValue === 'DISABLED' || envValue.trim() === '') {
        preferSecure = true;
        if (debugMode) {
          logger.debug('Environment token appears invalid, checking secure storage');
        }
      }
    }
    
    // Only load if not already set with valid token (unless we want to prefer secure storage)
    if (!envValue || envValue.trim() === '' || preferSecure) {
      const value = retrieveSecureVariable(varName);
      if (value) {
        process.env[varName] = value;
        if (preferSecure) {
          if (debugMode) {
            logger.debug('Replaced invalid environment token with secure storage token');
          }
        } else {
          if (debugMode) {
            logger.debug(`Loaded ${varName} from secure storage`);
          }
        }
      }
    } else if (debugMode) {
      logger.debug(`${varName} already set in environment, skipping secure storage`);
    }
  });
}

/**
 * Check if secure storage is available on this system
 * @returns {boolean} True if secure storage is supported
 */
export function isSecureStorageAvailable() {
  try {
    if (os.platform() === 'darwin') {
      execSync('which security', { stdio: 'pipe' });
      return true;
    } else {
      execSync('which secret-tool', { stdio: 'pipe' });
      return true;
    }
  } catch (error) {
    return false;
  }
}

export default {
  getSecureServiceName,
  storeSecureVariable,
  retrieveSecureVariable,
  removeSecureVariable,
  loadSecureVariables,
  isSecureStorageAvailable
};
