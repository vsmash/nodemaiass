// Environment variable display utility for development and debugging
import colors from './colors.js';
import { getConfigPaths, loadEnvironmentConfig } from './config.js';
import { MAIASS_VARIABLES, getVariableSource } from './maiass-variables.js';
import { log, logger } from './logger.js';
import { SYMBOLS } from './symbols.js';
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

  log.info(SYMBOLS.GLOBE, 'Environment Variables Status');
  console.log();
  console.log('═'.repeat(50));
  console.log();

  // Show configuration sources if requested
  if (showSources) {
    displayLoadedConfigFiles();
  }

  // Get loaded files info for source tracking
  const envConfig = loadEnvironmentConfig();
  
  // Display MAIASS-specific variables
  if (showAll) {
    displayAllEnvironmentVariables(showSensitive);
  } else {
    displayMaiassVariables(showSensitive, envConfig.loadedFiles);
  }

  console.log('═'.repeat(50));
  log.success(SYMBOLS.CHECKMARK, 'Environment display complete');
  log.space();
}

/**
 * Display which config files were loaded
 */
function displayLoadedConfigFiles() {
  log.warning(SYMBOLS.FOLDER, 'Configuration Sources:');
  console.log();
  
  const paths = getConfigPaths();
  const configFiles = [
    { path: path.resolve(process.cwd(), '.env'), label: 'Project .env', priority: 1 },
    { path: path.join(paths.home, '.maiass.env'), label: 'User .maiass.env', priority: 2 },
    { path: path.join(paths.config, 'config.env'), label: 'OS Config', priority: 3 },
    { path: path.join(paths.data, 'secure.env'), label: 'OS Secure', priority: 4 }
  ];

  configFiles.forEach(({ path: filePath, label, priority }) => {
    const exists = fs.existsSync(filePath);
    const status = exists ? colors.Green(SYMBOLS.CHECK + ' LOADED') : colors.Red(SYMBOLS.X + ' Not found');
    console.log(`  ${priority}. ${colors.BBlue(label.padEnd(20))} ${status}`);
    if (exists) {
      console.log(`     ${colors.Cyan(filePath)}`);
    }
  });
}

/**
 * Display MAIASS-specific environment variables with sources and defaults
 */
function displayMaiassVariables(showSensitive, loadedFiles = []) {
  log.warning(SYMBOLS.GEAR, 'MAIASS Variables:');
  console.log();

  // Get all defined MAIASS variables
  const allVarKeys = Object.keys(MAIASS_VARIABLES).sort();
  
  if (allVarKeys.length === 0) {
    console.log(colors.Yellow('  No MAIASS variables defined'));
    return;
  }

  allVarKeys.forEach(key => {
    const varDef = MAIASS_VARIABLES[key];
    const currentValue = process.env[key];
    const isSensitive = varDef.sensitive || false;
    
    let displayValue;
    let source;
    
    if (!currentValue) {
      if (varDef.default) {
        displayValue = colors.Cyan(`${varDef.default} (default)`);
        source = colors.Yellow('default');
      } else {
        displayValue = colors.Red('(not set)');
        source = colors.Red('not set');
      }
    } else {
      if (isSensitive && !showSensitive) {
        displayValue = colors.Yellow(`***${currentValue.slice(-4)} (masked)`);
      } else {
        displayValue = colors.Green(currentValue);
      }
      source = getVariableSource(key, currentValue, loadedFiles);
      source = currentValue === varDef.default ? colors.Yellow('default') : colors.Green(source);
    }

    const keyColor = isSensitive ? colors.BRed : colors.BBlue;
    console.log(`  ${keyColor(key.padEnd(35))} = ${displayValue}`);
    console.log(`  ${' '.repeat(37)}   ${colors.Cyan(SYMBOLS.ARROW)} ${source} ${colors.White('(' + varDef.description + ')')}`);
  });
}

/**
 * Display all MAIASS-related environment variables (filtered)
 */
function displayAllEnvironmentVariables(showSensitive) {
  log.warning(SYMBOLS.WRENCH, 'All MAIASS Environment Variables:');
  console.log();

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
