import { BLOCK_TYPES } from '../workspace/model/types';
import { BLOCK_CONFIG, type BlockTypeConfig } from './blockConfig';

/** Lowercases and strips accents so "titulo" matches "Título". */
export function normalize(value: string): string {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

function score(config: BlockTypeConfig, query: string): number {
  const label = normalize(config.label);
  if (label.startsWith(query)) return 3;
  if (label.split(/\s+/).some((word) => word.startsWith(query))) return 2;
  if (config.keywords.some((keyword) => normalize(keyword).startsWith(query))) return 1;
  return 0;
}

/** Block types matching the text typed after "/", best matches first. */
export function filterBlockTypes(query: string): BlockTypeConfig[] {
  const normalized = normalize(query);
  const all = BLOCK_TYPES.map((type) => BLOCK_CONFIG[type]);
  if (!normalized) return all;
  return all
    .map((config, order) => ({ config, order, score: score(config, normalized) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.order - b.order)
    .map((entry) => entry.config);
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
