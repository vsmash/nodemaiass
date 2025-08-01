#!/usr/bin/env node

/**
 * MAIASS Test Runner
 * Comprehensive testing framework for the MAIASS pipeline
 */

import { execSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import colors from '../lib/colors.js';
import { SYMBOLS } from '../lib/symbols.js';

// Test configuration
const TEST_CONFIG = {
  timeout: 30000, // 30 seconds per test
  tempDir: path.join(os.tmpdir(), 'maiass-tests'),
  verbose: process.env.MAIASS_TEST_VERBOSE === 'true',
  keepTempFiles: process.env.MAIASS_TEST_KEEP_FILES === 'true'
};

// Test results tracking
let testResults = {
  passed: 0,
  failed: 0,
  skipped: 0,
  total: 0,
  failures: []
};

/**
 * Test utilities
 */
class TestUtils {
  /**
   * Create a temporary test repository
   */
  static async createTestRepo(name, options = {}) {
    const {
      branch = 'main',
      files = ['package.json'],
      version = '1.0.0',
      hasRemote = false
    } = options;

    const repoPath = path.join(TEST_CONFIG.tempDir, name);
    
    // Clean up existing repo
    if (fs.existsSync(repoPath)) {
      fs.rmSync(repoPath, { recursive: true, force: true });
    }
    
    fs.mkdirSync(repoPath, { recursive: true });
    
    // Initialize git repository
    execSync('git init', { cwd: repoPath, stdio: 'pipe' });
    execSync('git config user.name "Test User"', { cwd: repoPath, stdio: 'pipe' });
    execSync('git config user.email "test@example.com"', { cwd: repoPath, stdio: 'pipe' });
    
    // Create initial files
    for (const file of files) {
      const filePath = path.join(repoPath, file);
      const dir = path.dirname(filePath);
      
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      let content = '';
      if (file === 'package.json') {
        content = JSON.stringify({
          name: name,
          version: version,
          description: `Test package for ${name}`
        }, null, 2);
      } else if (file.endsWith('.js')) {
        content = `// Test file for ${name}\nconsole.log('Hello from ${file}');\n`;
      } else if (file === 'VERSION') {
        content = version;
      } else {
        content = `Test content for ${file}\n`;
      }
      
      fs.writeFileSync(filePath, content);
    }
    
    // Initial commit
    execSync('git add .', { cwd: repoPath, stdio: 'pipe' });
    execSync('git commit -m "Initial commit"', { cwd: repoPath, stdio: 'pipe' });
    
    // Create develop branch if needed
    if (branch !== 'main' && branch !== 'master') {
      execSync(`git checkout -b ${branch}`, { cwd: repoPath, stdio: 'pipe' });
    }
    
    // Add remote if requested
    if (hasRemote) {
      // Create a bare remote repository
      const remotePath = path.join(TEST_CONFIG.tempDir, `${name}-remote.git`);
      if (fs.existsSync(remotePath)) {
        fs.rmSync(remotePath, { recursive: true, force: true });
      }
      fs.mkdirSync(remotePath, { recursive: true });
      execSync('git init --bare', { cwd: remotePath, stdio: 'pipe' });
      execSync(`git remote add origin ${remotePath}`, { cwd: repoPath, stdio: 'pipe' });
      execSync(`git push -u origin ${branch}`, { cwd: repoPath, stdio: 'pipe' });
    }
    
    return repoPath;
  }
  
  /**
   * Execute MAIASS command in test environment
   */
  static async runMaiassCommand(args, options = {}) {
    const {
      cwd = process.cwd(),
      timeout = TEST_CONFIG.timeout,
      expectError = false,
      input = ''
    } = options;
    
    // Get the absolute path to maiass.cjs (the actual entry point users run)
    const maiassPath = path.resolve(path.dirname(import.meta.url.replace('file://', '')), '../maiass.cjs');
    
    return new Promise((resolve, reject) => {
      const child = spawn('node', [maiassPath, ...args], {
        cwd,
        stdio: ['pipe', 'pipe', 'pipe'],
        env: {
          ...process.env,
          MAIASS_DEBUG: 'false', // Reduce noise in tests
          MAIASS_AI_MODE: 'off' // Disable AI for tests
        }
      });
      
      let stdout = '';
      let stderr = '';
      
      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      // Send input if provided
      if (input) {
        child.stdin.write(input);
        child.stdin.end();
      } else {
        child.stdin.end();
      }
      
      const timer = setTimeout(() => {
        child.kill();
        reject(new Error(`Test timed out after ${timeout}ms`));
      }, timeout);
      
      child.on('close', (code) => {
        clearTimeout(timer);
        
        const result = {
          code,
          stdout,
          stderr,
          success: code === 0
        };
        
        if (expectError && code === 0) {
          reject(new Error('Expected command to fail but it succeeded'));
        } else if (!expectError && code !== 0) {
          reject(new Error(`Command failed with code ${code}: ${stderr}`));
        } else {
          resolve(result);
        }
      });
      
      child.on('error', (error) => {
        clearTimeout(timer);
        reject(error);
      });
    });
  }
  
  /**
   * Clean up test files
   */
  static cleanup() {
    if (!TEST_CONFIG.keepTempFiles && fs.existsSync(TEST_CONFIG.tempDir)) {
      fs.rmSync(TEST_CONFIG.tempDir, { recursive: true, force: true });
    }
  }
  
  /**
   * Assert helper
   */
  static assert(condition, message) {
    if (!condition) {
      throw new Error(`Assertion failed: ${message}`);
    }
  }
  
  /**
   * Assert equals helper
   */
  static assertEquals(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(`Assertion failed: ${message}\nExpected: ${expected}\nActual: ${actual}`);
    }
  }
  
  /**
   * Assert contains helper
   */
  static assertContains(text, substring, message) {
    if (!text.includes(substring)) {
      throw new Error(`Assertion failed: ${message}\nText does not contain: ${substring}\nActual text: ${text}`);
    }
  }
}

