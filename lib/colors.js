// Color definitions for MAIASS CLI
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
  BGray: (text) => chalk.bold(chalk.gray(text)),
  BPink: (text) => chalk.bold(chalk.magentaBright(text)),
  // soft pink
  BSoftPink: (text) => chalk.bold(chalk.hex('#FFB6C1')(text)),

  BLime: (text) => chalk.bold(chalk.greenBright(text)),
  BYellowBright: (text) => chalk.bold(chalk.yellowBright(text)),
  BBlueBright: (text) => chalk.bold(chalk.blueBright(text)),
  Cyan: (text) => chalk.cyan(text),
  Red: (text) => chalk.red(text),
  Green: (text) => chalk.green(text),
  Blue: (text) => chalk.blue(text),
  Yellow: (text) => chalk.yellow(text),
  Purple: (text) => chalk.magenta(text),
  White: (text) => chalk.white(text),
  Gray: (text) => chalk.gray(text),
  Magenta: (text) => chalk.magenta(text),
  Aqua: (text) => chalk.cyanBright(text),
  Pink: (text) => chalk.magentaBright(text),
  SoftPink: (text) => chalk.hex('#FFB6C1')(text),
  Lime: (text) => chalk.greenBright(text),
  YellowBright: (text) => chalk.yellowBright(text),
  BlueBright: (text) => chalk.blueBright(text),
  SkyBlue: (text) => chalk.bold.cyanBright(text),
  BlueOnWhite: (text) => chalk.blue.bgWhite(text),
  BBlueOnWhite: (text) => chalk.bold.blue.bgWhite(text),

  // Helper function to format messages with MAIASS branding
  formatMessage: (icon, message) => {
    const prefix = chalk.bold.cyanBright('| ))');
    return `${icon} ${prefix} ${message}`;
  },
};
