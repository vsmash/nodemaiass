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
        describe: 'Show sensitive variables (tokens, keys) unmasked',
        type: 'boolean',
        default: false
      })
      .option('show-all', {
        alias: 'a',
        describe: 'Show all environment variables, not just MAIASS-specific',
        type: 'boolean',
        default: false
      })
      .option('no-sources', {
        describe: 'Hide config file source information',
        type: 'boolean',
        default: false
      });
  }, (argv) => {
    displayEnvironmentVariables({
      showSensitive: argv.showSensitive,
      showAll: argv.showAll,
      showSources: !argv.noSources
    });
  })
  .demandCommand(1, 'You need at least one command before moving on')
  .help()
  .argv;
