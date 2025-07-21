// Complete list of MAIASS environment variables with their defaults
// Extracted from setup_bumpscript_variables() in maiass.sh

export const MAIASS_VARIABLES = {
  // Core system variables
  'MAIASS_DEBUG': { default: 'false', description: 'Enable debug mode' },
  'MAIASS_AUTOPUSH_COMMITS': { default: 'false', description: 'Automatically push commits' },
  'MAIASS_BRAND': { default: 'MAIASS', description: 'Brand name for display' },
  'MAIASS_VERBOSITY': { default: 'brief', description: 'Verbosity level (brief/normal/verbose)' },
  'MAIASS_LOGGING': { default: 'false', description: 'Enable logging to file' },
  'MAIASS_LOG_FILE': { default: 'maiass.log', description: 'Log file name' },

  // OpenAI/AI configuration
  'MAIASS_OPENAI_MODE': { default: 'ask', description: 'OpenAI interaction mode' },
  'MAIASS_OPENAI_TOKEN': { default: '', description: 'OpenAI API token', sensitive: true },
  'MAIASS_OPENAI_MODEL': { default: 'gpt-3.5-turbo', description: 'OpenAI model to use' },
  'MAIASS_OPENAI_TEMPERATURE': { default: '0.7', description: 'OpenAI temperature setting' },
  'MAIASS_OPENAI_MAX_CHARACTERS': { default: '8000', description: 'Max characters for OpenAI requests' },
  'MAIASS_OPENAI_COMMIT_MESSAGE_STYLE': { default: 'bullet', description: 'Commit message style' },
  'MAIASS_OPENAI_ENDPOINT': { default: 'https://api.openai.com/v1/chat/completions', description: 'OpenAI API endpoint' },

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
  'MAIASS_CHANGELOG_INTERNAL_NAME': { default: 'CHANGELOG_internal.md', description: 'Internal changelog filename' },

  // Repository configuration
  'MAIASS_REPO_TYPE': { default: 'bespoke', description: 'Repository type (wordpress-theme/plugin/site, craft, bespoke)' },
  'MAIASS_VERSION_PATH': { default: '.', description: 'Path to version files' },
  'MAIASS_PACKAGE_PATH': { default: '.', description: 'Path to package.json' },
  'MAIASS_WP_FILES_PATH': { default: '', description: 'Path to WordPress files' },

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
  
  // Check which file might contain this variable
  // This is a simplified check - in reality we'd need to parse each file
  if (loadedFiles.includes('.env')) {
    return 'project .env';
  } else if (loadedFiles.some(f => f.includes('.maiass.env'))) {
    return 'user .maiass.env';
  } else if (loadedFiles.some(f => f.includes('config.env'))) {
    return 'OS config';
  } else if (loadedFiles.some(f => f.includes('secure.env'))) {
    return 'OS secure';
  }
  
  return 'environment';
}

export default MAIASS_VARIABLES;
