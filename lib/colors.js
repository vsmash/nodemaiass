// Color definitions for MAIASSNODE CLI
import chalk from 'chalk';

export default {

  BCyan: (text) => chalk.bold(chalk.cyan(text)),
  BRed: (text) => chalk.bold(chalk.red(text)),
  BGreen: (text) => chalk.bold(chalk.green(text)),
  BBlue: (text) => chalk.bold(chalk.blue(text)),
  BYellow: (text) => chalk.bold(chalk.yellow(text)),
  BPurple: (text) => chalk.bold(chalk.magenta(text)),
  BWhite: (text) => chalk.bold(chalk.white(text)),
  BMagenta: (text) => chalk.bold(chalk.magenta(text)),
  BAqua: (text) => chalk.bold(chalk.cyanBright(text)),
  Cyan: (text) => chalk.cyan(text),
  Red: (text) => chalk.red(text),
  Green: (text) => chalk.green(text),
  Blue: (text) => chalk.blue(text),
  Yellow: (text) => chalk.yellow(text),
  Purple: (text) => chalk.magenta(text),
  White: (text) => chalk.white(text),
  Magenta: (text) => chalk.magenta(text),
  Aqua: (text) => chalk.cyanBright(text),
};