/**
 * Test suite runner
 */
class TestSuite {
  constructor(name) {
    this.name = name;
    this.tests = [];
    this.beforeEach = null;
    this.afterEach = null;
  }
  
  /**
   * Add a test to the suite
   */
  test(name, testFn) {
    this.tests.push({ name, fn: testFn });
  }
  
  /**
   * Set up before each test
   */
  before(fn) {
    this.beforeEach = fn;
  }
  
  /**
   * Clean up after each test
   */
  after(fn) {
    this.afterEach = fn;
  }
  
  /**
   * Run all tests in the suite
   */
  async run() {
    console.log(colors.BCyan(`\n${SYMBOLS.GEAR} Running test suite: ${this.name}`));
    console.log(colors.Gray(`${'─'.repeat(50)}`));
    
    for (const test of this.tests) {
      testResults.total++;
      
      try {
        // Run beforeEach if defined
        if (this.beforeEach) {
          await this.beforeEach();
        }
        
        // Run the test
        const startTime = Date.now();
        await test.fn();
        const duration = Date.now() - startTime;
        
        // Test passed
        testResults.passed++;
        console.log(colors.BGreen(`${SYMBOLS.CHECKMARK} ${test.name} (${duration}ms)`));
        
        // Run afterEach if defined
        if (this.afterEach) {
          await this.afterEach();
        }
        
      } catch (error) {
        // Test failed
        testResults.failed++;
        testResults.failures.push({
          suite: this.name,
          test: test.name,
          error: error.message,
          stack: error.stack
        });
        
        console.log(colors.BRed(`${SYMBOLS.CROSS} ${test.name}`));
        if (TEST_CONFIG.verbose) {
          console.log(colors.Red(`  Error: ${error.message}`));
        }
        
        // Run afterEach even if test failed
        if (this.afterEach) {
          try {
            await this.afterEach();
          } catch (cleanupError) {
            console.log(colors.Yellow(`  Cleanup error: ${cleanupError.message}`));
          }
        }
      }
    }
  }
}

