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

// get the version from package.json (ES module compatible)
const __dirname = path.dirname(new URL(import.meta.url).pathname);
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json')));
const version = packageJson.version;

console.log(colors.Aqua(`MAIASSNODE v${version}`));

// Import env display utility
import { displayEnvironmentVariables } from './lib/env-display.js';
import { getGitInfo, displayGitInfo, validateBranchForOperations } from './lib/git-info.js';
import { commitThis } from './lib/commit.js';

// Yargs CLI setup (stub)
yargs(hideBin(process.argv))
  .scriptName('maiassnode')
  .usage('$0 <cmd> [args]')
  .command('hello', 'Print hello world', () => {}, () => {
    console.log(colors.BCyan('Hello from MAIASSNODE!'));
  })
  .command('env', 'Display environment variables', (yargs) => {
    return yargs
      .option('show-sensitive', {
        alias: 's',
        type: 'boolean',
        default: false,
        description: 'Show sensitive variables unmasked'
      })
      .option('show-all', {
        alias: 'a', 
        type: 'boolean',
        default: false,
        description: 'Show all MAIASS environment variables'
      })
      .option('no-sources', {
        type: 'boolean',
        default: false,
        description: 'Hide configuration file source information'
      });
  }, (argv) => {
    displayEnvironmentVariables({
      showSensitive: argv.showSensitive,
      showAll: argv.showAll,
      showSources: !argv.noSources
    });
  })
  .command('git', 'Display git branch and repository information', (yargs) => {
    return yargs
      .option('no-remote', {
        type: 'boolean',
        default: false,
        description: 'Hide remote repository information'
      })
      .option('no-author', {
        type: 'boolean',
        default: false,
        description: 'Hide git author information'
      })
      .option('validate', {
        alias: 'v',
        type: 'boolean',
        default: false,
        description: 'Validate branch for MAIASS operations'
      })
      .option('no-status', {
        type: 'boolean',
        default: false,
        description: 'Hide git status information (staged/unstaged changes)'
      });
  }, (argv) => {
    const gitInfo = getGitInfo();
    
    if (!gitInfo) {
      console.log(colors.Red(SYMBOLS.CROSS + ' Not in a git repository'));
      process.exit(1);
    }
    
    displayGitInfo(gitInfo, {
      showRemote: !argv.noRemote,
      showAuthor: !argv.noAuthor,
      showStatus: !argv.noStatus
    });
    
    if (argv.validate) {
      console.log();
      const validation = validateBranchForOperations(gitInfo);
      
      if (validation.warnings.length > 0) {
        console.log(colors.BYellow(SYMBOLS.WARNING + '  Warnings:'));
        validation.warnings.forEach(warning => {
          console.log(`  ${colors.Yellow(SYMBOLS.BULLET)} ${warning}`);
        });
        console.log();
      }
      
      if (validation.recommendations.length > 0) {
        console.log(colors.BCyan(SYMBOLS.INFO + ' Recommendations:'));
        validation.recommendations.forEach(rec => {
          console.log(`  ${colors.Cyan(SYMBOLS.BULLET)} ${rec}`);
        });
        console.log();
      }
    }
  })
  .command('commit', 'Commit changes with AI-powered message generation', (yargs) => {
    return yargs
      .option('auto-stage', {
        alias: 'a',
        type: 'boolean',
        default: false,
        description: 'Automatically stage all changes without asking'
      })
      .option('commits-only', {
        alias: 'c',
        type: 'boolean',
        default: false,
        description: 'Only handle commits, do not proceed to release pipeline'
      });
  }, async (argv) => {
    const success = await commitThis({
      autoStage: argv.autoStage,
      commitsOnly: argv.commitsOnly
    });
    
    if (!success) {
      process.exit(1);
    }
  })
  .demandCommand(1, 'You need at least one command before moving on')
  .help()
  .argv;
