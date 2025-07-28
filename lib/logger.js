// Centralized logger for MAIASSNODE CLI with consistent branding
import colors from './colors.js';
import chalk from 'chalk';

// Bold sky-blue prefix for MAIASS branding
const MAIASS_PREFIX = chalk.bold.cyanBright('(.)');

export const log = {
  logThis: (prefix, icon, message) => {
    // Only include prefix and icon if they are defined and not empty
    const prefixPart = prefix ? `${prefix}  ` : '';
    const iconPart = icon ? `${icon}  ` : '';
    console.log(`${iconPart}${prefixPart}${message}`.trim());
  },

  // Main branded message types with icons
  info: (icon, message) => {
    log.logThis(MAIASS_PREFIX, colors.BCyan(icon), colors.Cyan(message));
  },

  success: (icon, message) => {
    log.logThis(MAIASS_PREFIX, colors.BGreen(icon), colors.Green(message));
  },

  warning: (icon, message) => {
    log.logThis(MAIASS_PREFIX, colors.BYellow(icon), colors.Yellow(message));
  },

  error: (icon, message) => {
    log.logThis(MAIASS_PREFIX, colors.BRed(icon), colors.Red(message));
  },

  blue: (icon, message) => {
    log.logThis(MAIASS_PREFIX, colors.BBlue(icon), colors.Blue(message));
  },

  purple: (icon, message) => {
    log.logThis(MAIASS_PREFIX, colors.BPurple(icon), colors.Purple(message));
  },

  // Custom color variants
  custom: (icon, message, colorFn) => {
    log.logThis(MAIASS_PREFIX, colorFn(icon), colorFn(message));
  },

  // Plain messages without icons (for indented content, spacing, etc.)
  plain: (message) => {
    console.log(message);
  },

  // Branded plain message (no icon, but with | )) prefix)
  branded: (message, colorFn = colors.White) => {
    console.log(`${MAIASS_PREFIX} ${colorFn(message)}`);
  },

  // Empty line
  space: () => {
    console.log();
  },

  // Indented content (for sub-items under main messages)
  indent: (message, colorFn = colors.Gray) => {
    console.log(`    ${colorFn(message)}`);
  },

  // Indented with arrow (for config values, etc.)
  indentArrow: (message, colorFn = colors.Gray) => {
    console.log(`    ${colorFn('→')} ${colorFn(message)}`);
  }
  
};

// Convenience methods for common patterns
export const logger = {
  ...log,
  
  // Common CLI patterns
  header: (icon, title) => {
    log.info(icon, title);
    log.space();
  },

  section: (title, colorFn = colors.BBlue) => {
    log.custom('📁', title, colorFn);
    log.space();
  },

  configItem: (key, value, source = '', description = '') => {
    const keyColor = colors.BWhite;
    const valueColor = colors.White;
    const sourceColor = colors.Gray;
    
    log.plain(`    ${keyColor(key.padEnd(25))} = ${valueColor(value)}`);
    if (source) {
      log.plain(`    ${' '.repeat(25)}   ${sourceColor(`→ ${source}`)} ${colors.Gray(`(${description})`)}`);
    }
    log.space();
  },

  usage: (examples) => {
    log.blue('ℹ️', 'Usage examples:');
    examples.forEach(example => {
      log.plain(`  ${example}`);
    });
  }
};

export default logger;
