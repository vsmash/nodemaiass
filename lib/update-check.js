/**
 * Check npm registry for a newer version of maiass.
 * Resolves quickly (3s timeout) and never throws — callers can fire-and-forget.
 *
 * @param {string} currentVersion - The currently running version (e.g. "5.10.3")
 * @param {Function} [fetchFn] - Optional fetch override for testing
 * @returns {Promise<{updateAvailable: boolean, currentVersion: string, latestVersion?: string, error?: string}>}
 */
export async function checkForUpdates(currentVersion, fetchFn = fetch) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout

    const response = await fetchFn('https://registry.npmjs.org/maiass', {
      headers: {
        'Accept': 'application/vnd.npm.install-v1+json',
        'User-Agent': 'MAIASS-Version-Checker'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return { updateAvailable: false, currentVersion, error: `HTTP ${response.status}` };
    }

    const data = await response.json();
    const latestVersion = data['dist-tags']?.latest;

    if (!latestVersion) {
      return { updateAvailable: false, currentVersion, error: 'No latest version in registry' };
    }

    // Semantic version comparison — compares each part left to right
    const current = currentVersion.split('.').map(n => parseInt(n, 10));
    const latest  = latestVersion.split('.').map(n => parseInt(n, 10));

    let updateAvailable = false;
    for (let i = 0; i < Math.max(current.length, latest.length); i++) {
      const c = current[i] || 0;
      const l = latest[i]  || 0;
      if (l > c) { updateAvailable = true; break; }
      if (l < c) { break; }
    }

    return { updateAvailable, currentVersion, latestVersion };

  } catch (error) {
    const msg = error.name === 'AbortError' ? 'Request timeout' : error.message;
    return { updateAvailable: false, currentVersion, error: msg };
  }
}
