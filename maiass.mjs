#!/usr/bin/env node
// MAIASS: Modular AI-Assisted Semantic Scribe
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
import { displayEnvironmentVariables, FLAGS as ENV_FLAGS } from './lib/env-display.js';
import { getGitInfo, displayGitInfo, validateBranchForOperations, FLAGS as GIT_INFO_FLAGS } from './lib/git-info.js';
import { commitThis } from './lib/commit.js';
import { handleConfigCommand, FLAGS as CONFIG_FLAGS } from './lib/config-command.js';
import { handleVersionCommand, FLAGS as VERSION_FLAGS } from './lib/version-command.js';
import { handleMaiassCommand, FLAGS as MAIASS_FLAGS } from './lib/maiass-command.js';
import { handleAccountInfoCommand, FLAGS as ACCOUNT_INFO_FLAGS } from './lib/account-info.js';
import { handleCleanupCommand, FLAGS as CLEANUP_FLAGS } from './lib/changelog-cleanup.js';
import { SYMBOLS } from './lib/symbols.js';
import { bootstrapProject } from './lib/bootstrap.js';
import { createGithubAction, showGitlabExcerpt, showBitbucketExcerpt } from './lib/ci-templates.js';
import { validateFlags } from './lib/flag-validator.js';
import { extractMessageFlag } from './lib/arg-utils.js';

// Simple CLI setup for pkg compatibility
const args = process.argv.slice(2);

// -m / --message <value>: a verbatim commit message supplied non-interactively
// (MAI-XX node+bash parity). The flag CONSUMES the next token as its value, so
// that value must NOT be treated as the command name / version-bump type during
// command derivation below. Supported forms: `-m <value>`, `--message <value>`,
// `--message=<value>`. Single value only (no git-style repeated -m).
//
// extractMessageFlag returns { message, valueIndices } where valueIndices marks
// argv positions that belong to the flag (the flag token and, for the space-
// separated form, its value) so command derivation can skip them.
const { message: providedMessage, valueIndices: messageArgIndices } = extractMessageFlag(args);

// Skip flags (starting with -) AND the -m/--message value token to find the
// first meaningful positional argument (command / version-bump).
const firstArg = args.find((a, i) => !a.startsWith('-') && !messageArgIndices.has(i));

// Handle --setup/--bootstrap flag early
if (args.includes('--setup') || args.includes('--bootstrap')) {
  process.env.MAIASS_FORCE_BOOTSTRAP = 'true';
}

// Check if first argument is a version bump type
const versionBumpTypes = ['major', 'minor', 'patch'];
const validCommands = ['hello', 'env', 'git-info', 'config', 'version', 'account-info', 'cleanup-changelogs', 'maiass', 'help'];
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
    console.log(`Run 'maiass --help' for more information.`);
    process.exit(1);
  }
  command = firstArg;
} else if (!firstArg) {
  // No command specified, default to maiass
  command = 'maiass';
}

// MAI-93: `-ac` / `--auto-commit` has been REMOVED (breaking change, no alias).
// Reject it early — before any work — and point users at the replacement.
// Skip any position that is the VALUE of -m/--message, so a legitimate commit
// message like `maiass -uc -m "-ac"` is NOT treated as the removed flag.
const usesRemovedAutoCommit = args.some(
  (a, i) => (a === '--auto-commit' || a === '-ac') && !messageArgIndices.has(i)
);
if (usesRemovedAutoCommit) {
  console.error('Please use -uc (--unattended-commit)');
  process.exit(1);
}

// Auto modes:
// -a  / --auto:              full auto — push, merge to develop, version bump.
//                            Does NOT force-stage unstaged/untracked changes any
//                            more (MAI-93) — auto-staging is opt-in via
//                            MAIASS_AUTO_STAGE_UNSTAGED=true.
// -uc / --unattended-commit: auto-yes for commit phase only — commits STAGED
//                            changes, pushes the current branch, then stops (no
//                            merge, no bump). Unattended but does NOT force-stage
//                            (MAI-93). Distinct from the INTERACTIVE commits-only
//                            (-c / -co / --commits-only), which prompts.
const isUnattendedCommit = args.includes('--unattended-commit') || args.includes('-uc');
const isAuto = !isUnattendedCommit && (args.includes('--auto') || args.includes('-a'));

