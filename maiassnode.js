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
import { handleConfigCommand } from './lib/config-command.js';
import { SYMBOLS } from './lib/symbols.js';

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
  .command('commit', 'Commit changes with AI assistance', (yargs) => {
    return yargs
      .option('auto-stage', {
        alias: 'a',
        type: 'boolean',
        description: 'Automatically stage all changes before committing'
      })
      .option('commits-only', {
        alias: 'c',
        type: 'boolean',
        description: 'Only handle commits, do not proceed to release pipeline'
      });
  }, async (argv) => {
    await commitThis({
      autoStage: argv.autoStage,
      commitsOnly: argv.commitsOnly
    });
  })
  .command('config [key]', 'Manage configuration settings', (yargs) => {
    return yargs
      .positional('key', {
        describe: 'Configuration key to get/set (format: key or key=value)',
        type: 'string'
      })
      .option('global', {
        alias: 'g',
        type: 'boolean',
        description: 'Manage global user configuration (~/.maiass.env)'
      })
      .option('project', {
        alias: 'p',
        type: 'boolean',
        description: 'Manage project configuration (./.env)'
      })
      .option('edit', {
        alias: 'e',
        type: 'boolean',
        description: 'Open configuration file in editor'
      })
      .option('list', {
        alias: 'l',
        type: 'boolean',
        description: 'Show only configured values (not defaults)'
      })
      .option('show-sensitive', {
        alias: 's',
        type: 'boolean',
        description: 'Show sensitive values (tokens, passwords) in full'
      })
      .option('list-vars', {
        type: 'boolean',
        description: 'List all available configuration variables'
      })
      .example('nma config', 'Show all configuration values')
      .example('nma config --global', 'Show global configuration')
      .example('nma config --project', 'Show project configuration')
      .example('nma config --global openai_token=abc123', 'Set global OpenAI token')
      .example('nma config --project debug=true', 'Set project debug mode')
      .example('nma config verbosity', 'Get verbosity setting')
      .example('nma config --edit --global', 'Edit global config file')
      .example('nma config --list-vars', 'List available variables');
  }, async (argv) => {
    await handleConfigCommand(argv);
  })  
  .demandCommand(1, 'You need at least one command before moving on')
  .help()
  .argv;
