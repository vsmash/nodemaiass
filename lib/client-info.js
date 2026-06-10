// Client information utilities
// Provides client name and version for API headers

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let cachedVersion = null;

/**
 * Get the current version from package.json
 * @returns {string} Version string
 */
function getVersionFromPackageJson() {
  if (cachedVersion) {
    return cachedVersion;
  }
  
  try {
    const packageJsonPath = path.join(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    cachedVersion = packageJson.version || '0.0.0';
    return cachedVersion;
  } catch (error) {
    console.error('Warning: Could not read version from package.json:', error.message);
    return '0.0.0';
  }
}

/**
 * Get client name for API headers
 * Uses MAIASS_CLIENT_NAME environment variable or defaults to 'nodemaiass'
 * @returns {string} Client name
 */
export function getClientName() {
  return process.env.MAIASS_CLIENT_NAME || 'nodemaiass';
}

/**
 * Get client version for API headers
 * Priority: MAIASS_CLIENT_VERSION env var > package.json version
 * @returns {string} Client version
 */
export function getClientVersion() {
  return process.env.MAIASS_CLIENT_VERSION || getVersionFromPackageJson();
}

/**
 * Get both client name and version
 * @returns {Object} Object with name and version properties
 */
export function getClientInfo() {
  return {
    name: getClientName(),
    version: getClientVersion()
  };
}

/**
 * Robustly decide whether AI is effectively OFF based on MAIASS_AI_MODE.
 *
 * MAI-98: the GitHub Actions version-bump workflow set `MAIASS_AI_MODE: off`
 * (an unquoted YAML boolean) which GitHub stringifies to "false". We also need
 * to treat the various "off"-ish spellings consistently everywhere so no AI
 * path ever fires when the operator meant to disable it. A null/undefined/empty
 * value is NOT off (default behaviour is the interactive 'ask' mode).
 *
 * @param {string|undefined} [mode] - raw MAIASS_AI_MODE value (defaults to env)
 * @returns {boolean} true when AI should be considered disabled
 */
export function isAIModeOff(mode = process.env.MAIASS_AI_MODE) {
  if (mode === undefined || mode === null) return false;
  const normalised = String(mode).trim().toLowerCase();
  if (normalised === '') return false;
  return ['off', 'false', 'no', '0', 'disabled'].includes(normalised);
}

/**
 * Detect whether we are running inside a CI / automation environment.
 *
 * MAI-98: ephemeral CI runners produce a fresh machine fingerprint on every
 * run, so any anonymous-subscription mint there creates a brand new sub +
 * free-credit grant that is never reused — draining the global free pool.
 * When in CI with no pre-existing token we must never mint an anonymous sub.
 *
 * @returns {boolean} true when a known CI environment is detected
 */
export function isCI() {
  return (
    process.env.CI === 'true' ||
    !!process.env.GITHUB_ACTIONS ||
    !!process.env.GITLAB_CI ||
    !!process.env.CIRCLECI ||
    !!process.env.BUILDKITE ||
    !!process.env.TF_BUILD
  );
}

/**
 * Headers to attach to MAIASS proxy / token requests so the server can
 * independently detect CI and apply its own anti-abuse handling.
 *
 * MAI-98 SHARED CONTRACT with worker-api-specialist: the header name is
 * `X-MAIASS-CI` and is only sent when {@link isCI} is true.
 *
 * @returns {Object} header object ({} when not in CI)
 */
export function ciHeaders() {
  return isCI() ? { 'X-MAIASS-CI': 'true' } : {};
}
