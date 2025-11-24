// Client information utilities
// Provides client name and version for API headers

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let cachedVersion = null;

/**
 * Get the current version from package.json
 * @returns {string} Version string
 */
function getVersionFromPackageJson() {
  if (cachedVersion) {
    return cachedVersion;
  }
  
  try {
    const packageJsonPath = path.join(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    cachedVersion = packageJson.version || '0.0.0';
    return cachedVersion;
  } catch (error) {
    console.error('Warning: Could not read version from package.json:', error.message);
    return '0.0.0';
  }
}

/**
 * Get client name for API headers
 * Uses MAIASS_CLIENT_NAME environment variable or defaults to 'nodemaiass'
 * @returns {string} Client name
 */
export function getClientName() {
  return process.env.MAIASS_CLIENT_NAME || 'nodemaiass';
}

/**
 * Get client version for API headers
 * Priority: MAIASS_CLIENT_VERSION env var > package.json version
 * @returns {string} Client version
 */
export function getClientVersion() {
  return process.env.MAIASS_CLIENT_VERSION || getVersionFromPackageJson();
}

/**
 * Get both client name and version
 * @returns {Object} Object with name and version properties
 */
export function getClientInfo() {
  return {
    name: getClientName(),
    version: getClientVersion()
  };
}
