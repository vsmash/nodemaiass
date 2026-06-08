// MAI-93 — behaviour tests for the auto-stage / commit-only changes:
//
//   1. Auto-staging of unstaged/untracked changes is OPT-IN. By default neither
//      `-a` nor `-uc` sweeps the working tree; they commit only what is staged.
//   2. MAIASS_AUTO_STAGE_UNSTAGED=true restores the `git add -A` sweep.
//   3. The version-bump commit stages ONLY version + changelog files, even with
//      an unrelated dirty file present.
//   4. `-ac` / `--auto-commit` is REMOVED — it exits non-zero with a
//      "use -uc (--unattended-commit)" message and makes no changes.
//   5. `-uc` with nothing staged → clean no-op (exit 0). `-a` with nothing
//      staged → still bumps the version.
//   6. Flag naming: `-uc` / `--unattended-commit` is the UNATTENDED commit-only
//      flag; `-co` is an INTERACTIVE alias of `-c` / `--commits-only`.
//
// Like commit-message-flag.test.js, these are hermetic integration tests that
// spawn the real CLI in a throwaway git repo with no network (MAIASS_AI_TOKEN
// deleted, no origin remote) and assert via git. -m supplies the message so no
// AI path is taken.

import { describe, it, expect, afterEach } from 'vitest';
import { execFileSync, spawnSync } from 'child_process';
import { mkdtempSync, rmSync, writeFileSync, readFileSync, existsSync } from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  stashLeftoverChanges,
  restoreStashedChanges,
  restoreStashedChangesOnBranch,
  getStashRef,
} from '../../lib/maiass-pipeline.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../..');
const CLI = path.join(REPO_ROOT, 'maiass.mjs');

const tmpRepos = [];

/**
 * Hermetic git repo with an initial commit, a first-run marker, and a
 * package.json (so version commands have a version file to bump). Checks out
 * the requested working branch.
 */
function makeRepo({ branch = 'feature/MAI-777_demo', withVersionFile = false } = {}) {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'maiass-mai93-'));
  tmpRepos.push(dir);
  const git = (args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8' });
  git(['init', '-q']);
  git(['config', 'user.name', 'Test User']);
  git(['config', 'user.email', 'test@example.com']);
  git(['config', 'commit.gpgsign', 'false']);
  writeFileSync(path.join(dir, '.env.maiass.local'), '# local test settings\n', 'utf8');
  // Gitignore the local marker (mirrors real first-run setup) so it does not
  // show up as an untracked change that would block version management.
  writeFileSync(path.join(dir, '.gitignore'), '.env.maiass.local\n', 'utf8');
  writeFileSync(path.join(dir, 'README.md'), 'init\n', 'utf8');
  git(['add', 'README.md', '.gitignore']);
  if (withVersionFile) {
    writeFileSync(
      path.join(dir, 'package.json'),
      JSON.stringify({ name: 'tmp', version: '1.0.0' }, null, 2) + '\n',
      'utf8',
    );
    // .env.maiass pins package.json as the primary version file so detection is
    // deterministic regardless of the host machine, and names the develop branch.
    writeFileSync(
      path.join(dir, '.env.maiass'),
      'MAIASS_VERSION_PRIMARY_FILE=package.json\nMAIASS_VERSION_PRIMARY_TYPE=json\nMAIASS_DEVELOPBRANCH=develop\n',
      'utf8',
    );
    git(['add', 'package.json', '.env.maiass']);
  }
  git(['commit', '-q', '-m', 'initial commit']);
  git(['checkout', '-q', '-b', branch]);
  return dir;
}

function stageChange(dir, name = 'file.txt', contents = 'change\n') {
  writeFileSync(path.join(dir, name), contents, 'utf8');
  execFileSync('git', ['add', name], { cwd: dir, encoding: 'utf8' });
}

function unstagedChange(dir, name = 'file.txt', contents = 'change\n') {
  writeFileSync(path.join(dir, name), contents, 'utf8');
}

