import { describe, expect, it } from 'vitest';
import { detectShortcut } from './markdownShortcuts';

describe('detectShortcut', () => {
  it.each([
    ['#', '# ', 'heading1'],
    ['##', '## ', 'heading2'],
    ['###', '### ', 'heading3'],
    ['-', '- ', 'bulleted'],
    ['1.', '1. ', 'numbered'],
    ['[]', '[] ', 'todo'],
    ['>', '> ', 'quote'],
    ['``', '```', 'code'],
    ['--', '---', 'divider'],
  ])('converts %j + one key into %s', (previous, next, type) => {
    expect(detectShortcut(previous, next)).toEqual({ type, text: '' });
  });

  it('keeps the text typed after the prefix position', () => {
    expect(detectShortcut('#Title', '# Title')).toEqual({ type: 'heading1', text: 'Title' });
  });

  it('ignores pasted text and prefixes that already existed', () => {
    expect(detectShortcut('', '# pasted heading')).toBeNull();
    expect(detectShortcut('- item', '- items')).toBeNull();
    expect(detectShortcut('hello', 'hello!')).toBeNull();
  });
});
