// Configuration command handler for MAIASSNODE CLI
// Implements: nma config [options] [key[=value]]

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
  
  console.log(colors.BCyan(`${SYMBOLS.GEAR} Configuration Status`));
  console.log();
  
  if (showPaths) {
    console.log(colors.BBlue('📁 Configuration Files:'));
    console.log();
    
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
  
  console.log(colors.BBlue('⚙️  Configuration Values:'));
  console.log();
  
  // Group by category for better display
  const categories = {
    'Core System': ['MAIASS_DEBUG', 'MAIASS_VERBOSITY', 'MAIASS_LOGGING', 'MAIASS_BRAND'],
    'OpenAI Integration': ['MAIASS_OPENAI_MODE', 'MAIASS_OPENAI_TOKEN', 'MAIASS_OPENAI_MODEL', 'MAIASS_OPENAI_TEMPERATURE', 'MAIASS_OPENAI_ENDPOINT', 'MAIASS_OPENAI_MAX_CHARACTERS', 'MAIASS_OPENAI_COMMIT_MESSAGE_STYLE'],
    'Git Branches': ['MAIASS_DEVELOPBRANCH', 'MAIASS_STAGINGBRANCH', 'MAIASS_MASTERBRANCH'],
    'Repository Settings': ['MAIASS_REPO_TYPE', 'MAIASS_GITHUB_OWNER', 'MAIASS_GITHUB_REPO', 'MAIASS_BITBUCKET_WORKSPACE', 'MAIASS_BITBUCKET_REPO_SLUG'],
    'Pull Requests': ['MAIASS_STAGING_PULLREQUESTS', 'MAIASS_MASTER_PULLREQUESTS'],
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
          'project': colors.BGreen,
          'global': colors.BBlue,
          'default': colors.Gray,
          'not_set': colors.BYellow
        }[info.source] || colors.White;
        
        const sourceText = {
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
        'project': colors.BGreen,
        'global': colors.BBlue,
        'default': colors.Gray,
        'not_set': colors.BYellow
      }[info.source] || colors.White;
      
      const sourceText = {
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
 * Handle config command
 * @param {Object} args - Command arguments from yargs
 */
export async function handleConfigCommand(args) {
  const {
    global: isGlobal,
    project: isProject,
    edit,
    list,
    'show-sensitive': showSensitive,
    'list-vars': listVars,
    key
  } = args;
  
  const paths = getConfigPaths();
  
  try {
    // Handle --list-vars flag
    if (listVars) {
      console.log(colors.BCyan(`${SYMBOLS.INFO} Available Configuration Variables:`));
      console.log();
      
      Object.entries(MAIASS_VARIABLES).forEach(([key, def]) => {
        const displayKey = key.replace('MAIASS_', '').toLowerCase();
        const sensitive = def.sensitive ? colors.BYellow(' (sensitive)') : '';
        console.log(`  ${colors.BWhite(displayKey.padEnd(30))} - ${colors.Gray(def.description)}${sensitive}`);
      });
      
      console.log();
      console.log(colors.BBlue(`${SYMBOLS.INFO} Usage examples:`));
      console.log(`  nma config --global openai_token=your_token_here`);
      console.log(`  nma config --project debug=true`);
      console.log(`  nma config verbosity`);
      return;
    }
    
    // Handle --edit flag
    if (edit) {
      const configPath = isGlobal ? paths.global : 
                        isProject ? paths.project : 
                        paths.project; // Default to project
      
      console.log(colors.BBlue(`${SYMBOLS.INFO} Editing ${isGlobal ? 'global' : 'project'} configuration...`));
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
        setConfigValue(configPath, key, value);
        
        const varDef = MAIASS_VARIABLES[key];
        const displayKey = rawKey.toLowerCase();
        let displayValue = value;
        
        if (varDef.sensitive) {
          displayValue = '***' + value.slice(-4);
        }
        
        console.log(colors.BGreen(`${SYMBOLS.CHECKMARK} Configuration updated`));
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
          'project': colors.BGreen,
          'global': colors.BBlue,
          'default': colors.Gray,
          'not_set': colors.BYellow
        }[valueInfo.source] || colors.White;
        
        console.log(colors.BCyan(`${SYMBOLS.INFO} Configuration Value:`));
        console.log();
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