/** Modify an already-tracked file without staging it (becomes " M" in porcelain). */
function modifyTracked(dir, name, contents) {
  writeFileSync(path.join(dir, name), contents, 'utf8');
}

function runCli(dir, args, { extraEnv = {}, timeout = 30000 } = {}) {
  const env = {
    ...process.env,
    MAIASS_AUTO_PUSH_COMMITS: 'false',
    MAIASS_AI_MODE: 'ask',
    ...extraEnv,
  };
  delete env.MAIASS_AI_TOKEN;
  if (!('MAIASS_AUTO_STAGE_UNSTAGED' in extraEnv)) {
    delete env.MAIASS_AUTO_STAGE_UNSTAGED;
  }
  const res = spawnSync('node', [CLI, ...args], {
    cwd: dir,
    env,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    timeout,
  });
  const stdout = `${res.stdout || ''}${res.stderr || ''}`;
  return { status: res.status, signal: res.signal, stdout };
}

const porcelain = (dir) =>
  execFileSync('git', ['status', '--porcelain'], { cwd: dir, encoding: 'utf8' });
const commitSubject = (dir) =>
  execFileSync('git', ['log', '-1', '--format=%s'], { cwd: dir, encoding: 'utf8' }).trim();
const headSha = (dir) =>
  execFileSync('git', ['rev-parse', 'HEAD'], { cwd: dir, encoding: 'utf8' }).trim();
/** Files touched by HEAD relative to its parent. */
const filesInHead = (dir) =>
  execFileSync('git', ['show', '--name-only', '--format=', 'HEAD'], { cwd: dir, encoding: 'utf8' })
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

afterEach(() => {
  while (tmpRepos.length) {
    const dir = tmpRepos.pop();
    try {
      rmSync(dir, { recursive: true, force: true });
    } catch {
      /* best effort */
    }
  }
});

// ── 1. default (no auto-stage env): commit only staged, leave the rest ────────

describe('MAI-93 default behaviour — auto-stage is opt-in', () => {
  it('-uc commits only staged changes; untracked/unstaged untouched; no prompt', () => {
    const dir = makeRepo();
    stageChange(dir, 'staged.txt', 'staged\n');
    unstagedChange(dir, 'loose.txt', 'loose\n');
    const { status, signal, stdout } = runCli(dir, ['-uc', '-m', 'MAI-777 staged only']);
    expect(signal).toBeNull(); // did not hang on a prompt
    expect(status).toBe(0);
    expect(commitSubject(dir)).toBe('MAI-777 staged only');
    // committed file is the staged one only
    expect(filesInHead(dir)).toContain('staged.txt');
    expect(filesInHead(dir)).not.toContain('loose.txt');
    // untracked file remains untracked
    expect(porcelain(dir)).toContain('?? loose.txt');
    // no interactive prompt text
    expect(stdout).not.toMatch(/Do you want to stage and commit them/i);
  });

  it('-a commits only staged changes for the commit phase; untracked left alone', () => {
    // Run on develop so version management actually executes (it refuses to run
    // on a feature branch when develop does not exist).
    const dir = makeRepo({ branch: 'develop', withVersionFile: true });
    stageChange(dir, 'staged.txt', 'staged\n');
    unstagedChange(dir, 'loose.txt', 'loose\n');
    const { status, signal } = runCli(dir, ['-a', 'patch', '-m', 'MAI-777 auto staged only'], {
      timeout: 40000,
    });
    expect(signal).toBeNull();
    expect(status).toBe(0);
    // The loose untracked file must never have been swept in by any phase.
    expect(porcelain(dir)).toContain('?? loose.txt');
  });
});

// ── 2. opt-in restores the git add -A sweep ───────────────────────────────────