// Auto-mode env vars are applied AFTER flag validation below — see
// "Apply auto-mode env vars" block. Detected here only because the booleans
// are referenced in later debug logging; applying them here would leak into
// process.env for commands that reject --auto via the validator (e.g.
// `account-info --auto`).

// Handle version flag
if (args.includes('--version') || args.includes('-v')) {
  console.log(version);
  process.exit(0);
}

// Handle --account-info flag (before help to allow it to work)
if (args.includes('--account-info')) {
  command = 'account-info';
}

// Handle --cleanup-changelogs flag (mirrors --account-info — top-level utility)
if (args.includes('--cleanup-changelogs')) {
  command = 'cleanup-changelogs';
}

// Validate flags against the active subcommand's allow-list (MAI-43).
//
// Each subcommand handler exports a FLAGS array of its own legitimate flags.
// We validate the argv against the union of (always-valid + subcommand FLAGS)
// so that e.g. `version --tag` and `config --global` work without
// blanket-skipping validation (which would let typos like `--globl` through).
const SUBCOMMAND_FLAGS = {
  hello: [],
  env: ENV_FLAGS,
  'git-info': GIT_INFO_FLAGS,
  config: CONFIG_FLAGS,
  version: VERSION_FLAGS,
  'account-info': ACCOUNT_INFO_FLAGS,
  'cleanup-changelogs': CLEANUP_FLAGS,
  maiass: MAIASS_FLAGS,
  help: [],
};

const activeSubcommandFlags = SUBCOMMAND_FLAGS[command] ?? [];
// Skip the -m/--message value token during validation — it may legitimately
// begin with '-' (e.g. `-m "-- breaking change --"`) and must not be treated
// as an unknown flag.
const flagValidation = validateFlags(args, activeSubcommandFlags, messageArgIndices);

if (!flagValidation.valid) {
  console.error(colors.Red(`${SYMBOLS.CROSS} Error: Unrecognized option '${flagValidation.flag}' for command '${command}'`));
  if (flagValidation.suggestion) {
    console.log('');
    console.log(colors.BYellow(`Did you mean '${flagValidation.suggestion}'?`));
  }
  console.log('');
  console.log(`Valid flags for '${command}':`);
  const sortedFlags = [...flagValidation.validFlags].sort();
  // Group long-form and short-form together for readable output.
  const longFlags = sortedFlags.filter(f => f.startsWith('--'));
  const shortFlags = sortedFlags.filter(f => !f.startsWith('--'));
  if (longFlags.length) console.log('  ' + longFlags.join(', '));
  if (shortFlags.length) console.log('  ' + shortFlags.join(', '));
  console.log('');
  console.log(`Run 'maiass --help' or 'maiass ${command} --help' for more information.`);
  process.exit(1);
}

// An explicitly-supplied but empty/whitespace-only -m/--message is a usage
// error — fail fast with a non-zero exit (parity with bash, which aborts here).
// An absent flag (providedMessage === null) is unaffected.
if (providedMessage !== null && providedMessage.trim() === '') {
  console.error(colors.Red(`${SYMBOLS.CROSS} Error: --message/-m requires a non-empty value`));
  process.exit(1);
}

// Apply auto-mode env vars now that validation has passed. Setting these
// before validation would leak MAIASS_AUTO_* into process.env for commands
// that reject --auto (e.g. `account-info --auto`) — see MAI-43 code review.
//
// MAI-93: auto modes NO LONGER force MAIASS_AUTO_STAGE_UNSTAGED. Auto-staging
// of unstaged/untracked changes is now opt-in — whatever the user/config set
// (loaded into process.env at maiass.mjs:25) is preserved; default off. The
// auto-yes vars below only cover push and AI-suggestion approval.
if (isAuto || isUnattendedCommit) {
  // Shared auto-yes vars for both modes (NOT auto-stage — see MAI-93 above)
  process.env.MAIASS_AUTO_PUSH_COMMITS = 'true';
  process.env.MAIASS_AUTO_APPROVE_AI_SUGGESTIONS = 'true';
}