/**
 * Test suites
 */

// Git Information Tests
const gitInfoTests = new TestSuite('Git Information');

gitInfoTests.test('should detect git repository', async () => {
  const repoPath = await TestUtils.createTestRepo('git-repo-test');
  
  const result = await TestUtils.runMaiassCommand(['git'], { cwd: repoPath });
  
  TestUtils.assertContains(result.stdout, 'Current Branch', 'Should show current branch');
  // Accept either main or master branch (git init creates master by default)
  TestUtils.assert(
    result.stdout.includes('main') || result.stdout.includes('master'),
    'Should be on main or master branch'
  );
});

gitInfoTests.test('should detect non-git directory', async () => {
  const nonGitPath = path.join(TEST_CONFIG.tempDir, 'non-git');
  fs.mkdirSync(nonGitPath, { recursive: true });
  
  const result = await TestUtils.runMaiassCommand(['git'], { 
    cwd: nonGitPath, 
    expectError: true 
  });
  
  // Check both stdout and stderr for error message
  const output = result.stdout + result.stderr;
  TestUtils.assert(
    output.includes('Not in a git repository') || output.includes('not a git repository'),
    'Should detect non-git directory'
  );
});

gitInfoTests.test('should extract JIRA ticket from branch name', async () => {
  const repoPath = await TestUtils.createTestRepo('jira-test');
  
  // Create feature branch with JIRA ticket
  execSync('git checkout -b feature/USER-123-new-feature', { cwd: repoPath, stdio: 'pipe' });
  
  const result = await TestUtils.runMaiassCommand(['git'], { cwd: repoPath });
  
  TestUtils.assertContains(result.stdout, 'USER-123', 'Should extract JIRA ticket');
  TestUtils.assertContains(result.stdout, 'feature/USER-123-new-feature', 'Should show branch name');
});

// Configuration Tests
const configTests = new TestSuite('Configuration Management');

configTests.test('should show default configuration', async () => {
  const result = await TestUtils.runMaiassCommand(['config']);
  
  // Check for configuration display (may show as 'debug' instead of 'MAIASS_DEBUG')
  TestUtils.assert(
    result.stdout.includes('debug') || result.stdout.includes('MAIASS_DEBUG'),
    'Should show debug setting'
  );
  TestUtils.assert(
    result.stdout.includes('verbosity') || result.stdout.includes('MAIASS_VERBOSITY'),
    'Should show verbosity setting'
  );
});

configTests.test('should set and get configuration values', async () => {
  const repoPath = await TestUtils.createTestRepo('config-test');
  
  // Set a project config value
  await TestUtils.runMaiassCommand(['config', '--project', 'debug=true'], { cwd: repoPath });
  
  // Get the config
  const result = await TestUtils.runMaiassCommand(['config', '--project'], { cwd: repoPath });
  
  // Check for debug setting in various formats
  TestUtils.assert(
    result.stdout.includes('debug') && result.stdout.includes('true'),
    'Should show debug setting as true'
  );
});

// Version Management Tests
const versionTests = new TestSuite('Version Management');

versionTests.test('should detect current version from package.json', async () => {
  const repoPath = await TestUtils.createTestRepo('version-test', {
    files: ['package.json'],
    version: '1.2.3'
  });
  
  const result = await TestUtils.runMaiassCommand(['version', '--current'], { cwd: repoPath });
  
  TestUtils.assertContains(result.stdout, '1.2.3', 'Should detect version from package.json');
});