describe('MAI-93 opt-in — MAIASS_AUTO_STAGE_UNSTAGED=true sweeps everything', () => {
  it('-uc with auto-stage env stages and commits untracked changes too', () => {
    const dir = makeRepo();
    unstagedChange(dir, 'loose.txt', 'loose\n'); // never git-added
    const { status, signal } = runCli(dir, ['-uc', '-m', 'MAI-777 sweep'], {
      extraEnv: { MAIASS_AUTO_STAGE_UNSTAGED: 'true' },
    });
    expect(signal).toBeNull();
    expect(status).toBe(0);
    expect(commitSubject(dir)).toBe('MAI-777 sweep');
    expect(filesInHead(dir)).toContain('loose.txt');
    // working tree is clean after the sweep
    expect(porcelain(dir).trim()).toBe('');
  });
});

// ── 3. version commit stages ONLY version + changelog files ────────────────────

describe('MAI-93 version-bump commit is scoped to version + changelog files', () => {
  it('bump commit excludes an unrelated dirty file', () => {
    // Run on develop so version management runs.
    const dir = makeRepo({ branch: 'develop', withVersionFile: true });
    // Commit a tracked source file so we can dirty it without it being untracked.
    stageChange(dir, 'src.txt', 'v1\n');
    runCli(dir, ['-uc', '-m', 'MAI-777 seed src']);
    // Now dirty that tracked file (unstaged) and run a full bump.
    modifyTracked(dir, 'src.txt', 'v2-uncommitted\n');
    const { status } = runCli(dir, ['-a', 'patch', '-m', 'MAI-777 bump'], { timeout: 40000 });
    expect(status).toBe(0);
    // Find the version-bump commit and inspect the files it touched.
    const log = execFileSync(
      'git',
      ['log', '--format=%H %s', '-n', '10'],
      { cwd: dir, encoding: 'utf8' },
    );
    const bumpLine = log.split('\n').find((l) => /Bumped version to/.test(l));
    expect(bumpLine, 'expected a "Bumped version to" commit').toBeTruthy();
    const bumpSha = bumpLine.split(' ')[0];
    const bumpFiles = execFileSync(
      'git',
      ['show', '--name-only', '--format=', bumpSha],
      { cwd: dir, encoding: 'utf8' },
    )
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    // package.json (version file) must be in the bump commit...
    expect(bumpFiles).toContain('package.json');
    // ...but the unrelated dirty file must NOT be.
    expect(bumpFiles).not.toContain('src.txt');
    // The unrelated modification is still uncommitted in the working tree.
    expect(porcelain(dir)).toMatch(/ M src\.txt/);
  });
});

// ── 4. -ac removed ────────────────────────────────────────────────────────────

describe('MAI-93 -ac / --auto-commit removed', () => {
  it('-ac exits non-zero with the "use -uc" message and makes no changes', () => {
    const dir = makeRepo();
    stageChange(dir, 'staged.txt', 'staged\n');
    const before = headSha(dir);
    const { status, signal, stdout } = runCli(dir, ['-ac', '-m', 'should not run']);
    expect(signal).toBeNull();
    expect(status).not.toBe(0);
    expect(stdout).toContain('Please use -uc (--unattended-commit)');
    // No commit was made.
    expect(headSha(dir)).toBe(before);
    // staged change is untouched (still staged).
    expect(porcelain(dir)).toMatch(/A  staged\.txt/);
  });

  it('--auto-commit exits non-zero with the "use -uc" message', () => {
    const dir = makeRepo();
    stageChange(dir, 'staged.txt', 'staged\n');
    const before = headSha(dir);
    const { status, stdout } = runCli(dir, ['--auto-commit', '-m', 'should not run']);
    expect(status).not.toBe(0);
    expect(stdout).toContain('Please use -uc (--unattended-commit)');
    expect(headSha(dir)).toBe(before);
  });
});

// ── 5. nothing-staged edge cases ──────────────────────────────────────────────

