// Centralized logger for MAIASS CLI with consistent branding
import colors from './colors.js';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import os from 'os';

// Store environment variables
let env = {};

// Debug collection system
let debugBuffer = [];
let sessionId = null;

/**
 * Initialize debug collection session
 */
function initDebugSession() {
  sessionId = `maiass-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  debugBuffer = [];
}

/**
 * Add entry to debug buffer
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {Object} metadata - Additional metadata
 */
function addToDebugBuffer(level, message, metadata = {}) {
  if (!sessionId) initDebugSession();
  
  debugBuffer.push({
    timestamp: new Date().toISOString(),
    level,
    message,
    ...metadata
  });
}

/**
 * Write debug buffer to temporary file
 * @returns {string} Path to debug file
 */
export function writeDebugFile() {
  if (!sessionId || debugBuffer.length === 0) return null;
  
  try {
    const tempDir = os.tmpdir();
    const debugFile = path.join(tempDir, `${sessionId}.debug.log`);
    
    const debugContent = debugBuffer
      .map(entry => `[${entry.timestamp}] ${entry.level.toUpperCase()}: ${entry.message}`)
      .join('\n');
    
    fs.writeFileSync(debugFile, debugContent, 'utf8');
    return debugFile;
  } catch (error) {
    console.error('Failed to write debug file:', error.message);
    return null;
  }
}

/**
 * Get current debug session info
 * @returns {Object} Session info
 */
export function getDebugSession() {
  return {
    sessionId,
    entryCount: debugBuffer.length,
    hasErrors: debugBuffer.some(entry => entry.level === 'error')
  };
}

/**
 * Initialize logger with environment variables
 * @param {Object} environment - Environment variables
 */
export function initLogger(environment) {
  env = { ...environment };
}

/**
 * Check if message should be shown based on verbosity level
 * @param {string} level - Message level: 'error', 'warning', 'info', 'debug', 'critical', 'prompt'
 * @returns {boolean} - Whether to show the message
 */
function shouldLog(level) {
  const verbosity = env.MAIASS_VERBOSITY || process.env.MAIASS_VERBOSITY || 'brief';
  
  // Always show errors, prompts, and critical messages
  if (['error', 'critical', 'prompt'].includes(level)) return true;
  
  // For brief: only errors, critical messages, prompts, final results, and important warnings
  if (verbosity === 'brief') {
    return ['error', 'critical', 'prompt', 'success', 'warning'].includes(level);
  }
  
  // For normal: errors, warnings, success, and important info
  if (verbosity === 'normal') {
    return ['error', 'warning', 'success', 'info', 'critical', 'prompt'].includes(level);
  }
  
  // For verbose/debug: show everything
  if (verbosity === 'verbose' || verbosity === 'debug') {
    return true;
  }
  
  return false;
}

// Bold soft pink prefix for MAIASS branding
const MAIASS_PREFIX = colors.BSoftPink('|))');

export const log = {
  logThis: (prefix, icon, message) => {
    // Only include prefix and icon if they are defined and not empty
    const prefixPart = prefix ? `${prefix}  ` : '';
    const iconPart = icon ? `${icon}  ` : '';
    const fullMessage = `${iconPart}${prefixPart}${message}`.trim();
    console.log(fullMessage);
    
    // Add to debug buffer (strip color codes for cleaner debug log)
    const cleanMessage = message.replace(/\x1b\[[0-9;]*m/g, '');
    addToDebugBuffer('info', `${icon} ${cleanMessage}`);
  },

  // Main branded message types with icons
  info: (icon, message, bold=false) => {
    if (!shouldLog('info')) return;
    log.logThis(MAIASS_PREFIX, colors.BCyan(icon), bold?colors.BCyan(message):colors.Cyan(message));
  },

  success: (icon, message, bold=false) => {
    if (!shouldLog('success')) return;
    log.logThis(MAIASS_PREFIX, colors.BGreen(icon), bold?colors.BGreen(message):colors.Green(message));
  },

  aisuggestion: (icon, message, bold=true) => {
    if (!shouldLog('prompt')) return;
    log.logThis('', colors.BYellowBright(icon), bold?colors.BYellowBright(message):colors.BYellowBright(message));
  },

  warning: (icon, message, bold=false) => {
    if (!shouldLog('warning')) return;
    log.logThis(MAIASS_PREFIX, colors.BYellow(icon), bold?colors.BYellow(message):colors.Yellow(message));
  },

  error: (icon, message, bold=false) => {
    const msg = bold ? colors.BRed(message) : colors.Red(message);
    const fullMessage = `${MAIASS_PREFIX}  ${colors.BRed(icon)}  ${msg}`;
    console.error(fullMessage);
    addToDebugBuffer('error', `${icon} ${message}`);
  },

  blue: (icon, message, bold=false) => {
    if (!shouldLog('info')) return;
    log.logThis(MAIASS_PREFIX, colors.BBlue(icon), bold?colors.BBlue(message):colors.Blue(message));
  },

  purple: (icon, message, bold=false) => {
    if (!shouldLog('info')) return;
    log.logThis(MAIASS_PREFIX, colors.BPurple(icon), bold?colors.BPurple(message):colors.Purple(message));
  },

  BWhite: (icon, message, bold=false) => {
    if (!shouldLog('info')) return;
    log.logThis(MAIASS_PREFIX, colors.BWhite(icon), bold?colors.BWhite(message):colors.White(message));
  },

  blueOnWhite: (icon, message, bold=false) => {
    if (!shouldLog('info')) return;
    log.logThis(MAIASS_PREFIX, colors.BBlueOnWhite(icon), bold?colors.BBlueOnWhite(message):colors.BlueOnWhite(message));
  },

  // Custom color variants
  custom: (icon, message, colorFn) => {
    if (!shouldLog('info')) return;
    log.logThis(MAIASS_PREFIX, colorFn(icon), colorFn(message));
  },

  // Plain messages without icons (for indented content, spacing, etc.)
  plain: (message) => {
    if (!shouldLog('info')) return;
    console.log(message);
  },

  // Branded plain message (no icon, but with | )) prefix)
  branded: (message, colorFn = colors.White) => {
    if (!shouldLog('info')) return;
    console.log(`${MAIASS_PREFIX} ${colorFn(message)}`);
  },

  // Empty line
  space: () => {
    if (!shouldLog('info')) return;
    console.log();
  },

  // Indented content (for sub-items under main messages)
  indent: (message, colorFn = colors.Gray) => {
    if (!shouldLog('info')) return;
    console.log(`    ${colorFn(message)}`);
  },

  // Critical messages that should always show regardless of verbosity
  critical: (icon, message, bold=false) => {
    log.logThis(MAIASS_PREFIX, colors.BCyan(icon), bold?colors.BCyan(message):colors.Cyan(message));
  },

  // User prompts that should always show
  prompt: (message, colorFn = colors.White) => {
    console.log(colorFn(message));
  },

  // debug message (with MAIASS branding)
  debug: (label, data) => {
    const debugEnabled = env.MAIASS_DEBUG === 'true' || env.MAIASS_DEBUG === true || 
                        process.env.MAIASS_DEBUG === 'true' || process.env.MAIASS_DEBUG === true;
    if (!debugEnabled) return;
    
    const timestamp = new Date().toISOString();
    const debugPrefix = colors.Blue('🐛  |))  ');
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
    if (!shouldLog('info')) return;
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
