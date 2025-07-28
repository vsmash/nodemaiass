// Cross-platform symbol system with Unicode/ASCII fallbacks
import os from 'os';

/**
 * Detect if the current terminal supports Unicode
 * @returns {boolean} True if Unicode is supported
 */
function supportsUnicode() {
  // Check environment variable override
  if (process.env.MAIASS_NO_UNICODE === 'true') {
    return false;
  }
  
  // Force Unicode if explicitly enabled
  if (process.env.MAIASS_FORCE_UNICODE === 'true') {
    return true;
  }
  
  // Check platform and terminal capabilities
  const platform = os.platform();
  
  // Windows-specific checks
  if (platform === 'win32') {
    // Modern Windows Terminal supports Unicode
    if (process.env.WT_SESSION) {
      return true;
    }
    
    // PowerShell 7+ generally supports Unicode
    if (process.env.PSModulePath && process.env.POWERSHELL_DISTRIBUTION_CHANNEL) {
      return true;
    }
    
    // VS Code integrated terminal
    if (process.env.VSCODE_INJECTION || process.env.TERM_PROGRAM === 'vscode') {
      return true;
    }
    
    // Default to ASCII for Windows cmd and older terminals
    return false;
  }
  
  // macOS and Linux generally support Unicode
  if (platform === 'darwin' || platform === 'linux') {
    // Check if we're in a known Unicode-capable terminal
    const term = process.env.TERM || '';
    const termProgram = process.env.TERM_PROGRAM || '';
    
    if (term.includes('xterm') || 
        term.includes('screen') || 
        termProgram === 'vscode' ||
        termProgram === 'iTerm.app' ||
        process.env.COLORTERM === 'truecolor') {
      return true;
    }
  }
  
  // Default to Unicode for non-Windows platforms
  return platform !== 'win32';
}

/**
 * Symbol definitions with Unicode and ASCII fallbacks
 */
const SYMBOL_SETS = {
  unicode: {
    globe: '🌍',
    folder: '📁',
    gear: '⚙️',
    wrench: '🔧',
    checkmark: '✅',
    cross: '❌',
    warning: '⚠️',
    info: 'ℹ️',
    smile: '😊',
    sunglasses: '😎',
    poo: '💩',
    rocket: '🚀',
    arrow: '→',
    check: '✓',
    x: '✗',
    bullet: '•',
    diamond: '◆',
    star: '★',
    heart: '♥',
    spade: '♠',
    club: '♣',
    maiassdot: '(.)'
  },
  ascii: {
    globe: '[GLOBE]',
    folder: '[FOLDER]',
    gear: '[GEAR]',
    wrench: '[TOOL]',
    checkmark: '[OK]',
    cross: '[ERROR]',
    warning: '[WARN]',
    info: '[INFO]',
    smile: ':)',
    sunglasses: ':D',
    poo: ':(',
    rocket: '[ROCKET]',
    arrow: '->',
    check: '+',
    x: '-',
    bullet: '*',
    diamond: '<>',
    star: '*',
    heart: '<3',
    spade: 'S',
    club: 'C',
    maiassdot: '(.)'
  }
};

/**
 * Get the appropriate symbol set based on terminal capabilities
 */
const useUnicode = supportsUnicode();
const symbols = useUnicode ? SYMBOL_SETS.unicode : SYMBOL_SETS.ascii;

/**
 * Get a symbol with automatic Unicode/ASCII fallback
 * @param {string} name - Symbol name
 * @returns {string} The appropriate symbol for the current terminal
 */
export function getSymbol(name) {
  return symbols[name] || name;
}

/**
 * Check if Unicode is being used
 * @returns {boolean} True if Unicode symbols are active
 */
export function isUnicodeEnabled() {
  return useUnicode;
}

/**
 * Get terminal info for debugging
 * @returns {Object} Terminal capability information
 */
export function getTerminalInfo() {
  return {
    platform: os.platform(),
    supportsUnicode: useUnicode,
    env: {
      TERM: process.env.TERM,
      TERM_PROGRAM: process.env.TERM_PROGRAM,
      COLORTERM: process.env.COLORTERM,
      WT_SESSION: process.env.WT_SESSION,
      VSCODE_INJECTION: process.env.VSCODE_INJECTION,
      MAIASS_NO_UNICODE: process.env.MAIASS_NO_UNICODE,
      MAIASS_FORCE_UNICODE: process.env.MAIASS_FORCE_UNICODE
    }
  };
}

// Export individual symbols for convenience
export const SYMBOLS = {
  GLOBE: getSymbol('globe'),
  FOLDER: getSymbol('folder'),
  GEAR: getSymbol('gear'),
  WRENCH: getSymbol('wrench'),
  CHECKMARK: getSymbol('checkmark'),
  CROSS: getSymbol('cross'),
  WARNING: getSymbol('warning'),
  INFO: getSymbol('info'),
  ARROW: getSymbol('arrow'),
  CHECK: getSymbol('check'),
  X: getSymbol('x'),
  BULLET: getSymbol('bullet'),
  DIAMOND: getSymbol('diamond'),
  STAR: getSymbol('star'),
  HEART: getSymbol('heart'),
  SPADE: getSymbol('spade'),
  CLUB: getSymbol('club'),
  MAIASSDOT: getSymbol('maiassdot')
};

export default {
  getSymbol,
  isUnicodeEnabled,
  getTerminalInfo,
  SYMBOLS
};
