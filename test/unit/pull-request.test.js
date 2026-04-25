import { describe, it, expect, vi } from 'vitest';
import { buildPullRequestUrl, createPullRequest } from '../../lib/pull-request.js';

describe('buildPullRequestUrl', () => {
  it('builds a GitHub PR URL with title', () => {
    const url = buildPullRequestUrl({
      provider: 'github',
      owner: 'vsmash',
      repo: 'maiass',
      source: 'feature/foo',
      target: 'develop',
      title: 'Release 1.2.3'
    });
    expect(url).toBe('https://github.com/vsmash/maiass/compare/develop...feature/foo?quick_pull=1&title=Release%201.2.3');
  });

  it('builds a GitHub PR URL without title', () => {
    const url = buildPullRequestUrl({
      provider: 'github', owner: 'vsmash', repo: 'maiass',
      source: 'feature/foo', target: 'develop'
    });
    expect(url).toBe('https://github.com/vsmash/maiass/compare/develop...feature/foo?quick_pull=1');
  });

  it('builds a Bitbucket PR URL', () => {
    const url = buildPullRequestUrl({
      provider: 'bitbucket',
      owner: 'myteam',
      repo: 'myrepo',
      source: 'feature/x',
      target: 'staging',
      title: 'Test PR'
    });
    expect(url).toBe('https://bitbucket.org/myteam/myrepo/pull-requests/new?source=feature/x&dest=staging&title=Test%20PR');
  });

  it('builds a GitLab MR URL', () => {
    const url = buildPullRequestUrl({
      provider: 'gitlab',
      owner: 'group/sub',
      repo: 'proj',
      source: 'feature/x',
      target: 'main',
      title: 'My MR'
    });
    expect(url).toContain('https://gitlab.com/group/sub/proj/-/merge_requests/new?');
    expect(url).toContain('merge_request%5Bsource_branch%5D=feature%2Fx');
    expect(url).toContain('merge_request%5Btarget_branch%5D=main');
    expect(url).toContain('merge_request%5Btitle%5D=My+MR');
  });

  it('returns null for unsupported provider', () => {
    expect(buildPullRequestUrl({
      provider: 'sourceforge', owner: 'x', repo: 'y',
      source: 'a', target: 'b'
    })).toBeNull();
  });
});

describe('createPullRequest', () => {
  // Mock helpers — return capturable spies for detect/push/open
  function mocks({ provider = 'github', pushOk = true } = {}) {
    return {
      detect: vi.fn().mockReturnValue({ provider, owner: 'vsmash', repo: 'maiass' }),
      push:   vi.fn().mockReturnValue({ success: pushOk, error: pushOk ? undefined : 'remote rejected' }),
      open:   vi.fn().mockReturnValue(true)
    };
  }

  it('succeeds: detects, pushes, opens browser with correct URL', () => {
    const m = mocks();
    const result = createPullRequest({ source: 'feature/x', target: 'develop', title: 'PR' }, m);

    expect(result.success).toBe(true);
    expect(result.url).toContain('github.com/vsmash/maiass/compare/develop...feature/x');
    expect(m.detect).toHaveBeenCalledOnce();
    expect(m.push).toHaveBeenCalledWith('feature/x');
    expect(m.open).toHaveBeenCalledWith(result.url);
  });

  it('fails when provider detection returns null', () => {
    const detect = vi.fn().mockReturnValue(null);
    const push = vi.fn();
    const open = vi.fn();
    const result = createPullRequest({ source: 'x', target: 'y' }, { detect, push, open });

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/detect/i);
    expect(push).not.toHaveBeenCalled();
    expect(open).not.toHaveBeenCalled();
  });

  it('fails when push fails — does not open browser', () => {
    const m = mocks({ pushOk: false });
    const result = createPullRequest({ source: 'feature/x', target: 'develop' }, m);

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/push/i);
    expect(m.open).not.toHaveBeenCalled();
  });

  it('fails for unsupported provider — does not push', () => {
    const m = mocks({ provider: 'sourceforge' });
    const result = createPullRequest({ source: 'x', target: 'y' }, m);

    expect(result.success).toBe(false);
    expect(m.push).not.toHaveBeenCalled();
  });
});
