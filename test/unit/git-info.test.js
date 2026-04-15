import { describe, it, expect } from 'vitest';
import { extractJiraTicket } from '../../lib/git-info.js';

describe('extractJiraTicket', () => {

  // ── Jira ───────────────────────────────────────────────────────────────────

  describe('Jira patterns', () => {
    it('extracts from feature/ABC-123', () => {
      expect(extractJiraTicket('feature/ABC-123')).toBe('ABC-123');
    });

    it('extracts from feature/ABC-123-description', () => {
      expect(extractJiraTicket('feature/ABC-123-some-feature')).toBe('ABC-123');
    });

    it('extracts from bare ABC-123 at branch root', () => {
      expect(extractJiraTicket('ABC-123-some-feature')).toBe('ABC-123');
    });

    it('extracts from nested path foo/bar/ABC-123', () => {
      expect(extractJiraTicket('foo/bar/ABC-123-thing')).toBe('ABC-123');
    });

    it('extracts from RDCTL-45 style', () => {
      expect(extractJiraTicket('RDCTL-45')).toBe('RDCTL-45');
    });
  });

  // ── Numeric (GitHub Projects / Trello) ────────────────────────────────────

  describe('numeric ticket patterns', () => {
    it('extracts from 123-description at branch root', () => {
      expect(extractJiraTicket('123-some-feature')).toBe('123');
    });

    it('extracts from feature/123-description', () => {
      expect(extractJiraTicket('feature/123-some-feature')).toBe('123');
    });

    it('extracts from feature/sub/123-description', () => {
      expect(extractJiraTicket('feature/sub/123-some-feature')).toBe('123');
    });

    it('extracts from #123-description at branch root', () => {
      expect(extractJiraTicket('#123-some-feature')).toBe('#123');
    });

    it('extracts from feature/#123-description', () => {
      expect(extractJiraTicket('feature/#123-some-feature')).toBe('#123');
    });
  });

  // ── No match ──────────────────────────────────────────────────────────────

  describe('non-ticket branches', () => {
    it('returns null for develop', () => {
      expect(extractJiraTicket('develop')).toBeNull();
    });

    it('returns null for main', () => {
      expect(extractJiraTicket('main')).toBeNull();
    });

    it('returns null for release/1.2.3', () => {
      expect(extractJiraTicket('release/1.2.3')).toBeNull();
    });

    it('returns null for hotfix/urgent-fix (no ticket number)', () => {
      expect(extractJiraTicket('hotfix/urgent-fix')).toBeNull();
    });

    it('returns null for empty string', () => {
      expect(extractJiraTicket('')).toBeNull();
    });

    it('returns null for null', () => {
      expect(extractJiraTicket(null)).toBeNull();
    });
  });

});
