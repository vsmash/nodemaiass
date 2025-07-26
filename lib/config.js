// Cross-platform configuration and environment variable loading
import path from 'path';
import fs from 'fs';
import os from 'os';
import dotenv from 'dotenv';

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
    config: path.join(configDir, 'maiassnode'),
    data: path.join(dataDir, 'maiassnode'),
    home: homedir
  };
}

/**
 * Load environment variables from multiple sources with fallback priority:
 * 1. Current working directory (.env)
 * 2. Home directory (.maiass.env)
 * 3. OS-specific config directory (maiassnode/config.env)
 * 4. OS-specific secure directory for sensitive vars (maiassnode/secure.env)
 */
export function loadEnvironmentConfig() {
  const paths = getConfigPaths();
  const envFiles = [
    // Priority order (highest to lowest)
    path.resolve(process.cwd(), '.env.maiass'),             // Project-specific
    path.join(paths.home, '.env.maiass'),                  // User global
    path.join(paths.config, 'config.env'),                 // OS config dir
    path.join(paths.data, 'secure.env')                    // OS secure dir
  ];
  
  const loadedFiles = [];
  
  // Load files in priority order (lowest to highest priority)
  // Start with lowest priority files, end with highest priority
  const orderedFiles = [
    path.join(paths.data, 'secure.env'),                    // Lowest priority
    path.join(paths.config, 'config.env'),                 
    path.join(paths.home, '.env.maiass'),                  
    path.resolve(process.cwd(), '.env.maiass')              // Highest priority
  ];
  
  // First, load all files except project .env.maiass without override
  orderedFiles.slice(0, -1).forEach((envFile) => {
    if (fs.existsSync(envFile)) {
      try {
        dotenv.config({ path: envFile });
        loadedFiles.push(envFile);
      } catch (error) {
        console.warn(`Warning: Could not load ${envFile}:`, error.message);
      }
    }
  });
  
  // Finally, load project .env.maiass with override to ensure it takes precedence
  const projectEnv = orderedFiles[orderedFiles.length - 1];
  if (fs.existsSync(projectEnv)) {
    try {
      dotenv.config({ path: projectEnv, override: true });
      loadedFiles.push(projectEnv);
    } catch (error) {
      console.warn(`Warning: Could not load ${projectEnv}:`, error.message);
    }
  }
  
  return {
    loadedFiles,
    configPaths: paths
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
