// Environment variable display utility for development and debugging
import colors from './colors.js';
import { getConfigPaths } from './config.js';
import fs from 'fs';
import path from 'path';

/**
 * Display all environment variables with source information
 * @param {Object} options - Display options
 * @param {boolean} options.showSensitive - Whether to show sensitive variables (masked by default)
 * @param {boolean} options.showSources - Whether to show which file each variable came from
 * @param {boolean} options.showAll - Whether to show all process.env variables
 */
export function displayEnvironmentVariables(options = {}) {
  const {
    showSensitive = false,
    showSources = true,
    showAll = false
  } = options;

  console.log(colors.BCyan('\n🌍 Environment Variables Status\n'));
  console.log('═'.repeat(50));

  // Show loaded config files
  if (showSources) {
    displayLoadedConfigFiles();
  }

  // Display MAIASS-specific variables
  if (showAll) {
    displayAllEnvironmentVariables(showSensitive);
  } else {
    displayMaiassVariables(showSensitive);
  }

  console.log('═'.repeat(50));
  console.log(colors.BGreen('✅ Environment display complete\n'));
}

/**
 * Display which config files were loaded
 */
function displayLoadedConfigFiles() {
  console.log(colors.BYellow('\n📁 Configuration Sources:\n'));
  
  const paths = getConfigPaths();
  const configFiles = [
    { path: path.resolve(process.cwd(), '.env'), label: 'Project .env', priority: 1 },
    { path: path.join(paths.home, '.maiass.env'), label: 'User .maiass.env', priority: 2 },
    { path: path.join(paths.config, 'config.env'), label: 'OS Config', priority: 3 },
    { path: path.join(paths.data, 'secure.env'), label: 'OS Secure', priority: 4 }
  ];

  configFiles.forEach(({ path: filePath, label, priority }) => {
    const exists = fs.existsSync(filePath);
    const status = exists ? colors.BGreen('✓ LOADED') : colors.Red('✗ Not found');
    console.log(`  ${priority}. ${label.padEnd(20)} ${status}`);
    if (exists) {
      console.log(`     ${colors.Cyan(filePath)}`);
    }
  });
}

/**
 * Display MAIASS-specific environment variables
 */
function displayMaiassVariables(showSensitive) {
  console.log(colors.BYellow('\n⚙️  MAIASS Variables:\n'));

  // Get all MAIASS_ prefixed environment variables
  const allVars = Object.entries(process.env)
    .filter(([key]) => key.startsWith('MAIASS_'))
    .sort();
  
  const sensitivePatterns = ['TOKEN', 'KEY', 'SECRET', 'PASSWORD'];

  if (allVars.length === 0) {
    console.log(colors.Yellow('  No MAIASS variables found'));
    return;
  }

  allVars.forEach(([key, value]) => {
    const isSensitive = sensitivePatterns.some(pattern => 
      key.toUpperCase().includes(pattern)
    );
    
    let displayValue;
    if (!value) {
      displayValue = colors.Red('(not set)');
    } else if (isSensitive && !showSensitive) {
      displayValue = colors.Yellow(`***${value.slice(-4)} (masked)`);
    } else {
      displayValue = colors.Green(value);
    }

    const keyColor = isSensitive ? colors.BRed : colors.BBlue;
    console.log(`  ${keyColor(key.padEnd(30))} = ${displayValue}`);
  });
}

/**
 * Display all MAIASS-related environment variables (filtered)
 */
function displayAllEnvironmentVariables(showSensitive) {
  console.log(colors.BYellow('\n🔧 All MAIASS Environment Variables:\n'));

  // Filter to only MAIASS_ prefixed variables
  const allVars = Object.entries(process.env)
    .filter(([key]) => key.startsWith('MAIASS_'))
    .sort();

  const sensitivePatterns = ['KEY', 'TOKEN', 'SECRET', 'PASSWORD', 'AUTH'];

  if (allVars.length === 0) {
    console.log(colors.Yellow('  No MAIASS-related environment variables found'));
    return;
  }

  allVars.forEach(([key, value]) => {
    const isSensitive = sensitivePatterns.some(pattern => 
      key.toUpperCase().includes(pattern)
    );

    let displayValue;
    if (isSensitive && !showSensitive) {
      displayValue = colors.Yellow('*** (masked - use --show-sensitive)');
    } else {
      // Truncate very long values
      displayValue = value.length > 100 
        ? colors.Cyan(value.slice(0, 100) + '...')
        : colors.Cyan(value);
    }

    const keyColor = isSensitive ? colors.BRed : colors.Blue;
    console.log(`  ${keyColor(key.padEnd(30))} = ${displayValue}`);
  });
}

export default {
  displayEnvironmentVariables
};
