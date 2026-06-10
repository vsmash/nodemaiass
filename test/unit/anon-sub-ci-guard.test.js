// MAI-98 — regression tests for the anonymous-subscription guard.
//
// Bug: `maiass -a patch` on an ephemeral CI runner (the --create-gh-action
// version-bump workflow) minted a brand-new anonymous subscription + free-
// credit grant on every run, because:
//   1. the workflow's `MAIASS_AI_MODE: off` was an unquoted YAML boolean that
//      GitHub stringifies to "false", and
//   2. even when it reached the CLI correctly, the repo's tracked .env.maiass
//      (loaded with override) could flip AI back on,
// so createAnonymousSubscriptionIfNeeded() POSTed /v1/token with a fresh
// machine fingerprint every time.
//
// Fix (defense in depth): createAnonymousSubscriptionIfNeeded() returns null and
// makes NO network call when AI is effectively off OR when running in CI with no
// pre-existing token. These tests mock the network so no real calls are made.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// No token in secure storage -> forces the mint path (unless guarded).
vi.mock('../../lib/secure-storage.js', () => ({
  retrieveSecureVariable: vi.fn(() => null),
  storeSecureVariable: vi.fn(() => true),
  removeSecureVariable: vi.fn(() => true),
  loadSecureVariables: vi.fn(() => {}),
  isSecureStorageAvailable: vi.fn(() => true),
  getSecureServiceName: vi.fn(() => 'test'),
}));

// Deterministic fingerprint, no system probing.
vi.mock('../../lib/machine-fingerprint.js', () => ({
  generateMachineFingerprint: vi.fn(() => 'test-fingerprint'),
}));

import { createAnonymousSubscriptionIfNeeded } from '../../lib/commit.js';
import { isAIModeOff, isCI } from '../../lib/client-info.js';

// Env keys we mutate per test — snapshot & restore so cases don't leak.
const ENV_KEYS = [
  'MAIASS_AI_MODE', 'MAIASS_AI_TOKEN', 'MAIASS_SUBSCRIPTION_ID',
  'MAIASS_CREDITS_REMAINING', 'MAIASS_DEBUG', 'MAIASS_AI_HOST',
  'CI', 'GITHUB_ACTIONS', 'GITLAB_CI', 'CIRCLECI', 'BUILDKITE', 'TF_BUILD',
];

let savedEnv;
let fetchSpy;

beforeEach(() => {
  savedEnv = {};
  for (const k of ENV_KEYS) savedEnv[k] = process.env[k];
  // Clean slate: no token, no CI markers, no explicit AI mode.
  for (const k of ENV_KEYS) delete process.env[k];

  // A successful mint response — proves that when fetch DOES run we'd create a
  // sub, so the "no fetch" assertions are meaningful.
  fetchSpy = vi.fn(async () => ({
    ok: true,
    status: 200,
    statusText: 'OK',
    json: async () => ({ apiKey: 'anon-key-123', id: 'sub_abc', creditsRemaining: 50 }),
    text: async () => '',
  }));
  vi.stubGlobal('fetch', fetchSpy);
});

afterEach(() => {
  for (const k of ENV_KEYS) {
    if (savedEnv[k] === undefined) delete process.env[k];
    else process.env[k] = savedEnv[k];
  }
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe('isAIModeOff', () => {
  it.each([
    ['off', true],
    ['OFF', true],
    ['false', true],   // unquoted YAML `off` -> GitHub stringifies to "false"
    ['False', true],
    ['no', true],
    ['0', true],
    ['disabled', true],
    ['  off  ', true],
    ['ask', false],
    ['autosuggest', false],
    ['ai_only', false],
    ['', false],       // empty -> default behaviour (not off)
  ])('treats %j as off=%s', (value, expected) => {
    expect(isAIModeOff(value)).toBe(expected);
  });

  it('is not off when undefined (defaults to interactive ask)', () => {
    expect(isAIModeOff(undefined)).toBe(false);
  });
});

describe('isCI', () => {
  it('detects CI=true', () => {
    process.env.CI = 'true';
    expect(isCI()).toBe(true);
  });
  it('detects GITHUB_ACTIONS', () => {
    process.env.GITHUB_ACTIONS = 'true';
    expect(isCI()).toBe(true);
  });
  it('is false with no CI markers', () => {
    expect(isCI()).toBe(false);
  });
});

describe('createAnonymousSubscriptionIfNeeded — MAI-98 guard', () => {
  it.each(['off', 'false', 'no', '0', 'disabled'])(
    'MAIASS_AI_MODE=%s -> returns null, no /v1/token call',
    async (mode) => {
      process.env.MAIASS_AI_MODE = mode;
      const result = await createAnonymousSubscriptionIfNeeded();
      expect(result).toBeNull();
      expect(fetchSpy).not.toHaveBeenCalled();
    },
  );

  it('CI=true with no token -> returns null, no /v1/token call (run proceeds without AI)', async () => {
    process.env.CI = 'true';
    // AI mode left at default (would otherwise be "on")
    const result = await createAnonymousSubscriptionIfNeeded();
    expect(result).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('GITHUB_ACTIONS set with no token -> returns null, no /v1/token call', async () => {
    process.env.GITHUB_ACTIONS = 'true';
    const result = await createAnonymousSubscriptionIfNeeded();
    expect(result).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('an existing MAIASS_AI_TOKEN short-circuits before any guard or network', async () => {
    process.env.CI = 'true';
    process.env.MAIASS_AI_MODE = 'off';
    process.env.MAIASS_AI_TOKEN = 'pre-existing-token';
    const result = await createAnonymousSubscriptionIfNeeded();
    expect(result).toBe('pre-existing-token');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('normal local, AI ask, no token -> mints a sub (unchanged behaviour)', async () => {
    process.env.MAIASS_AI_MODE = 'ask';
    // not in CI, no token
    const result = await createAnonymousSubscriptionIfNeeded();
    expect(result).toBe('anon-key-123');
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, opts] = fetchSpy.mock.calls[0];
    expect(String(url)).toContain('/v1/token');
    // Not in CI -> no X-MAIASS-CI header
    expect(opts.headers['X-MAIASS-CI']).toBeUndefined();
  });

  it('local mint sends X-Client headers (contract preserved)', async () => {
    process.env.MAIASS_AI_MODE = 'ask';
    await createAnonymousSubscriptionIfNeeded();
    const [, opts] = fetchSpy.mock.calls[0];
    expect(opts.headers['X-Client-Name']).toBeTruthy();
    expect(opts.headers['X-Client-Version']).toBeTruthy();
  });
});
