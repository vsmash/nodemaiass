import { describe, it, expect } from 'vitest';
import { parseRemoteUrl } from '../../lib/repo-provider.js';

describe('parseRemoteUrl', () => {
  describe('GitHub', () => {
    it('parses HTTPS URLs with .git suffix', () => {
      expect(parseRemoteUrl('https://github.com/vsmash/maiass.git'))
        .toEqual({ provider: 'github', owner: 'vsmash', repo: 'maiass' });
    });

    it('parses HTTPS URLs without .git suffix', () => {
      expect(parseRemoteUrl('https://github.com/vsmash/maiass'))
        .toEqual({ provider: 'github', owner: 'vsmash', repo: 'maiass' });
    });

    it('parses SSH URLs', () => {
      expect(parseRemoteUrl('git@github.com:vsmash/maiass.git'))
        .toEqual({ provider: 'github', owner: 'vsmash', repo: 'maiass' });
    });

    it('parses HTTPS URLs with auth token in URL', () => {
      expect(parseRemoteUrl('https://x-access-token:abc123@github.com/vsmash/maiass.git'))
        .toEqual({ provider: 'github', owner: 'vsmash', repo: 'maiass' });
    });
  });

  describe('Bitbucket', () => {
    it('parses HTTPS URLs', () => {
      expect(parseRemoteUrl('https://bitbucket.org/myteam/myrepo.git'))
        .toEqual({ provider: 'bitbucket', owner: 'myteam', repo: 'myrepo' });
    });

    it('parses SSH URLs', () => {
      expect(parseRemoteUrl('git@bitbucket.org:myteam/myrepo.git'))
        .toEqual({ provider: 'bitbucket', owner: 'myteam', repo: 'myrepo' });
    });
  });

  describe('GitLab', () => {
    it('parses HTTPS URLs at gitlab.com', () => {
      expect(parseRemoteUrl('https://gitlab.com/mygroup/myproject.git'))
        .toEqual({ provider: 'gitlab', owner: 'mygroup', repo: 'myproject' });
    });

    it('parses SSH URLs at gitlab.com', () => {
      expect(parseRemoteUrl('git@gitlab.com:mygroup/myproject.git'))
        .toEqual({ provider: 'gitlab', owner: 'mygroup', repo: 'myproject' });
    });

    it('parses GitLab subgroups', () => {
      expect(parseRemoteUrl('git@gitlab.com:mygroup/subteam/myproject.git'))
        .toEqual({ provider: 'gitlab', owner: 'mygroup/subteam', repo: 'myproject' });
    });

    it('parses self-hosted GitLab URLs', () => {
      expect(parseRemoteUrl('https://gitlab.example.com/mygroup/myproject.git'))
        .toEqual({ provider: 'gitlab', owner: 'mygroup', repo: 'myproject' });
    });
  });

  describe('Edge cases', () => {
    it('returns null for null input', () => {
      expect(parseRemoteUrl(null)).toBeNull();
    });

    it('returns null for empty string', () => {
      expect(parseRemoteUrl('')).toBeNull();
    });

    it('returns null for unknown providers', () => {
      expect(parseRemoteUrl('git@example.com:foo/bar.git')).toBeNull();
    });

    it('returns null for malformed URLs', () => {
      expect(parseRemoteUrl('not-a-url')).toBeNull();
    });

    it('returns null when path is too short', () => {
      expect(parseRemoteUrl('https://github.com/onlyowner')).toBeNull();
    });
  });
});
