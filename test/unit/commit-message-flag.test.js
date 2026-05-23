// MAI-51 — regression tests for the -m / --message verbatim commit-message flag.
//
// Two layers:
//   1. Pure unit tests of the extractMessageFlag argv parser (lib/arg-utils.js).
//   2. Hermetic integration tests that spawn the real CLI (maiass.mjs) in a
//      throwaway git repo with NO network (MAIASS_AI_TOKEN deleted, no origin
//      remote) and assert on the resulting commit via `git log`.
//
// maiass.mjs runs top-level CLI code on import, so it cannot be imported into a
// unit test — hence the spawn-based integration approach for behaviour, and the
// extracted pure parser for the argv-level cases.

import { describe, it, expect, afterEach } from 'vitest';
import { execFileSync, spawnSync } from 'child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

import { extractMessageFlag } from '../../lib/arg-utils.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../..');
const CLI = path.join(REPO_ROOT, 'maiass.mjs');

// ── helpers ──────────────────────────────────────────────────────────────────

const tmpRepos = [];

/**
 * Create a fresh, hermetic git repo in os.tmpdir():
 *  - git init + dummy identity, gpgsign off (CI machines may have it on)
 *  - an INITIAL commit so the branch resolves (a zero-commit repo reports
 *    branch=null and skips ticket detection — see git-info.getGitInfo)
 *  - .env.maiass.local pre-created so the run is NOT a first-run (avoids the
 *    welcome banner creating an untracked marker file mid-run)
 *  - checkout the requested working branch
 * Returns the repo path.
 */
function makeRepo({ branch = 'feature/MAI-777_demo' } = {}) {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'maiass-mflag-'));
  tmpRepos.push(dir);
  const git = (args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8' });
  git(['init', '-q']);
  git(['config', 'user.name', 'Test User']);
  git(['config', 'user.email', 'test@example.com']);
  git(['config', 'commit.gpgsign', 'false']);
  // First-run marker so the welcome path (which writes an untracked
  // .env.maiass.local) does not run during the spawned CLI invocation.
  writeFileSync(path.join(dir, '.env.maiass.local'), '# local test settings\n', 'utf8');
  writeFileSync(path.join(dir, 'README.md'), 'init\n', 'utf8');
  git(['add', 'README.md']);
  git(['commit', '-q', '-m', 'initial commit']);
  git(['checkout', '-q', '-b', branch]);
  return dir;
}

/** Stage a change so there is something to commit. */
function stageChange(dir, name = 'file.txt', contents = 'change one\n') {
  writeFileSync(path.join(dir, name), contents, 'utf8');
  execFileSync('git', ['add', name], { cwd: dir, encoding: 'utf8' });
}

/** Write an unstaged (not added) change. */
function unstagedChange(dir, name = 'file.txt', contents = 'change one\n') {
  writeFileSync(path.join(dir, name), contents, 'utf8');
}

/**
 * Run the CLI in the given repo. Captures combined stdout+stderr (the CLI
 * prints errors via log.error → stderr, so both streams must be captured for
 * the assertions to be reliable). stdin is ignored so any interactive prompt
 * would error/hang rather than silently succeed — intentional, we want
 * unattended runs proven unattended. spawnSync (not execFileSync) is used so
 * stdout AND stderr are available on both success and non-zero exit.
 *
 * Returns { status, signal, stdout } where `stdout` is the merged stream.
 */
