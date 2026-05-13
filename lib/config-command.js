// Configuration command handler for MAIASS CLI
// Implements: nma config [options] [key[=value]]

import { log, logger } from './logger.js';
import colors from './colors.js';
import { SYMBOLS } from './symbols.js';
import { MAIASS_VARIABLES } from './maiass-variables.js';
import {
  getConfigPaths,
  configExists,
  readConfig,
  writeConfig,
  setConfigValue,
  getConfigValue,
  listConfig,
  editConfig,
  validateConfig
} from './config-manager.js';

/**
 * Display configuration values in a formatted table
 * @param {Object} config - Configuration data from listConfig()
 * @param {Object} options - Display options
 */
function displayConfig(config, options = {}) {
  const { scope = 'all', showSensitive = false, showPaths = true } = options;
  
  logger.header(SYMBOLS.GEAR, 'Configuration Status');
  
  if (showPaths) {
    logger.section('Configuration Files:', colors.BBlue);
    
    const globalStatus = config.files.global.exists ? 
      colors.BGreen(`${SYMBOLS.CHECKMARK} EXISTS`) : 
      colors.BYellow(`${SYMBOLS.WARNING} Not found`);
    
    const projectStatus = config.files.project.exists ? 
      colors.BGreen(`${SYMBOLS.CHECKMARK} EXISTS`) : 
      colors.BYellow(`${SYMBOLS.WARNING} Not found`);
    
    console.log(`  1. Global Config      ${globalStatus}`);
    console.log(`     ${colors.Gray(config.files.global.path)}`);
    console.log(`  2. Project Config     ${projectStatus}`);
    console.log(`     ${colors.Gray(config.files.project.path)}`);
    console.log();
  }
  
  // Filter variables based on scope
  let varsToShow = Object.entries(config.merged);
  
  if (scope === 'global') {
    varsToShow = varsToShow.filter(([key, info]) => info.source === 'global');
  } else if (scope === 'project') {
    varsToShow = varsToShow.filter(([key, info]) => info.source === 'project');
  } else if (scope === 'set') {
    varsToShow = varsToShow.filter(([key, info]) => info.source !== 'default' && info.source !== 'not_set');
  }
  
  if (varsToShow.length === 0) {
    console.log(colors.BYellow(`${SYMBOLS.INFO} No configuration values found for scope: ${scope}`));
    return;
  }
  
  logger.section('Configuration Values:', colors.BBlue);
  
  // Group by category for better display
  const categories = {
    'Core System': ['MAIASS_DEBUG', 'MAIASS_VERBOSITY', 'MAIASS_LOGGING', 'MAIASS_BRAND'],
    'AI Integration': ['MAIASS_AI_MODE', 'MAIASS_AI_TOKEN', 'MAIASS_AI_MODEL', 'MAIASS_AI_TEMPERATURE', 'MAIASS_AI_HOST', 'MAIASS_AI_MAX_CHARACTERS', 'MAIASS_AI_COMMIT_MESSAGE_STYLE'],
    'Git Branches': ['MAIASS_DEVELOPBRANCH', 'MAIASS_STAGINGBRANCH', 'MAIASS_MAINBRANCH'],
    'Repository Settings': ['MAIASS_REPO_TYPE', 'MAIASS_GITHUB_OWNER', 'MAIASS_GITHUB_REPO', 'MAIASS_BITBUCKET_WORKSPACE', 'MAIASS_BITBUCKET_REPO_SLUG'],
    'Pull Requests': ['MAIASS_DEVELOP_PULLREQUESTS'],
    'Version Management': ['MAIASS_VERSION_PATH', 'MAIASS_VERSION_PRIMARY_FILE', 'MAIASS_VERSION_PRIMARY_TYPE', 'MAIASS_VERSION_PRIMARY_LINE_START', 'MAIASS_VERSION_SECONDARY_FILES'],
    'Changelog': ['MAIASS_CHANGELOG_PATH', 'MAIASS_CHANGELOG_NAME', 'MAIASS_CHANGELOG_INTERNAL_NAME']
  };
  
  Object.entries(categories).forEach(([categoryName, categoryVars]) => {
    const categoryEntries = varsToShow.filter(([key]) => categoryVars.includes(key));
    
    if (categoryEntries.length > 0) {
      console.log(colors.BWhite(`  ${categoryName}:`));
      console.log();
      
      categoryEntries.forEach(([key, info]) => {
        const displayKey = key.replace('MAIASS_', '').toLowerCase();
        const sourceColor = {
          'project local': colors.BCyan,
          'project': colors.BGreen,
          'global': colors.BBlue,
          'default': colors.Gray,
          'not_set': colors.BYellow
        }[info.source] || colors.White;
        
        const sourceText = {
          'project local': 'project local',
          'project': 'project',
          'global': 'global',
          'default': 'default',
          'not_set': 'not set'
        }[info.source];
        
        let displayValue = info.value || '(not set)';
        if (info.sensitive && !showSensitive && info.value) {
          displayValue = '***' + info.value.slice(-4);
        }
        
        console.log(`    ${colors.BWhite(displayKey.padEnd(25))} = ${colors.White(displayValue)}`);
        console.log(`    ${' '.repeat(25)}   ${sourceColor(`→ ${sourceText}`)} ${colors.Gray(`(${info.description})`)}`);
        console.log();
      });
    }
  });
  
  // Show other variables not in categories
  const otherEntries = varsToShow.filter(([key]) => 
    !Object.values(categories).flat().includes(key)
  );
  
  if (otherEntries.length > 0) {
    console.log(colors.BWhite('  Other Settings:'));
    console.log();
    
    otherEntries.forEach(([key, info]) => {
      const displayKey = key.replace('MAIASS_', '').toLowerCase();
      const sourceColor = {
        'project local': colors.BCyan,
        'project': colors.BGreen,
        'global': colors.BBlue,
        'default': colors.Gray,
        'not_set': colors.BYellow
      }[info.source] || colors.White;
      
      const sourceText = {
        'project local': 'project local',
        'project': 'project',
        'global': 'global',
        'default': 'default',
        'not_set': 'not set'
      }[info.source];
      
      let displayValue = info.value || '(not set)';
      if (info.sensitive && !showSensitive && info.value) {
        displayValue = '***' + info.value.slice(-4);
      }
      
      console.log(`    ${colors.BWhite(displayKey.padEnd(25))} = ${colors.White(displayValue)}`);
      console.log(`    ${' '.repeat(25)}   ${sourceColor(`→ ${sourceText}`)} ${colors.Gray(`(${info.description})`)}`);
      console.log();
    });
  }
}