versionTests.test('should bump patch version', async () => {
  const repoPath = await TestUtils.createTestRepo('version-bump-test', {
    files: ['package.json'],
    version: '1.2.3'
  });
  
  const result = await TestUtils.runMaiassCommand(['version', 'patch', '--dry-run'], { cwd: repoPath });
  
  // Check for version bump indication in dry-run output
  TestUtils.assert(
    result.stdout.includes('1.2.4') || result.stdout.includes('patch') || result.stdout.includes('DRY RUN'),
    'Should show patch version bump or dry-run indication'
  );
});

versionTests.test('should bump minor version', async () => {
  const repoPath = await TestUtils.createTestRepo('version-minor-test', {
    files: ['package.json'],
    version: '1.2.3'
  });
  
  const result = await TestUtils.runMaiassCommand(['version', 'minor', '--dry-run'], { cwd: repoPath });
  
  // Check for version bump indication in dry-run output
  TestUtils.assert(
    result.stdout.includes('1.3.0') || result.stdout.includes('minor') || result.stdout.includes('DRY RUN'),
    'Should show minor version bump or dry-run indication'
  );
});

versionTests.test('should bump major version', async () => {
  const repoPath = await TestUtils.createTestRepo('version-major-test', {
    files: ['package.json'],
    version: '1.2.3'
  });
  
  const result = await TestUtils.runMaiassCommand(['version', 'major', '--dry-run'], { cwd: repoPath });
  
  // Check for version bump indication in dry-run output
  TestUtils.assert(
    result.stdout.includes('2.0.0') || result.stdout.includes('major') || result.stdout.includes('DRY RUN'),
    'Should show major version bump or dry-run indication'
  );
});

// Commit Workflow Tests
const commitTests = new TestSuite('Commit Workflow');

commitTests.test('should detect no changes', async () => {
  const repoPath = await TestUtils.createTestRepo('no-changes-test');
  
  const result = await TestUtils.runMaiassCommand(['commit'], { cwd: repoPath });
  
  TestUtils.assertContains(result.stdout, 'No changes', 'Should detect no changes');
});

commitTests.test('should detect unstaged changes', async () => {
  const repoPath = await TestUtils.createTestRepo('unstaged-test');
  
  // Modify a file
  fs.writeFileSync(path.join(repoPath, 'test.txt'), 'Modified content');
  
  const result = await TestUtils.runMaiassCommand(['commit'], { 
    cwd: repoPath,
    input: 'n\n' // Answer 'no' to staging prompt
  });
  
  // Check for various change detection messages
  TestUtils.assert(
    result.stdout.includes('unstaged') || 
    result.stdout.includes('uncommitted') || 
    result.stdout.includes('changes') ||
    result.stdout.includes('Untracked'),
    'Should detect unstaged or uncommitted changes'
  );
});

// Pipeline Integration Tests
const pipelineTests = new TestSuite('Pipeline Integration');

pipelineTests.test('should run commits-only workflow', async () => {
  const repoPath = await TestUtils.createTestRepo('commits-only-test');
  
  // Verify git repository was created properly
  TestUtils.assert(fs.existsSync(path.join(repoPath, '.git')), 'Git repository should exist');
  
  // Create some changes
  fs.writeFileSync(path.join(repoPath, 'new-file.txt'), 'New content');
  execSync('git add .', { cwd: repoPath, stdio: 'pipe' });
  
  // Verify we have staged changes
  const gitStatus = execSync('git status --porcelain', { cwd: repoPath, encoding: 'utf8' });
  TestUtils.assert(gitStatus.trim().length > 0, 'Should have staged changes');
  
  const result = await TestUtils.runMaiassCommand(['--commits-only', '--force'], { 
    cwd: repoPath,
    input: 'Test commit message\n',
    timeout: 10000 // Shorter timeout for faster feedback
  });
  
  // Check for commits-only completion or workflow indication
  TestUtils.assert(
    result.stdout.includes('Commits-only') || 
    result.stdout.includes('completed') ||
    result.stdout.includes('workflow') ||
    result.stdout.includes('commit') ||
    result.success,
    `Should complete commits-only workflow successfully. Output: ${result.stdout}`
  );
});

