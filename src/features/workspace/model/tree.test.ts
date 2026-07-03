import { describe, expect, it } from 'vitest';
import {
  addPage,
  canIndent,
  canOutdent,
  createEmptyWorkspace,
  deletePage,
  getAncestors,
  getDescendantIds,
  indentPage,
  movePage,
  outdentPage,
  setActivePage,
  toggleCollapsed,
  updatePage,
} from './tree';
import type { WorkspaceData } from './types';

const NOW = 1_700_000_000_000;

/**
 * Builds:
 *   a
 *   ├─ a1
 *   │  └─ a1x
 *   └─ a2
 *   b
 */
function buildWorkspace(): WorkspaceData {
  let ws = createEmptyWorkspace();
  ws = addPage(ws, { id: 'a', title: 'A', now: NOW });
  ws = addPage(ws, { id: 'b', title: 'B', now: NOW });
  ws = addPage(ws, { id: 'a1', parentId: 'a', title: 'A1', now: NOW });
  ws = addPage(ws, { id: 'a2', parentId: 'a', title: 'A2', now: NOW });
  ws = addPage(ws, { id: 'a1x', parentId: 'a1', title: 'A1x', now: NOW });
  return ws;
}

describe('addPage', () => {
  it('appends root pages in order', () => {
    const ws = buildWorkspace();
    expect(ws.rootIds).toEqual(['a', 'b']);
    expect(ws.pages.a.childIds).toEqual(['a1', 'a2']);
    expect(ws.pages.a1x.parentId).toBe('a1');
  });

  it('inserts at the requested index and expands the parent', () => {
    let ws = toggleCollapsed(buildWorkspace(), 'a');
    expect(ws.pages.a.collapsed).toBe(true);
    ws = addPage(ws, { id: 'a0', parentId: 'a', now: NOW, index: 0 });
    expect(ws.pages.a.childIds).toEqual(['a0', 'a1', 'a2']);
    expect(ws.pages.a.collapsed).toBe(false);
  });

  it('ignores unknown parents and duplicated ids', () => {
    const ws = buildWorkspace();
    expect(addPage(ws, { id: 'x', parentId: 'missing', now: NOW })).toBe(ws);
    expect(addPage(ws, { id: 'a', now: NOW })).toBe(ws);
  });

  it('does not mutate the previous state', () => {
    const before = buildWorkspace();
    const snapshot = JSON.parse(JSON.stringify(before));
    addPage(before, { id: 'c', now: NOW });
    expect(before).toEqual(snapshot);
  });
});

describe('updatePage', () => {
  it('renames a page and bumps updatedAt', () => {
    const ws = updatePage(buildWorkspace(), 'a1', { title: 'Renamed', icon: '🚀' }, NOW + 5);
    expect(ws.pages.a1).toMatchObject({ title: 'Renamed', icon: '🚀', updatedAt: NOW + 5 });
  });
});

describe('queries', () => {
  it('lists descendants depth-first', () => {
    expect(getDescendantIds(buildWorkspace(), 'a')).toEqual(['a1', 'a1x', 'a2']);
  });

  it('returns ancestors from the root down', () => {
    expect(getAncestors(buildWorkspace(), 'a1x').map((page) => page.id)).toEqual(['a', 'a1']);
    expect(getAncestors(buildWorkspace(), 'b')).toEqual([]);
  });
});

describe('deletePage', () => {
  it('removes the page with its whole subtree', () => {
    const ws = deletePage(buildWorkspace(), 'a1');
    expect(ws.pages.a1).toBeUndefined();
    expect(ws.pages.a1x).toBeUndefined();
    expect(ws.pages.a.childIds).toEqual(['a2']);
  });

  it('activates the parent when the active page is deleted', () => {
    const ws = deletePage(setActivePage(buildWorkspace(), 'a1x'), 'a1');
    expect(ws.activePageId).toBe('a');
  });

  it('activates a sibling when a root page is deleted', () => {
    expect(deletePage(setActivePage(buildWorkspace(), 'b'), 'b').activePageId).toBe('a');
    expect(deletePage(setActivePage(buildWorkspace(), 'a'), 'a').activePageId).toBe('b');
  });

  it('clears the active page when nothing is left', () => {
    let ws = addPage(createEmptyWorkspace(), { id: 'only', now: NOW });
    ws = deletePage(setActivePage(ws, 'only'), 'only');
    expect(ws.activePageId).toBeNull();
    expect(ws.rootIds).toEqual([]);
  });
});

describe('movePage', () => {
  it('moves a page under another parent', () => {
    const ws = movePage(buildWorkspace(), 'b', 'a2');
    expect(ws.rootIds).toEqual(['a']);
    expect(ws.pages.a2.childIds).toEqual(['b']);
    expect(ws.pages.b.parentId).toBe('a2');
  });

  it('refuses to create cycles', () => {
    const ws = buildWorkspace();
    expect(movePage(ws, 'a', 'a1x')).toBe(ws);
    expect(movePage(ws, 'a', 'a')).toBe(ws);
  });

  it('moves a page back to the root', () => {
    const ws = movePage(buildWorkspace(), 'a1', null, 0);
    expect(ws.rootIds).toEqual(['a1', 'a', 'b']);
    expect(ws.pages.a1.parentId).toBeNull();
  });
});

describe('indent / outdent', () => {
  it('nests a page under its previous sibling', () => {
    const ws = indentPage(buildWorkspace(), 'a2');
    expect(ws.pages.a1.childIds).toEqual(['a1x', 'a2']);
    expect(ws.pages.a.childIds).toEqual(['a1']);
  });

  it('cannot indent the first sibling', () => {
    const ws = buildWorkspace();
    expect(canIndent(ws, 'a')).toBe(false);
    expect(indentPage(ws, 'a1')).toBe(ws);
  });

  it('moves a page right after its parent', () => {
    const ws = outdentPage(buildWorkspace(), 'a1');
    expect(ws.rootIds).toEqual(['a', 'a1', 'b']);
    expect(ws.pages.a.childIds).toEqual(['a2']);
    expect(ws.pages.a1.childIds).toEqual(['a1x']);
  });

  it('cannot outdent a root page', () => {
    const ws = buildWorkspace();
    expect(canOutdent(ws, 'b')).toBe(false);
    expect(outdentPage(ws, 'b')).toBe(ws);
  });
});
