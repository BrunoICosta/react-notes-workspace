import { produce, type Draft } from 'immer';
import type { Block, BlockType, Page, WorkspaceData } from './types';

/** Block types that keep their type on the next line when pressing Enter (lists). */
const CONTINUING_TYPES = new Set<BlockType>(['todo', 'bulleted', 'numbered']);

/** Block types that have no editable text. */
export const TEXTLESS_TYPES = new Set<BlockType>(['divider']);

export function createBlock(id: string, type: BlockType = 'paragraph', text = ''): Block {
  return { id, type, text: TEXTLESS_TYPES.has(type) ? '' : text, checked: false };
}

/** Applies a recipe to one page, bumping `updatedAt`. Unknown pages are a no-op. */
function editPage(
  ws: WorkspaceData,
  pageId: string,
  now: number,
  recipe: (page: Draft<Page>) => void,
): WorkspaceData {
  if (!ws.pages[pageId]) return ws;
  return produce(ws, (draft) => {
    const page = draft.pages[pageId];
    recipe(page);
    page.updatedAt = now;
  });
}

function indexOfBlock(ws: WorkspaceData, pageId: string, blockId: string): number {
  return ws.pages[pageId]?.blocks.findIndex((block) => block.id === blockId) ?? -1;
}

export function insertBlock(
  ws: WorkspaceData,
  pageId: string,
  block: Block,
  index: number,
  now: number,
): WorkspaceData {
  return editPage(ws, pageId, now, (page) => {
    const position = Math.max(0, Math.min(index, page.blocks.length));
    page.blocks.splice(position, 0, block);
  });
}

/** Inserts `block` right after `afterId`, or at the top when `afterId` is null. */
export function insertBlockAfter(
  ws: WorkspaceData,
  pageId: string,
  afterId: string | null,
  block: Block,
  now: number,
): WorkspaceData {
  if (afterId === null) return insertBlock(ws, pageId, block, 0, now);
  const index = indexOfBlock(ws, pageId, afterId);
  if (index === -1) return ws;
  return insertBlock(ws, pageId, block, index + 1, now);
}

export function updateBlock(
  ws: WorkspaceData,
  pageId: string,
  blockId: string,
  patch: Partial<Omit<Block, 'id'>>,
  now: number,
): WorkspaceData {
  const index = indexOfBlock(ws, pageId, blockId);
  if (index === -1) return ws;
  return editPage(ws, pageId, now, (page) => {
    Object.assign(page.blocks[index], patch);
  });
}

export function changeBlockType(
  ws: WorkspaceData,
  pageId: string,
  blockId: string,
  type: BlockType,
  now: number,
): WorkspaceData {
  const index = indexOfBlock(ws, pageId, blockId);
  if (index === -1) return ws;
  return editPage(ws, pageId, now, (page) => {
    const block = page.blocks[index];
    block.type = type;
    if (TEXTLESS_TYPES.has(type)) block.text = '';
    if (type !== 'todo') block.checked = false;
  });
}

export function removeBlock(
  ws: WorkspaceData,
  pageId: string,
  blockId: string,
  now: number,
): WorkspaceData {
  const index = indexOfBlock(ws, pageId, blockId);
  if (index === -1) return ws;
  return editPage(ws, pageId, now, (page) => {
    page.blocks.splice(index, 1);
  });
}

/** Moves `activeId` to the position currently held by `overId` (drag and drop semantics). */
export function moveBlock(
  ws: WorkspaceData,
  pageId: string,
  activeId: string,
  overId: string,
  now: number,
): WorkspaceData {
  const from = indexOfBlock(ws, pageId, activeId);
  const to = indexOfBlock(ws, pageId, overId);
  if (from === -1 || to === -1 || from === to) return ws;
  return editPage(ws, pageId, now, (page) => {
    const [moved] = page.blocks.splice(from, 1);
    page.blocks.splice(to, 0, moved);
  });
}

/**
 * Splits a block at the caret, like pressing Enter in the middle of a line.
 * The text after the caret moves to a new block; lists continue with the same type.
 */
export function splitBlock(
  ws: WorkspaceData,
  pageId: string,
  blockId: string,
  caret: number,
  newBlockId: string,
  now: number,
): WorkspaceData {
  const index = indexOfBlock(ws, pageId, blockId);
  if (index === -1) return ws;
  return editPage(ws, pageId, now, (page) => {
    const block = page.blocks[index];
    const position = Math.max(0, Math.min(caret, block.text.length));
    const after = block.text.slice(position);
    block.text = block.text.slice(0, position);
    const nextType = CONTINUING_TYPES.has(block.type) ? block.type : 'paragraph';
    page.blocks.splice(index + 1, 0, createBlock(newBlockId, nextType, after));
  });
}

/**
 * Merges a block into the previous one (Backspace at the start of a line).
 * A previous divider is simply removed. Returns the input when there is no previous block.
 */
export function mergeWithPrevious(
  ws: WorkspaceData,
  pageId: string,
  blockId: string,
  now: number,
): WorkspaceData {
  const index = indexOfBlock(ws, pageId, blockId);
  if (index <= 0) return ws;
  return editPage(ws, pageId, now, (page) => {
    const previous = page.blocks[index - 1];
    if (TEXTLESS_TYPES.has(previous.type)) {
      page.blocks.splice(index - 1, 1);
      return;
    }
    previous.text += page.blocks[index].text;
    page.blocks.splice(index, 1);
  });
}

/** 1-based position of a numbered block within its run of consecutive numbered blocks. */
export function getListNumber(blocks: readonly Block[], index: number): number {
  let number = 1;
  for (let i = index - 1; i >= 0 && blocks[i].type === 'numbered'; i -= 1) number += 1;
  return number;
}
