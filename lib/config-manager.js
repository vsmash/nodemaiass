// Configuration management for MAIASSNODE
// Handles global and project-level configuration settings

import fs from 'fs';
import path from 'path';
import os from 'os';
import { execSync } from 'child_process';
import { log, logger } from './logger.js';
import colors from './colors.js';
import { SYMBOLS } from './symbols.js';
import { MAIASS_VARIABLES } from './maiass-variables.js';
import { loadEnvironmentConfig } from './config.js';

/**
 * Get configuration file paths
 * @returns {Object} Configuration file paths
 */
export function getConfigPaths() {
  return {
    global: path.join(os.homedir(), '.env.maiass'),
    project: path.resolve(process.cwd(), '.env.maiass'),
    projectDir: process.cwd(),
    homeDir: os.homedir()
  };
}

/**
 * Check if a configuration file exists
 * @param {string} configPath - Path to config file
 * @returns {boolean} True if file exists
 */
export function configExists(configPath) {
  return fs.existsSync(configPath);
}

/**
 * Read configuration file contents
 * @param {string} configPath - Path to config file
 * @returns {Object} Parsed configuration object
 */
export function readConfig(configPath) {
  if (!configExists(configPath)) {
    return {};
  }
  
  try {
    const content = fs.readFileSync(configPath, 'utf8');
    const config = {};
    
    // Parse .env format (KEY=value)
    content.split('\n').forEach(line => {
      line = line.trim();
      if (line && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
          let value = valueParts.join('=').trim();
          
          // Remove surrounding quotes if present
          if ((value.startsWith('"') && value.endsWith('"')) ||
              (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
          }
          
          config[key.trim()] = value;
        }
      }
    });
    
    return config;
  } catch (error) {
    console.error(colors.Red(`${SYMBOLS.CROSS} Error reading config file ${configPath}: ${error.message}`));
    return {};
  }
}

/**
 * Write configuration to file
 * @param {string} configPath - Path to config file
 * @param {Object} config - Configuration object to write
 * @param {Object} options - Write options
 */
