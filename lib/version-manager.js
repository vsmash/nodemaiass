import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import colors from './colors.js';
import { SYMBOLS } from './symbols.js';
import { loadEnvironmentConfig } from './config.js';

/**
 * Execute git command safely
 * @param {string} command - Git command to execute
 * @param {boolean} silent - Whether to suppress errors
 * @returns {Promise<Object>} Command result with success, output, and error
 */
function executeGitCommand(command, silent = false) {
  try {
    const result = execSync(`git ${command}`, { 
      encoding: 'utf8', 
      stdio: silent ? 'pipe' : ['pipe', 'pipe', 'ignore']
    });
    
    return {
      success: true,
      output: result.trim(),
      error: null
    };
  } catch (error) {
    return {
      success: false,
      output: '',
      error: error.message
    };
  }
}

/**
 * Supported version file types and their parsing/updating logic
 */
const VERSION_FILE_TYPES = {
  json: {
    extensions: ['.json'],
    detect: (content) => {
      try {
        const parsed = JSON.parse(content);
        return parsed.version !== undefined;
      } catch {
        return false;
      }
    },
    extract: (content) => {
      try {
        const parsed = JSON.parse(content);
        return parsed.version || null;
      } catch {
        return null;
      }
    },
    update: (content, newVersion) => {
      try {
        const parsed = JSON.parse(content);
        parsed.version = newVersion;
        return JSON.stringify(parsed, null, 2) + '\n';
      } catch {
        return null;
      }
    }
  },
  text: {
    extensions: ['.txt', '.version', ''],
    detect: (content, filename) => {
      // Simple text files that contain just a version number
      const basename = path.basename(filename).toLowerCase();
      if (basename === 'version' || basename.includes('version')) {
        return /^\d+\.\d+\.\d+/.test(content.trim());
      }
      return false;
    },
    extract: (content) => {
      const match = content.match(/^(\d+\.\d+\.\d+)/);
      return match ? match[1] : null;
    },
    update: (content, newVersion) => {
      return content.replace(/^\d+\.\d+\.\d+/, newVersion);
    }
  },
  php: {
    extensions: ['.php','pattern'],
    detect: (content) => {
      return /Version:\s*\d+\.\d+\.\d+/.test(content) || 
             /define\s*\(\s*['"].*VERSION['"]/.test(content);
    },
    extract: (content) => {
      // WordPress style header
      let match = content.match(/Version:\s*(\d+\.\d+\.\d+)/);
      if (match) return match[1];
      
      // PHP define
      match = content.match(/define\s*\(\s*['"].*VERSION['"],\s*['"](\d+\.\d+\.\d+)['"]/);
      return match ? match[1] : null;
    },
    update: (content, newVersion) => {
      // Update WordPress style header
      content = content.replace(
        /(Version:\s*)\d+\.\d+\.\d+/g, 
        `$1${newVersion}`
      );
      
      // Update PHP define
      content = content.replace(
        /(define\s*\(\s*['"].*VERSION['"],\s*['"])\d+\.\d+\.\d+(['"])/g,
        `$1${newVersion}$2`
      );
      
      return content;
    }
  }
};

/**
 * Parse semantic version string
 * @param {string} version - Version string (e.g., "1.2.3")
 * @returns {Object|null} Parsed version object or null if invalid
 */
export function parseVersion(version) {
  if (!version) return null;
  
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)(?:-(.+))?$/);
  if (!match) return null;
  
  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3], 10),
    prerelease: match[4] || null,
    raw: version
  };
}

/**
 * Compare two semantic versions
 * @param {string} version1 - First version
 * @param {string} version2 - Second version
 * @returns {number} -1 if v1 < v2, 0 if equal, 1 if v1 > v2
 */
export function compareVersions(version1, version2) {
  const v1 = parseVersion(version1);
  const v2 = parseVersion(version2);
  
  if (!v1 || !v2) return 0;
  
  if (v1.major !== v2.major) return v1.major - v2.major;
  if (v1.minor !== v2.minor) return v1.minor - v2.minor;
  if (v1.patch !== v2.patch) return v1.patch - v2.patch;
  
  return 0;
}

/**
 * Bump version according to type
 * @param {string} currentVersion - Current version string
 * @param {string} bumpType - Type of bump (major, minor, patch)
 * @returns {string|null} New version string or null if invalid
 */
export function bumpVersion(currentVersion, bumpType) {
  const parsed = parseVersion(currentVersion);
  if (!parsed) return null;
  
  switch (bumpType.toLowerCase()) {
    case 'major':
      return `${parsed.major + 1}.0.0`;
    case 'minor':
      return `${parsed.major}.${parsed.minor + 1}.0`;
    case 'patch':
      return `${parsed.major}.${parsed.minor}.${parsed.patch + 1}`;
    default:
      // Check if it's a specific version
      if (parseVersion(bumpType)) {
        return bumpType;
      }
      return null;
  }
}

/**
 * Get WordPress plugin/theme configuration from environment variables
 * @param {string} projectPath - Path to project directory
 * @returns {Object} WordPress configuration
 */
function getWordPressConfig(projectPath = process.cwd()) {
  console.log(colors.BBlue(`${SYMBOLS.INFO} [DEBUG] Loading WordPress config from: ${projectPath}`));
  
  // Check if .env.maiass exists in current directory
  const envFile = path.join(projectPath, '.env.maiass');
  console.log(colors.BBlue(`${SYMBOLS.INFO} [DEBUG] Looking for .env.maiass at: ${envFile}`));
  
  if (fs.existsSync(envFile)) {
    console.log(colors.BGreen(`${SYMBOLS.CHECKMARK} [DEBUG] .env.maiass file exists`));
    try {
      const envContent = fs.readFileSync(envFile, 'utf8');
      console.log(colors.BBlue(`${SYMBOLS.INFO} [DEBUG] .env.maiass content:`));
      console.log(colors.Gray(envContent));
    } catch (error) {
      console.log(colors.BYellow(`${SYMBOLS.WARNING} [DEBUG] Could not read .env.maiass: ${error.message}`));
    }
  } else {
    console.log(colors.BYellow(`${SYMBOLS.WARNING} [DEBUG] .env.maiass file not found`));
  }
  
  const envVars = loadEnvironmentConfig();
  console.log(colors.BBlue(`${SYMBOLS.INFO} [DEBUG] Environment variables loaded`));
  
  // Show all loaded environment variables for debugging
  console.log(colors.BBlue(`${SYMBOLS.INFO} [DEBUG] All loaded environment variables:`));
  const relevantVars = ['MAIASS_PLUGIN_PATH', 'MAIASS_THEME_PATH', 'MAIASS_VERSION_CONSTANT', 'MAIASS_REPO_TYPE'];
  relevantVars.forEach(varName => {
    const value = envVars[varName];
    console.log(colors.Gray(`  ${varName}: ${value || '(not set)'}`));
  });
  
  const config = {
    pluginPath: envVars.MAIASS_PLUGIN_PATH || null,
    themePath: envVars.MAIASS_THEME_PATH || null,
    versionConstant: envVars.MAIASS_VERSION_CONSTANT || null
  };
  
  console.log(colors.BBlue(`${SYMBOLS.INFO} [DEBUG] WordPress config:`));
  console.log(colors.Gray(`  Plugin Path: ${config.pluginPath || '(not set)'}`));
  console.log(colors.Gray(`  Theme Path: ${config.themePath || '(not set)'}`));
  console.log(colors.Gray(`  Version Constant: ${config.versionConstant || '(not set)'}`));
  
  return config;
}

/**
 * Convert slug to uppercase with underscores for PHP constant
 * @param {string} slug - Plugin/theme slug
 * @returns {string} Formatted constant name
 */
function slugToConstant(slug) {
  return slug
    .replace(/[^a-zA-Z0-9_]/g, '_') // Replace non-alphanumeric with underscores
    .replace(/_+/g, '_') // Replace multiple underscores with single
    .replace(/^_|_$/g, '') // Remove leading/trailing underscores
    .toUpperCase();
}

/**
 * Generate version constant name from plugin/theme path
 * @param {string} pluginOrThemePath - Path to plugin or theme
 * @returns {string} Generated constant name
 */
function generateVersionConstant(pluginOrThemePath) {
  let slug;
  
  if (pluginOrThemePath.includes('wp-content/plugins/')) {
    slug = pluginOrThemePath.split('wp-content/plugins/')[1].split('/')[0];
  } else if (pluginOrThemePath.includes('wp-content/themes/')) {
    slug = pluginOrThemePath.split('wp-content/themes/')[1].split('/')[0];
  } else {
    // Extract last directory name as slug
    slug = path.basename(pluginOrThemePath);
  }
  
  return `${slugToConstant(slug)}_VERSION`;
}

/**
 * Update WordPress theme style.css version header
 * @param {string} filePath - Path to the style.css file
 * @param {string} newVersion - New version value
 * @returns {boolean} Success status
 */
function updateThemeStyleVersion(filePath, newVersion) {
  console.log(colors.BBlue(`${SYMBOLS.INFO} [DEBUG] Checking theme style.css: ${filePath}`));
  
  if (!fs.existsSync(filePath)) {
    console.log(colors.BYellow(`${SYMBOLS.WARNING} [DEBUG] style.css not found: ${filePath}`));
    return false;
  }
  
  console.log(colors.BGreen(`${SYMBOLS.CHECKMARK} [DEBUG] style.css exists: ${filePath}`));
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    console.log(colors.BBlue(`${SYMBOLS.INFO} [DEBUG] style.css content length: ${content.length} characters`));
    
    // WordPress theme header pattern for Version (handles various formats)
    // Matches: "Version:", "version:", "* Version:", "* version:", etc.
    const versionPattern = /^(\s*\*?\s*[Vv]ersion:\s*)([0-9]+\.[0-9]+\.[0-9]+.*)$/gm;
    console.log(colors.BBlue(`${SYMBOLS.INFO} [DEBUG] Search pattern: ${versionPattern.source}`));
    
    // Test the pattern and show results
    const matches = content.match(versionPattern);
    if (matches) {
      console.log(colors.BGreen(`${SYMBOLS.CHECKMARK} [DEBUG] Found ${matches.length} version header(s):`));
      matches.forEach((match, index) => {
        console.log(colors.Gray(`  ${index + 1}: ${match.trim()}`));
      });
      
      // Replace with uniform format: always write "Version: x.x.x"
      content = content.replace(versionPattern, `Version: ${newVersion}`);
      console.log(colors.BGreen(`${SYMBOLS.CHECKMARK} Updated theme version in style.css (standardized format)`));
    } else {
      console.log(colors.BYellow(`${SYMBOLS.WARNING} [DEBUG] No version header found in style.css`));
      
      // Show the first part of the file to help debug
      const lines = content.split('\n');
      console.log(colors.BBlue(`${SYMBOLS.INFO} [DEBUG] First 15 lines of style.css:`));
      lines.slice(0, 15).forEach((line, index) => {
        console.log(colors.Gray(`  ${index + 1}: ${line}`));
      });
      
      return false;
    }
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(colors.BGreen(`${SYMBOLS.CHECKMARK} [DEBUG] style.css written successfully`));
    return true;
  } catch (error) {
    console.error(colors.Red(`${SYMBOLS.CROSS} Error updating ${filePath}: ${error.message}`));
    return false;
  }
}

/**
 * Update PHP version constant in file
 * @param {string} filePath - Path to the PHP file
 * @param {string} constantName - Name of the constant to update
 * @param {string} newVersion - New version value
 * @returns {boolean} Success status
 */
function updatePhpVersionConstant(filePath, constantName, newVersion) {
  console.log(colors.BBlue(`${SYMBOLS.INFO} [DEBUG] Checking PHP file: ${filePath}`));
  
  if (!fs.existsSync(filePath)) {
    console.log(colors.BYellow(`${SYMBOLS.WARNING} [DEBUG] File not found: ${filePath}`));
    return false;
  }
  
  console.log(colors.BGreen(`${SYMBOLS.CHECKMARK} [DEBUG] File exists: ${filePath}`));
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    console.log(colors.BBlue(`${SYMBOLS.INFO} [DEBUG] File content length: ${content.length} characters`));
    
    const definePattern = new RegExp(`^\\s*define\\s*\\(\\s*['"]${constantName}['"].*$`, 'gm');
    console.log(colors.BBlue(`${SYMBOLS.INFO} [DEBUG] Search pattern: ${definePattern.source}`));
    console.log(colors.BBlue(`${SYMBOLS.INFO} [DEBUG] Looking for constant: ${constantName}`));
    
    // Test the pattern and show results
    const matches = content.match(definePattern);
    if (matches) {
      console.log(colors.BGreen(`${SYMBOLS.CHECKMARK} [DEBUG] Found ${matches.length} match(es):`));
      matches.forEach((match, index) => {
        console.log(colors.Gray(`  ${index + 1}: ${match.trim()}`));
      });
    } else {
      console.log(colors.BYellow(`${SYMBOLS.WARNING} [DEBUG] No matches found for pattern`));
      
      // Show a sample of the file content to help debug
      const lines = content.split('\n');
      console.log(colors.BBlue(`${SYMBOLS.INFO} [DEBUG] First 10 lines of file:`));
      lines.slice(0, 10).forEach((line, index) => {
        console.log(colors.Gray(`  ${index + 1}: ${line}`));
      });
      
      // Look for any define statements
      const anyDefinePattern = /^\s*define\s*\(/gm;
      const defineMatches = content.match(anyDefinePattern);
      if (defineMatches) {
        console.log(colors.BBlue(`${SYMBOLS.INFO} [DEBUG] Found ${defineMatches.length} define statement(s) in file`));
      } else {
        console.log(colors.BYellow(`${SYMBOLS.WARNING} [DEBUG] No define statements found in file`));
      }
    }
    
    const newDefine = `define('${constantName}', '${newVersion}');`;
    console.log(colors.BBlue(`${SYMBOLS.INFO} [DEBUG] New define statement: ${newDefine}`));
    
    if (definePattern.test(content)) {
      // Replace existing define
      content = content.replace(definePattern, newDefine);
      console.log(colors.BGreen(`${SYMBOLS.CHECKMARK} Updated ${constantName} in ${path.basename(filePath)}`));
    } else {
      // Add new define after opening PHP tag
      const phpOpenTag = /<\?php/;
      console.log(colors.BBlue(`${SYMBOLS.INFO} [DEBUG] Looking for PHP opening tag...`));
      
      if (phpOpenTag.test(content)) {
        console.log(colors.BGreen(`${SYMBOLS.CHECKMARK} [DEBUG] Found PHP opening tag, adding new define`));
        content = content.replace(phpOpenTag, `<?php\n\n${newDefine}`);
        console.log(colors.BGreen(`${SYMBOLS.CHECKMARK} Added ${constantName} to ${path.basename(filePath)}`));
      } else {
        console.log(colors.BYellow(`${SYMBOLS.WARNING} Could not find PHP opening tag in ${path.basename(filePath)}`));
        return false;
      }
    }
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(colors.BGreen(`${SYMBOLS.CHECKMARK} [DEBUG] File written successfully`));
    return true;
  } catch (error) {
    console.error(colors.Red(`${SYMBOLS.CROSS} Error updating ${filePath}: ${error.message}`));
    return false;
  }
}

/**
 * Update WordPress plugin/theme version files
 * @param {string} newVersion - New version to set
 * @param {string} projectPath - Path to project directory
 * @returns {boolean} Success status
 */
function updateWordPressVersions(newVersion, projectPath = process.cwd()) {
  const wpConfig = getWordPressConfig(projectPath);
  let success = true;
  
  // Handle plugin path
  if (wpConfig.pluginPath) {
    const pluginPath = path.isAbsolute(wpConfig.pluginPath) 
      ? wpConfig.pluginPath 
      : path.join(projectPath, wpConfig.pluginPath);
    
    // Determine main plugin file
    let mainPluginFile;
    if (fs.existsSync(pluginPath) && fs.statSync(pluginPath).isDirectory()) {
      // Look for main plugin file (usually matches directory name)
      const pluginName = path.basename(pluginPath);
      const possibleFiles = [
        path.join(pluginPath, `${pluginName}.php`),
        path.join(pluginPath, 'plugin.php'),
        path.join(pluginPath, 'index.php')
      ];
      
      mainPluginFile = possibleFiles.find(file => fs.existsSync(file));
    } else if (pluginPath.endsWith('.php')) {
      mainPluginFile = pluginPath;
    }
    
    if (mainPluginFile) {
      const constantName = wpConfig.versionConstant || generateVersionConstant(wpConfig.pluginPath);
      if (!updatePhpVersionConstant(mainPluginFile, constantName, newVersion)) {
        success = false;
      }
    } else {
      console.log(colors.BYellow(`${SYMBOLS.WARNING} Could not find main plugin file in ${pluginPath}`));
    }
  }
  
  // Handle theme path
  if (wpConfig.themePath) {
    console.log(colors.BBlue(`${SYMBOLS.INFO} [DEBUG] Processing theme path: ${wpConfig.themePath}`));
    
    const themePath = path.isAbsolute(wpConfig.themePath) 
      ? wpConfig.themePath 
      : path.join(projectPath, wpConfig.themePath);
    
    console.log(colors.BBlue(`${SYMBOLS.INFO} [DEBUG] Resolved theme path: ${themePath}`));
    console.log(colors.BBlue(`${SYMBOLS.INFO} [DEBUG] Checking if theme path exists...`));
    
    // Look for functions.php in theme directory
    let functionsFile;
    if (fs.existsSync(themePath)) {
      console.log(colors.BGreen(`${SYMBOLS.CHECKMARK} [DEBUG] Theme path exists`));
      
      if (fs.statSync(themePath).isDirectory()) {
        console.log(colors.BBlue(`${SYMBOLS.INFO} [DEBUG] Theme path is a directory, looking for functions.php`));
        functionsFile = path.join(themePath, 'functions.php');
        console.log(colors.BBlue(`${SYMBOLS.INFO} [DEBUG] Functions file path: ${functionsFile}`));
      } else {
        console.log(colors.BBlue(`${SYMBOLS.INFO} [DEBUG] Theme path is a file`));
      }
    } else {
      console.log(colors.BYellow(`${SYMBOLS.WARNING} [DEBUG] Theme path does not exist: ${themePath}`));
    }
    
    if (wpConfig.themePath.endsWith('functions.php')) {
      console.log(colors.BBlue(`${SYMBOLS.INFO} [DEBUG] Theme path ends with functions.php, using directly`));
      functionsFile = themePath;
    }
    
    console.log(colors.BBlue(`${SYMBOLS.INFO} [DEBUG] Final functions file path: ${functionsFile || '(not determined)'}`));
    
    if (functionsFile && fs.existsSync(functionsFile)) {
      console.log(colors.BGreen(`${SYMBOLS.CHECKMARK} [DEBUG] Functions file exists, proceeding with update`));
      
      const constantName = wpConfig.versionConstant || generateVersionConstant(wpConfig.themePath);
      console.log(colors.BBlue(`${SYMBOLS.INFO} [DEBUG] Using constant name: ${constantName}`));
      
      if (!updatePhpVersionConstant(functionsFile, constantName, newVersion)) {
        success = false;
      }
    } else {
      console.log(colors.BYellow(`${SYMBOLS.WARNING} Could not find functions.php in ${themePath}`));
      if (functionsFile) {
        console.log(colors.BYellow(`${SYMBOLS.WARNING} [DEBUG] Expected functions.php at: ${functionsFile}`));
      }
    }
    
    // Also update style.css if it exists in the theme directory
    const styleFile = path.join(themePath, 'style.css');
    console.log(colors.BBlue(`${SYMBOLS.INFO} [DEBUG] Checking for style.css at: ${styleFile}`));
    
    if (fs.existsSync(styleFile)) {
      console.log(colors.BGreen(`${SYMBOLS.CHECKMARK} [DEBUG] style.css found, updating theme version header`));
      if (!updateThemeStyleVersion(styleFile, newVersion)) {
        success = false;
      }
    } else {
      console.log(colors.BYellow(`${SYMBOLS.WARNING} [DEBUG] style.css not found at: ${styleFile}`));
    }
  }
  
  return success;
}

/**
 * Detect version files in the current directory
 * @param {string} projectPath - Path to project directory
 * @returns {Array} Array of detected version files
 */
export function detectVersionFiles(projectPath = process.cwd()) {
  const versionFiles = [];
  
  // Common version file patterns to check
  const filesToCheck = [
    'package.json',
    'composer.json', 
    'VERSION',
    'version.txt',
    'style.css', // WordPress themes
    'plugin.php', // WordPress plugins
    'functions.php'
  ];
  
  for (const filename of filesToCheck) {
    const filePath = path.join(projectPath, filename);
    
    if (fs.existsSync(filePath)) {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const ext = path.extname(filename);
        
        // Determine file type and check if it contains version info
        for (const [typeName, typeConfig] of Object.entries(VERSION_FILE_TYPES)) {
          if (typeConfig.extensions.includes(ext) || typeConfig.extensions.includes('')) {
            if (typeConfig.detect(content, filename)) {
              const version = typeConfig.extract(content);
              if (version) {
                versionFiles.push({
                  path: filePath,
                  filename,
                  type: typeName,
                  currentVersion: version,
                  content
                });
                break; // Found matching type, move to next file
              }
            }
          }
        }
      } catch (error) {
        // Skip files that can't be read
        continue;
      }
    }
  }
  
  return versionFiles;
}

/**
 * Get the latest version from git tags
 * @returns {Promise<string|null>} Latest version tag or null
 */
export async function getLatestVersionFromTags() {
  try {
    const result = await executeGitCommand('tag -l');
    if (!result.success) return null;
    
    const tags = result.output
      .split('\n')
      .filter(tag => tag.trim())
      .filter(tag => /^\d+\.\d+\.\d+$/.test(tag))
      .sort((a, b) => compareVersions(b, a)); // Sort descending
    
    return tags.length > 0 ? tags[0] : null;
  } catch {
    return null;
  }
}

/**
 * Get current project version from files or git tags
 * @param {string} projectPath - Path to project directory
 * @returns {Promise<Object>} Version information
 */
export async function getCurrentVersion(projectPath = process.cwd()) {
  const versionFiles = detectVersionFiles(projectPath);
  const tagVersion = await getLatestVersionFromTags();
  
  let primaryVersion = null;
  let primarySource = null;
  
  // Prioritize package.json if it exists
  const packageJson = versionFiles.find(f => f.filename === 'package.json');
  if (packageJson) {
    primaryVersion = packageJson.currentVersion;
    primarySource = 'package.json';
  } else if (versionFiles.length > 0) {
    // Use first detected version file
    primaryVersion = versionFiles[0].currentVersion;
    primarySource = versionFiles[0].filename;
  } else if (tagVersion) {
    primaryVersion = tagVersion;
    primarySource = 'git tags';
  }
  
  return {
    current: primaryVersion,
    source: primarySource,
    files: versionFiles,
    tagVersion,
    hasVersionFiles: versionFiles.length > 0
  };
}

/**
 * Update version in all detected files
 * @param {string} newVersion - New version to set
 * @param {Array} versionFiles - Array of version files to update
 * @param {boolean} dryRun - If true, don't actually write files
 * @returns {Promise<Object>} Update results
 */
export async function updateVersionFiles(newVersion, versionFiles, dryRun = false) {
  const results = {
    success: true,
    updated: [],
    failed: [],
    dryRun
  };
  
  for (const file of versionFiles) {
    try {
      const typeConfig = VERSION_FILE_TYPES[file.type];
      const updatedContent = typeConfig.update(file.content, newVersion);
      
      if (!updatedContent) {
        results.failed.push({
          file: file.filename,
          error: 'Failed to update content'
        });
        continue;
      }
      
      if (!dryRun) {
        fs.writeFileSync(file.path, updatedContent, 'utf8');
      }
      
      results.updated.push({
        file: file.filename,
        path: file.path,
        oldVersion: file.currentVersion,
        newVersion
      });
      
    } catch (error) {
      results.failed.push({
        file: file.filename,
        error: error.message
      });
      results.success = false;
    }
  }
  
  // Update WordPress plugin/theme versions if configured
  if (!dryRun) {
    console.log(colors.BBlue(`${SYMBOLS.INFO} Checking for WordPress plugin/theme version updates...`));
    const wpSuccess = updateWordPressVersions(newVersion);
    if (!wpSuccess) {
      results.success = false;
      results.failed.push({
        file: 'WordPress files',
        error: 'Failed to update some WordPress plugin/theme version constants'
      });
    }
  } else {
    // For dry run, just check if WordPress config exists
    const wpConfig = getWordPressConfig();
    if (wpConfig.pluginPath || wpConfig.themePath) {
      console.log(colors.BBlue(`${SYMBOLS.INFO} Would update WordPress plugin/theme versions (dry run)`));
      if (wpConfig.pluginPath) {
        const constantName = wpConfig.versionConstant || generateVersionConstant(wpConfig.pluginPath);
        console.log(colors.Gray(`  Plugin: ${wpConfig.pluginPath} (${constantName})`));
      }
      if (wpConfig.themePath) {
        const constantName = wpConfig.versionConstant || generateVersionConstant(wpConfig.themePath);
        console.log(colors.Gray(`  Theme: ${wpConfig.themePath} (${constantName})`));
      }
    }
  }
  
  return results;
}

/**
 * Create git tag for version
 * @param {string} version - Version to tag
 * @param {string} message - Tag message
 * @param {boolean} dryRun - If true, don't actually create tag
 * @returns {Promise<Object>} Tag creation result
 */
export async function createVersionTag(version, message = null, dryRun = false) {
  const tagMessage = message || `Release version ${version}`;
  
  if (dryRun) {
    return {
      success: true,
      dryRun: true,
      tag: version,
      message: tagMessage
    };
  }
  
  try {
    // Check if tag already exists
    const existingTag = await executeGitCommand(`tag -l ${version}`);
    if (existingTag.success && existingTag.output.trim()) {
      return {
        success: false,
        error: `Tag ${version} already exists`
      };
    }
    
    // Create annotated tag
    const result = await executeGitCommand(`tag -a ${version} -m "${tagMessage}"`);
    
    return {
      success: result.success,
      tag: version,
      message: tagMessage,
      error: result.success ? null : result.error
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Validate version string
 * @param {string} version - Version string to validate
 * @returns {Object} Validation result
 */
export function validateVersion(version) {
  const parsed = parseVersion(version);
  
  return {
    valid: parsed !== null,
    parsed,
    error: parsed ? null : 'Invalid semantic version format (expected: MAJOR.MINOR.PATCH)'
  };
}
