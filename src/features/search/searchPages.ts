import { getAncestors } from '../workspace/model/tree';
import type { Page, WorkspaceData } from '../workspace/model/types';

export interface SearchSnippet {
  before: string;
  match: string;
  after: string;
}

export interface SearchResult {
  pageId: string;
  icon: string;
  title: string;
  /** Titles of the ancestors, root first. */
  path: string[];
  matchedIn: 'title' | 'content' | 'recent';
  snippet?: SearchSnippet;
}

const SNIPPET_CONTEXT = 32;

/**
 * Lowercases and strips accents character by character, so indexes in the
 * normalized string match indexes in the original one (needed for highlighting).
 */
export function foldText(text: string): string {
  let result = '';
  for (const char of text) {
    const folded = char.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
    result += folded.length === char.length ? folded : char.toLowerCase();
  }
  return result;
}

function buildSnippet(text: string, index: number, length: number): SearchSnippet {
  const start = Math.max(0, index - SNIPPET_CONTEXT);
  const end = Math.min(text.length, index + length + SNIPPET_CONTEXT);
  return {
    before: (start > 0 ? '…' : '') + text.slice(start, index),
    match: text.slice(index, index + length),
    after: text.slice(index + length, end) + (end < text.length ? '…' : ''),
  };
}

function toResult(ws: WorkspaceData, page: Page, matchedIn: SearchResult['matchedIn']) {
  return {
    pageId: page.id,
    icon: page.icon,
    title: page.title.trim() || 'Sem título',
    path: getAncestors(ws, page.id).map((ancestor) => ancestor.title.trim() || 'Sem título'),
    matchedIn,
  };
}

/**
 * Searches page titles and block contents (accent and case insensitive).
 * Title matches rank first; an empty query lists the most recently edited pages.
 */
export function searchPages(ws: WorkspaceData, query: string, limit = 20): SearchResult[] {
  const pages = Object.values(ws.pages);
  const needle = foldText(query.trim());

  if (!needle) {
    return [...pages]
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, limit)
      .map((page) => toResult(ws, page, 'recent'));
  }

  const titleMatches: Array<SearchResult & { position: number }> = [];
  const contentMatches: SearchResult[] = [];

  for (const page of pages) {
    const titleIndex = foldText(page.title).indexOf(needle);
    if (titleIndex !== -1) {
      titleMatches.push({ ...toResult(ws, page, 'title'), position: titleIndex });
      continue;
    }
    for (const block of page.blocks) {
      const index = foldText(block.text).indexOf(needle);
      if (index !== -1) {
        contentMatches.push({
          ...toResult(ws, page, 'content'),
          snippet: buildSnippet(block.text, index, needle.length),
        });
        break;
      }
    }
  }

  titleMatches.sort((a, b) => a.position - b.position || a.title.localeCompare(b.title));
  return [
    ...titleMatches.map(({ position: _position, ...result }) => result),
    ...contentMatches,
  ].slice(0, limit);
}
