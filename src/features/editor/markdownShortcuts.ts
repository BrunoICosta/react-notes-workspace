import type { BlockType } from '../workspace/model/types';

/** Typing one of these prefixes at the start of an empty-ish paragraph converts it. */
const SHORTCUTS: ReadonlyArray<{ prefix: string; type: BlockType }> = [
  { prefix: '### ', type: 'heading3' },
  { prefix: '## ', type: 'heading2' },
  { prefix: '# ', type: 'heading1' },
  { prefix: '[] ', type: 'todo' },
  { prefix: '[ ] ', type: 'todo' },
  { prefix: '- ', type: 'bulleted' },
  { prefix: '* ', type: 'bulleted' },
  { prefix: '1. ', type: 'numbered' },
  { prefix: '> ', type: 'quote' },
  { prefix: '```', type: 'code' },
  { prefix: '---', type: 'divider' },
];

export interface ShortcutMatch {
  type: BlockType;
  /** Text left in the block once the prefix is removed. */
  text: string;
}

/**
 * Detects a markdown-style shortcut that was just completed by the user's last edit.
 * Only fires when the prefix is new, so pasting or editing later in the text is safe.
 */
export function detectShortcut(previousText: string, nextText: string): ShortcutMatch | null {
  for (const { prefix, type } of SHORTCUTS) {
    if (nextText.startsWith(prefix) && !previousText.startsWith(prefix)) {
      if (nextText.length - previousText.length !== 1) return null;
      return { type, text: nextText.slice(prefix.length) };
    }
  }
  return null;
}
