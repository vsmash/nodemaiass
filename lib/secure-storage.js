// Secure storage functionality for nodemaiass
// Uses OS keychain (macOS) or secret-tool (Linux) for sensitive data storage
// Windows uses encrypted file storage in AppData
// Compatible with bashmaiass approach but uses NODEMAIASS service names

import { execSync, execFileSync } from 'child_process';
import os from 'os';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { log, logger } from './logger.js';

/**
 * Encryption key derivation for Windows storage
 * Uses machine-specific data to create a unique encryption key
 * @returns {Buffer} Encryption key
 */
function getEncryptionKey() {
  // Use machine-specific data to derive a key
  // This provides basic protection while being deterministic per machine
  const machineId = os.hostname() + os.userInfo().username;
  return crypto.createHash('sha256').update(machineId).digest();
}

/**
 * Encrypt data for Windows storage
 * @param {string} data - Data to encrypt
 * @returns {string} Encrypted data (base64)
 */
function encryptData(data) {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  
  let encrypted = cipher.update(data, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  
  // Prepend IV to encrypted data
  return iv.toString('base64') + ':' + encrypted;
}

/**
 * Decrypt data from Windows storage
 * @param {string} encryptedData - Encrypted data (base64 with IV)
 * @returns {string} Decrypted data
 */
function decryptData(encryptedData) {
  const key = getEncryptionKey();
  const parts = encryptedData.split(':');
  
  if (parts.length !== 2) {
    throw new Error('Invalid encrypted data format');
  }
  
  const iv = Buffer.from(parts[0], 'base64');
  const encrypted = parts[1];
  
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = decipher.update(encrypted, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

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
    } else if (os.platform() === 'win32') {
      // Windows: Use encrypted file storage in AppData
      // cmdkey doesn't support password retrieval, so we use a file-based approach
      const storageDir = path.join(os.homedir(), 'AppData', 'Local', 'maiass');
      const storageFile = path.join(storageDir, `${serviceName}.dat`);
      
      // Create directory if it doesn't exist
      if (!fs.existsSync(storageDir)) {
        fs.mkdirSync(storageDir, { recursive: true, mode: 0o700 });
      }
      
      // Read existing data or create new
      let data = {};
      if (fs.existsSync(storageFile)) {
        try {
          const encrypted = fs.readFileSync(storageFile, 'utf8');
          const decrypted = decryptData(encrypted);
          data = JSON.parse(decrypted);
        } catch (error) {
          // If decryption fails, start fresh
          if (debugMode) {
            logger.debug(`Could not read existing storage file: ${error.message}`);
          }
        }
      }
      
      // Update the value
      data[varName] = varValue;
      
      // Encrypt and save
      const encrypted = encryptData(JSON.stringify(data));
      fs.writeFileSync(storageFile, encrypted, { mode: 0o600 });
      
      if (debugMode) {
        logger.debug(`Stored ${varName} in Windows secure storage (encrypted file)`);
      }
    } else {
      // Linux: Use secret-tool if available
      try {
        execSync('which secret-tool', { stdio: 'pipe' });
        const label = `NODEMAIASS ${varName} (${serviceName})`;
        execFileSync('secret-tool', [
          'store',
          `--label=${label}`,
          'service',
          serviceName,
          'key',
          varName
        ], {
          stdio: ['pipe', 'pipe', 'pipe'],
          input: varValue
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
    } else if (os.platform() === 'win32') {
      // Windows: Read from encrypted file storage
      const storageDir = path.join(os.homedir(), 'AppData', 'Local', 'maiass');
      const storageFile = path.join(storageDir, `${serviceName}.dat`);
      
      if (!fs.existsSync(storageFile)) {
        if (debugMode) {
          logger.debug(`Storage file does not exist: ${storageFile}`);
        }
        return null;
      }
      
      try {
        const encrypted = fs.readFileSync(storageFile, 'utf8');
        const decrypted = decryptData(encrypted);
        const data = JSON.parse(decrypted);
        value = data[varName] || null;
        
        if (debugMode && value) {
          logger.debug(`Retrieved ${varName} from Windows secure storage (encrypted file)`);
        }
      } catch (error) {
        if (debugMode) {
          logger.debug(`Could not retrieve ${varName}: ${error.message}`);
        }
        return null;
      }
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
    } else if (os.platform() === 'win32') {
      // Windows: Remove from encrypted file storage
      const storageDir = path.join(os.homedir(), 'AppData', 'Local', 'maiass');
      const storageFile = path.join(storageDir, `${serviceName}.dat`);
      
      if (!fs.existsSync(storageFile)) {
        // File doesn't exist, nothing to remove
        if (debugMode) {
          logger.debug(`Storage file does not exist, nothing to remove`);
        }
        return true;
      }
      
      try {
        const encrypted = fs.readFileSync(storageFile, 'utf8');
        const decrypted = decryptData(encrypted);
        const data = JSON.parse(decrypted);
        
        // Remove the variable
        delete data[varName];
        
        // If no more data, delete the file
        if (Object.keys(data).length === 0) {
          fs.unlinkSync(storageFile);
          if (debugMode) {
            logger.debug(`Removed storage file (no more credentials)`);
          }
        } else {
          // Save updated data
          const newEncrypted = encryptData(JSON.stringify(data));
          fs.writeFileSync(storageFile, newEncrypted, { mode: 0o600 });
        }
      } catch (error) {
        if (debugMode) {
          logger.debug(`Error removing ${varName}: ${error.message}`);
        }
        return false;
      }
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
    } else if (os.platform() === 'win32') {
      // Windows: Always available (uses encrypted file storage)
      return true;
    } else {
      // Linux: Check for secret-tool
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
