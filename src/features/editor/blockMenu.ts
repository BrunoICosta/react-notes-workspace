import i18n, { currentLanguage, SUPPORTED_LANGUAGES, type Language } from '../../i18n';
import { BLOCK_TYPES, type BlockType } from '../workspace/model/types';
import { BLOCK_GLYPHS } from './blockConfig';

export interface BlockMenuItem {
  type: BlockType;
  label: string;
  description: string;
  glyph: string;
}

/** Lowercases and strips accents so "titulo" matches "Título". */
export function normalize(value: string): string {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

interface SearchTerms {
  label: string;
  keywords: string[];
}

function termsFor(type: BlockType, language: Language): SearchTerms {
  const t = i18n.getFixedT(language, 'editor');
  return {
    label: normalize(t(`blocks.${type}.label`)),
    keywords: t(`blocks.${type}.keywords`).split(/\s+/).map(normalize).filter(Boolean),
  };
}

function labelScore(label: string, query: string): number {
  if (label.startsWith(query)) return 2;
  if (label.split(/\s+/).some((word) => word.startsWith(query))) return 1;
  return 0;
}

/**
 * Ranks a block type for a query. Labels in the active language weigh the most,
 * but labels and keywords of every supported language match, so "/heading" works
 * in Portuguese and "/titulo" works in English.
 */
function score(type: BlockType, query: string, active: Language): number {
  const own = termsFor(type, active);
  const ownLabel = labelScore(own.label, query);
  if (ownLabel > 0) return ownLabel + 2;

  const others = SUPPORTED_LANGUAGES.filter((language) => language !== active).map((language) =>
    termsFor(type, language),
  );
  if (others.some((terms) => labelScore(terms.label, query) > 0)) return 2;

  const keywords = [own, ...others].flatMap((terms) => terms.keywords);
  return keywords.some((keyword) => keyword.startsWith(query)) ? 1 : 0;
}

function toMenuItem(type: BlockType, language: Language): BlockMenuItem {
  const t = i18n.getFixedT(language, 'editor');
  return {
    type,
    label: t(`blocks.${type}.label`),
    description: t(`blocks.${type}.description`),
    glyph: BLOCK_GLYPHS[type],
  };
}

/** Block types matching the text typed after "/", best matches first, in the active language. */
export function filterBlockTypes(
  query: string,
  language: Language = currentLanguage(),
): BlockMenuItem[] {
  const normalized = normalize(query);
  if (!normalized) return BLOCK_TYPES.map((type) => toMenuItem(type, language));
  return BLOCK_TYPES.map((type, order) => ({
    type,
    order,
    score: score(type, normalized, language),
  }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.order - b.order)
    .map((entry) => toMenuItem(entry.type, language));
}

/**
 * Returns the index of the "/" that opens the menu when the user has just typed it
 * at the start of the block or after whitespace; otherwise null.
 */
export function detectSlashTrigger(
  previousText: string,
  nextText: string,
  caret: number,
): number | null {
  if (nextText.length !== previousText.length + 1) return null;
  const slashIndex = caret - 1;
  if (slashIndex < 0 || nextText[slashIndex] !== '/') return null;
  const before = nextText[slashIndex - 1];
  return before === undefined || /\s/.test(before) ? slashIndex : null;
}

/** DOM id of an option, used by the textarea's aria-activedescendant. */
export function slashOptionId(menuId: string, index: number): string {
  return `${menuId}-option-${index}`;
}