describe('MAI-93 nothing-staged edge cases', () => {
  it('-uc with nothing staged → clean no-op, exit 0', () => {
    const dir = makeRepo();
    unstagedChange(dir, 'loose.txt', 'loose\n'); // present but unstaged
    const before = headSha(dir);
    const { status, signal, stdout } = runCli(dir, ['-uc', '-m', 'MAI-777 nothing']);
    expect(signal).toBeNull();
    expect(status).toBe(0);
    // No new commit.
    expect(headSha(dir)).toBe(before);
    expect(stdout).toContain('Nothing staged; MAIASS_AUTO_STAGE_UNSTAGED=false — skipping commit');
    // The unstaged file is still there, still untracked.
    expect(porcelain(dir)).toContain('?? loose.txt');
  });

  it('-a with nothing staged still bumps the version', () => {
    // On develop with a clean tree and nothing staged — version bump must run.
    const dir = makeRepo({ branch: 'develop', withVersionFile: true });
    const { status, signal } = runCli(dir, ['-a', 'patch', '-m', 'MAI-777 bump only'], {
      timeout: 40000,
    });
    expect(signal).toBeNull();
    expect(status).toBe(0);
    // package.json version was bumped from 1.0.0.
    const pkg = JSON.parse(readFileSync(path.join(dir, 'package.json'), 'utf8'));
    expect(pkg.version).not.toBe('1.0.0');
    // A version-bump commit exists.
    const log = execFileSync('git', ['log', '--format=%s', '-n', '10'], {
      cwd: dir,
      encoding: 'utf8',
    });
    expect(log).toMatch(/Bumped version to/);
  });
});

// ── 5b. -co is the INTERACTIVE commit-only alias (== -c / --commits-only) ──────
//
// MAI-93 flag-naming fix: `-co` must be a plain alias of `--commits-only`, NOT
// the unattended flag (that is now `-uc`). Because it is INTERACTIVE, it does
// NOT auto-approve — with an unstaged change present it would prompt (and, with
// no TTY, fail). That prompting is exactly what distinguishes it from `-uc`,
// which auto-stages-decisions away. So here the tree holds only a staged change
// (clean otherwise): all three forms commit that staged change verbatim via -m,
// stop, and do NOT bump the version. We run `-co`, `-c` and `--commits-only`
// through the identical scenario and assert they behave the same.

describe('MAI-93 -co is an interactive alias of -c / --commits-only', () => {
  for (const flag of ['-co', '-c', '--commits-only']) {
    it(`${flag} commits staged changes, stops, no version bump (interactive commit-only)`, () => {
      // Run on develop with a version file present so we can prove no bump happens.
      const dir = makeRepo({ branch: 'develop', withVersionFile: true });
      stageChange(dir, 'staged.txt', 'staged\n'); // only a staged change; clean otherwise
      const { status, signal } = runCli(dir, [flag, '-m', 'MAI-777 commits-only']);
      expect(signal).toBeNull(); // -m means no AI prompt; clean tree means no stage prompt
      expect(status).toBe(0);
      // The staged change was committed under the supplied message.
      expect(commitSubject(dir)).toBe('MAI-777 commits-only');
      expect(filesInHead(dir)).toContain('staged.txt');
      // Commit-only means NO version bump: package.json stays at 1.0.0 and there
      // is no "Bumped version to" commit.
      const pkg = JSON.parse(readFileSync(path.join(dir, 'package.json'), 'utf8'));
      expect(pkg.version).toBe('1.0.0');
      const log = execFileSync('git', ['log', '--format=%s', '-n', '10'], {
        cwd: dir,
        encoding: 'utf8',
      });
      expect(log).not.toMatch(/Bumped version to/);
    });
  }
});

// ── 6. MAI-93 stash & restore around the version pipeline ─────────────────────

const stashList = (dir) =>
  execFileSync('git', ['stash', 'list'], { cwd: dir, encoding: 'utf8' }).trim();

