// Complete list of MAIASS environment variables with their defaults
// Extracted from setup_bumpscript_variables() in maiass.sh
import fs from 'fs';
import path from 'path';

export const MAIASS_VARIABLES = {
  // Core system variables
  'MAIASS_DEBUG': { default: 'false', description: 'Enable debug mode' },
  'MAIASS_AUTOPUSH_COMMITS': { default: 'false', description: 'Automatically push commits' },
  'MAIASS_BRAND': { default: 'MAIASS', description: 'Brand name for display' },
  'MAIASS_VERBOSITY': { default: 'brief', description: 'Verbosity level (brief/normal/verbose)' },
  'MAIASS_LOGGING': { default: 'false', description: 'Enable logging to file' },
  'MAIASS_LOG_FILE': { default: 'maiass.log', description: 'Log file name' },

  // AI configuration
  'MAIASS_AI_MODE': { default: 'ask', description: 'AI interaction mode' },
  'MAIASS_AI_TOKEN': { default: '', description: 'AI API token', sensitive: true },
  'MAIASS_AI_MODEL': { default: 'gpt-3.5-turbo', description: 'AI model to use' },
  'MAIASS_AI_TEMPERATURE': { default: '0.7', description: 'AI temperature setting' },
  'MAIASS_AI_MAX_CHARACTERS': { default: '8000', description: 'Max characters for AI requests' },
  'MAIASS_AI_COMMIT_MESSAGE_STYLE': { default: 'bullet', description: 'Commit message style' },

  // Version file system
  'MAIASS_VERSION_PRIMARY_FILE': { default: '', description: 'Primary version file path' },
  'MAIASS_VERSION_PRIMARY_TYPE': { default: '', description: 'Primary version file type' },
  'MAIASS_VERSION_PRIMARY_LINE_START': { default: '', description: 'Line start pattern for version' },
  'MAIASS_VERSION_SECONDARY_FILES': { default: '', description: 'Secondary version files (comma-separated)' },

  // Branch configuration
  'MAIASS_DEVELOPBRANCH': { default: 'develop', description: 'Development branch name' },
  'MAIASS_STAGINGBRANCH': { default: 'staging', description: 'Staging branch name' },
  'MAIASS_MASTERBRANCH': { default: 'master', description: 'Master/main branch name' },

  // Changelog configuration
  'MAIASS_CHANGELOG_PATH': { default: '.', description: 'Path to changelog directory' },
  'MAIASS_CHANGELOG_NAME': { default: 'CHANGELOG.md', description: 'Main changelog filename' },
  'MAIASS_CHANGELOG_INTERNAL_NAME': { default: '.CHANGELOG_internal.md', description: 'Internal changelog filename' },

  // Repository configuration
  'MAIASS_REPO_TYPE': { default: 'bespoke', description: 'Repository type (wordpress-theme/plugin/site, craft, bespoke)' },
  'MAIASS_VERSION_PATH': { default: '.', description: 'Path to version files' },
  'MAIASS_PACKAGE_PATH': { default: '.', description: 'Path to package.json' },
  'MAIASS_WP_FILES_PATH': { default: '', description: 'Path to WordPress files' },

  // Release configuration
  'MAIASS_AUTO_TAG_RELEASES': { default: 'true', description: 'Automatically tag releases without prompting' },

  // Pull request configuration
  'MAIASS_STAGING_PULLREQUESTS': { default: 'on', description: 'Enable staging pull requests' },
  'MAIASS_MASTER_PULLREQUESTS': { default: 'on', description: 'Enable master pull requests' },

  // Repository provider configuration
  'MAIASS_BITBUCKET_WORKSPACE': { default: '', description: 'Bitbucket workspace name' },
  'MAIASS_BITBUCKET_REPO_SLUG': { default: '', description: 'Bitbucket repository slug' },
  'MAIASS_GITHUB_OWNER': { default: '', description: 'GitHub repository owner' },
  'MAIASS_GITHUB_REPO': { default: '', description: 'GitHub repository name' }
};

/**
 * Get the source of an environment variable value
 * @param {string} key - Environment variable key
 * @param {string} value - Current value
 * @param {Array} loadedFiles - Array of loaded config files
 * @returns {string} Source description
 */
export function getVariableSource(key, value, loadedFiles) {
  const varDef = MAIASS_VARIABLES[key];
  
  if (!value) {
    return 'not set';
  }
  
  if (varDef && value === varDef.default) {
    return 'default';
  }
  
  // Check which file contains this variable by reading file contents
  // Priority order: project .env (highest) -> user .maiass.env -> OS config -> OS secure (lowest)
  
  // Check project .env first (highest priority)
  const projectEnv = path.resolve(process.cwd(), '.env');
  if (loadedFiles.some(f => f === projectEnv)) {
    try {
      const content = fs.readFileSync(projectEnv, 'utf8');
      if (content.includes(`${key}=`)) {
        return 'project .env';
      }
    } catch (error) {
      // File read error, continue checking other files
    }
  }
  
  // Check user .maiass.env
  const userEnv = loadedFiles.find(f => f.includes('.maiass.env'));
  if (userEnv) {
    try {
      const content = fs.readFileSync(userEnv, 'utf8');
      if (content.includes(`${key}=`)) {
        return 'user .maiass.env';
      }
    } catch (error) {
      // File read error, continue checking other files
    }
  }
  
  // Check OS config
  const osConfig = loadedFiles.find(f => f.includes('config.env'));
  if (osConfig) {
    try {
      const content = fs.readFileSync(osConfig, 'utf8');
      if (content.includes(`${key}=`)) {
        return 'OS config';
      }
    } catch (error) {
      // File read error, continue checking other files
    }
  }
  
  // Check OS secure
  const osSecure = loadedFiles.find(f => f.includes('secure.env'));
  if (osSecure) {
    try {
      const content = fs.readFileSync(osSecure, 'utf8');
      if (content.includes(`${key}=`)) {
        return 'OS secure';
      }
    } catch (error) {
      // File read error, continue checking other files
    }
  }
  
  return 'environment';
}

export default MAIASS_VARIABLES;
