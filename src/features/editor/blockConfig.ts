import type { BlockType } from '../workspace/model/types';

/**
 * Short glyph shown in the slash menu preview tile. Labels, descriptions,
 * placeholders and search keywords live in the `editor` translation namespace.
 */
export const BLOCK_GLYPHS: Record<BlockType, string> = {
  paragraph: 'Aa',
  heading1: 'H1',
  heading2: 'H2',
  heading3: 'H3',
  todo: '☑',
  bulleted: '•',
  numbered: '1.',
  quote: '❝',
  code: '</>',
  divider: '─',
  callout: '💡',
};