describe('MAI-93 stash & restore for the version pipeline', () => {
  it('-a with an unrelated unstaged tracked file AND an untracked file, nothing staged → bumps; leftover changes survive; version commit scoped', () => {
    const dir = makeRepo({ branch: 'develop', withVersionFile: true });
    // Seed a tracked source file so we can dirty it (unstaged tracked change).
    stageChange(dir, 'src.txt', 'v1\n');
    runCli(dir, ['-uc', '-m', 'MAI-777 seed src']);
    // Now: an unrelated unstaged tracked change + an untracked file. Nothing staged.
    modifyTracked(dir, 'src.txt', 'v2-uncommitted\n');
    unstagedChange(dir, 'loose.txt', 'loose-untracked\n');

    const { status, signal, stdout } = runCli(dir, ['-a', 'patch', '-m', 'MAI-777 bump'], {
      timeout: 40000,
    });
    expect(signal).toBeNull();
    expect(status).toBe(0);

    // Version was bumped + committed.
    const pkg = JSON.parse(readFileSync(path.join(dir, 'package.json'), 'utf8'));
    expect(pkg.version).not.toBe('1.0.0');
    const log = execFileSync('git', ['log', '--format=%H %s', '-n', '10'], {
      cwd: dir,
      encoding: 'utf8',
    });
    const bumpLine = log.split('\n').find((l) => /Bumped version to/.test(l));
    expect(bumpLine, 'expected a "Bumped version to" commit').toBeTruthy();

    // The version commit contains ONLY version + changelog files.
    const bumpSha = bumpLine.split(' ')[0];
    const bumpFiles = execFileSync('git', ['show', '--name-only', '--format=', bumpSha], {
      cwd: dir,
      encoding: 'utf8',
    })
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    expect(bumpFiles).toContain('package.json');
    expect(bumpFiles).not.toContain('src.txt');
    expect(bumpFiles).not.toContain('loose.txt');

    // After the run the leftover changes are back in the working tree (popped).
    const status2 = porcelain(dir);
    expect(status2).toMatch(/ M src\.txt/); // unstaged tracked change restored
    expect(status2).toContain('?? loose.txt'); // untracked file restored
    expect(readFileSync(path.join(dir, 'src.txt'), 'utf8')).toBe('v2-uncommitted\n');
    expect(readFileSync(path.join(dir, 'loose.txt'), 'utf8')).toBe('loose-untracked\n');

    // The stash entry was consumed by the pop — none left behind.
    expect(stashList(dir)).toBe('');
    // Reassuring log line.
    expect(stdout).toMatch(/Stashed \d+ unrelated change/i);
  });

  it('-a with a clean tree creates no stash (no leftover stash entries)', () => {
    const dir = makeRepo({ branch: 'develop', withVersionFile: true });
    const { status, signal, stdout } = runCli(dir, ['-a', 'patch', '-m', 'MAI-777 clean'], {
      timeout: 40000,
    });
    expect(signal).toBeNull();
    expect(status).toBe(0);
    // No stash was created and none left behind.
    expect(stashList(dir)).toBe('');
    // No stash log line.
    expect(stdout).not.toMatch(/Stashed \d+ unrelated change/i);
    // Version still bumped.
    const pkg = JSON.parse(readFileSync(path.join(dir, 'package.json'), 'utf8'));
    expect(pkg.version).not.toBe('1.0.0');
  });
});

// ── 7. restore helper unit tests (incl. pop-conflict preservation) ────────────

