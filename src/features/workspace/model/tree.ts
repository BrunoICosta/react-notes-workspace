import { produce, type Draft } from 'immer';
import type { Block, Page, WorkspaceData } from './types';

export const DEFAULT_PAGE_ICON = '📄';

export function createEmptyWorkspace(): WorkspaceData {
  return { pages: {}, rootIds: [], activePageId: null };
}

export interface NewPageInput {
  id: string;
  now: number;
  parentId?: string | null;
  title?: string;
  icon?: string;
  blocks?: Block[];
  /** Position among the siblings. Appends when omitted. */
  index?: number;
}

export function createPage(input: NewPageInput): Page {
  return {
    id: input.id,
    title: input.title ?? '',
    icon: input.icon ?? DEFAULT_PAGE_ICON,
    parentId: input.parentId ?? null,
    childIds: [],
    blocks: input.blocks ?? [],
    favorite: false,
    collapsed: false,
    createdAt: input.now,
    updatedAt: input.now,
  };
}

/** Ordered ids of the pages that share the given parent (the root list when null). */
export function getSiblingIds(ws: WorkspaceData, parentId: string | null): string[] {
  if (parentId === null) return ws.rootIds;
  return ws.pages[parentId]?.childIds ?? [];
}

function draftSiblingIds(draft: Draft<WorkspaceData>, parentId: string | null): string[] {
  if (parentId === null) return draft.rootIds;
  return draft.pages[parentId]?.childIds ?? [];
}

function insertAt(list: string[], id: string, index?: number): void {
  if (index === undefined || index < 0 || index > list.length) list.push(id);
  else list.splice(index, 0, id);
}

function removeFrom(list: string[], id: string): void {
  const index = list.indexOf(id);
  if (index !== -1) list.splice(index, 1);
}

export function addPage(ws: WorkspaceData, input: NewPageInput): WorkspaceData {
  const parentId = input.parentId ?? null;
  if (ws.pages[input.id]) return ws;
  if (parentId !== null && !ws.pages[parentId]) return ws;

  return produce(ws, (draft) => {
    draft.pages[input.id] = createPage({ ...input, parentId });
    insertAt(draftSiblingIds(draft, parentId), input.id, input.index);
    if (parentId !== null) draft.pages[parentId].collapsed = false;
  });
}

export function updatePage(
  ws: WorkspaceData,
  id: string,
  patch: Partial<Pick<Page, 'title' | 'icon'>>,
  now: number,
): WorkspaceData {
  if (!ws.pages[id]) return ws;
  return produce(ws, (draft) => {
    Object.assign(draft.pages[id], patch, { updatedAt: now });
  });
}

export function toggleCollapsed(ws: WorkspaceData, id: string): WorkspaceData {
  if (!ws.pages[id]) return ws;
  return produce(ws, (draft) => {
    draft.pages[id].collapsed = !draft.pages[id].collapsed;
  });
}

export function toggleFavorite(ws: WorkspaceData, id: string): WorkspaceData {
  if (!ws.pages[id]) return ws;
  return produce(ws, (draft) => {
    draft.pages[id].favorite = !draft.pages[id].favorite;
  });
}

/** Ids of all pages in tree order (depth-first), regardless of collapsed state. */
export function getTreeOrder(ws: WorkspaceData): string[] {
  return ws.rootIds.flatMap((id) => [id, ...getDescendantIds(ws, id)]);
}

/** Favorite pages ordered as they appear in the tree. */
export function getFavoriteIds(ws: WorkspaceData): string[] {
  return getTreeOrder(ws).filter((id) => ws.pages[id]?.favorite);
}

export function setActivePage(ws: WorkspaceData, id: string | null): WorkspaceData {
  if (id !== null && !ws.pages[id]) return ws;
  if (ws.activePageId === id) return ws;
  return { ...ws, activePageId: id };
}

