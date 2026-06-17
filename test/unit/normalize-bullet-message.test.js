import { describe, it, expect } from 'vitest';
import { normalizeBulletMessage } from '../../lib/commit.js';

// MAI-108: the AI commit-message bullet prompt previously embedded literal
// few-shot example bullets that small models echoed verbatim. The prompt is now
// de-leaked, and bullet-style output is run through normalizeBulletMessage() so
// the on-disk format is deterministic regardless of which model produced it.
//
// Contract:
//   - first non-empty line becomes the title (any leading "- "/"* " stripped),
//   - every subsequent non-empty line becomes "  - ..." (exactly two-space
//     indent, single dash),
//   - blank lines between/after content are dropped,
//   - a bare title (single non-empty line) is returned unchanged.

describe('normalizeBulletMessage (MAI-108)', () => {
  it('(a) collapses double-indented leaky bullets to a single two-space dash', () => {
    const input = [
      'Updated commit prompt',
      '    - feat: de-leak few-shot examples',
      '      - fix: normalize bullet indent',
    ].join('\n');
    const expected = [
      'Updated commit prompt',
      '  - feat: de-leak few-shot examples',
      '  - fix: normalize bullet indent',
    ].join('\n');
    expect(normalizeBulletMessage(input)).toBe(expected);
  });

  it('(b) indents non-indented "- feat:" bullets to exactly two spaces', () => {
    const input = [
      'Refactored auth flow',
      '- feat: add token refresh',
      '- docs: update README',
    ].join('\n');
    const expected = [
      'Refactored auth flow',
      '  - feat: add token refresh',
      '  - docs: update README',
    ].join('\n');
    expect(normalizeBulletMessage(input)).toBe(expected);
  });

  it('(c) drops a blank line between the title and the bullets', () => {
    const input = [
      'Fixed crash on startup',
      '',
      '  - fix: guard null config',
    ].join('\n');
    const expected = [
      'Fixed crash on startup',
      '  - fix: guard null config',
    ].join('\n');
    expect(normalizeBulletMessage(input)).toBe(expected);
  });

  it('(d) leaves a bare title (no bullets) unchanged', () => {
    const input = 'Bumped dependency versions';
    expect(normalizeBulletMessage(input)).toBe(input);
  });

  it('also normalizes "*" bullet markers and trims trailing whitespace', () => {
    const input = 'Tidied logging\n* chore: drop debug line   \n';
    const expected = 'Tidied logging\n  - chore: drop debug line';
    expect(normalizeBulletMessage(input)).toBe(expected);
  });
});
