#!/usr/bin/env node
// MAIASSNODE: Node.js replica of maiass.sh
import path from 'path';
import fs from 'fs';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { loadEnvironmentConfig, ensureConfigDirectories } from './lib/config.js';

// Load environment variables from multiple sources with cross-platform support
ensureConfigDirectories();
const envConfig = loadEnvironmentConfig();


// Example: print version and a colorful welcome
import colors from './lib/colors.js';

// get the version from package.json (ES module compatible, cross-platform)
const __dirname = path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w):/, '$1:'));
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json')));
const version = packageJson.version;

console.log(colors.Aqua(`MAIASSNODE v${version}`));

// Import env display utility
import { displayEnvironmentVariables } from './lib/env-display.js';
import { getGitInfo, displayGitInfo, validateBranchForOperations } from './lib/git-info.js';
import { commitThis } from './lib/commit.js';
import { handleConfigCommand } from './lib/config-command.js';
import { handleVersionCommand } from './lib/version-command.js';
import { handleMaiassCommand } from './lib/maiass-command.js';
import { SYMBOLS } from './lib/symbols.js';

// Simple CLI setup for pkg compatibility
const args = process.argv.slice(2);
const command = args[0] || 'help';

// Handle version flag
if (args.includes('--version') || args.includes('-v')) {
  console.log(version);
  process.exit(0);
}

// Handle help flag
if (args.includes('--help') || args.includes('-h') || command === 'help') {
  console.log(`
MAIASSNODE v${version}`);
  console.log('Usage: maiassnode <command> [options]\n');
  console.log('Commands:');
  console.log('  hello              Print hello world');
  console.log('  env                Display environment variables');
  console.log('  git                Display git information');
  console.log('  commit             Commit workflow');
  console.log('  version            Version management');
  console.log('  config             Manage configuration');
  console.log('  maiass             Complete MAIASS workflow');
  console.log('\nOptions:');
  console.log('  --version, -v      Show version');
  console.log('  --help, -h         Show help');
  process.exit(0);
}

// Command routing
switch (command) {
  case 'hello':
    console.log(colors.BCyan('Hello from MAIASSNODE!'));
    break;
    
  case 'env':
    const envOptions = {
      showSensitive: args.includes('--show-sensitive') || args.includes('-s'),
      showAll: args.includes('--show-all') || args.includes('-a'),
      noSources: args.includes('--no-sources')
    };
    displayEnvironmentVariables(envOptions);
    break;
    
  case 'git':
    const gitOptions = {
      hideAuthor: args.includes('--hide-author'),
      hideStatus: args.includes('--hide-status')
    };
    const gitInfo = getGitInfo();
    if (!gitInfo.isGitRepo) {
      console.log(colors.Red(SYMBOLS.CROSS + ' Not in a git repository'));
      process.exit(1);
    }
    displayGitInfo(gitInfo, gitOptions);
    break;
    
  case 'commit':
    (async () => {
      const commitOptions = {
        dryRun: args.includes('--dry-run'),
        message: getArgValue(args, '--message') || getArgValue(args, '-m'),
        skipValidation: args.includes('--skip-validation')
      };
      await commitThis(commitOptions);
    })();
    break;
    
  case 'version':
    (async () => {
      // Get the bump type from the second argument (after 'version')
      const bumpType = args[1]; // 'minor', 'major', 'patch', or specific version
      
      const versionOptions = {
        _: bumpType ? [bumpType] : [], // positionalArgs array expected by handleVersionCommand
        'dry-run': args.includes('--dry-run'),
        tag: args.includes('--tag'),
        'tag-message': getArgValue(args, '--tag-message'),
        force: args.includes('--force'),
        current: args.includes('--current')
      };
      await handleVersionCommand(versionOptions);
    })();
    break;
    
  case 'config':
    (async () => {
      const configOptions = {
        key: args[1],
        global: args.includes('--global') || args.includes('-g'),
        project: args.includes('--project') || args.includes('-p'),
        edit: args.includes('--edit') || args.includes('-e'),
        listVars: args.includes('--list-vars')
      };
      await handleConfigCommand(configOptions);
    })();
    break;
    
  case 'maiass':
    (async () => {
      const maiassOptions = {
        dryRun: args.includes('--dry-run'),
        skipValidation: args.includes('--skip-validation'),
        message: getArgValue(args, '--message') || getArgValue(args, '-m'),
        bump: getArgValue(args, '--bump'),
        tag: args.includes('--tag')
      };
      await handleMaiassCommand(maiassOptions);
    })();
    break;
    
  default:
    console.log(colors.Red(`Unknown command: ${command}`));
    console.log('Run `maiassnode --help` for available commands.');
    process.exit(1);
}

// Helper function to get argument values
function getArgValue(args, flag) {
  const index = args.indexOf(flag);
  return index !== -1 && index + 1 < args.length ? args[index + 1] : null;
}
