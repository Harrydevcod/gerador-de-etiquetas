import { describe, expect, it } from 'vitest';
import { matchesModelQuery, normalizeModelQuery } from './modelPickerSearch';

describe('normalizeModelQuery', () => {
  it('normalizes whitespace, case, and Portuguese accents', () => {
    expect(normalizeModelQuery('  ClÁSSICO  ')).toBe('classico');
  });
});

describe('matchesModelQuery', () => {
  it('matches an accentless query against an accented model name', () => {
    expect(matchesModelQuery('Clássico', 'classico')).toBe(true);
  });

  it('matches a partial query case-insensitively', () => {
    expect(matchesModelQuery('Farmácia', 'MAC')).toBe(true);
  });

  it('matches every model when the query is blank', () => {
    expect(matchesModelQuery('Boutique', '   ')).toBe(true);
  });

  it('rejects unrelated model names', () => {
    expect(matchesModelQuery('Tech', 'padaria')).toBe(false);
  });
});
