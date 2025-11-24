#!/usr/bin/env node
// MAIASS: Modular AI-Augmented Semantic Scribe
import path from 'path';
import fs from 'fs';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { initLogger, logger } from './lib/logger.js';
import { loadEnvironmentConfig, ensureConfigDirectories } from './lib/config.js';

// Load environment variables from multiple sources with cross-platform support
ensureConfigDirectories();
const envConfig = loadEnvironmentConfig();

// Initialize logger with environment variables
initLogger(envConfig);

// Add a visible debug message
const debugLine = '─'.repeat(60);
logger.debug(debugLine);
logger.debug('DEBUG MODE ENABLED - VERBOSE LOGGING ACTIVE');
logger.debug('MAIASS_DEBUG is set to: ' + (envConfig.MAIASS_DEBUG || 'false'));
logger.debug(debugLine);

// Example: print version and a colorful welcome
import colors from './lib/colors.js';

// get the version from package.json (ES module compatible, cross-platform)
const __dirname = path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w):/, '$1:'));
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json')));
const version = packageJson.version;

// Import env display utility
import { displayEnvironmentVariables } from './lib/env-display.js';
import { getGitInfo, displayGitInfo, validateBranchForOperations } from './lib/git-info.js';
import { commitThis } from './lib/commit.js';
import { handleConfigCommand } from './lib/config-command.js';
import { handleVersionCommand } from './lib/version-command.js';
import { handleMaiassCommand } from './lib/maiass-command.js';
import { handleAccountInfoCommand } from './lib/account-info.js';
import { SYMBOLS } from './lib/symbols.js';
import { bootstrapProject, needsBootstrap } from './lib/bootstrap.js';

// Simple CLI setup for pkg compatibility
const args = process.argv.slice(2);
const firstArg = args[0];

// Handle --setup/--bootstrap flag early
if (args.includes('--setup') || args.includes('--bootstrap')) {
  process.env.MAIASS_FORCE_BOOTSTRAP = 'true';
}

// Check if first argument is a version bump type
const versionBumpTypes = ['major', 'minor', 'patch'];
let command = 'maiass'; // Default to maiass workflow
let versionBump = null;

if (firstArg && versionBumpTypes.includes(firstArg)) {
  // First arg is a version bump type, use it for maiass workflow
  versionBump = firstArg;
  command = 'maiass';
} else if (firstArg && !firstArg.startsWith('-')) {
  // First arg is a command
  command = firstArg;
} else {
  // No command specified or starts with flag, default to maiass
  command = 'maiass';
}

// Handle --auto flag (must be before other processing)
if (args.includes('--auto') || args.includes('-a')) {
  // Override all auto-yes variables for non-interactive mode
  process.env.MAIASS_AUTO_STAGE_UNSTAGED = 'true';
  process.env.MAIASS_AUTO_PUSH_COMMITS = 'true';
  process.env.MAIASS_AUTO_MERGE_TO_DEVELOP = 'true';
  process.env.MAIASS_AUTO_APPROVE_AI_SUGGESTIONS = 'true';
  
  if (process.env.MAIASS_DEBUG === 'true') {
    logger.debug('[DEBUG] Auto-mode enabled - all prompts will be skipped');
  }
}

// Handle version flag
if (args.includes('--version') || args.includes('-v')) {
  console.log(version);
  process.exit(0);
}

// Handle help flag
if (args.includes('--help') || args.includes('-h') || command === 'help') {
  console.log(`\nMAIASS v${version}`);
  console.log('Usage: maiass [version-bump] [options]\n');
  console.log('Version Bump (runs full MAIASS workflow):');
  console.log('  maiass             Run MAIASS workflow (default: patch bump)');
  console.log('  maiass minor       Run MAIASS workflow with minor version bump');
  console.log('  maiass major       Run MAIASS workflow with major version bump');
  console.log('  maiass patch       Run MAIASS workflow with patch version bump');
  console.log('\nOther Commands:');
  console.log('  hello              Print hello world');
  console.log('  env                Display environment variables');
  console.log('  git-info           Display git repository information');
  console.log('  config             Manage configuration');
  console.log('  version            Manage version information');
  console.log('  account-info       Show your account status (masked token)');
  console.log('\nOptions:');
  console.log('  --auto             Enable all auto-yes functionality (non-interactive mode)');
  console.log('  --commits-only, -c Generate AI commits without version management');
  console.log('  --auto-stage       Automatically stage all changes');
  console.log('  --setup, --bootstrap Run interactive project setup');
  console.log('  --help, -h         Show this help message');
  console.log('  --version, -v      Show version');
  console.log('  --dry-run          Run without making changes');
  console.log('  --force            Skip confirmation prompts');
  console.log('  --silent           Suppress non-essential output');
  process.exit(0);
}

// Command routing (wrapped in async IIFE to handle async commands)
(async () => {
  // Run bootstrap if needed (first-time setup)
  if (needsBootstrap()) {
    const completed = await bootstrapProject();
    if (completed) {
      // Bootstrap completed, exit so user can run maiass again
      process.exit(0);
    }
  }
  
  switch (command) {
    case 'hello':
      console.log(colors.BCyan('Hello from MAIASS!'));
      break;
      
    case 'env':
      displayEnvironmentVariables();
      break;
      
    case 'git-info':
      const gitInfo = getGitInfo();
      displayGitInfo(gitInfo);
      break;
      
    case 'config':
      await handleConfigCommand(process.argv.slice(3));
      break;
      
    case 'version':
      await handleVersionCommand(process.argv.slice(3));
      break;
      
    case 'account-info':
      await handleAccountInfoCommand({
        json: args.includes('--json')
      });
      break;
      
    case 'maiass':
      // Handle the main MAIASS workflow
      await handleMaiassCommand({
        _: process.argv.slice(2).filter(arg => !arg.startsWith('--')),
        'commits-only': args.includes('--commits-only') || args.includes('-c'),
        'auto-stage': args.includes('--auto-stage'),
        'auto': args.includes('--auto'),
        'version-bump': versionBump,
        'dry-run': args.includes('--dry-run') || args.includes('-d'),
        force: args.includes('--force') || args.includes('-f'),
        silent: args.includes('--silent') || args.includes('-s'),
        tag: getArgValue(args, '--tag') || getArgValue(args, '-t')
      });
      break;
      
    default:
      console.error(`Unknown command: ${command}`);
      console.log('Run `maiass --help` for available commands.');
      process.exit(1);
  }
  
  // Exit cleanly after successful command execution
  process.exit(0);
})().catch(error => {
  console.error(colors.Red(`${SYMBOLS.CROSS} Fatal error: ${error.message}`));
  if (process.env.MAIASS_DEBUG === 'true') {
    console.error(colors.Gray(error.stack));
  }
  process.exit(1);
});

// Helper function to get argument values
function getArgValue(args, flag) {
  const index = args.indexOf(flag);
  if (index !== -1 && index < args.length - 1) {
    return args[index + 1];
  }
  return null;
}
