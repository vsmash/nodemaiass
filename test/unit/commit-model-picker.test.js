import { describe, it, expect } from 'vitest';
import { pickCommitModel } from '../../lib/commit.js';

// MAI-48: size-aware AI commit model picker.
//
// Resolution order:
//   1. MAIASS_AI_COMMIT_MODEL (explicit override) wins.
//   2. MAIASS_AI_MODEL (legacy global override) — back-compat.
//   3. Auto-pick by diff char count:
//        <  30000 -> gpt-4o-mini   (tier 1)
//        30000..100000 -> gpt-4-turbo (tier 2)
//        > 100000 -> gpt-4o        (tier 3)
//
// pickCommitModel(diffLength, env) takes an explicit env object so the tests
// don't have to mutate process.env or worry about parallel test isolation.

describe('pickCommitModel (MAI-48)', () => {
  it('MAIASS_AI_COMMIT_MODEL wins over everything else, even with a small diff', () => {
    const result = pickCommitModel(100, {
      MAIASS_AI_COMMIT_MODEL: 'gpt-4o',
      MAIASS_AI_MODEL: 'gpt-3.5-turbo'
    });
    expect(result.model).toBe('gpt-4o');
    expect(result.source).toBe('override');
  });

  it('MAIASS_AI_COMMIT_MODEL wins over a large-diff auto-pick', () => {
    const result = pickCommitModel(200000, {
      MAIASS_AI_COMMIT_MODEL: 'gpt-4o-mini'
    });
    expect(result.model).toBe('gpt-4o-mini');
    expect(result.source).toBe('override');
  });

  it('falls back to MAIASS_AI_MODEL (legacy) when commit override is unset', () => {
    const result = pickCommitModel(100, {
      MAIASS_AI_MODEL: 'gpt-3.5-turbo'
    });
    expect(result.model).toBe('gpt-3.5-turbo');
    expect(result.source).toBe('legacy');
  });

  it('treats empty MAIASS_AI_COMMIT_MODEL as unset and uses legacy', () => {
    const result = pickCommitModel(100, {
      MAIASS_AI_COMMIT_MODEL: '   ',
      MAIASS_AI_MODEL: 'gpt-3.5-turbo'
    });
    expect(result.model).toBe('gpt-3.5-turbo');
    expect(result.source).toBe('legacy');
  });

  it('auto-picks gpt-4o-mini (tier 1) for small diffs (< 30000 chars)', () => {
    const result = pickCommitModel(8000, {});
    expect(result.model).toBe('gpt-4o-mini');
    expect(result.tier).toBe(1);
    expect(result.source).toBe('auto');
  });

  it('auto-picks gpt-4o-mini at the lower edge (0 chars)', () => {
    const result = pickCommitModel(0, {});
    expect(result.model).toBe('gpt-4o-mini');
    expect(result.tier).toBe(1);
  });

  it('auto-picks gpt-4o-mini just under the tier-2 threshold (29999 chars)', () => {
    const result = pickCommitModel(29999, {});
    expect(result.model).toBe('gpt-4o-mini');
    expect(result.tier).toBe(1);
  });

  it('auto-picks gpt-4-turbo (tier 2) at the tier-2 floor (30000 chars)', () => {
    const result = pickCommitModel(30000, {});
    expect(result.model).toBe('gpt-4-turbo');
    expect(result.tier).toBe(2);
    expect(result.source).toBe('auto');
  });

  it('auto-picks gpt-4-turbo (tier 2) mid-range (60000 chars)', () => {
    const result = pickCommitModel(60000, {});
    expect(result.model).toBe('gpt-4-turbo');
    expect(result.tier).toBe(2);
  });

  it('auto-picks gpt-4-turbo (tier 2) at the tier-2 ceiling (100000 chars)', () => {
    const result = pickCommitModel(100000, {});
    expect(result.model).toBe('gpt-4-turbo');
    expect(result.tier).toBe(2);
  });

  it('auto-picks gpt-4o (tier 3) just above the tier-2 ceiling (100001 chars)', () => {
    const result = pickCommitModel(100001, {});
    expect(result.model).toBe('gpt-4o');
    expect(result.tier).toBe(3);
    expect(result.source).toBe('auto');
  });

  it('auto-picks gpt-4o (tier 3) for very large diffs (250000 chars)', () => {
    const result = pickCommitModel(250000, {});
    expect(result.model).toBe('gpt-4o');
    expect(result.tier).toBe(3);
  });

  it('treats negative diff length defensively as tier 1', () => {
    const result = pickCommitModel(-1, {});
    expect(result.model).toBe('gpt-4o-mini');
    expect(result.tier).toBe(1);
  });
});