/** Every descendant id of a page in depth-first order, excluding the page itself. */
export function getDescendantIds(ws: WorkspaceData, id: string): string[] {
  const result: string[] = [];
  const stack = [...(ws.pages[id]?.childIds ?? [])].reverse();
  while (stack.length > 0) {
    const current = stack.pop() as string;
    result.push(current);
    const children = ws.pages[current]?.childIds ?? [];
    for (let i = children.length - 1; i >= 0; i -= 1) stack.push(children[i]);
  }
  return result;
}

/** Ancestors of a page ordered from the root down to the direct parent. */
export function getAncestors(ws: WorkspaceData, id: string): Page[] {
  const ancestors: Page[] = [];
  const visited = new Set<string>();
  let parentId = ws.pages[id]?.parentId ?? null;
  while (parentId !== null && !visited.has(parentId)) {
    const parent = ws.pages[parentId];
    if (!parent) break;
    visited.add(parentId);
    ancestors.unshift(parent);
    parentId = parent.parentId;
  }
  return ancestors;
}

export function isAncestorOf(ws: WorkspaceData, ancestorId: string, id: string): boolean {
  return getAncestors(ws, id).some((page) => page.id === ancestorId);
}

/**
 * Deletes a page together with its whole subtree. When the active page is removed,
 * the closest surviving page becomes active (parent, previous sibling, then the first root).
 */
export function deletePage(ws: WorkspaceData, id: string): WorkspaceData {
  const page = ws.pages[id];
  if (!page) return ws;
  const removed = new Set([id, ...getDescendantIds(ws, id)]);

  return produce(ws, (draft) => {
    const siblings = draftSiblingIds(draft, page.parentId);
    const position = siblings.indexOf(id);
    removeFrom(siblings, id);
    for (const removedId of removed) delete draft.pages[removedId];

    if (draft.activePageId !== null && removed.has(draft.activePageId)) {
      draft.activePageId =
        page.parentId ?? siblings[Math.max(0, position - 1)] ?? draft.rootIds[0] ?? null;
    }
  });
}

/**
 * Moves a page under a new parent (or to the root when `newParentId` is null).
 * Moving a page into itself or into one of its descendants is ignored.
 */
export function movePage(
  ws: WorkspaceData,
  id: string,
  newParentId: string | null,
  index?: number,
): WorkspaceData {
  const page = ws.pages[id];
  if (!page) return ws;
  if (newParentId !== null) {
    if (!ws.pages[newParentId]) return ws;
    if (newParentId === id || isAncestorOf(ws, id, newParentId)) return ws;
  }

  return produce(ws, (draft) => {
    removeFrom(draftSiblingIds(draft, page.parentId), id);
    insertAt(draftSiblingIds(draft, newParentId), id, index);
    draft.pages[id].parentId = newParentId;
    if (newParentId !== null) draft.pages[newParentId].collapsed = false;
  });
}

export function canIndent(ws: WorkspaceData, id: string): boolean {
  const page = ws.pages[id];
  if (!page) return false;
  return getSiblingIds(ws, page.parentId).indexOf(id) > 0;
}

export function canOutdent(ws: WorkspaceData, id: string): boolean {
  const page = ws.pages[id];
  return page !== undefined && page.parentId !== null;
}

/** Nests a page under its previous sibling, like pressing Tab in an outline. */
export function indentPage(ws: WorkspaceData, id: string): WorkspaceData {
  if (!canIndent(ws, id)) return ws;
  const page = ws.pages[id];
  const siblings = getSiblingIds(ws, page.parentId);
  return movePage(ws, id, siblings[siblings.indexOf(id) - 1]);
}

/** Moves a page one level up, right after its current parent. */
export function outdentPage(ws: WorkspaceData, id: string): WorkspaceData {
  if (!canOutdent(ws, id)) return ws;
  const parent = ws.pages[ws.pages[id].parentId as string];
  const parentSiblings = getSiblingIds(ws, parent.parentId);
  return movePage(ws, id, parent.parentId, parentSiblings.indexOf(parent.id) + 1);
}
