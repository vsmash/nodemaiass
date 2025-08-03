#!/usr/bin/env node
/**
 * MAIASS: Modular AI-Augmented Semantic Scribe
 * Standalone bundled version for distribution
 */

const path = require('path');
const fs = require('fs');

// Embedded version and config (updated during build)
const MAIASS_VERSION = "5.3.6";
const MAIASS_CONFIG = {
  name: "maiass",
  description: "MAIASS: Modular AI-Augmented Semantic Scribe - CLI tool for AI-augmented development",
  version: MAIASS_VERSION
};

// Simple argument parsing
const args = process.argv.slice(2);
const firstArg = args[0];

// Handle version flag
if (args.includes('--version') || args.includes('-v')) {
  console.log(MAIASS_VERSION);
  process.exit(0);
}

// Handle help flag
if (args.includes('--help') || args.includes('-h') || firstArg === 'help') {
  console.log(`\nMAIASS v${MAIASS_VERSION}`);
  console.log('Modular AI-Augmented Semantic Scribe\n');
  console.log('Usage: maiass [command] [options]\n');
  console.log('Commands:');
  console.log('  hello              Print hello world');
  console.log('  version            Show version information');
  console.log('  check-updates      Check for available updates');
  console.log('\nOptions:');
  console.log('  --help, -h         Show this help message');
  console.log('  --version, -v      Show version');
  console.log('\nThis is a bundled Node.js version with limited functionality.');
  console.log('For full features, install from source or use the bash version.');
  console.log('\nHomepage: https://github.com/vsmash/maiass');
  process.exit(0);
}

// Simple color utilities
const colors = {
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  cyan: (text) => `\x1b[36m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  bold: (text) => `\x1b[1m${text}\x1b[0m`
};

// Check for updates function
async function checkForUpdates() {
  try {
    console.log(colors.cyan('🔍 Checking for MAIASS updates...'));
    
    const https = require('https');
    const url = 'https://api.github.com/repos/vsmash/maiass/releases/latest';
    
    return new Promise((resolve, reject) => {
      const req = https.get(url, {
        headers: {
          'User-Agent': 'MAIASS-CLI'
        }
      }, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            const release = JSON.parse(data);
            const latestVersion = release.tag_name?.replace('v', '') || release.name;
            
            if (latestVersion && latestVersion !== MAIASS_VERSION) {
              console.log(colors.yellow(`📦 Update available: ${MAIASS_VERSION} → ${latestVersion}`));
              console.log(colors.cyan('🍺 Update with: brew upgrade maiass'));
              console.log(colors.cyan('📖 Or visit: https://github.com/vsmash/maiass/releases'));
            } else {
              console.log(colors.green('✅ You have the latest version!'));
            }
            resolve(true);
          } catch (e) {
            console.log(colors.yellow('⚠️  Could not parse update information'));
            resolve(false);
          }
        });
      });
      
      req.on('error', (err) => {
        console.log(colors.yellow('⚠️  Could not check for updates (offline?)'));
        resolve(false);
      });
      
      req.setTimeout(5000, () => {
        req.destroy();
        console.log(colors.yellow('⚠️  Update check timed out'));
        resolve(false);
      });
    });
  } catch (error) {
    console.log(colors.yellow('⚠️  Could not check for updates'));
    return false;
  }
}

// Command routing
async function main() {
  const command = firstArg || 'hello';
  
  switch (command) {
    case 'hello':
      console.log(colors.cyan('\n🚀 Hello from MAIASS!'));
      console.log(colors.bold(`Version: ${MAIASS_VERSION}`));
      console.log('\nThis is the bundled Node.js version with basic functionality.');
      console.log('For full features, see: https://github.com/vsmash/maiass');
      
      // Auto-check for updates
      console.log('');
      await checkForUpdates();
      break;
      
    case 'version':
      console.log(colors.bold(`MAIASS v${MAIASS_VERSION}`));
      console.log(`Node.js ${process.version}`);
      console.log(`Platform: ${process.platform} ${process.arch}`);
      break;
      
    case 'check-updates':
      await checkForUpdates();
      break;
      
    default:
      console.log(colors.red(`❌ Unknown command: ${command}`));
      console.log(colors.cyan('Run `maiass --help` for available commands.'));
      console.log('\nNote: This bundled version has limited functionality.');
      console.log('For full MAIASS features, install from source:');
      console.log('https://github.com/vsmash/maiass');
      process.exit(1);
  }
}

// Run main function
main().catch(error => {
  console.error(colors.red('❌ Error:'), error.message);
  process.exit(1);
});
