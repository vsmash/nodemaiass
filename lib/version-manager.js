import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import colors from './colors.js';
import { SYMBOLS } from './symbols.js';

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
    extensions: ['.php'],
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
