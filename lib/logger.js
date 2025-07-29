// Centralized logger for MAIASSNODE CLI with consistent branding
import colors from './colors.js';
import chalk from 'chalk';

// Store environment variables
let env = {};

/**
 * Initialize logger with environment variables
 * @param {Object} environment - Environment variables
 */
export function initLogger(environment) {
  env = { ...environment };
}

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
  info: (icon, message, bold=false) => {
    log.logThis(MAIASS_PREFIX, colors.BCyan(icon), bold?colors.BCyan(message):colors.Cyan(message));
  },

  success: (icon, message, bold=false) => {
    log.logThis(MAIASS_PREFIX, colors.BGreen(icon), bold?colors.BGreen(message):colors.Green(message));
  },

  aisuggestion: (icon, message, bold=true) => {
    log.logThis('', colors.BYellowBright(icon), bold?colors.BYellowBright(message):colors.BYellowBright(message));
  },

  warning: (icon, message, bold=false) => {
    log.logThis(MAIASS_PREFIX, colors.BYellow(icon), bold?colors.BYellow(message):colors.Yellow(message));
  },

  error: (icon, message, bold=false) => {
    log.logThis(MAIASS_PREFIX, colors.BRed(icon), bold?colors.BRed(message):colors.Red(message));
  },

  blue: (icon, message, bold=false) => {
    log.logThis(MAIASS_PREFIX, colors.BBlue(icon), bold?colors.BBlue(message):colors.Blue(message));
  },

  purple: (icon, message, bold=false) => {
    log.logThis(MAIASS_PREFIX, colors.BPurple(icon), bold?colors.BPurple(message):colors.Purple(message));
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

  // debug message (with MAIASS branding)
  debug: (label, data) => {
    const debugEnabled = env.MAIASS_DEBUG === 'true' || env.MAIASS_DEBUG === true || 
                        process.env.MAIASS_DEBUG === 'true' || process.env.MAIASS_DEBUG === true;
    if (!debugEnabled) return;
    
    const timestamp = new Date().toISOString();
    const debugPrefix = colors.Blue('🐛  (.)  ');
    const timestampStr = colors.Gray(`[${timestamp}]`);
    
    // Ensure we're writing to stderr to avoid mixing with other output
    const output = process.stderr;
    
    // Write the debug message header
    output.write(`${debugPrefix} ${timestampStr} ${colors.Blue(label)}\n`);
    
    // If we have data, pretty-print it with 2-space indentation
    if (data !== undefined) {
      const jsonStr = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
      // Split into lines and indent each line
      const lines = jsonStr.split('\n');
      for (const line of lines) {
        output.write(`  ${colors.Gray(line)}\n`);
      }
    }
    
    // Ensure everything is flushed
    output.write('');
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
