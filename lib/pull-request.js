import { execSync, spawn } from 'child_process';
import { detectRepoProvider } from './repo-provider.js';

/**
 * Build a provider-specific URL that opens the PR creation form pre-filled
 * with source/target branches and a title.
 *
 * @param {Object} args
 * @param {string} args.provider - 'github' | 'bitbucket' | 'gitlab'
 * @param {string} args.owner - Repo owner / workspace
 * @param {string} args.repo - Repo name / slug
 * @param {string} args.source - Source branch (the changes)
 * @param {string} args.target - Target branch (where they're merging into)
 * @param {string} [args.title] - Optional PR title
 * @returns {string|null} The URL, or null if provider unsupported
 */
export function buildPullRequestUrl({ provider, owner, repo, source, target, title = '' }) {
  const encodedTitle = encodeURIComponent(title);

  if (provider === 'github') {
    // GitHub's quick_pull form: /compare/target...source?quick_pull=1&title=...
    const base = `https://github.com/${owner}/${repo}/compare/${target}...${source}?quick_pull=1`;
    return title ? `${base}&title=${encodedTitle}` : base;
  }

  if (provider === 'bitbucket') {
    // Bitbucket: /pull-requests/new?source=...&dest=...&title=...
    const base = `https://bitbucket.org/${owner}/${repo}/pull-requests/new?source=${source}&dest=${target}`;
    return title ? `${base}&title=${encodedTitle}` : base;
  }

  if (provider === 'gitlab') {
    // GitLab: /-/merge_requests/new?merge_request[source_branch]=...&...
    const params = new URLSearchParams({
      'merge_request[source_branch]': source,
      'merge_request[target_branch]': target
    });
    if (title) params.set('merge_request[title]', title);
    return `https://gitlab.com/${owner}/${repo}/-/merge_requests/new?${params.toString()}`;
  }

  return null;
}

/**
 * Open a URL in the user's default browser using the platform-native command.
 * Uses spawn so it doesn't block, and detaches so the parent can exit cleanly.
 *
 * @param {string} url
 * @returns {boolean} True if the open command was launched
 */
export function openInBrowser(url) {
  const platform = process.platform;
  let cmd, args;

  if (platform === 'darwin') {
    cmd = 'open';
    args = [url];
  } else if (platform === 'win32') {
    cmd = 'cmd';
    args = ['/c', 'start', '""', url];
  } else {
    // Linux + others: xdg-open is the standard
    cmd = 'xdg-open';
    args = [url];
  }

  try {
    const child = spawn(cmd, args, { detached: true, stdio: 'ignore' });
    child.unref();
    return true;
  } catch {
    return false;
  }
}

/**
 * Push a branch to origin, setting upstream if needed.
 * Used before opening the PR URL so the source branch exists on the remote.
 */
function pushBranchToOrigin(branch) {
  try {
    execSync(`git push --set-upstream origin ${branch}`, { stdio: ['pipe', 'pipe', 'pipe'] });
    return { success: true };
  } catch (error) {
    // Fall back to a plain push if upstream is already set
    try {
      execSync(`git push origin ${branch}`, { stdio: ['pipe', 'pipe', 'pipe'] });
      return { success: true };
    } catch (innerError) {
      return { success: false, error: innerError.message };
    }
  }
}

/**
 * Push the source branch and open a PR-creation URL in the browser.
 * Mirrors the bashmaiass `perform_merge_operation` PR path.
 *
 * @param {Object} args
 * @param {string} args.source - Source branch
 * @param {string} args.target - Target branch
 * @param {string} [args.title] - Optional PR title
 * @param {Object} [deps] - Injectable dependencies for testing
 * @param {Function} [deps.detect] - Provider detection function (defaults to detectRepoProvider)
 * @param {Function} [deps.push] - Branch push function (defaults to pushBranchToOrigin)
 * @param {Function} [deps.open] - Browser open function (defaults to openInBrowser)
 * @returns {{success: boolean, url?: string, error?: string}}
 */
export function createPullRequest({ source, target, title }, deps = {}) {
  const detect = deps.detect || detectRepoProvider;
  const push   = deps.push   || pushBranchToOrigin;
  const open   = deps.open   || openInBrowser;

  const repoInfo = detect();
  if (!repoInfo) {
    return { success: false, error: 'Could not detect repository provider from git remote' };
  }

  const url = buildPullRequestUrl({
    provider: repoInfo.provider,
    owner: repoInfo.owner,
    repo: repoInfo.repo,
    source,
    target,
    title
  });
  if (!url) {
    return { success: false, error: `Unsupported provider: ${repoInfo.provider}` };
  }

  // Push source branch so the PR has commits to compare against
  const pushResult = push(source);
  if (!pushResult.success) {
    return { success: false, error: `Failed to push ${source}: ${pushResult.error}` };
  }

  open(url);
  return { success: true, url };
}
