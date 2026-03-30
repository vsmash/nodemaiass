// MAIASS Bootstrap Module
// Interactive project setup and configuration
// Mirrors bashmaiass lib/core/bootstrap.sh

import fs from 'fs';
import path from 'path';
import { getSingleCharInput, getLineInput } from './input-utils.js';
import { log, logger } from './logger.js';
import { SYMBOLS } from './symbols.js';
import colors from './colors.js';

/**
 * Check if bootstrap is needed
 * @returns {boolean} True if .env.maiass doesn't exist or force bootstrap is set
 */
export function needsBootstrap() {
  const forceBootstrap = process.env.MAIASS_FORCE_BOOTSTRAP === 'true';
  const envFileExists = fs.existsSync('.env.maiass');
  
  return !envFileExists || forceBootstrap;
}

/**
 * Load existing .env.maiass values to use as defaults
 * @returns {Object} Existing configuration values
 */
function loadExistingValues() {
  const existing = {};
  
  if (!fs.existsSync('.env.maiass')) {
    return existing;
  }
  
  try {
    const content = fs.readFileSync('.env.maiass', 'utf8');
    const lines = content.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      
      const match = trimmed.match(/^([A-Z_]+)=(.*)$/);
      if (match) {
        const [, key, value] = match;
        // Remove quotes if present
        existing[key] = value.replace(/^["']|["']$/g, '');
      }
    }
  } catch (error) {
    logger.debug('Could not load existing .env.maiass:', error.message);
  }
  
  return existing;
}

/**
 * Detect project type based on files present
 * @returns {string} Detected project type
 */
function detectProjectType() {
  // Check for WordPress
  if (fs.existsSync('wp-config.php') || fs.existsSync('wp-content')) {
    if (fs.existsSync('style.css')) {
      const styleContent = fs.readFileSync('style.css', 'utf8');
      if (styleContent.includes('Theme Name:')) {
        return 'wordpress-theme';
      }
    }
    // Check for plugin
    const files = fs.readdirSync('.');
    for (const file of files) {
      if (file.endsWith('.php')) {
        const content = fs.readFileSync(file, 'utf8');
        if (content.includes('Plugin Name:')) {
          return 'wordpress-plugin';
        }
      }
    }
    return 'wordpress-site';
  }
  
  // Check for Craft CMS
  if (fs.existsSync('craft') || fs.existsSync('config/general.php')) {
    return 'craft';
  }
  
  // Default to bespoke
  return 'bespoke';
}

/**
 * Detect version source file
 * @returns {string} Detected version file
 */
function detectVersionSource() {
  if (fs.existsSync('package.json')) {
    return 'package.json';
  }
  if (fs.existsSync('composer.json')) {
    return 'composer.json';
  }
  if (fs.existsSync('VERSION')) {
    return 'VERSION';
  }
  return 'package.json'; // Default
}

/**
 * Infer version file type from filename/extension
 * @param {string} filename - Version file name or path
 * @returns {string} File type: 'json', 'php', or 'txt'
 */
function inferVersionFileType(filename) {
  if (!filename) return 'txt';
  if (filename.endsWith('.json')) return 'json';
  if (filename.endsWith('.php')) return 'php';
  if (filename.endsWith('.css')) return 'php'; // CSS version headers use same pattern as PHP
  return 'txt';
}

/**
 * Main bootstrap function
 * @returns {Promise<boolean>} True if bootstrap completed, false if skipped
 */
export async function bootstrapProject() {
  const forceBootstrap = process.env.MAIASS_FORCE_BOOTSTRAP === 'true';
  const envFileExists = fs.existsSync('.env.maiass');
  
  if (envFileExists && !forceBootstrap) {
    logger.debug('Project already configured (.env.maiass exists)');
    return false;
  }
  
  const existing = loadExistingValues();
  const isReconfigure = envFileExists && forceBootstrap;
  
  console.log('');
  console.log(colors.BCyan('════════════════════════════════════════════════════════════'));
  if (isReconfigure) {
    console.log(colors.BCyan('🔧 Reconfiguring MAIASS for this project'));
    console.log(colors.Gray('Current values will be shown as defaults.'));
  } else {
    console.log(colors.BCyan('🚀 Setting up MAIASS for this project'));
    console.log(colors.Gray('This is a one-time setup that will make future runs smoother.'));
  }
  console.log(colors.BCyan('════════════════════════════════════════════════════════════'));
  console.log('');
  
  const config = {};
  
  // Step 1: Configuration file setup
  await setupEnvFile(existing);
  
  // Step 2: Project type detection
  config.projectType = await configureProjectType(existing);
  
  // Step 3: Version source
  config.versionSource = await configureVersionSource(existing);
  
  // Step 4: Features selection
  config.features = await chooseFeatures(existing);
  
  // Step 5: Changelog configuration (if full features)
  if (config.features === 'full') {
    config.changelog = await configureChangelog(existing);
  }
  
  // Step 6: Branch strategy
  config.branches = await configureBranches(existing);
  
  // Step 7: Save configuration
  await saveConfiguration(config);
  
  // Step 8: Initialize branch structure if needed (full mode only)
  if (config.features === 'full') {
    await initializeBranchStructure(config.branches);
  }
  
  console.log('');
  log.success(SYMBOLS.CHECKMARK, 'Project setup complete!');
  log.info(SYMBOLS.INFO, 'You can modify these settings anytime by editing .env.maiass');
  log.info(SYMBOLS.INFO, "Run 'maiass' again to start using your configured workflow.");
  console.log('');
  
  return true;
}

/**
 * Step 1: Setup environment file
 */
async function setupEnvFile(existing) {
  console.log(colors.BCyan('📄 Configuration File Setup'));
  console.log('');
  
  if (process.env.MAIASS_FORCE_BOOTSTRAP === 'true') {
    console.log(`${SYMBOLS.INFO} Updating existing .env.maiass file with new configuration.`);
    return;
  }
  
  console.log(`${SYMBOLS.INFO} MAIASS uses configuration files to store project settings:`);
  console.log('  • .env.maiass - Team/repo config (tracked in git)');
  console.log('  • .env.maiass.local - Personal settings (gitignored)');
  console.log('');
  
  const create = await getSingleCharInput('Create configuration files? [Y/n]: ');
  if (create === 'n') {
    console.log(`${SYMBOLS.WARNING} Setup cancelled. Run with --setup to try again.`);
    process.exit(0);
  }
}

/**
 * Step 2: Configure project type
 */
async function configureProjectType(existing) {
  console.log('');
  console.log(colors.BCyan('🔍 Project Type Detection'));
  console.log('');
  
  const detected = detectProjectType();
  const current = existing.MAIASS_REPO_TYPE || detected;
  
  console.log('MAIASS can optimize its workflow based on your project type.');
  console.log('This helps determine version file locations and update strategies.');
  console.log('');
  
  console.log(`${SYMBOLS.INFO} Detected project type: ${colors.BGreen(detected)}`);
  if (existing.MAIASS_REPO_TYPE) {
    console.log(`${SYMBOLS.INFO} Current setting: ${colors.BGreen(existing.MAIASS_REPO_TYPE)}`);
  }
  console.log('');
  
  console.log(colors.BWhite('Available project types:'));
  console.log(`  ${colors.BCyan('1)')} bespoke          - Standard Node.js/web project (default)`);
  console.log(`  ${colors.BCyan('2)')} wordpress-theme  - WordPress theme with style.css versioning`);
  console.log(`  ${colors.BCyan('3)')} wordpress-plugin - WordPress plugin with main PHP file versioning`);
  console.log(`  ${colors.BCyan('4)')} wordpress-site   - Full WordPress installation`);
  console.log(`  ${colors.BCyan('5)')} craft            - Craft CMS project`);
  console.log('');
  
  const defaultChoice = ['bespoke', 'wordpress-theme', 'wordpress-plugin', 'wordpress-site', 'craft'].indexOf(current) + 1;
  const choice = await getLineInput(`Select project type [1-5, Enter for ${defaultChoice}=${current}]: `);
  
  if (!choice) return current;
  
  const types = ['bespoke', 'wordpress-theme', 'wordpress-plugin', 'wordpress-site', 'craft'];
  const index = parseInt(choice) - 1;
  
  if (index >= 0 && index < types.length) {
    log.success(SYMBOLS.CHECKMARK, `Project type set to: ${colors.BGreen(types[index])}`);
    return types[index];
  }
  
  log.warning(SYMBOLS.WARNING, `Invalid choice, using: ${current}`);
  return current;
}

/**
 * Step 3: Configure version source
 */
async function configureVersionSource(existing) {
  console.log('');
  console.log(colors.BCyan('📦 Version Source Configuration'));
  console.log('');
  
  const detected = detectVersionSource();
  const current = existing.MAIASS_VERSION_PRIMARY_FILE || detected;
  
  console.log('MAIASS needs to know where your project version is stored.');
  console.log('This file will be updated automatically when you bump versions.');
  console.log('');
  
  console.log(`${SYMBOLS.INFO} Detected version file: ${colors.BGreen(detected)}`);
  if (existing.MAIASS_VERSION_PRIMARY_FILE) {
    console.log(`${SYMBOLS.INFO} Current setting: ${colors.BGreen(existing.MAIASS_VERSION_PRIMARY_FILE)}`);
  }
  console.log('');
  
  console.log(colors.Gray('Common options: package.json, composer.json, VERSION, style.css'));
  const file = await getLineInput(`Version source file [Enter for ${current}]: `);
  
  const result = file || current;
  if (file) {
    console.log(`${SYMBOLS.CHECKMARK} Version source set to: ${colors.BGreen(result)}`);
  }
  return result;
}

/**
 * Step 4: Choose MAIASS features
 */
async function chooseFeatures(existing) {
  console.log('');
  console.log(colors.BCyan('⚙️  Feature Selection'));
  console.log('');
  
  const currentMode = existing.MAIASS_MODE || 'full';
  const current = currentMode === 'ai_only' ? 'ai_only' : 'full';
  
  console.log('Choose which MAIASS features you want to use:');
  console.log('');
  console.log(colors.BWhite('Available modes:'));
  console.log(`  ${colors.BCyan('1)')} full    - Complete workflow ${colors.Gray('(recommended)')}`);
  console.log(`               • AI-powered commit messages`);
  console.log(`               • Automatic version bumping`);
  console.log(`               • Changelog generation`);
  console.log(`               • Branch management`);
  console.log('');
  console.log(`  ${colors.BCyan('2)')} ai_only - AI commit messages only`);
  console.log(`               • AI-powered commit messages`);
  console.log(`               • No version management`);
  console.log(`               • No changelog updates`);
  console.log('');
  
  if (existing.MAIASS_MODE) {
    console.log(`${SYMBOLS.INFO} Current mode: ${colors.BGreen(current)}`);
  }
  
  const defaultChoice = current === 'full' ? '1' : '2';
  const choice = await getLineInput(`Select mode [1-2, Enter for ${defaultChoice}]: `);
  
  let result;
  if (choice === '2') result = 'ai_only';
  else if (choice === '1' || !choice) result = 'full';
  else result = current;
  
  console.log(`${SYMBOLS.CHECKMARK} Mode set to: ${colors.BGreen(result)}`);
  return result;
}

/**
 * Step 5: Configure changelog
 */
async function configureChangelog(existing) {
  console.log('');
  console.log(colors.BCyan('🧾 Changelog Configuration'));
  console.log('');
  
  const config = {
    path: existing.MAIASS_CHANGELOG_PATH || '.',
    name: existing.MAIASS_CHANGELOG_NAME || 'CHANGELOG.md',
    internalEnabled: existing.MAIASS_CHANGELOG_INTERNAL_ENABLED !== 'false',
    internalPath: existing.MAIASS_CHANGELOG_INTERNAL_PATH || '.',
    internalName: existing.MAIASS_CHANGELOG_INTERNAL_NAME || '.CHANGELOG_internal.md'
  };
  
  console.log('MAIASS can maintain two changelogs:');
  console.log(`  • ${colors.BWhite('Public changelog')}  - CHANGELOG.md (for users/clients)`);
  console.log(`  • ${colors.BWhite('Internal changelog')} - .CHANGELOG_internal.md (for team)`);
  console.log('');
  console.log(colors.Gray('Internal changelog includes JIRA tickets, commit authors, and detailed notes.'));
  console.log(colors.Gray('It should be excluded from production deployments.'));
  console.log('');
  
  if (existing.MAIASS_CHANGELOG_INTERNAL_ENABLED) {
    console.log(`${SYMBOLS.INFO} Current setting: ${config.internalEnabled ? colors.BGreen('enabled') : colors.BRed('disabled')}`);
  }
  
  // Ask about internal changelog
  const enableInternal = await getSingleCharInput(
    `Enable internal changelog? [${config.internalEnabled ? 'Y/n' : 'y/N'}]: `
  );
  
  if (enableInternal === 'y' || (enableInternal === '' && config.internalEnabled)) {
    config.internalEnabled = true;
    console.log(`${SYMBOLS.CHECKMARK} Internal changelog enabled`);
  } else if (enableInternal === 'n' || (enableInternal === '' && !config.internalEnabled)) {
    config.internalEnabled = false;
    console.log(`${SYMBOLS.INFO} Internal changelog disabled`);
  }
  
  return config;
}

/**
 * Step 6: Configure branch strategy
 */
async function configureBranches(existing) {
  console.log('');
  console.log(colors.BCyan('🌿 Branch Strategy Configuration'));
  console.log('');
  
  const config = {
    main: existing.MAIASS_MAINBRANCH || 'main',
    develop: existing.MAIASS_DEVELOPBRANCH || 'develop',
    staging: existing.MAIASS_STAGINGBRANCH || 'staging'
  };
  
  console.log('MAIASS uses a Git Flow-inspired branching strategy:');
  console.log('');
  console.log(`  ${colors.BWhite('Development Branch')} (${colors.BCyan('develop')}) - ${colors.BYellow('★ TRUNK BRANCH')}`);
  console.log(`    • This is where MAIASS performs version bumps and changelog updates`);
  console.log(`    • Must allow direct commits (no PR requirement)`);
  console.log(`    • All feature work merges here first`);
  console.log('');
  console.log(`  ${colors.BWhite('Main/Production Branch')} (${colors.BCyan('main/master')})`);
  console.log(`    • Stable releases only`);
  console.log(`    • Updated via merge from develop after testing`);
  console.log(`    • Can require PRs for merges`);
  console.log('');
  console.log(`  ${colors.BWhite('Staging Branch')} (${colors.BCyan('staging')}) - ${colors.Gray('optional')}`);
  console.log(`    • Pre-production testing environment`);
  console.log(`    • Sits between develop and main`);
  console.log('');
  console.log(colors.BYellow('IMPORTANT:') + ' MAIASS must run on the development branch to automatically');
  console.log('version and commit changes. PRs should not be required for this branch.');
  console.log('');
  
  if (existing.MAIASS_MAINBRANCH) {
    console.log(`${SYMBOLS.INFO} Current branches: ${colors.BGreen(config.main)} / ${colors.BGreen(config.develop)} / ${colors.BGreen(config.staging)}`);
  }
  console.log('');
  
  const main = await getLineInput(`Main/production branch [Enter for ${config.main}]: `);
  config.main = main || config.main;
  
  const develop = await getLineInput(`Development branch [Enter for ${config.develop}]: `);
  config.develop = develop || config.develop;
  
  const staging = await getLineInput(`Staging branch (optional) [Enter for ${config.staging}]: `);
  config.staging = staging || config.staging;
  
  console.log(`${SYMBOLS.CHECKMARK} Branches configured: ${colors.BGreen(config.main)} / ${colors.BGreen(config.develop)} / ${colors.BGreen(config.staging)}`);
  
  return config;
}

/**
 * Step 7: Save configuration to .env.maiass
 */
async function saveConfiguration(config) {
  const timestamp = new Date().toISOString();
  
  let content = `# MAIASS Configuration
# Generated on ${timestamp}

# Core Settings
# Verbosity level (brief/normal/verbose)
#MAIASS_VERBOSITY=normal
# Enable debug mode
#MAIASS_DEBUG=false

# Project Configuration
MAIASS_REPO_TYPE=${config.projectType}

# Version Management Settings
# Primary version file (usually auto-detected from package.json)
MAIASS_VERSION_PRIMARY_FILE=${config.versionSource}
MAIASS_VERSION_PRIMARY_TYPE=${inferVersionFileType(config.versionSource)}
# Secondary files that should have their versions updated (comma-separated)
#MAIASS_VERSION_SECONDARY_FILES=

`;

  // Add mode if AI-only
  if (config.features === 'ai_only') {
    content += `# MAIASS Mode (full or ai_only)
MAIASS_MODE=ai_only

`;
  }

  // Add changelog config if full mode
  if (config.features === 'full' && config.changelog) {
    content += `# Changelog Configuration
MAIASS_CHANGELOG_PATH=${config.changelog.path}
MAIASS_CHANGELOG_NAME=${config.changelog.name}
MAIASS_CHANGELOG_INTERNAL_ENABLED=${config.changelog.internalEnabled}
`;
    if (config.changelog.internalEnabled) {
      content += `MAIASS_CHANGELOG_INTERNAL_PATH=${config.changelog.internalPath}
MAIASS_CHANGELOG_INTERNAL_NAME=${config.changelog.internalName}
`;
    }
    content += '\n';
  }

  // Add branch configuration
  content += `# Branch Configuration
MAIASS_MAINBRANCH=${config.branches.main}
MAIASS_DEVELOPBRANCH=${config.branches.develop}
MAIASS_STAGINGBRANCH=${config.branches.staging}

`;

  // Add standard options
  content += `# Auto-Yes Functionality (for CI/CD and non-interactive mode)
#MAIASS_AUTO_STAGE_UNSTAGED=false
#MAIASS_AUTO_PUSH_COMMITS=false
#MAIASS_AUTO_MERGE_TO_DEVELOP=false
#MAIASS_AUTO_APPROVE_AI_SUGGESTIONS=false

# Push Control
# Options: blank/ask (prompt user - default), 'always' (auto-push), 'never' (skip push)
#MAIASS_PUSH_ABSTRACTS_TO_REMOTE=

# Patch Release Control
#MAIASS_PATCH_RELEASES=

# Version Checking
#MAIASS_AUTO_UPDATE_CHECK=true

# Invalid Token Behavior
#MAIASS_AI_INVALID_TOKEN_CHOICES=false

# AI Configuration
#MAIASS_AI_MODEL=gpt-4
#MAIASS_AI_TEMPERATURE=0.8
#MAIASS_AI_MAX_CHARACTERS=8000
#MAIASS_AI_MODE=ask

# Repository Configuration
#MAIASS_REPO_PROVIDER=
#MAIASS_GITHUB_OWNER=
#MAIASS_GITHUB_REPO=
#MAIASS_BITBUCKET_WORKSPACE=
#MAIASS_BITBUCKET_REPO_SLUG=

# Pull Request Configuration
#MAIASS_STAGING_PULLREQUESTS=on
#MAIASS_MAIN_PULLREQUESTS=on

# Logging Configuration
#MAIASS_LOGGING=true
#MAIASS_LOG_FILE=maiass.log
#MAIASS_HIDEGIT=true

# Client Identity (for proxy version enforcement)
#MAIASS_CLIENT_NAME=nodemaiass
#MAIASS_CLIENT_VERSION=5.8.1
`;

  // Write .env.maiass
  fs.writeFileSync('.env.maiass', content, 'utf8');
  log.success(SYMBOLS.CHECKMARK, 'Configuration saved to .env.maiass');
  
  // Create .env.maiass.local if it doesn't exist
  if (!fs.existsSync('.env.maiass.local')) {
    const localContent = `# .env.maiass.local - Personal/Local Settings
# This file is automatically gitignored and never committed.
# Use this for personal overrides and sensitive data.

# Example: Override AI host for local development
#MAIASS_AI_HOST=http://localhost:8787

# Example: Personal debug settings
#MAIASS_DEBUG=true
`;
    fs.writeFileSync('.env.maiass.local', localContent, 'utf8');
    log.success(SYMBOLS.CHECKMARK, 'Created .env.maiass.local for personal settings');
  }
  
  // Ensure .gitignore includes .env.maiass.local
  await ensureGitignore();
}

/**
 * Step 8: Initialize branch structure for new repositories
 */
async function initializeBranchStructure(branchConfig) {
  const { execSync } = await import('child_process');
  
  // Check if we're in a git repo
  try {
    execSync('git rev-parse --is-inside-work-tree', { stdio: 'pipe' });
  } catch {
    // Not a git repo, skip
    return;
  }
  
  // Check if there are any commits
  let hasCommits = false;
  try {
    execSync('git rev-parse HEAD', { stdio: 'pipe' });
    hasCommits = true;
  } catch {
    // No commits yet
    hasCommits = false;
  }
  
  // If there are already commits, check if develop branch exists
  if (hasCommits) {
    try {
      execSync(`git rev-parse --verify ${branchConfig.develop}`, { stdio: 'pipe' });
      // Develop branch exists, nothing to do
      return;
    } catch {
      // Develop branch doesn't exist, offer to create it
      console.log('');
      console.log(colors.BCyan('🌿 Branch Structure Setup'));
      console.log('');
      console.log(`${SYMBOLS.INFO} Your repository has commits but no ${colors.BGreen(branchConfig.develop)} branch.`);
      console.log(`${SYMBOLS.INFO} MAIASS works best with a ${colors.BGreen(branchConfig.develop)} branch for version management.`);
      console.log('');
      
      const createBranch = await getSingleCharInput(`Create ${branchConfig.develop} branch from current branch? [Y/n]: `);
      if (createBranch !== 'n') {
        try {
          execSync(`git checkout -b ${branchConfig.develop}`, { stdio: 'inherit' });
          log.success(SYMBOLS.CHECKMARK, `Created and switched to ${colors.BGreen(branchConfig.develop)} branch`);
        } catch (error) {
          log.warning(SYMBOLS.WARNING, `Could not create ${branchConfig.develop} branch: ${error.message}`);
        }
      }
      return;
    }
  }
  
  // No commits yet - this is a brand new repo
  console.log('');
  console.log(colors.BCyan('🌿 Branch Structure Setup'));
  console.log('');
  console.log(`${SYMBOLS.INFO} This appears to be a new repository with no commits yet.`);
  console.log(`${SYMBOLS.INFO} MAIASS can set up the recommended branch structure for you:`);
  console.log('');
  console.log(`  1. Create initial commit on ${colors.BGreen(branchConfig.main)} branch`);
  console.log(`  2. Create ${colors.BGreen(branchConfig.develop)} branch from ${branchConfig.main}`);
  console.log(`  3. Switch to ${colors.BGreen(branchConfig.develop)} for development`);
  console.log('');
  console.log(colors.Gray('This ensures MAIASS has the proper branch structure for version management.'));
  console.log('');
  
  const setupBranches = await getSingleCharInput('Set up branch structure now? [Y/n]: ');
  if (setupBranches === 'n') {
    log.info(SYMBOLS.INFO, 'Skipping branch setup. You can create branches manually later.');
    return;
  }
  
  try {
    // Check if we're on a branch or in detached HEAD
    let currentBranch;
    try {
      currentBranch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8', stdio: 'pipe' }).trim();
    } catch {
      currentBranch = null;
    }
    
    // If not on a branch or on wrong branch, create/switch to main
    if (!currentBranch || currentBranch === 'HEAD' || currentBranch !== branchConfig.main) {
      log.info(SYMBOLS.INFO, `Creating ${colors.BGreen(branchConfig.main)} branch...`);
      execSync(`git checkout -b ${branchConfig.main}`, { stdio: 'pipe' });
    }
    
    // Create initial commit with the config files
    log.info(SYMBOLS.INFO, 'Creating initial commit...');
    execSync('git add .env.maiass .env.maiass.local .gitignore', { stdio: 'pipe' });
    execSync('git commit -m "Initial commit: MAIASS configuration"', { stdio: 'inherit' });
    log.success(SYMBOLS.CHECKMARK, `Initial commit created on ${colors.BGreen(branchConfig.main)}`);
    
    // Create develop branch
    log.info(SYMBOLS.INFO, `Creating ${colors.BGreen(branchConfig.develop)} branch...`);
    execSync(`git checkout -b ${branchConfig.develop}`, { stdio: 'pipe' });
    log.success(SYMBOLS.CHECKMARK, `Created and switched to ${colors.BGreen(branchConfig.develop)} branch`);
    
    console.log('');
    log.success(SYMBOLS.CHECKMARK, 'Branch structure initialized successfully!');
    log.info(SYMBOLS.INFO, `You are now on the ${colors.BGreen(branchConfig.develop)} branch and ready to start development.`);
    
  } catch (error) {
    console.log('');
    log.warning(SYMBOLS.WARNING, 'Could not automatically set up branch structure');
    log.info(SYMBOLS.INFO, 'You can create branches manually:');
    console.log(`  ${colors.Gray(`git checkout -b ${branchConfig.main}`)}`);
    console.log(`  ${colors.Gray('git add .')}`);
    console.log(`  ${colors.Gray('git commit -m "Initial commit"')}`);
    console.log(`  ${colors.Gray(`git checkout -b ${branchConfig.develop}`)}`);
  }
}

/**
 * Ensure .gitignore includes necessary patterns
 */
async function ensureGitignore() {
  let gitignoreContent = '';
  let needsUpdate = false;
  
  if (fs.existsSync('.gitignore')) {
    gitignoreContent = fs.readFileSync('.gitignore', 'utf8');
  }
  
  const patterns = ['.env.maiass.local', '.env.maiass.bak'];
  const missing = patterns.filter(pattern => !gitignoreContent.includes(pattern));
  
  if (missing.length > 0) {
    needsUpdate = true;
    if (gitignoreContent && !gitignoreContent.endsWith('\n')) {
      gitignoreContent += '\n';
    }
    gitignoreContent += '\n# MAIASS environment files\n';
    for (const pattern of missing) {
      gitignoreContent += `${pattern}\n`;
    }
    
    fs.writeFileSync('.gitignore', gitignoreContent, 'utf8');
    log.success(SYMBOLS.CHECKMARK, `Added ${missing.join(', ')} to .gitignore`);
  }
}