if (isAuto) {
  // -a: also auto-merge to develop (legacy behaviour)
  process.env.MAIASS_AUTO_MERGE_TO_DEVELOP = 'true';
  if (process.env.MAIASS_DEBUG === 'true') {
    logger.debug('[DEBUG] Auto mode enabled — full pipeline runs unattended');
  }
} else if (isUnattendedCommit) {
  // -uc: stop after commit phase. Implemented by treating it as commits-only
  process.env.MAIASS_AUTO_FINISH_AFTER_COMMIT = 'true';
  if (process.env.MAIASS_DEBUG === 'true') {
    logger.debug('[DEBUG] Unattended-commit mode enabled — stops after commit phase');
  }
}

// Subcommand-specific help: route `maiass config --help` to the config
// handler so it can print its own flag reference rather than the global one.
// (The handler returns immediately after printing help.)
if (command === 'config' && (args.includes('--help') || args.includes('-h'))) {
  await handleConfigCommand(process.argv.slice(3));
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
  console.log('  --account-info     Show your account status (masked token)');
  console.log('  --cleanup-changelogs  AI-clean CHANGELOG.md + .CHANGELOG_internal.md (backfills from git; writes .bak)');
  console.log('  --auto, -a         Full auto — commit staged, push, merge to develop, bump version');
  console.log('                     (auto-staging of UNSTAGED changes is opt-in: MAIASS_AUTO_STAGE_UNSTAGED=true)');
  console.log('  --commits-only, -c, -co  Interactive commit-only — generate AI commits without version management');
  console.log('  --unattended-commit, -uc Unattended commit-only — commits STAGED changes, pushes current branch,');
  console.log('                     then stops (no merge/bump; auto-staging of unstaged changes is opt-in)');
  console.log('  --message, -m <msg> Use this commit message verbatim (skips AI + the message prompt; no credit/token needed).');
  console.log('                     Supplies the message only; for fully unattended use combine with -uc (or --auto-stage).');
  console.log('  --auto-stage       Stage all changes for this run (one-shot opt-in; otherwise unstaged');
  console.log('                     changes are left alone unless MAIASS_AUTO_STAGE_UNSTAGED=true)');
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
  console.log('\nSubcommand flags:');
  console.log('  Each subcommand has its own flags. Examples:');
  console.log('    maiass version                         Show current project version');
  console.log('    maiass config --global key=value       Write to global config');
  console.log('    maiass config --list-vars              List all supported variables');
  console.log('    maiass account-info --json             Account info as JSON');
  console.log('  Run `maiass config --help` for the config subcommand reference.');
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
      `# Use this file for personal overrides, e.g. MAIASS_AI_MODE=autosuggest\n` +
      `\n` +
      `# Example: devlog tagging (optional)\n` +
      `#MAIASS_DEVLOG_CLIENT="yourclient"\n` +
      `#MAIASS_DEVLOG_SUBCLIENT=""\n` +
      `#MAIASS_DEVLOG_PROJECT="yourproject"\n`,
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

    case 'cleanup-changelogs':
      await handleCleanupCommand();
      break;

    case 'maiass':
      // Handle the main MAIASS workflow
      await handleMaiassCommand({
        // Positionals must exclude the -m/--message value token (it doesn't start
        // with '-' but is NOT a command/bump-type positional).
        _: process.argv.slice(2).filter((arg, i) => !arg.startsWith('-') && !messageArgIndices.has(i)),
        // commits-only is the INTERACTIVE commit-only mode: -c / -co / --commits-only.
        // The UNATTENDED variant -uc / --unattended-commit also maps here, then adds
        // the auto-yes / auto-finish env vars set above (MAI-93).
        'commits-only': args.includes('--commits-only') || args.includes('-c') || args.includes('-co')
          || args.includes('--unattended-commit') || args.includes('-uc'),
        'auto-stage': args.includes('--auto-stage'),
        'auto': args.includes('--auto') || args.includes('-a'),
        'version-bump': versionBump,
        'dry-run': args.includes('--dry-run') || args.includes('-d'),
        force: args.includes('--force') || args.includes('-f'),
        silent: args.includes('--silent') || args.includes('-s'),
        tag: getArgValue(args, '--tag') || getArgValue(args, '-t'),
        // Verbatim commit message supplied via -m/--message (or null). Threaded
        // through the pipeline to the commit phase; bypasses AI + interactive.
        message: providedMessage
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

// extractMessageFlag is imported from ./lib/arg-utils.js — extracted (MAI-51)
// so it can be unit-tested without booting the CLI on import.
