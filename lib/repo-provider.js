import { execSync } from 'child_process';

/**
 * Parse a git remote URL and extract provider, owner, and repo.
 * Supports common GitHub, Bitbucket, and GitLab URL formats:
 *
 *   https://github.com/owner/repo.git
 *   git@github.com:owner/repo.git
 *   https://bitbucket.org/workspace/slug.git
 *   git@bitbucket.org:workspace/slug.git
 *   https://gitlab.com/group/project.git
 *   git@gitlab.com:group/project.git
 *
 * @param {string} url - Remote URL (e.g. from `git config --get remote.origin.url`)
 * @returns {{provider: string, owner: string, repo: string} | null}
 */
export function parseRemoteUrl(url) {
  if (!url) return null;

  // Match host + path from either SSH (git@host:path) or HTTPS (https://host/path) form
  const sshMatch = url.match(/^git@([^:]+):(.+?)(?:\.git)?\/?$/);
  const httpsMatch = url.match(/^https?:\/\/(?:[^@]+@)?([^/]+)\/(.+?)(?:\.git)?\/?$/);

  const match = sshMatch || httpsMatch;
  if (!match) return null;

  const host = match[1].toLowerCase();
  const path = match[2];

  // Need at least owner/repo — anything less can't be a valid remote
  const parts = path.split('/');
  if (parts.length < 2) return null;

  // Last segment is repo; everything before is the owner (handles GitLab subgroups)
  const repo = parts.pop();
  const owner = parts.join('/');

  let provider = null;
  if (host.includes('github.com')) provider = 'github';
  else if (host.includes('bitbucket.org')) provider = 'bitbucket';
  else if (host.includes('gitlab.com') || host.includes('gitlab.')) provider = 'gitlab';
  else return null;

  return { provider, owner, repo };
}

/**
 * Read the origin remote URL via git. Returns null if no remote or not a git repo.
 */
export function getOriginUrl() {
  try {
    const url = execSync('git config --get remote.origin.url', {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    }).trim();
    return url || null;
  } catch {
    return null;
  }
}

/**
 * Detect repo provider/owner/repo from the current git remote.
 * Respects existing env vars so the user can override auto-detection in `.env.maiass`.
 *
 * Sets the following on `process.env` if not already set:
 *   MAIASS_REPO_PROVIDER, MAIASS_GITHUB_OWNER, MAIASS_GITHUB_REPO,
 *   MAIASS_BITBUCKET_WORKSPACE, MAIASS_BITBUCKET_REPO_SLUG
 *
 * @returns {{provider: string, owner: string, repo: string} | null}
 */
export function detectRepoProvider() {
  // Respect explicit override — if all the relevant vars are already set, skip detection
  const overrideProvider = process.env.MAIASS_REPO_PROVIDER;
  if (overrideProvider) {
    return {
      provider: overrideProvider,
      owner: process.env.MAIASS_GITHUB_OWNER || process.env.MAIASS_BITBUCKET_WORKSPACE || '',
      repo: process.env.MAIASS_GITHUB_REPO || process.env.MAIASS_BITBUCKET_REPO_SLUG || ''
    };
  }

  const url = getOriginUrl();
  const parsed = parseRemoteUrl(url);
  if (!parsed) return null;

  // Cache to env so the rest of the pipeline can read consistently
  process.env.MAIASS_REPO_PROVIDER = parsed.provider;
  if (parsed.provider === 'github') {
    process.env.MAIASS_GITHUB_OWNER = parsed.owner;
    process.env.MAIASS_GITHUB_REPO = parsed.repo;
  } else if (parsed.provider === 'bitbucket') {
    process.env.MAIASS_BITBUCKET_WORKSPACE = parsed.owner;
    process.env.MAIASS_BITBUCKET_REPO_SLUG = parsed.repo;
  }

  return parsed;
}
