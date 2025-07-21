#!/usr/bin/env node
// Helper script to set up environment variables in secure locations
import { getSecureEnvPath, getConfigEnvPath, ensureConfigDirectories } from './lib/config.js';
import fs from 'fs';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function setupEnvironment() {
  console.log('🔧 MAIASSNODE Environment Setup');
  console.log('===============================\n');
  
  ensureConfigDirectories();
  
  const secureEnvPath = getSecureEnvPath();
  const configEnvPath = getConfigEnvPath();
  
  console.log(`Secure variables will be stored in: ${secureEnvPath}`);
  console.log(`General config will be stored in: ${configEnvPath}\n`);
  
  // Check if files already exist
  const secureExists = fs.existsSync(secureEnvPath);
  const configExists = fs.existsSync(configEnvPath);
  
  if (secureExists || configExists) {
    console.log('⚠️  Configuration files already exist:');
    if (secureExists) console.log(`   - ${secureEnvPath}`);
    if (configExists) console.log(`   - ${configEnvPath}`);
    
    const overwrite = await prompt('\nDo you want to update them? (y/N): ');
    if (overwrite.toLowerCase() !== 'y') {
      console.log('Setup cancelled.');
      rl.close();
      return;
    }
  }
  
  // Collect sensitive variables
  console.log('\n📝 Setting up sensitive variables (stored securely):');
  const openaiKey = await prompt('OpenAI API Key (optional): ');
  
  // Collect general config
  console.log('\n⚙️  Setting up general configuration:');
  const defaultBranch = await prompt('Default branch name (default: main): ') || 'main';
  const developBranch = await prompt('Development branch name (default: develop): ') || 'develop';
  
  // Write secure env file
  if (openaiKey.trim()) {
    const secureContent = `# Sensitive environment variables for MAIASSNODE
# This file is stored in a secure OS-specific location
OPENAI_API_KEY=${openaiKey.trim()}
`;
    fs.writeFileSync(secureEnvPath, secureContent, { mode: 0o600 }); // Secure permissions
    console.log(`✅ Secure variables saved to: ${secureEnvPath}`);
  }
  
  // Write general config file
  const configContent = `# General configuration for MAIASSNODE
# This file contains non-sensitive settings
DEFAULT_BRANCH=${defaultBranch}
DEVELOP_BRANCH=${developBranch}
MAIASS_VERSION=0.2.0
`;
  fs.writeFileSync(configEnvPath, configContent);
  console.log(`✅ General config saved to: ${configEnvPath}`);
  
  console.log('\n🎉 Environment setup complete!');
  console.log('\nYou can also create project-specific .env files in your working directories.');
  console.log('Priority order: .env (cwd) > ~/.maiass.env > config.env > secure.env');
  
  rl.close();
}

setupEnvironment().catch(console.error);
