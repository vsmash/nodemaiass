// API Token validation utility for debug mode
import path from 'path';
import fs from 'fs';
import os from 'os';
import dotenv from 'dotenv';
import colors from './colors.js';
import { getConfigPaths } from './config.js';
import { SYMBOLS } from './symbols.js';

/**
 * List of API tokens to validate
 */
const API_TOKENS = [
  {
    name: 'MAIASS_AI_TOKEN',
    description: 'MAIASS AI API Token',
    minLength: 10,
    pattern: /^[a-zA-Z0-9_-]+$/
  },
  {
    name: 'OPENAI_API_KEY',
    description: 'OpenAI API Key',
    minLength: 20,
    pattern: /^sk-[a-zA-Z0-9]+$/
  }
];

/**
 * Validate if a token value appears to be valid
 * @param {string} token - The token value
 * @param {Object} tokenConfig - Token configuration
 * @returns {Object} Validation result
 */
function validateTokenValue(token, tokenConfig) {
  if (!token || token.trim() === '') {
    return { valid: false, reason: 'empty' };
  }

  const trimmedToken = token.trim();
  
  if (trimmedToken.length < tokenConfig.minLength) {
    return { valid: false, reason: 'too_short' };
  }

  if (tokenConfig.pattern && !tokenConfig.pattern.test(trimmedToken)) {
    return { valid: false, reason: 'invalid_format' };
  }

  return { valid: true, reason: 'valid' };
}

/**
 * Load environment variables from a specific file without affecting global env
 * @param {string} filePath - Path to the environment file
 * @returns {Object} Environment variables from the file
 */
function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  try {
    const result = dotenv.config({ path: filePath, processEnv: {} });
    return result.parsed || {};
  } catch (error) {
    return null;
  }
}

/**
 * Get the status symbol and color for validation result
 * @param {Object} validation - Validation result
 * @returns {Object} Symbol and color info
 */
function getValidationDisplay(validation) {
  if (!validation) {
    return { symbol: colors.Gray(SYMBOLS.MINUS), status: 'not found', color: colors.Gray };
  }

  switch (validation.reason) {
    case 'valid':
      return { symbol: colors.Green(SYMBOLS.CHECK), status: 'valid', color: colors.Green };
    case 'empty':
      return { symbol: colors.Yellow(SYMBOLS.WARNING), status: 'empty', color: colors.Yellow };
    case 'too_short':
      return { symbol: colors.Red(SYMBOLS.CROSS), status: 'too short', color: colors.Red };
    case 'invalid_format':
      return { symbol: colors.Red(SYMBOLS.CROSS), status: 'invalid format', color: colors.Red };
    default:
      return { symbol: colors.Red(SYMBOLS.CROSS), status: 'invalid', color: colors.Red };
  }
}

/**
 * Display API token validation results for debug mode
 * Only displays when MAIASS_DEBUG is enabled
 */
export function displayTokenValidation() {
  // Only run in debug mode
  if (process.env.MAIASS_DEBUG !== 'true') {
    return;
  }

  console.log(colors.Blue('\n[DEBUG] API Token Validation:'));
  
  const paths = getConfigPaths();
  
  // Define environment files in priority order (same as config.js)
  const envFiles = [
    {
      path: path.join(paths.data, 'secure.env'),
      name: 'secure.env (OS secure)',
      priority: 1
    },
    {
      path: path.join(paths.config, 'config.env'),
      name: 'config.env (OS config)',
      priority: 2
    },
    {
      path: path.join(paths.home, '.maiass.env'),
      name: '.maiass.env (user home)',
      priority: 3
    },
    {
      path: path.resolve(process.cwd(), '.env.maiass'),
      name: '.env.maiass (project)',
      priority: 4
    }
  ];

  // Check each environment file
  envFiles.forEach(envFile => {
    console.log(colors.Blue(`\n[DEBUG] Checking ${envFile.name}:`));
    console.log(colors.Gray(`[DEBUG]   Path: ${envFile.path}`));
    
    const envVars = loadEnvFile(envFile.path);
    
    if (!envVars) {
      console.log(colors.Gray(`[DEBUG]   ${SYMBOLS.MINUS} File not found or unreadable`));
      return;
    }

    console.log(colors.Green(`[DEBUG]   ${SYMBOLS.CHECK} File loaded successfully`));
    
    // Check each API token
    API_TOKENS.forEach(tokenConfig => {
      const tokenValue = envVars[tokenConfig.name];
      const validation = tokenValue ? validateTokenValue(tokenValue, tokenConfig) : null;
      const display = getValidationDisplay(validation);
      
      console.log(`[DEBUG]     ${display.symbol} ${tokenConfig.description} (${tokenConfig.name}): ${display.color(display.status)}`);
      
      if (validation && validation.valid) {
        // Show partial token for confirmation (first 8 chars + ...)
        const maskedToken = tokenValue.substring(0, 8) + '...';
        console.log(colors.Gray(`[DEBUG]       Preview: ${maskedToken}`));
      }
    });
  });

  // Show final token resolution (what's actually in process.env after all files loaded)
  console.log(colors.Blue('\n[DEBUG] Final Token Resolution (after all files loaded):'));
  API_TOKENS.forEach(tokenConfig => {
    const tokenValue = process.env[tokenConfig.name];
    const validation = tokenValue ? validateTokenValue(tokenValue, tokenConfig) : null;
    const display = getValidationDisplay(validation);
    
    console.log(`[DEBUG]   ${display.symbol} ${tokenConfig.description} (${tokenConfig.name}): ${display.color(display.status)}`);
    
    if (validation && validation.valid) {
      const maskedToken = tokenValue.substring(0, 8) + '...';
      console.log(colors.Gray(`[DEBUG]     Active: ${maskedToken}`));
    }
  });
  
  console.log(colors.Blue('[DEBUG] Token validation complete.\n'));
}

export default {
  displayTokenValidation,
  validateTokenValue,
  API_TOKENS
};
