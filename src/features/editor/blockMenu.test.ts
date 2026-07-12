import { describe, expect, it } from 'vitest';
import { detectSlashTrigger, filterBlockTypes, normalize } from './blockMenu';

describe('normalize', () => {
  it('removes accents and casing', () => {
    expect(normalize('  Título CITAÇÃO ')).toBe('titulo citacao');
  });
});

describe('filterBlockTypes', () => {
  it('lists every block type for an empty query', () => {
    expect(filterBlockTypes('')).toHaveLength(11);
  });

  it('matches labels without accents and ranks prefix matches first', () => {
    expect(filterBlockTypes('titulo').map((item) => item.type)).toEqual([
      'heading1',
      'heading2',
      'heading3',
    ]);
  });

  it('matches english keywords and words inside the label', () => {
    expect(filterBlockTypes('h2')[0].type).toBe('heading2');
    expect(filterBlockTypes('todo')[0].type).toBe('todo');
    expect(filterBlockTypes('numerada')[0].type).toBe('numbered');
    expect(filterBlockTypes('code')[0].type).toBe('code');
  });

  it('returns nothing for unknown terms', () => {
    expect(filterBlockTypes('xyz')).toEqual([]);
  });
});

describe('detectSlashTrigger', () => {
  it('opens at the start of a block or after a space', () => {
    expect(detectSlashTrigger('', '/', 1)).toBe(0);
    expect(detectSlashTrigger('Olá ', 'Olá /', 5)).toBe(4);
  });

  it('ignores slashes inside words, paths and pasted text', () => {
    expect(detectSlashTrigger('e', 'e/', 2)).toBeNull();
    expect(detectSlashTrigger('', 'a/b', 2)).toBeNull();
  });
});
