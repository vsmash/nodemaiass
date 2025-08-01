#!/usr/bin/env node

/**
 * Debug test to isolate git repository detection issue
 */

import { execSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

const tempDir = path.join(os.tmpdir(), 'maiass-debug-test');
const repoPath = path.join(tempDir, 'test-repo');

// Clean up and create test repo
if (fs.existsSync(tempDir)) {
  fs.rmSync(tempDir, { recursive: true, force: true });
}
fs.mkdirSync(tempDir, { recursive: true });
fs.mkdirSync(repoPath, { recursive: true });

console.log('Creating test repository at:', repoPath);

// Initialize git repository
execSync('git init', { cwd: repoPath, stdio: 'pipe' });
execSync('git config user.name "Test User"', { cwd: repoPath, stdio: 'pipe' });
execSync('git config user.email "test@example.com"', { cwd: repoPath, stdio: 'pipe' });

// Create package.json
const packageJson = {
  name: 'debug-test',
  version: '1.0.0',
  description: 'Debug test package'
};
fs.writeFileSync(path.join(repoPath, 'package.json'), JSON.stringify(packageJson, null, 2));

// Initial commit
execSync('git add .', { cwd: repoPath, stdio: 'pipe' });
execSync('git commit -m "Initial commit"', { cwd: repoPath, stdio: 'pipe' });

console.log('Test repository created successfully');

// Test individual git command
console.log('\n=== Testing individual git command ===');
const gitResult = spawn('node', [path.resolve('../maiass.cjs'), 'git'], {
  cwd: repoPath,
  stdio: ['pipe', 'pipe', 'pipe']
});

let gitOutput = '';
gitResult.stdout.on('data', (data) => {
  gitOutput += data.toString();
});

gitResult.stderr.on('data', (data) => {
  gitOutput += data.toString();
});

gitResult.on('close', (code) => {
  console.log('Git command exit code:', code);
  console.log('Git command output:', gitOutput);
  
  // Test pipeline command
  console.log('\n=== Testing pipeline command ===');
  const pipelineResult = spawn('node', [path.resolve('../maiass.cjs'), '--dry-run', 'patch'], {
    cwd: repoPath,
    stdio: ['pipe', 'pipe', 'pipe']
  });
  
  let pipelineOutput = '';
  pipelineResult.stdout.on('data', (data) => {
    pipelineOutput += data.toString();
  });
  
  pipelineResult.stderr.on('data', (data) => {
    pipelineOutput += data.toString();
  });
  
  pipelineResult.on('close', (code) => {
    console.log('Pipeline command exit code:', code);
    console.log('Pipeline command output:', pipelineOutput);
    
    // Cleanup
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
    
    console.log('\nDebug test completed');
  });
});
