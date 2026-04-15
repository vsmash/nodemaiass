import { describe, it, expect } from 'vitest';

// Test the ticket-stripping regex in isolation — same pattern as changelog.js
const stripTicket = (line) =>
  line.replace(/^\[?(?:[A-Z]+-[0-9]+|#?\d+)\]?[\s:—-]+/gm, '');

describe('changelog ticket stripping', () => {

  it('strips Jira ticket prefix', () => {
    expect(stripTicket('ABC-123 fixed the thing')).toBe('fixed the thing');
  });

  it('strips Jira ticket with colon', () => {
    expect(stripTicket('ABC-123: fixed the thing')).toBe('fixed the thing');
  });

  it('strips bracketed Jira ticket', () => {
    expect(stripTicket('[ABC-123] fixed the thing')).toBe('fixed the thing');
  });

  it('strips numeric ticket prefix', () => {
    expect(stripTicket('123 fixed the thing')).toBe('fixed the thing');
  });

  it('strips numeric ticket with dash', () => {
    expect(stripTicket('123 - fixed the thing')).toBe('fixed the thing');
  });

  it('strips hash-prefixed numeric ticket', () => {
    expect(stripTicket('#123 fixed the thing')).toBe('fixed the thing');
  });

  it('strips hash-prefixed numeric ticket with colon', () => {
    expect(stripTicket('#123: fixed the thing')).toBe('fixed the thing');
  });

  it('leaves plain commit message untouched', () => {
    expect(stripTicket('fixed the thing')).toBe('fixed the thing');
  });

  it('leaves conventional commit untouched', () => {
    expect(stripTicket('fix: corrected null check')).toBe('fix: corrected null check');
  });

});
