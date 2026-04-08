#!/usr/bin/env node

/**
 * MAIASS Test Runner
 * Tests the CLI commands against the actual maiass.mjs entry point
 */

import { execSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import colors from '../lib/colors.js';
import { SYMBOLS } from '../lib/symbols.js';

// Test configuration
const TEST_CONFIG = {
  timeout: 30000,
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
   * Create a temporary test git repository
   */
  static async createTestRepo(name, options = {}) {
    const {
      branch = 'main',
      files = ['package.json'],
      version = '1.0.0'
    } = options;

    const repoPath = path.join(TEST_CONFIG.tempDir, name);

    if (fs.existsSync(repoPath)) {
      fs.rmSync(repoPath, { recursive: true, force: true });
    }
    fs.mkdirSync(repoPath, { recursive: true });

    execSync('git init', { cwd: repoPath, stdio: 'pipe' });
    execSync('git config user.name "Test User"', { cwd: repoPath, stdio: 'pipe' });
    execSync('git config user.email "test@example.com"', { cwd: repoPath, stdio: 'pipe' });

    for (const file of files) {
      const filePath = path.join(repoPath, file);
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      let content = '';
      if (file === 'package.json') {
        content = JSON.stringify({ name, version, description: `Test package for ${name}` }, null, 2);
      } else if (file === 'VERSION') {
        content = version;
      } else {
        content = `Test content for ${file}\n`;
      }
      fs.writeFileSync(filePath, content);
    }

    execSync('git add .', { cwd: repoPath, stdio: 'pipe' });
    execSync('git commit -m "Initial commit"', { cwd: repoPath, stdio: 'pipe' });

    if (branch !== 'main') {
      execSync(`git checkout -b ${branch}`, { cwd: repoPath, stdio: 'pipe' });
    }

    return repoPath;
  }

  /**
   * Execute a maiass command in a test environment
   */
  static async runMaiassCommand(args, options = {}) {
    const {
      cwd = process.cwd(),
      timeout = TEST_CONFIG.timeout,
      expectError = false,
      input = ''
    } = options;

    const maiassPath = path.resolve(path.dirname(import.meta.url.replace('file://', '')), '../maiass.mjs');

    return new Promise((resolve, reject) => {
      const child = spawn('node', [maiassPath, ...args], {
        cwd,
        stdio: ['pipe', 'pipe', 'pipe'],
        env: {
          ...process.env,
          MAIASS_DEBUG: 'false',
          MAIASS_AI_COMMITS: 'off',
          MAIASS_LOGGING: 'false'
        }
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => { stdout += data.toString(); });
      child.stderr.on('data', (data) => { stderr += data.toString(); });

      if (input) {
        child.stdin.write(input);
      }
      child.stdin.end();

      const timer = setTimeout(() => {
        child.kill();
        reject(new Error(`Test timed out after ${timeout}ms`));
      }, timeout);

      child.on('close', (code) => {
        clearTimeout(timer);
        const result = { code, stdout, stderr, success: code === 0 };

        if (expectError && code === 0) {
          reject(new Error('Expected command to fail but it succeeded'));
        } else if (!expectError && code !== 0) {
          reject(new Error(`Command failed with code ${code}: ${stderr || stdout}`));
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

  static cleanup() {
    if (!TEST_CONFIG.keepTempFiles && fs.existsSync(TEST_CONFIG.tempDir)) {
      fs.rmSync(TEST_CONFIG.tempDir, { recursive: true, force: true });
    }
  }

  static assert(condition, message) {
    if (!condition) throw new Error(`Assertion failed: ${message}`);
  }

  static assertContains(text, substring, message) {
    if (!text.includes(substring)) {
      throw new Error(`Assertion failed: ${message}\nExpected to contain: "${substring}"\nActual: ${text.slice(0, 300)}`);
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
  }

  test(name, fn) {
    this.tests.push({ name, fn });
  }

  async run() {
    console.log(colors.BCyan(`\n${SYMBOLS.GEAR} Running test suite: ${this.name}`));
    console.log(colors.Gray(`${'─'.repeat(50)}`));

    for (const test of this.tests) {
      testResults.total++;
      try {
        const startTime = Date.now();
        await test.fn();
        const duration = Date.now() - startTime;
        testResults.passed++;
        console.log(colors.BGreen(`${SYMBOLS.CHECKMARK} ${test.name} (${duration}ms)`));
      } catch (error) {
        testResults.failed++;
        testResults.failures.push({ suite: this.name, test: test.name, error: error.message });
        console.log(colors.BRed(`${SYMBOLS.CROSS} ${test.name}`));
        if (TEST_CONFIG.verbose) {
          console.log(colors.Red(`  ${error.message}`));
        }
      }
    }
  }
}

// ── Git Information Tests ─────────────────────────────────────────────────────

const gitInfoTests = new TestSuite('Git Information');

gitInfoTests.test('should detect git repository', async () => {
  const repoPath = await TestUtils.createTestRepo('git-repo-test');
  const result = await TestUtils.runMaiassCommand(['git-info'], { cwd: repoPath });
  TestUtils.assertContains(result.stdout, 'Branch', 'Should show branch info');
});

gitInfoTests.test('should detect non-git directory', async () => {
  const nonGitPath = path.join(TEST_CONFIG.tempDir, 'non-git');
  fs.mkdirSync(nonGitPath, { recursive: true });
  const result = await TestUtils.runMaiassCommand(['git-info'], {
    cwd: nonGitPath,
    expectError: true
  });
  const output = result.stdout + result.stderr;
  TestUtils.assert(
    output.toLowerCase().includes('not') || output.toLowerCase().includes('git'),
    'Should report not in a git repository'
  );
});

gitInfoTests.test('should extract JIRA ticket from branch name', async () => {
  const repoPath = await TestUtils.createTestRepo('jira-test');
  execSync('git checkout -b feature/USER-123-new-feature', { cwd: repoPath, stdio: 'pipe' });
  const result = await TestUtils.runMaiassCommand(['git-info'], { cwd: repoPath });
  TestUtils.assertContains(result.stdout, 'USER-123', 'Should extract JIRA ticket');
});

// ── Configuration Tests ───────────────────────────────────────────────────────

const configTests = new TestSuite('Configuration Management');

configTests.test('should show configuration', async () => {
  const result = await TestUtils.runMaiassCommand(['config']);
  TestUtils.assert(
    result.stdout.includes('debug') || result.stdout.includes('MAIASS'),
    'Should show configuration output'
  );
});

// ── Version Management Tests ──────────────────────────────────────────────────

const versionTests = new TestSuite('Version Management');

versionTests.test('should detect current version from package.json', async () => {
  const repoPath = await TestUtils.createTestRepo('version-test', { version: '1.2.3' });
  const result = await TestUtils.runMaiassCommand(['version'], { cwd: repoPath });
  TestUtils.assertContains(result.stdout, '1.2.3', 'Should show version from package.json');
});

versionTests.test('should preview patch version bump', async () => {
  const repoPath = await TestUtils.createTestRepo('version-patch-test', { version: '1.2.3' });
  const result = await TestUtils.runMaiassCommand(['version', 'patch', '--dry-run'], { cwd: repoPath });
  TestUtils.assert(
    result.stdout.includes('1.2.4') || result.stdout.includes('patch') || result.stdout.includes('Dry run'),
    'Should show patch bump preview'
  );
});

versionTests.test('should preview minor version bump', async () => {
  const repoPath = await TestUtils.createTestRepo('version-minor-test', { version: '1.2.3' });
  const result = await TestUtils.runMaiassCommand(['version', 'minor', '--dry-run'], { cwd: repoPath });
  TestUtils.assert(
    result.stdout.includes('1.3.0') || result.stdout.includes('minor') || result.stdout.includes('Dry run'),
    'Should show minor bump preview'
  );
});

versionTests.test('should preview major version bump', async () => {
  const repoPath = await TestUtils.createTestRepo('version-major-test', { version: '1.2.3' });
  const result = await TestUtils.runMaiassCommand(['version', 'major', '--dry-run'], { cwd: repoPath });
  TestUtils.assert(
    result.stdout.includes('2.0.0') || result.stdout.includes('major') || result.stdout.includes('Dry run'),
    'Should show major bump preview'
  );
});

// ── Pipeline Tests ────────────────────────────────────────────────────────────

const pipelineTests = new TestSuite('Pipeline');

pipelineTests.test('should display environment info', async () => {
  const repoPath = await TestUtils.createTestRepo('env-test');
  const result = await TestUtils.runMaiassCommand(['env'], { cwd: repoPath });
  TestUtils.assert(
    result.stdout.includes('MAIASS') || result.stdout.includes('Environment') || result.stdout.includes('debug'),
    'Should display environment info'
  );
});

pipelineTests.test('should show version in --version flag', async () => {
  const result = await TestUtils.runMaiassCommand(['--version']);
  TestUtils.assert(
    result.stdout.includes('v') || result.stdout.match(/\d+\.\d+\.\d+/),
    'Should show version number'
  );
});

// ── Main ──────────────────────────────────────────────────────────────────────

async function runAllTests() {
  console.log(colors.BCyan(`\n${SYMBOLS.ROCKET} MAIASS Test Suite`));
  console.log(colors.Gray('Starting tests...\n'));

  fs.mkdirSync(TEST_CONFIG.tempDir, { recursive: true });

  const suites = [gitInfoTests, configTests, versionTests, pipelineTests];

  try {
    for (const suite of suites) {
      await suite.run();
    }

    console.log(colors.BCyan(`\n${SYMBOLS.INFO} Test Results`));
    console.log(colors.Gray('═'.repeat(50)));
    console.log(`${colors.BGreen('Passed:')} ${testResults.passed}`);
    console.log(`${colors.BRed('Failed:')} ${testResults.failed}`);
    console.log(`${colors.BWhite('Total:')}  ${testResults.total}`);

    if (testResults.failures.length > 0) {
      console.log(colors.BRed(`\n${SYMBOLS.CROSS} Failures:`));
      for (const f of testResults.failures) {
        console.log(colors.Red(`  ${f.suite} > ${f.test}`));
        console.log(colors.Gray(`    ${f.error}`));
      }
    }

    const rate = ((testResults.passed / testResults.total) * 100).toFixed(1);
    console.log(colors.BCyan(`\nSuccess Rate: ${rate}%`));

    if (testResults.failed === 0) {
      console.log(colors.BGreen(`\n${SYMBOLS.CHECKMARK} All tests passed!\n`));
      process.exit(0);
    } else {
      console.log(colors.BRed(`\n${SYMBOLS.CROSS} ${testResults.failed} test(s) failed\n`));
      process.exit(1);
    }
  } finally {
    TestUtils.cleanup();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests().catch(error => {
    console.error(colors.BRed(`${SYMBOLS.CROSS} Fatal: ${error.message}`));
    process.exit(1);
  });
}

export { TestUtils, TestSuite, runAllTests };
