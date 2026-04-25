#!/usr/bin/env node
// MAIASS: Modular AI-Augmented Semantic Scribe
import path from 'path';
import fs from 'fs';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { initLogger, logger } from './lib/logger.js';
import { loadEnvironmentConfig, ensureConfigDirectories } from './lib/config.js';

// If running from a subdirectory of a git repo, cd to the repo root first so
// that .env.maiass is loaded from the right place and git operations are
// consistent with the project root.
import { execSync } from 'child_process';
try {
  const gitRoot = execSync('git rev-parse --show-toplevel', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
  if (gitRoot && gitRoot !== process.cwd()) {
    process.chdir(gitRoot);
  }
} catch {
  // Not in a git repo — leave cwd as-is, pipeline will handle it gracefully
}

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
import { bootstrapProject } from './lib/bootstrap.js';
import { createGithubAction, showGitlabExcerpt, showBitbucketExcerpt } from './lib/ci-templates.js';

// Simple CLI setup for pkg compatibility
const args = process.argv.slice(2);
// Skip flags (starting with -) to find the first meaningful argument
const firstArg = args.find(a => !a.startsWith('-'));

// Handle --setup/--bootstrap flag early
if (args.includes('--setup') || args.includes('--bootstrap')) {
  process.env.MAIASS_FORCE_BOOTSTRAP = 'true';
}

// Check if first argument is a version bump type
const versionBumpTypes = ['major', 'minor', 'patch'];
const validCommands = ['hello', 'env', 'git-info', 'config', 'version', 'account-info', 'maiass', 'help'];
let command = 'maiass'; // Default to maiass workflow
let versionBump = null;

if (firstArg && versionBumpTypes.includes(firstArg)) {
  // First arg is a version bump type, use it for maiass workflow
  versionBump = firstArg;
  command = 'maiass';
} else if (firstArg && !firstArg.startsWith('-')) {
  // First arg is a command - validate it
  if (!validCommands.includes(firstArg)) {
    console.error(colors.Red(`${SYMBOLS.CROSS} Error: Unknown command '${firstArg}'`));
    console.log('');
    console.log('Valid commands:');
    console.log('  ' + validCommands.join(', '));
    console.log('');
    console.log('Version bump types:');
    console.log('  ' + versionBumpTypes.join(', '));
    console.log('');
    console.log(`Run 'nma --help' for more information.`);
    process.exit(1);
  }
  command = firstArg;
} else if (!firstArg) {
  // No command specified, default to maiass
  command = 'maiass';
}

// Auto modes:
// -a  / --auto:        full auto — stage, push, merge to develop, version bump
//                      (kept identical to historical behaviour for CI compatibility)
// -ac / --auto-commit: auto-yes for commit phase only — stops after commit
//                      (no merge, no bump). Useful for CI runs that just want
//                      the AI commit captured without touching develop.
const isAutoCommit = args.includes('--auto-commit') || args.includes('-ac');
const isAuto = !isAutoCommit && (args.includes('--auto') || args.includes('-a'));

if (isAuto || isAutoCommit) {
  // Shared auto-yes vars for both modes
  process.env.MAIASS_AUTO_STAGE_UNSTAGED = 'true';
  process.env.MAIASS_AUTO_PUSH_COMMITS = 'true';
  process.env.MAIASS_AUTO_APPROVE_AI_SUGGESTIONS = 'true';
}

if (isAuto) {
  // -a: also auto-merge to develop (legacy behaviour)
  process.env.MAIASS_AUTO_MERGE_TO_DEVELOP = 'true';
  if (process.env.MAIASS_DEBUG === 'true') {
    logger.debug('[DEBUG] Auto mode enabled — full pipeline runs unattended');
  }
} else if (isAutoCommit) {
  // -ac: stop after commit phase. Implemented by treating it as commits-only
  process.env.MAIASS_AUTO_FINISH_AFTER_COMMIT = 'true';
  if (process.env.MAIASS_DEBUG === 'true') {
    logger.debug('[DEBUG] Auto-commit mode enabled — stops after commit phase');
  }
}

// Handle version flag
if (args.includes('--version') || args.includes('-v')) {
  console.log(version);
  process.exit(0);
}

// Handle --account-info flag (before help to allow it to work)
if (args.includes('--account-info')) {
  command = 'account-info';
}

// Validate flags - check for unrecognized options
const validFlags = [
  '--help', '-h',
  '--version', '-v',
  '--account-info',
  '--auto', '-a',
  '--auto-commit', '-ac',
  '--commits-only', '-c',
  '--auto-stage',
  '--setup', '--bootstrap',
  '--dry-run', '-d',
  '--force', '-f',
  '--silent', '-s',
  '--json',
  '--tag', '-t',
  '--create-gh-action',
  '--show-gl-excerpt',
  '--show-bb-excerpt'
];

// Check for unrecognized flags
for (const arg of args) {
  if (arg.startsWith('-')) {
    // Check if it's a flag with value (e.g., --tag=value or --tag value)
    const flagName = arg.split('=')[0];
    if (!validFlags.includes(flagName) && !validFlags.includes(arg)) {
      console.error(colors.Red(`${SYMBOLS.CROSS} Error: Unrecognized option '${arg}'`));
      console.log('');
      console.log('Valid flags:');
      // Group flags by category for better readability
      const helpFlags = validFlags.filter(f => f.includes('help') || f.includes('version'));
      const commandFlags = validFlags.filter(f => f.includes('account') || f.includes('setup') || f.includes('bootstrap'));
      const workflowFlags = validFlags.filter(f => !helpFlags.includes(f) && !commandFlags.includes(f));
      
      console.log('  Help & Info:');
      console.log('    ' + helpFlags.join(', '));
      console.log('  Commands:');
      console.log('    ' + commandFlags.join(', '));
      console.log('  Workflow Options:');
      console.log('    ' + workflowFlags.join(', '));
      console.log('');
      console.log(`Run 'nma --help' for detailed information.`);
      process.exit(1);
    }
  }
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
  console.log('  --account-info     Show your account status (masked token)');
  console.log('  --auto, -a         Full auto — stage, commit, push, merge to develop, bump version');
  console.log('  --auto-commit, -ac Auto-yes for commit phase only — stops after commit (no merge, no bump)');
  console.log('  --commits-only, -c Generate AI commits without version management');
  console.log('  --auto-stage       Automatically stage all changes');
  console.log('  --setup, --bootstrap Run interactive project setup');
  console.log('  --help, -h         Show this help message');
  console.log('  --version, -v      Show version');
  console.log('  --dry-run          Run without making changes');
  console.log('  --force            Skip confirmation prompts');
  console.log('  --silent           Suppress non-essential output');
  console.log('\nCI Setup:');
  console.log('  --create-gh-action Create .github/workflows/maiass-version-bump.yml');
  console.log('  --show-gl-excerpt  Print GitLab CI excerpt to stdout (merge into .gitlab-ci.yml)');
  console.log('  --show-bb-excerpt  Print Bitbucket Pipelines excerpt to stdout');
  process.exit(0);
}

// CI template commands — these run and exit immediately, no pipeline needed
if (args.includes('--create-gh-action')) { createGithubAction(); process.exit(0); }
if (args.includes('--show-gl-excerpt'))  { showGitlabExcerpt(); process.exit(0); }
if (args.includes('--show-bb-excerpt'))  { showBitbucketExcerpt(); process.exit(0); }

// Command routing (wrapped in async IIFE to handle async commands)
(async () => {
  // --setup/--bootstrap: run the full interactive wizard and exit
  if (process.env.MAIASS_FORCE_BOOTSTRAP === 'true') {
    await bootstrapProject();
    process.exit(0);
  }

  // First run (no .env.maiass and no .env.maiass.local): initialise and show welcome.
  // We create .env.maiass.local as a marker so this only runs once per project.
  if (!fs.existsSync('.env.maiass') && !fs.existsSync('.env.maiass.local')) {
    // Create .env.maiass.local as a first-run marker (personal settings file)
    fs.writeFileSync(
      '.env.maiass.local',
      `# .env.maiass.local — personal/local MAIASS settings (never committed)\n` +
      `# Generated on first run: ${new Date().toISOString()}\n` +
      `# Use this file for personal overrides, e.g. MAIASS_AI_MODE=autosuggest\n`,
      'utf8'
    );

    // Add MAIASS entries to .gitignore if one already exists — avoids dirtying
    // repos that don't have a .gitignore yet
    if (fs.existsSync('.gitignore')) {
      let gitignore = fs.readFileSync('.gitignore', 'utf8');
      const needed = ['.env.maiass.local', 'maiass.log'].filter(p => !gitignore.includes(p));
      if (needed.length > 0) {
        if (!gitignore.endsWith('\n')) gitignore += '\n';
        gitignore += `\n# MAIASS\n${needed.join('\n')}\n`;
        fs.writeFileSync('.gitignore', gitignore, 'utf8');
      }
    }

    // Show what defaults are active so the user knows what they're getting
    const aiMode = process.env.MAIASS_AI_MODE || 'ask';
    console.log('');
    console.log(colors.BCyan('👋 Welcome to MAIASS!'));
    console.log(colors.Gray('   Running with smart defaults:'));
    console.log(colors.Gray(`   • AI commit messages: ${aiMode}`));
    console.log(colors.Gray('   • Version management: off'));
    console.log(colors.Gray('   • Changelogging: off'));
    console.log(colors.Gray('   Run maiass --setup to configure for this project.'));
    console.log('');
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
        _: process.argv.slice(2).filter(arg => !arg.startsWith('-')),
        // -ac is equivalent to -c (commits-only) plus auto-yes prompts
        'commits-only': args.includes('--commits-only') || args.includes('-c') || args.includes('--auto-commit') || args.includes('-ac'),
        'auto-stage': args.includes('--auto-stage'),
        'auto': args.includes('--auto') || args.includes('-a'),
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