/**
 * Print help for the `config` subcommand.
 * Only fires when handleConfigCommand is invoked with help:true on the options
 * object — the top-level `--help` flag in maiass.mjs short-circuits before
 * subcommand dispatch.
 */
function printConfigHelp() {
  console.log('');
  console.log(colors.BWhite('maiass config — manage MAIASS configuration'));
  console.log('');
  console.log('Usage:');
  console.log('  maiass config                            Show merged config (all sources)');
  console.log('  maiass config <key>                      Show one value (e.g. ai_mode)');
  console.log('  maiass config <key>=<value>              Set value in project config');
  console.log('  maiass config --global <key>=<value>     Set value in global config (~/.env.maiass)');
  console.log('  maiass config --project <key>=<value>    Set value in project config (./.env.maiass)');
  console.log('  maiass config --edit [--global|--project]  Open config file in $EDITOR');
  console.log('  maiass config --list                     Show only values that have been set');
  console.log('  maiass config --list-vars                List all supported variable names');
  console.log('  maiass config --show-sensitive           Reveal masked values (e.g. tokens)');
  console.log('');
  console.log('Keys may be given without the MAIASS_ prefix and in lower case.');
  console.log('Examples:');
  console.log('  maiass config ai_mode=ask');
  console.log('  maiass config --global ai_token=sk-...');
  console.log('  maiass config debug');
  console.log('');
}

/**
 * Handle config command
 * @param {Object|Array} args - Either a raw argv array (from process.argv.slice)
 *   or a yargs-style options object. The dispatcher in maiass.mjs passes an
 *   array; tests / future yargs wiring may pass an object. We normalise here
 *   so both shapes work — the same dual-shape pattern handleVersionCommand uses.
 */
