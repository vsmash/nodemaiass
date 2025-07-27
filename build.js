#!/usr/bin/env node
/**
 * Cross-platform build script for maiassnode
 * Builds binaries for all supported platforms and architectures
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import colors from './lib/colors.js';

const targets = [
  'node18-macos-x64',
  'node18-macos-arm64', 
  'node18-linux-x64',
  'node18-linux-arm64',
  'node18-win-x64',
  'node18-win-arm64'
];

const platformNames = {
  'node18-macos-x64': 'macOS Intel',
  'node18-macos-arm64': 'macOS Apple Silicon',
  'node18-linux-x64': 'Linux x64',
  'node18-linux-arm64': 'Linux ARM64',
  'node18-win-x64': 'Windows x64',
  'node18-win-arm64': 'Windows ARM64'
};

function buildForTarget(target) {
  console.log(colors.BBlue(`Building for ${platformNames[target]}...`));
  
  try {
    execSync(`npx pkg . --target ${target}`, {
      stdio: 'inherit',
      encoding: 'utf8'
    });
    console.log(colors.Green(`✓ Successfully built for ${platformNames[target]}`));
    return true;
  } catch (error) {
    console.log(colors.Red(`✗ Failed to build for ${platformNames[target]}: ${error.message}`));
    return false;
  }
}

function main() {
  console.log(colors.Aqua('MAIASSNODE Cross-Platform Build'));
  console.log(colors.White('Building binaries for all supported platforms...\n'));

  // Ensure build directory exists
  if (!fs.existsSync('build')) {
    fs.mkdirSync('build');
  }

  let successful = 0;
  let failed = 0;

  for (const target of targets) {
    if (buildForTarget(target)) {
      successful++;
    } else {
      failed++;
    }
    console.log(''); // Add spacing between builds
  }

  console.log(colors.White('\n=== Build Summary ==='));
  console.log(colors.Green(`Successful builds: ${successful}`));
  if (failed > 0) {
    console.log(colors.Red(`Failed builds: ${failed}`));
  }
  
  if (successful === targets.length) {
    console.log(colors.Green('\n🎉 All builds completed successfully!'));
    console.log(colors.White('Binaries are available in the build/ directory'));
  } else {
    console.log(colors.Yellow('\n⚠️  Some builds failed. Check the output above for details.'));
  }
}

main();
