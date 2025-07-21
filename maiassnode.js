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

// Yargs CLI setup (stub)
yargs(hideBin(process.argv))
  .scriptName('maiassnode')
  .usage('$0 <cmd> [args]')
  .command('hello', 'Print hello world', () => {}, () => {
    console.log(colors.BCyan('Hello from MAIASSNODE!'));
  })
  .demandCommand(1, 'You need at least one command before moving on')
  .help()
  .argv;
