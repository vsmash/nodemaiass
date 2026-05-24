import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { execSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

// Mock the interactive input layer so commitThis never touches a TTY
// (getSingleCharInput calls process.stdin.setRawMode, which throws on a
// non-TTY stdin). getMultiLineInput supplies a fixed commit message.
vi.mock('../../lib/input-utils.js', () => ({
  getSingleCharInput: vi.fn().mockResolvedValue('y'),
  getMultiLineInput: vi.fn().mockResolvedValue('MAI-58: regression test message'),
  getLineInput: vi.fn().mockResolvedValue('')
}));

// devlog.logCommit writes to a side-channel file; stub it so the test stays
// isolated.
vi.mock('../../lib/devlog.js', () => ({
  logCommit: vi.fn()
}));

import { commitThis } from '../../lib/commit.js';

/**
 * Build a throwaway git repo with a file:// bare origin and a dirtied tracked
 * file. Returns the work dir, the bare origin dir, and the feature branch name.
 */
function makeSandbox() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'mai58-test-'));
  const origin = path.join(root, 'origin.git');
  const work = path.join(root, 'work');
  fs.mkdirSync(origin);
  fs.mkdirSync(work);

  const git = (cmd, cwd) => execSync(`git ${cmd}`, { cwd, stdio: 'pipe' });

  git('init --bare -q', origin);
  git('init -q', work);
  git('config user.name "Test"', work);
  git('config user.email "test@example.invalid"', work);
  git('config commit.gpgsign false', work);
  git(`remote add origin file://${origin}`, work);

  fs.writeFileSync(path.join(work, 'tracked.txt'), 'line1\nline2\n');
  git('add tracked.txt', work);
  git('commit -q -m "initial commit"', work);
  git('branch -M develop', work);
  git('push -q -u origin develop', work);
  git('checkout -q -b feature/MAI-58_test', work);

  // Dirty the tracked file so there is something to stage/commit.
  fs.writeFileSync(path.join(work, 'tracked.txt'), 'line1\nline2\nline3\n');

  return { root, origin, work, branch: 'feature/MAI-58_test' };
}

const rev = (cwd, ref = 'HEAD') =>
  execSync(`git rev-parse ${ref}`, { cwd, stdio: 'pipe' }).toString().trim();

const stagedFiles = (cwd) =>
  execSync('git diff --cached --name-only', { cwd, stdio: 'pipe' }).toString().trim();

const remoteHasBranch = (origin, branch) => {
  try {
    execSync(`git rev-parse refs/heads/${branch}`, { cwd: origin, stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
};

describe('commitThis dry-run in commits-only mode (MAI-58)', () => {
  let sandbox;
  let originalCwd;
  let savedEnv;

  beforeEach(() => {
    sandbox = makeSandbox();
    // commit.js / git-info.js shell out with execSync, which inherits the
    // process working directory — chdir into the sandbox so all git commands
    // operate there.
    originalCwd = process.cwd();
    process.chdir(sandbox.work);
    savedEnv = { ...process.env };
    process.env.MAIASS_AI_MODE = 'off';
    process.env.MAIASS_AUTO_STAGE_UNSTAGED = 'true';
    process.env.MAIASS_AUTO_PUSH_COMMITS = 'true';
    process.env.MAIASS_VERBOSITY = 'brief';
    delete process.env.MAIASS_AI_TOKEN;
  });

  afterEach(() => {
    process.chdir(originalCwd);
    process.env = savedEnv;
    fs.rmSync(sandbox.root, { recursive: true, force: true });
  });

  it('does NOT stage, commit, or push when dryRun is true', async () => {
    const headBefore = rev(sandbox.work);

    const result = await commitThis({
      autoStage: true,
      commitsOnly: true,
      silent: false,
      dryRun: true
    });

    expect(result).toBe(true);
    // HEAD must not move
    expect(rev(sandbox.work)).toBe(headBefore);
    // Nothing staged in the index
    expect(stagedFiles(sandbox.work)).toBe('');
    // The feature branch must not have been pushed to origin
    expect(remoteHasBranch(sandbox.origin, sandbox.branch)).toBe(false);
  });

  it('DOES stage, commit, and push when dryRun is false (happy path)', async () => {
    const headBefore = rev(sandbox.work);

    const result = await commitThis({
      autoStage: true,
      commitsOnly: true,
      silent: false,
      dryRun: false
    });

    expect(result).toBe(true);
    // HEAD must move (a real commit happened)
    expect(rev(sandbox.work)).not.toBe(headBefore);
    // The feature branch must now exist on origin, pointing at the new HEAD
    expect(remoteHasBranch(sandbox.origin, sandbox.branch)).toBe(true);
    expect(rev(sandbox.origin, `refs/heads/${sandbox.branch}`)).toBe(rev(sandbox.work));
  });
});
