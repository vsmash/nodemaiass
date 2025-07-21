#!/usr/bin/env node
// MAIASSNODE: Node.js replica of maiass.sh
import path from 'path';
import fs from 'fs';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import chalk from 'chalk';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(process.env.HOME || '', '.maiass.env') });
dotenv.config(); // fallback to .env in cwd


// Example: print version and a colorful welcome
import colors from './lib/colors.js';

const version = '0.1.0';
console.log(colors.BCyan(`MAIASSNODE v${version}`));

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