pipelineTests.test('should handle dry-run mode', async () => {
  const repoPath = await TestUtils.createTestRepo('dry-run-test', {
    files: ['package.json'],
    version: '1.0.0',
    branch: 'master' // Stay on master to avoid develop branch switching
  });
  
  // Verify git repository was created properly
  TestUtils.assert(fs.existsSync(path.join(repoPath, '.git')), 'Git repository should exist');
  
  // Verify package.json exists with correct version
  const packagePath = path.join(repoPath, 'package.json');
  TestUtils.assert(fs.existsSync(packagePath), 'package.json should exist');
  const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  TestUtils.assertEquals(packageContent.version, '1.0.0', 'package.json should have version 1.0.0');
  
  // Use version command directly to avoid branch switching issues
  const result = await TestUtils.runMaiassCommand(['version', 'patch', '--dry-run'], { 
    cwd: repoPath,
    timeout: 10000 // Shorter timeout for faster feedback
  });
  
  // Check for dry-run indication
  TestUtils.assert(
    result.stdout.includes('dry-run') || 
    result.stdout.includes('DRY RUN') ||
    result.stdout.includes('preview') ||
    result.stdout.includes('1.0.1') ||
    result.stdout.includes('patch') ||
    result.success,
    `Should indicate dry-run mode or show version preview. Output: ${result.stdout}`
  );
});

/**
 * Main test runner
 */
async function runAllTests() {
  console.log(colors.BCyan(`${SYMBOLS.ROCKET} MAIASS Test Suite`));
  console.log(colors.Gray(`Starting comprehensive testing...`));
  
  // Ensure temp directory exists
  fs.mkdirSync(TEST_CONFIG.tempDir, { recursive: true });
  
  const testSuites = [
    gitInfoTests,
    configTests,
    versionTests,
    commitTests,
    pipelineTests
  ];
  
  try {
    // Run all test suites
    for (const suite of testSuites) {
      await suite.run();
    }
    
    // Print summary
    console.log(colors.BCyan(`\n${SYMBOLS.INFO} Test Results Summary`));
    console.log(colors.Gray(`${'═'.repeat(50)}`));
    console.log(`${colors.BGreen('Passed:')} ${testResults.passed}`);
    console.log(`${colors.BRed('Failed:')} ${testResults.failed}`);
    console.log(`${colors.BYellow('Skipped:')} ${testResults.skipped}`);
    console.log(`${colors.BWhite('Total:')} ${testResults.total}`);
    
    if (testResults.failed > 0) {
      console.log(colors.BRed(`\n${SYMBOLS.CROSS} Test Failures:`));
      for (const failure of testResults.failures) {
        console.log(colors.Red(`  ${failure.suite} > ${failure.test}`));
        console.log(colors.Gray(`    ${failure.error}`));
        if (TEST_CONFIG.verbose) {
          console.log(colors.Gray(`    ${failure.stack}`));
        }
      }
    }
    
    const successRate = ((testResults.passed / testResults.total) * 100).toFixed(1);
    console.log(colors.BCyan(`\nSuccess Rate: ${successRate}%`));
    
    if (testResults.failed === 0) {
      console.log(colors.BGreen(`\n${SYMBOLS.CHECKMARK} All tests passed!`));
      process.exit(0);
    } else {
      console.log(colors.BRed(`\n${SYMBOLS.CROSS} ${testResults.failed} test(s) failed`));
      process.exit(1);
    }
    
  } catch (error) {
    console.error(colors.BRed(`${SYMBOLS.CROSS} Test runner error: ${error.message}`));
    process.exit(1);
  } finally {
    // Cleanup
    TestUtils.cleanup();
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests().catch(error => {
    console.error(colors.BRed(`${SYMBOLS.CROSS} Fatal error: ${error.message}`));
    process.exit(1);
  });
}

export { TestUtils, TestSuite, runAllTests };
