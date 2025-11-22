// Cross-platform configuration and environment variable loading
import path from 'path';
import fs from 'fs';
import os from 'os';
import dotenv from 'dotenv';
import { loadSecureVariables } from './secure-storage.js';

/**
 * Get OS-specific config directory paths
 * @returns {Object} Object with config paths for different purposes
 */
export function getConfigPaths() {
  const platform = os.platform();
  const homedir = os.homedir();
  
  let configDir, dataDir;
  
  switch (platform) {
    case 'win32':
      configDir = process.env.APPDATA || path.join(homedir, 'AppData', 'Roaming');
      dataDir = process.env.LOCALAPPDATA || path.join(homedir, 'AppData', 'Local');
      break;
    case 'darwin': // macOS
      configDir = path.join(homedir, 'Library', 'Application Support');
      dataDir = path.join(homedir, 'Library', 'Application Support');
      break;
    default: // Linux and others
      configDir = process.env.XDG_CONFIG_HOME || path.join(homedir, '.config');
      dataDir = process.env.XDG_DATA_HOME || path.join(homedir, '.local', 'share');
      break;
  }
  
  return {
    config: path.join(configDir, 'maiass'),
    data: path.join(dataDir, 'maiass'),
    home: homedir
  };
}

/**
 * Load environment variables from multiple sources with fallback priority:
 * 1. Current working directory (.env.maiass.local) - highest priority, for sensitive local overrides
 * 2. Current working directory (.env.maiass) - project-specific config
 * 3. Home directory (.maiass.env) - user global config
 * 4. OS-specific config directory (maiass/config.env)
 * 5. OS secure storage (keychain/secret-tool) - lowest priority, for sensitive vars
 */
export function loadEnvironmentConfig() {
  const paths = getConfigPaths();
  
  const loadedFiles = [];
  
  // First, load secure variables from OS keychain/secret-tool (lowest priority)
  loadSecureVariables();
  
  // Load files in priority order (lowest to highest priority)
  const orderedFiles = [
    path.join(paths.config, 'config.env'),                 
    path.join(paths.home, '.maiass.env'),                  
    path.resolve(process.cwd(), '.env.maiass'),             // Project config
    path.resolve(process.cwd(), '.env.maiass.local')        // Highest priority - local overrides
  ];
  
  // Load all files except the last two without override
  orderedFiles.slice(0, -2).forEach((envFile) => {
    if (fs.existsSync(envFile)) {
      try {
        dotenv.config({ path: envFile });
        loadedFiles.push(envFile);
      } catch (error) {
        console.warn(`Warning: Could not load ${envFile}:`, error.message);
      }
    }
  });
  
  // Load project .env.maiass with override
  const projectEnv = orderedFiles[orderedFiles.length - 2];
  if (fs.existsSync(projectEnv)) {
    try {
      dotenv.config({ path: projectEnv, override: true });
      loadedFiles.push(projectEnv);
    } catch (error) {
      console.warn(`Warning: Could not load ${projectEnv}:`, error.message);
    }
  }
  
  // Finally, load .env.maiass.local with override to ensure it takes highest precedence
  const localEnv = orderedFiles[orderedFiles.length - 1];
  if (fs.existsSync(localEnv)) {
    try {
      dotenv.config({ path: localEnv, override: true });
      loadedFiles.push(localEnv);
    } catch (error) {
      console.warn(`Warning: Could not load ${localEnv}:`, error.message);
    }
  }
  
  // Return the environment variables along with metadata
  return {
    ...process.env,
    _metadata: {
      loadedFiles,
      configPaths: paths
    }
  };
}

/**
 * Ensure config directories exist
 */
export function ensureConfigDirectories() {
  const paths = getConfigPaths();
  
  [paths.config, paths.data].forEach(dir => {
    if (!fs.existsSync(dir)) {
      try {
        fs.mkdirSync(dir, { recursive: true });
      } catch (error) {
        console.warn(`Warning: Could not create config directory ${dir}:`, error.message);
      }
    }
  });
  
  return paths;
}

/**
 * Get the recommended path for storing sensitive environment variables
 */
export function getSecureEnvPath() {
  const paths = getConfigPaths();
  return path.join(paths.data, 'secure.env');
}

/**
 * Get the recommended path for storing general config
 */
export function getConfigEnvPath() {
  const paths = getConfigPaths();
  return path.join(paths.config, 'config.env');
}

export default {
  loadEnvironmentConfig,
  ensureConfigDirectories,
  getSecureEnvPath,
  getConfigEnvPath,
  getConfigPaths
};
