// Cross-platform configuration and environment variable loading
import path from 'path';
import fs from 'fs';
import os from 'os';
import dotenv from 'dotenv';

/**
 * Get OS-specific config directory paths
 * @returns {Object} Object with config paths for different purposes
 */
function getConfigPaths() {
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
    path.resolve(process.cwd(), '.env'),                    // Project-specific
    path.join(paths.home, '.maiass.env'),                  // User global
    path.join(paths.config, 'config.env'),                 // OS config dir
    path.join(paths.data, 'secure.env')                    // OS secure dir
  ];
  
  const loadedFiles = [];
  
  // Load in reverse order so higher priority files override lower priority
  for (let i = envFiles.length - 1; i >= 0; i--) {
    const envFile = envFiles[i];
    if (fs.existsSync(envFile)) {
      try {
        dotenv.config({ path: envFile });
        loadedFiles.push(envFile);
      } catch (error) {
        console.warn(`Warning: Could not load ${envFile}:`, error.message);
      }
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
