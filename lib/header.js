// Header display for MAIASS - matches bashmaiass branding
import colors from './colors.js';
import chalk from 'chalk';

/**
 * Check if terminal supports Unicode
 * @returns {boolean}
 */
function supportsUnicode() {
  // Check environment variables
  const lang = process.env.LANG || process.env.LC_ALL || '';
  if (lang.toLowerCase().includes('utf')) return true;
  
  // Windows typically doesn't support Unicode well in older terminals
  if (process.platform === 'win32') {
    // Windows Terminal and newer PowerShell support Unicode
    return process.env.WT_SESSION || process.env.TERM_PROGRAM === 'vscode';
  }
  
  // macOS and Linux typically support Unicode
  return true;
}

/**
 * Check if terminal supports 256 colors
 * @returns {boolean}
 */
function supports256Color() {
  const term = process.env.TERM || '';
  return term.includes('256') || term.includes('xterm');
}

/**
 * Check if terminal supports truecolor (24-bit)
 * @returns {boolean}
 */
function supportsTruecolor() {
  const colorterm = process.env.COLORTERM || '';
  return colorterm === 'truecolor' || colorterm === '24bit';
}

/**
 * Create a gradient line using the best available color support
 * @param {number} length - Length of the line
 * @param {string} startHex - Starting color (hex format)
 * @param {string} endHex - Ending color (hex format)
 * @returns {string} Colored gradient line
 */
function printGradientLine(length = 60, startHex = '#f7b2c4', endHex = '#6b0022') {
  const useUnicode = supportsUnicode();
  const char = useUnicode ? '═' : '=';
  
  // Truecolor support (best quality)
  if (supportsTruecolor()) {
    const r1 = parseInt(startHex.slice(1, 3), 16);
    const g1 = parseInt(startHex.slice(3, 5), 16);
    const b1 = parseInt(startHex.slice(5, 7), 16);
    
    const r2 = parseInt(endHex.slice(1, 3), 16);
    const g2 = parseInt(endHex.slice(3, 5), 16);
    const b2 = parseInt(endHex.slice(5, 7), 16);
    
    let line = '';
    for (let i = 0; i < length; i++) {
      const t = length > 1 ? i / (length - 1) : 0;
      const r = Math.round(r1 + (r2 - r1) * t);
      const g = Math.round(g1 + (g2 - g1) * t);
      const b = Math.round(b1 + (b2 - b1) * t);
      line += chalk.rgb(r, g, b)(char);
    }
    return line;
  }
  
  // 256-color fallback
  if (supports256Color()) {
    // Pink -> burgundy palette (matching bashmaiass)
    const palette = [224, 217, 218, 212, 211, 210, 205, 204, 198, 197, 161, 125, 89, 88, 52];
    const total = palette.length;
    const per = Math.ceil(length / total);
    
    let line = '';
    let printed = 0;
    
    for (const code of palette) {
      if (printed >= length) break;
      const count = Math.min(per, length - printed);
      line += chalk.ansi256(code)(char.repeat(count));
      printed += count;
    }
    
    return line;
  }
  
  // Plain fallback (no colors)
  return char.repeat(length);
}

/**
 * Create colored MAIASS text with gradient
 * @returns {string} Colored MAIASS text
 */
function colourMaiass() {
  // Soft pink -> burgundy across M A I A S S
  const cols = [218, 211, 205, 198, 161, 88];
  const word = 'MAIASS';
  
  if (supports256Color()) {
    let colored = '';
    for (let i = 0; i < word.length; i++) {
      colored += chalk.ansi256(cols[i])(word[i]);
    }
    return colored;
  }
  
  // Fallback to simple bold
  return chalk.bold(word);
}

/**
 * Display the MAIASS header (matches bashmaiass style)
 * @param {string} version - Current version number
 */
export function displayHeader(version) {
  const maiass = colourMaiass();
  const prefix = colors.BSoftPink('|))');
  const welcomeText = colors.BBlue('             Welcome to ');
  const versionText = colors.Blue(` (node) v${version} `);
  
  console.log(printGradientLine(60, '#0000FF', '#29CCC1'));
  console.log(`${prefix}${welcomeText}${maiass}${versionText}`);
  console.log(printGradientLine(60, '#0000FF', '#29CCC1'));
}

/**
 * Display a simple separator line
 * @param {number} length - Length of the line
 * @param {string} char - Character to use
 * @param {Function} colorFn - Color function to apply
 */
export function displaySeparator(length = 50, char = '─', colorFn = colors.BCyan) {
  const useUnicode = supportsUnicode();
  const actualChar = useUnicode ? char : '-';
  console.log(colorFn(actualChar.repeat(length)));
}

export default {
  displayHeader,
  displaySeparator,
  supportsUnicode,
  supports256Color,
  supportsTruecolor
};