describe('MAI-93 restore helper — stash preserved on pop conflict', () => {
  let prevCwd;
  afterEach(() => {
    if (prevCwd) {
      try {
        process.chdir(prevCwd);
      } catch {
        /* ignore */
      }
      prevCwd = undefined;
    }
  });

  /** Minimal git repo with one committed tracked file. */
  function makePlainRepo() {
    const dir = mkdtempSync(path.join(os.tmpdir(), 'maiass-mai93-helper-'));
    tmpRepos.push(dir);
    const git = (args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8' });
    git(['init', '-q']);
    git(['config', 'user.name', 'Test User']);
    git(['config', 'user.email', 'test@example.com']);
    git(['config', 'commit.gpgsign', 'false']);
    writeFileSync(path.join(dir, 'tracked.txt'), 'base\n', 'utf8');
    git(['add', 'tracked.txt']);
    git(['commit', '-q', '-m', 'base']);
    return dir;
  }

  it('stash on a clean tree is a no-op (stashed: false)', () => {
    const dir = makePlainRepo();
    prevCwd = process.cwd();
    process.chdir(dir);
    const info = stashLeftoverChanges();
    expect(info.stashed).toBe(false);
    expect(getStashRef()).toBeNull();
  });

  it('stash then restore round-trips a dirty tracked + untracked change', () => {
    const dir = makePlainRepo();
    prevCwd = process.cwd();
    process.chdir(dir);
    writeFileSync(path.join(dir, 'tracked.txt'), 'dirty\n', 'utf8');
    writeFileSync(path.join(dir, 'new.txt'), 'untracked\n', 'utf8');
    const info = stashLeftoverChanges();
    expect(info.stashed).toBe(true);
    // Tree is clean while stashed.
    expect(porcelain(dir).trim()).toBe('');
    const restore = restoreStashedChanges(info);
    expect(restore.success).toBe(true);
    expect(restore.conflict).toBe(false);
    // Changes are back.
    expect(readFileSync(path.join(dir, 'tracked.txt'), 'utf8')).toBe('dirty\n');
    expect(porcelain(dir)).toContain('?? new.txt');
    expect(getStashRef()).toBeNull();
  });

  it('pop conflict preserves the stash and returns a non-fatal warning', () => {
    const dir = makePlainRepo();
    prevCwd = process.cwd();
    process.chdir(dir);
    // Dirty the tracked file, then stash it.
    writeFileSync(path.join(dir, 'tracked.txt'), 'stashed-edit\n', 'utf8');
    const info = stashLeftoverChanges();
    expect(info.stashed).toBe(true);
    // Now make a CONFLICTING change to the same file on the clean tree so the
    // pop cannot apply cleanly.
    writeFileSync(path.join(dir, 'tracked.txt'), 'conflicting-edit\n', 'utf8');

    const restore = restoreStashedChanges(info);
    expect(restore.success).toBe(false);
    expect(restore.conflict).toBe(true);
    // The stash MUST still exist — work is not discarded.
    expect(getStashRef()).not.toBeNull();
    expect(stashList(dir)).not.toBe('');
  });
});

// ── 8. secondary version files are staged into the version commit ──────────────
//
// Regression: stageVersionAndChangelogFiles read only `entry.path`, but
// updateSecondaryVersionFiles pushes `{ file }` with no `path`. The fix adds
// `path` to that result AND makes the stager fall back to `entry.file`. Either
// way the secondary file must land in the "Bumped version to" commit.

const git = (dir, args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8' });

describe('MAI-93 secondary version files are staged into the version commit', () => {
  it('a tracked secondary file bumped via MAIASS_VERSION_SECONDARY_FILES is in the version commit', () => {
    const dir = makeRepo({ branch: 'develop', withVersionFile: true });
    // Append the secondary-files config to the .env.maiass committed by makeRepo.
    writeFileSync(
      path.join(dir, '.env.maiass'),
      'MAIASS_VERSION_PRIMARY_FILE=package.json\n' +
        'MAIASS_VERSION_PRIMARY_TYPE=json\n' +
        'MAIASS_DEVELOPBRANCH=develop\n' +
        'MAIASS_VERSION_SECONDARY_FILES=version.txt:txt:VERSION=\n',
      'utf8',
    );
    // A tracked secondary file with a bumpable version line.
    writeFileSync(path.join(dir, 'version.txt'), 'VERSION=1.0.0\n', 'utf8');
    git(dir, ['add', '.env.maiass', 'version.txt']);
    git(dir, ['commit', '-q', '-m', 'add secondary version file']);

    const { status, signal } = runCli(dir, ['-a', 'patch', '-m', 'MAI-777 bump'], {
      timeout: 40000,
    });
    expect(signal).toBeNull();
    expect(status).toBe(0);

    // The secondary file was bumped on disk.
    expect(readFileSync(path.join(dir, 'version.txt'), 'utf8')).not.toContain('1.0.0');

    // The version-bump commit includes BOTH the primary and the secondary file.
    const log = execFileSync('git', ['log', '--format=%H %s', '-n', '10'], {
      cwd: dir,
      encoding: 'utf8',
    });
    const bumpLine = log.split('\n').find((l) => /Bumped version to/.test(l));
    expect(bumpLine, 'expected a "Bumped version to" commit').toBeTruthy();
    const bumpSha = bumpLine.split(' ')[0];
    const bumpFiles = execFileSync('git', ['show', '--name-only', '--format=', bumpSha], {
      cwd: dir,
      encoding: 'utf8',
    })
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    expect(bumpFiles).toContain('package.json');
    expect(bumpFiles).toContain('version.txt');
  });
});

// ── 9. WordPress style.css / functions.php are staged into the version commit ──
//
// Regression: updateWordPressVersions edited the theme files on disk but pushed
// nothing into results.updated[], so the targeted stager never saw them. The fix
// returns the modified file list and pushes each with a `path`.

describe('MAI-93 WordPress theme files are staged into the version commit', () => {
  it('style.css and functions.php version bumps are in the version commit', () => {
    const dir = makeRepo({ branch: 'develop', withVersionFile: true });
    // Point MAIASS at a theme directory and name a version constant.
    writeFileSync(
      path.join(dir, '.env.maiass'),
      'MAIASS_VERSION_PRIMARY_FILE=package.json\n' +
        'MAIASS_VERSION_PRIMARY_TYPE=json\n' +
        'MAIASS_DEVELOPBRANCH=develop\n' +
        'MAIASS_THEME_PATH=theme\n' +
        'MAIASS_VERSION_CONSTANT=MY_THEME_VERSION\n',
      'utf8',
    );
    // A WordPress-style theme: style.css header + functions.php constant.
    execFileSync('mkdir', ['-p', path.join(dir, 'theme')]);
    writeFileSync(
      path.join(dir, 'theme', 'style.css'),
      '/*\nTheme Name: Demo\nVersion: 1.0.0\n*/\n',
      'utf8',
    );
    writeFileSync(
      path.join(dir, 'theme', 'functions.php'),
      "<?php\ndefine('MY_THEME_VERSION','1.0.0');\n",
      'utf8',
    );
    git(dir, ['add', '.env.maiass', 'theme/style.css', 'theme/functions.php']);
    git(dir, ['commit', '-q', '-m', 'add wordpress theme']);

    const { status, signal } = runCli(dir, ['-a', 'patch', '-m', 'MAI-777 bump'], {
      timeout: 40000,
    });
    expect(signal).toBeNull();
    expect(status).toBe(0);

    // Both theme files were bumped on disk.
    expect(readFileSync(path.join(dir, 'theme', 'style.css'), 'utf8')).not.toContain('Version: 1.0.0');
    expect(readFileSync(path.join(dir, 'theme', 'functions.php'), 'utf8')).not.toContain("'1.0.0'");

    // ...and both are in the version-bump commit.
    const log = execFileSync('git', ['log', '--format=%H %s', '-n', '10'], {
      cwd: dir,
      encoding: 'utf8',
    });
    const bumpLine = log.split('\n').find((l) => /Bumped version to/.test(l));
    expect(bumpLine, 'expected a "Bumped version to" commit').toBeTruthy();
    const bumpSha = bumpLine.split(' ')[0];
    const bumpFiles = execFileSync('git', ['show', '--name-only', '--format=', bumpSha], {
      cwd: dir,
      encoding: 'utf8',
    })
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    expect(bumpFiles).toContain('theme/style.css');
    expect(bumpFiles).toContain('theme/functions.php');
  });
});

// ── 10. -ac as the VALUE of -m is NOT rejected ────────────────────────────────
//
// The removed-flag guard must only fire for an actual -ac/--auto-commit FLAG,
// never when "-ac" is the verbatim commit message value of -m/--message.

describe('MAI-93 -ac as an -m value is not treated as the removed flag', () => {
  it('-uc -m "-ac" commits with that literal message and exits 0', () => {
    const dir = makeRepo();
    stageChange(dir, 'staged.txt', 'staged\n');
    const { status, signal, stdout } = runCli(dir, ['-uc', '-m', '-ac']);
    expect(signal).toBeNull();
    expect(status).toBe(0);
    // The removed-flag rejection did NOT fire.
    expect(stdout).not.toContain('Please use -uc (--unattended-commit)');
    // The literal "-ac" was used as the message (the branch-derived ticket may
    // be prefixed, but the verbatim value must be present, not consumed as a flag).
    expect(commitSubject(dir)).toContain('-ac');
    expect(filesInHead(dir)).toContain('staged.txt');
  });
});

// ── 11. guarded restore — never pop on the wrong branch ───────────────────────
//
// restoreStashedChangesOnBranch is the failure-safe wrapper the pipeline's
// finally calls. The real branch-switching is hard to force deterministically in
// e2e, so the guard is unit-tested with injected dependencies.

describe('MAI-93 restoreStashedChangesOnBranch — guarded pop', () => {
  it('no-op when nothing was stashed', async () => {
    let popped = false;
    const r = await restoreStashedChangesOnBranch(
      { stashed: false },
      'feature/x',
      { restoreFn: () => { popped = true; } },
    );
    expect(r.popped).toBe(false);
    expect(popped).toBe(false);
  });

  it('pops directly when already on the target branch (no checkout)', async () => {
    let switched = false;
    let popped = false;
    const r = await restoreStashedChangesOnBranch(
      { stashed: true },
      'feature/x',
      {
        getCurrentBranchFn: () => 'feature/x',
        switchToBranchFn: async () => { switched = true; return true; },
        restoreFn: () => { popped = true; },
      },
    );
    expect(switched).toBe(false); // already on target — no checkout attempted
    expect(popped).toBe(true);
    expect(r.popped).toBe(true);
  });

  it('checks out the target then pops when on a different branch', async () => {
    const calls = [];
    const r = await restoreStashedChangesOnBranch(
      { stashed: true },
      'feature/x',
      {
        getCurrentBranchFn: () => 'develop',
        switchToBranchFn: async (b) => { calls.push(b); return true; },
        restoreFn: () => calls.push('pop'),
      },
    );
    expect(calls).toEqual(['feature/x', 'pop']); // switched first, then popped
    expect(r.popped).toBe(true);
  });

  it('does NOT pop and preserves the stash when checkout fails', async () => {
    let popped = false;
    const r = await restoreStashedChangesOnBranch(
      { stashed: true, message: 'WIP' },
      'feature/x',
      {
        getCurrentBranchFn: () => 'develop',
        switchToBranchFn: async () => false, // checkout failed
        restoreFn: () => { popped = true; },
      },
    );
    expect(popped).toBe(false); // never popped on the wrong branch
    expect(r.popped).toBe(false);
    expect(r.preserved).toBe(true);
    expect(r.reason).toBe('checkout-failed');
  });

  it('does NOT pop and preserves the stash if the branch check throws', async () => {
    let popped = false;
    const r = await restoreStashedChangesOnBranch(
      { stashed: true },
      'feature/x',
      {
        getCurrentBranchFn: () => { throw new Error('git exploded'); },
        switchToBranchFn: async () => true,
        restoreFn: () => { popped = true; },
      },
    );
    expect(popped).toBe(false);
    expect(r.preserved).toBe(true);
    expect(r.reason).toBe('branch-check-threw');
  });
});