export function writeConfig(configPath, config, options = {}) {
  const { backup = true, createDir = true } = options;
  
  try {
    // Create directory if it doesn't exist
    if (createDir) {
      const dir = path.dirname(configPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }
    
    // Create backup if file exists
    if (backup && configExists(configPath)) {
      const backupPath = `${configPath}.backup.${Date.now()}`;
      fs.copyFileSync(configPath, backupPath);
    }
    
    // Generate .env format content
    const lines = [];
    lines.push('# MAIASS Configuration');
    lines.push(`# Generated on ${new Date().toISOString()}`);
    lines.push('');
    
    // Group variables by category for better organization
    const categories = {
      'Core': ['MAIASS_DEBUG', 'MAIASS_VERBOSITY', 'MAIASS_LOGGING', 'MAIASS_BRAND'],
      'OpenAI': ['MAIASS_AI_MODE', 'MAIASS_AI_TOKEN', 'MAIASS_AI_MODEL', 'MAIASS_AI_TEMPERATURE', 'MAIASS_AI_ENDPOINT', 'MAIASS_AI_MAX_CHARACTERS', 'MAIASS_AI_COMMIT_MESSAGE_STYLE'],
      'Branches': ['MAIASS_DEVELOPBRANCH', 'MAIASS_STAGINGBRANCH', 'MAIASS_MASTERBRANCH'],
      'Repository': ['MAIASS_REPO_TYPE', 'MAIASS_GITHUB_OWNER', 'MAIASS_GITHUB_REPO', 'MAIASS_BITBUCKET_WORKSPACE', 'MAIASS_BITBUCKET_REPO_SLUG'],
      'Pull Requests': ['MAIASS_STAGING_PULLREQUESTS', 'MAIASS_MASTER_PULLREQUESTS'],
      'Versioning': ['MAIASS_VERSION_PATH', 'MAIASS_VERSION_PRIMARY_FILE', 'MAIASS_VERSION_PRIMARY_TYPE', 'MAIASS_VERSION_PRIMARY_LINE_START', 'MAIASS_VERSION_SECONDARY_FILES'],
      'Changelog': ['MAIASS_CHANGELOG_PATH', 'MAIASS_CHANGELOG_NAME', 'MAIASS_CHANGELOG_INTERNAL_NAME'],
      'Other': []
    };
    
    // Write variables by category
    Object.entries(categories).forEach(([categoryName, categoryVars]) => {
      const varsInCategory = Object.keys(config).filter(key => 
        categoryVars.includes(key) || (categoryName === 'Other' && !Object.values(categories).flat().includes(key))
      );
      
      if (varsInCategory.length > 0) {
        lines.push(`# ${categoryName} Settings`);
        varsInCategory.forEach(key => {
          const value = config[key];
          const varDef = MAIASS_VARIABLES[key];
          
          if (varDef && varDef.description) {
            lines.push(`# ${varDef.description}`);
          }
          
          // Quote values that contain spaces or special characters
          const needsQuotes = /[\s#"'\\]/.test(value);
          const quotedValue = needsQuotes ? `"${value.replace(/"/g, '\\"')}"` : value;
          
          lines.push(`${key}=${quotedValue}`);
        });
        lines.push('');
      }
    });
    
    fs.writeFileSync(configPath, lines.join('\n'), 'utf8');
    
  } catch (error) {
    console.error(colors.Red(`${SYMBOLS.CROSS} Error writing config file ${configPath}: ${error.message}`));
    throw error;
  }
}

/**
 * Set a configuration value
 * @param {string} key - Configuration key
 * @param {string} value - Configuration value
 * @param {Object} options - Options like { global: true }
 */
export function setConfigValue(key, value, options = {}) {
  const paths = getConfigPaths();
  const configPath = options.global ? paths.global : paths.project;
  
  const config = readConfig(configPath);
  config[key] = value;
  writeConfig(configPath, config);
}

/**
 * Get a configuration value with fallback hierarchy
 * @param {string} key - Configuration key
 * @returns {Object} Value info with source
 */
export function getConfigValue(key) {
  const paths = getConfigPaths();
  
  // Check project config first (highest priority)
  const projectConfig = readConfig(paths.project);
  if (projectConfig[key] !== undefined) {
    return {
      value: projectConfig[key],
      source: 'project',
      path: paths.project
    };
  }
  
  // Check global config
  const globalConfig = readConfig(paths.global);
  if (globalConfig[key] !== undefined) {
    return {
      value: globalConfig[key],
      source: 'global',
      path: paths.global
    };
  }
  
  // Check default value
  const varDef = MAIASS_VARIABLES[key];
  if (varDef && varDef.default !== undefined) {
    return {
      value: varDef.default,
      source: 'default',
      path: null
    };
  }
  
  return {
    value: undefined,
    source: 'not_set',
    path: null
  };
}

/**
 * List all configuration values with their sources
 * @param {Object} options - Listing options
 * @returns {Object} Configuration listing
 */
export function listConfig(options = {}) {
  const { scope = 'all', showSensitive = false } = options;
  const paths = getConfigPaths();
  
  const result = {
    global: {},
    project: {},
    merged: {},
    files: {
      global: { exists: configExists(paths.global), path: paths.global },
      project: { exists: configExists(paths.project), path: paths.project }
    }
  };
  
  // Read config files
  if (result.files.global.exists) {
    result.global = readConfig(paths.global);
  }
  
  if (result.files.project.exists) {
    result.project = readConfig(paths.project);
  }
  
  // Create merged config with source tracking
  Object.keys(MAIASS_VARIABLES).forEach(key => {
    const valueInfo = getConfigValue(key);
    const varDef = MAIASS_VARIABLES[key];
    
    // Skip sensitive variables unless explicitly requested
    if (varDef.sensitive && !showSensitive) {
      if (valueInfo.value) {
        valueInfo.value = '***' + valueInfo.value.slice(-4);
      }
    }
    
    result.merged[key] = {
      ...valueInfo,
      description: varDef.description,
      sensitive: varDef.sensitive || false
    };
  });
  
  return result;
}

/**
 * Open configuration file in default editor
 * @param {string} configPath - Path to config file
 */
export function editConfig(configPath) {
  try {
    // Create file if it doesn't exist
    if (!configExists(configPath)) {
      writeConfig(configPath, {});
    }
    
    // Try to detect and use appropriate editor
    const editor = process.env.EDITOR || process.env.VISUAL || 'nano';
    
    log.blue(SYMBOLS.INFO, `Opening ${configPath} in ${editor}...`);
    
    execSync(`${editor} "${configPath}"`, { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
    
    log.success(SYMBOLS.CHECKMARK, 'Configuration file updated');
    
  } catch (error) {
    console.error(colors.Red(`${SYMBOLS.CROSS} Error opening editor: ${error.message}`));
    log.warning(SYMBOLS.INFO, `You can manually edit: ${configPath}`);
  }
}

/**
 * Validate configuration values
 * @param {Object} config - Configuration object to validate
 * @returns {Array} Array of validation errors
 */
export function validateConfig(config) {
  const errors = [];
  
  Object.entries(config).forEach(([key, value]) => {
    const varDef = MAIASS_VARIABLES[key];
    
    if (!varDef) {
      errors.push({
        key,
        error: 'Unknown configuration variable',
        suggestion: 'Check available variables with: nma config --list-vars'
      });
      return;
    }
    
    // Add specific validation rules here as needed
    if (key === 'MAIASS_AI_TEMPERATURE') {
      const temp = parseFloat(value);
      if (isNaN(temp) || temp < 0 || temp > 2) {
        errors.push({
          key,
          error: 'Temperature must be a number between 0 and 2',
          current: value
        });
      }
    }
    
    if (key.includes('PULLREQUESTS') && !['on', 'off'].includes(value)) {
      errors.push({
        key,
        error: 'Pull request setting must be "on" or "off"',
        current: value
      });
    }
  });
  
  return errors;
}
