import { describe, it, expect, vi } from 'vitest';
import { checkForUpdates } from '../../lib/update-check.js';

// Helper: build a mock fetch that returns a given npm registry response
function mockFetch(latestVersion, { status = 200 } = {}) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => ({ 'dist-tags': { latest: latestVersion } })
  });
}

// Helper: build a mock fetch that rejects (network error / timeout)
function mockFetchError(message = 'Network error') {
  return vi.fn().mockRejectedValue(new Error(message));
}

// Helper: mock an AbortError (simulates 3s timeout firing)
function mockFetchAbort() {
  const err = new Error('The operation was aborted');
  err.name = 'AbortError';
  return vi.fn().mockRejectedValue(err);
}

describe('checkForUpdates', () => {
  it('returns updateAvailable=false when current equals latest', async () => {
    const result = await checkForUpdates('5.10.3', mockFetch('5.10.3'));
    expect(result.updateAvailable).toBe(false);
    expect(result.currentVersion).toBe('5.10.3');
    expect(result.latestVersion).toBe('5.10.3');
  });

  it('returns updateAvailable=true when patch is behind', async () => {
    const result = await checkForUpdates('5.10.3', mockFetch('5.10.4'));
    expect(result.updateAvailable).toBe(true);
    expect(result.latestVersion).toBe('5.10.4');
  });

  it('returns updateAvailable=true when minor is behind', async () => {
    const result = await checkForUpdates('5.9.0', mockFetch('5.10.0'));
    expect(result.updateAvailable).toBe(true);
  });

  it('returns updateAvailable=true when major is behind', async () => {
    const result = await checkForUpdates('4.0.0', mockFetch('5.0.0'));
    expect(result.updateAvailable).toBe(true);
  });

  it('returns updateAvailable=false when current is ahead (dev build)', async () => {
    // Local dev version may be ahead of what is published — should not prompt update
    const result = await checkForUpdates('5.10.5', mockFetch('5.10.3'));
    expect(result.updateAvailable).toBe(false);
  });

  it('returns updateAvailable=false on HTTP error', async () => {
    const result = await checkForUpdates('5.10.3', mockFetch('5.10.4', { status: 500 }));
    expect(result.updateAvailable).toBe(false);
    expect(result.error).toMatch(/500/);
  });

  it('returns updateAvailable=false on network error', async () => {
    const result = await checkForUpdates('5.10.3', mockFetchError());
    expect(result.updateAvailable).toBe(false);
    expect(result.error).toBe('Network error');
  });

  it('returns updateAvailable=false on timeout (AbortError)', async () => {
    const result = await checkForUpdates('5.10.3', mockFetchAbort());
    expect(result.updateAvailable).toBe(false);
    expect(result.error).toBe('Request timeout');
  });

  it('returns updateAvailable=false when registry returns no dist-tags', async () => {
    const fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({}) // no dist-tags at all
    });
    const result = await checkForUpdates('5.10.3', fetch);
    expect(result.updateAvailable).toBe(false);
    expect(result.error).toMatch(/No latest version/);
  });
});