export async function handleConfigCommand(args) {
  let isGlobal, isProject, edit, list, showSensitive, listVars, key, helpRequested;

  if (Array.isArray(args)) {
    // Argv form: e.g. ['--global', 'ai_mode=ask'] or ['ai_mode'] or ['--list-vars']
    isGlobal = args.includes('--global');
    isProject = args.includes('--project');
    edit = args.includes('--edit');
    list = args.includes('--list');
    showSensitive = args.includes('--show-sensitive');
    listVars = args.includes('--list-vars');
    helpRequested = args.includes('--help') || args.includes('-h');
    // First non-flag argument becomes the key/key=value token
    key = args.find(a => !a.startsWith('-'));
  } else if (args && typeof args === 'object') {
    ({
      global: isGlobal,
      project: isProject,
      edit,
      list,
      'show-sensitive': showSensitive,
      'list-vars': listVars,
      help: helpRequested,
      key
    } = args);
  }

  // Print subcommand-specific help if explicitly requested with `config --help`.
  // (The top-level --help branch in maiass.mjs exits before we get here, so this
  //  only fires when callers invoke handleConfigCommand directly with help:true.)
  if (helpRequested) {
    printConfigHelp();
    return;
  }

  const paths = getConfigPaths();
  
  try {
    // Handle --list-vars flag
    if (listVars) {
      log.info(SYMBOLS.INFO, 'Available Configuration Variables:');
      log.space();
      
      Object.entries(MAIASS_VARIABLES).forEach(([key, def]) => {
        const displayKey = key.replace('MAIASS_', '').toLowerCase();
        const sensitive = def.sensitive ? colors.BYellow(' (sensitive)') : '';
        console.log(`  ${colors.BWhite(displayKey.padEnd(30))} - ${colors.Gray(def.description)}${sensitive}`);
      });
      
      log.space();
      log.blue(SYMBOLS.INFO, 'Usage examples:');
      console.log(`  maiass config --global ai_token=your_token_here`);
      console.log(`  maiass config --project debug=true`);
      console.log(`  maiass config ai_mode=ask           # writes to project config`);
      console.log(`  maiass config verbosity              # show current value`);
      return;
    }
    
    // Handle --edit flag
    if (edit) {
      const configPath = isGlobal ? paths.global : 
                        isProject ? paths.project : 
                        paths.project; // Default to project
      
      log.blue(SYMBOLS.INFO, `Editing ${isGlobal ? 'global' : 'project'} configuration...`);
      editConfig(configPath);
      return;
    }
    
    // Handle key=value assignment
    if (key) {
      const arg = key;
      
      if (arg.includes('=')) {
        // Set configuration value
        const [rawKey, ...valueParts] = arg.split('=');
        const key = `MAIASS_${rawKey.toUpperCase()}`;
        const value = valueParts.join('=');
        
        // Validate key exists
        if (!MAIASS_VARIABLES[key]) {
          console.error(colors.Red(`${SYMBOLS.CROSS} Unknown configuration variable: ${rawKey}`));
          console.log(colors.BYellow(`${SYMBOLS.INFO} Use --list-vars to see available variables`));
          return;
        }
        
        // Determine target config file
        const configPath = isGlobal ? paths.global : paths.project;
        const scope = isGlobal ? 'global' : 'project';
        
        // Validate value
        const tempConfig = { [key]: value };
        const errors = validateConfig(tempConfig);
        
        if (errors.length > 0) {
          console.error(colors.Red(`${SYMBOLS.CROSS} Configuration validation failed:`));
          errors.forEach(error => {
            console.error(colors.Red(`  ${error.key}: ${error.error}`));
            if (error.current) {
              console.error(colors.Gray(`    Current value: ${error.current}`));
            }
          });
          return;
        }
        
        // Set the value
        setConfigValue(key, value, { global: isGlobal });
        
        const varDef = MAIASS_VARIABLES[key];
        const displayKey = rawKey.toLowerCase();
        let displayValue = value;
        
        if (varDef.sensitive) {
          displayValue = '***' + value.slice(-4);
        }
        
        log.success(SYMBOLS.CHECKMARK, 'Configuration updated');
        console.log(`  ${colors.BWhite(displayKey)} = ${colors.White(displayValue)} ${colors.Gray(`(${scope})`)}`);
        console.log(`  ${colors.Gray(`File: ${configPath}`)}`);
        
      } else {
        // Get specific configuration value
        const rawKey = arg;
        const key = `MAIASS_${rawKey.toUpperCase()}`;
        
        if (!MAIASS_VARIABLES[key]) {
          console.error(colors.Red(`${SYMBOLS.CROSS} Unknown configuration variable: ${rawKey}`));
          console.log(colors.BYellow(`${SYMBOLS.INFO} Use --list-vars to see available variables`));
          return;
        }
        
        const valueInfo = getConfigValue(key);
        const varDef = MAIASS_VARIABLES[key];
        
        let displayValue = valueInfo.value || '(not set)';
        if (varDef.sensitive && !showSensitive && valueInfo.value) {
          displayValue = '***' + valueInfo.value.slice(-4);
        }
        
        const sourceColor = {
          'project local': colors.BCyan,
          'project': colors.BGreen,
          'global': colors.BBlue,
          'default': colors.Gray,
          'not_set': colors.BYellow
        }[valueInfo.source] || colors.White;
        
        log.info(SYMBOLS.INFO, 'Configuration Value:');
        log.space();
        console.log(`  ${colors.BWhite(rawKey.toLowerCase())} = ${colors.White(displayValue)}`);
        console.log(`  ${sourceColor(`→ ${valueInfo.source}`)} ${colors.Gray(`(${varDef.description})`)}`);
        
        if (valueInfo.path) {
          console.log(`  ${colors.Gray(`File: ${valueInfo.path}`)}`);
        }
      }
      
      return;
    }
    
    // Default: show configuration
    const config = listConfig({ showSensitive });
    
    let scope = 'all';
    if (isGlobal && !isProject) scope = 'global';
    else if (isProject && !isGlobal) scope = 'project';
    else if (list) scope = 'set';
    
    displayConfig(config, { 
      scope, 
      showSensitive, 
      showPaths: scope === 'all' 
    });
    
  } catch (error) {
    console.error(colors.Red(`${SYMBOLS.CROSS} Configuration error: ${error.message}`));
    process.exit(1);
  }
}