function runCli(dir, args, { extraEnv = {}, timeout = 30000 } = {}) {
  // Start from a clean, non-interactive env. Crucially MAIASS_AI_TOKEN is
  // absent so no AI/network path is taken; -m bypasses AI regardless.
  const env = {
    ...process.env,
    MAIASS_AUTO_PUSH_COMMITS: 'false',
    MAIASS_AI_MODE: 'ask',
    ...extraEnv,
  };
  delete env.MAIASS_AI_TOKEN;
  // Also strip any inherited auto-stage so individual cases control it.
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

/** Full commit message body (subject + body), trailing newlines stripped. */
function commitBody(dir) {
  return execFileSync('git', ['log', '-1', '--format=%B'], { cwd: dir, encoding: 'utf8' })
    .replace(/\n+$/, '');
}

/** Commit subject (first line) only. */
function commitSubject(dir) {
  return execFileSync('git', ['log', '-1', '--format=%s'], { cwd: dir, encoding: 'utf8' }).trim();
}

/** Current HEAD sha. */
function headSha(dir) {
  return execFileSync('git', ['rev-parse', 'HEAD'], { cwd: dir, encoding: 'utf8' }).trim();
}

/** Number of commits on HEAD. */
function commitCount(dir) {
  return parseInt(
    execFileSync('git', ['rev-list', '--count', 'HEAD'], { cwd: dir, encoding: 'utf8' }).trim(),
    10,
  );
}

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

// ── 1. pure parser unit tests (extractMessageFlag) ─────────────────────────────

describe('extractMessageFlag (pure argv parser)', () => {
  it('returns null message when -m/--message absent', () => {
    const { message, valueIndices } = extractMessageFlag(['-c', 'patch']);
    expect(message).toBeNull();
    expect(valueIndices.size).toBe(0);
  });

  it('parses -m <value> space form and records the value index', () => {
    const argv = ['-c', '-m', 'hello world'];
    const { message, valueIndices } = extractMessageFlag(argv);
    expect(message).toBe('hello world');
    // Value token is argv[2]; the flag token (argv[1]) is NOT recorded.
    expect([...valueIndices]).toEqual([2]);
  });

  it('parses --message <value> space form', () => {
    const { message, valueIndices } = extractMessageFlag(['--message', 'hi there']);
    expect(message).toBe('hi there');
    expect([...valueIndices]).toEqual([1]);
  });

  it('parses --message=<value> equals form and records the flag index', () => {
    const argv = ['-c', '--message=inline value'];
    const { message, valueIndices } = extractMessageFlag(argv);
    expect(message).toBe('inline value');
    // Equals form: the value lives in the flag token itself (argv[1]).
    expect([...valueIndices]).toEqual([1]);
  });

  it('takes the value verbatim — no escape interpretation', () => {
    // A real newline survives; a literal backslash-n stays literal.
    expect(extractMessageFlag(['-m', 'a\nb']).message).toBe('a\nb');
    expect(extractMessageFlag(['-m', 'a\\nb']).message).toBe('a\\nb');
  });

  it('last occurrence wins when the flag repeats', () => {
    expect(extractMessageFlag(['-m', 'first', '--message', 'second']).message).toBe('second');
  });

  it('flag with no following token yields empty string (not null)', () => {
    const { message } = extractMessageFlag(['-c', '-m']);
    expect(message).toBe('');
  });

  it('does not interpret a value that begins with a dash as a flag', () => {
    const { message, valueIndices } = extractMessageFlag(['-m', '-- breaking --']);
    expect(message).toBe('-- breaking --');
    expect([...valueIndices]).toEqual([1]);
  });
});

// ── 2. integration tests (spawn the CLI) ───────────────────────────────────────

describe('-m / --message verbatim commit (integration)', () => {
  // Case 1 — LOAD-BEARING: multiline message committed byte-exact, with the
  // two-space indent and NO blank line between title and bullets. Run on a
  // NON-ticket branch so the asserted body is exactly the input (the ticket
  // prepend is exercised separately in case 5).
  it('commits a multiline message verbatim (indent + no blank line preserved)', () => {
    const dir = makeRepo({ branch: 'feature/no-ticket_demo' });
    stageChange(dir);
    const msg = 'MAIASS test title\n  - fix: one\n  - docs: two';
    const { status } = runCli(dir, ['-c', '-m', msg], {
      extraEnv: { MAIASS_AUTO_STAGE_UNSTAGED: 'true' },
    });
    expect(status).toBe(0);
    expect(commitBody(dir)).toBe('MAIASS test title\n  - fix: one\n  - docs: two');
  });

  // Case 2 — a literal backslash-n must NOT become a newline.
  it('does not interpret a literal backslash-n as a newline', () => {
    const dir = makeRepo({ branch: 'feature/no-ticket_demo' });
    stageChange(dir);
    const { status } = runCli(dir, ['-c', '-m', 'line one\\nstill same arg'], {
      extraEnv: { MAIASS_AUTO_STAGE_UNSTAGED: 'true' },
    });
    expect(status).toBe(0);
    const body = commitBody(dir);
    expect(body).toBe('line one\\nstill same arg');
    // Belt-and-braces: it stayed one physical line.
    expect(body.split('\n')).toHaveLength(1);
  });

  // Case 3 — single line round-trips exactly.
  it('commits a single-line message exactly', () => {
    const dir = makeRepo({ branch: 'feature/no-ticket_demo' });
    stageChange(dir);
    const { status } = runCli(dir, ['-c', '-m', 'single line message'], {
      extraEnv: { MAIASS_AUTO_STAGE_UNSTAGED: 'true' },
    });
    expect(status).toBe(0);
    expect(commitBody(dir)).toBe('single line message');
  });

  // Case 4 — both --message forms work.
  it('accepts the --message=<value> equals form', () => {
    const dir = makeRepo({ branch: 'feature/no-ticket_demo' });
    stageChange(dir);
    const { status } = runCli(dir, ['-c', '--message=equals form works'], {
      extraEnv: { MAIASS_AUTO_STAGE_UNSTAGED: 'true' },
    });
    expect(status).toBe(0);
    expect(commitBody(dir)).toBe('equals form works');
  });

  it('accepts the --message <value> space form', () => {
    const dir = makeRepo({ branch: 'feature/no-ticket_demo' });
    stageChange(dir);
    const { status } = runCli(dir, ['-c', '--message', 'space form works'], {
      extraEnv: { MAIASS_AUTO_STAGE_UNSTAGED: 'true' },
    });
    expect(status).toBe(0);
    expect(commitBody(dir)).toBe('space form works');
  });

  // Case 5 — Jira ticket prepend on a MAI-XXX branch.
  it('prepends the Jira ticket from the branch name to the subject', () => {
    const dir = makeRepo({ branch: 'feature/MAI-777_demo' });
    stageChange(dir);
    const { status } = runCli(dir, ['-c', '-m', 'add the thing'], {
      extraEnv: { MAIASS_AUTO_STAGE_UNSTAGED: 'true' },
    });
    expect(status).toBe(0);
    expect(commitSubject(dir)).toBe('MAI-777 add the thing');
  });

  // Case 6 — idempotent: ticket already present is not doubled.
  it('does not double-prepend a ticket already present in the message', () => {
    const dir = makeRepo({ branch: 'feature/MAI-777_demo' });
    stageChange(dir);
    const { status } = runCli(dir, ['-c', '-m', 'MAI-777 already there'], {
      extraEnv: { MAIASS_AUTO_STAGE_UNSTAGED: 'true' },
    });
    expect(status).toBe(0);
    expect(commitSubject(dir)).toBe('MAI-777 already there');
  });

  // Case 7 — empty / whitespace-only message is a usage error.
  //
  // An explicitly-supplied but empty -m/--message fails fast with a non-zero
  // exit (parity with bash, which aborts here) BEFORE any staging/commit. No
  // commit is created and the run does not hang.
  it('exits non-zero and does not commit when the message is empty', () => {
    const dir = makeRepo({ branch: 'feature/MAI-777_demo' });
    stageChange(dir);
    const before = headSha(dir);
    const beforeCount = commitCount(dir);
    const { status, signal, stdout } = runCli(dir, ['-c', '-m', ''], {
      extraEnv: { MAIASS_AUTO_STAGE_UNSTAGED: 'true' },
    });
    // Did not hang (no kill-by-timeout).
    expect(signal).toBeNull();
    // Usage error → non-zero exit (parity with bash).
    expect(status).not.toBe(0);
    // HEAD unchanged — no new commit was created.
    expect(headSha(dir)).toBe(before);
    expect(commitCount(dir)).toBe(beforeCount);
    // Clear error surfaced.
    expect(stdout).toContain('requires a non-empty value');
  });

  it('exits non-zero and does not commit when the message is whitespace-only', () => {
    const dir = makeRepo({ branch: 'feature/MAI-777_demo' });
    stageChange(dir);
    const before = headSha(dir);
    const beforeCount = commitCount(dir);
    const { status, signal, stdout } = runCli(dir, ['-c', '-m', '   '], {
      extraEnv: { MAIASS_AUTO_STAGE_UNSTAGED: 'true' },
    });
    expect(signal).toBeNull();
    expect(status).not.toBe(0);
    expect(headSha(dir)).toBe(before);
    expect(commitCount(dir)).toBe(beforeCount);
    expect(stdout).toContain('requires a non-empty value');
  });

  // Case 8 — `-ac -m` is fully unattended even with UNSTAGED changes and NO
  // auto-stage env preset (-ac supplies the auto-yes itself). The timeout in
  // runCli converts any hang into a test failure rather than a blocked suite.
  it('runs fully unattended with -ac -m on a repo with unstaged changes (no auto-stage env)', () => {
    const dir = makeRepo({ branch: 'feature/MAI-777_demo' });
    unstagedChange(dir); // NOT git-added — -ac must stage it itself
    // Deliberately do NOT set MAIASS_AUTO_STAGE_UNSTAGED.
    const { status, signal } = runCli(dir, ['-ac', '-m', 'MAI-777 unattended'], { timeout: 30000 });
    // A hang would surface as signal === 'SIGTERM' (execFileSync timeout kill).
    expect(signal).toBeNull();
    expect(status).toBe(0);
    expect(commitSubject(dir)).toBe('MAI-777 unattended');
  });

  // Case 9 — no token / no AI / no network. All the runs above already delete
  // MAIASS_AI_TOKEN; this asserts the commit succeeds in that state explicitly,
  // and that nothing in the output indicates an AI/network path was taken.
  it('commits with no AI token set and never touches the network', () => {
    const dir = makeRepo({ branch: 'feature/no-ticket_demo' });
    stageChange(dir);
    const { status, stdout } = runCli(dir, ['-c', '-m', 'offline commit'], {
      extraEnv: { MAIASS_AUTO_STAGE_UNSTAGED: 'true' },
    });
    expect(status).toBe(0);
    expect(commitBody(dir)).toBe('offline commit');
    // -m short-circuits before any AI proxy / anonymous-subscription request.
    expect(stdout).not.toMatch(/anonymous subscription/i);
    expect(stdout).not.toMatch(/AI to suggest a commit message/i);
    expect(stdout).not.toMatch(/Waiting for AI response/i);
  });
});
