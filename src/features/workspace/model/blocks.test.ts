import { describe, expect, it } from 'vitest';
import {
  changeBlockType,
  createBlock,
  getListNumber,
  insertBlockAfter,
  mergeWithPrevious,
  moveBlock,
  removeBlock,
  splitBlock,
  updateBlock,
} from './blocks';
import { addPage, createEmptyWorkspace } from './tree';
import type { Block, WorkspaceData } from './types';

const NOW = 1_700_000_000_000;
const LATER = NOW + 1000;

function workspaceWith(blocks: Block[]): WorkspaceData {
  return addPage(createEmptyWorkspace(), { id: 'p', now: NOW, blocks });
}

const blocksOf = (ws: WorkspaceData) => ws.pages.p.blocks;
const idsOf = (ws: WorkspaceData) => blocksOf(ws).map((block) => block.id);

describe('createBlock', () => {
  it('drops text for textless blocks', () => {
    expect(createBlock('d', 'divider', 'ignored')).toEqual({
      id: 'd',
      type: 'divider',
      text: '',
      checked: false,
    });
  });
});

describe('insert / update / remove', () => {
  it('inserts after a block or at the top', () => {
    let ws = workspaceWith([createBlock('a'), createBlock('b')]);
    ws = insertBlockAfter(ws, 'p', 'a', createBlock('x'), LATER);
    ws = insertBlockAfter(ws, 'p', null, createBlock('top'), LATER);
    expect(idsOf(ws)).toEqual(['top', 'a', 'x', 'b']);
    expect(ws.pages.p.updatedAt).toBe(LATER);
  });

  it('updates text and checked state', () => {
    const ws = updateBlock(
      workspaceWith([createBlock('a', 'todo')]),
      'p',
      'a',
      { text: 'Buy milk', checked: true },
      LATER,
    );
    expect(blocksOf(ws)[0]).toMatchObject({ text: 'Buy milk', checked: true });
  });

  it('removes a block and ignores unknown ids', () => {
    const ws = workspaceWith([createBlock('a'), createBlock('b')]);
    expect(idsOf(removeBlock(ws, 'p', 'a', LATER))).toEqual(['b']);
    expect(removeBlock(ws, 'p', 'nope', LATER)).toBe(ws);
    expect(removeBlock(ws, 'other-page', 'a', LATER)).toBe(ws);
  });
});

describe('changeBlockType', () => {
  it('resets checked when leaving todo and text when becoming a divider', () => {
    let ws = workspaceWith([{ id: 'a', type: 'todo', text: 'Task', checked: true }]);
    ws = changeBlockType(ws, 'p', 'a', 'heading2', LATER);
    expect(blocksOf(ws)[0]).toEqual({ id: 'a', type: 'heading2', text: 'Task', checked: false });
    ws = changeBlockType(ws, 'p', 'a', 'divider', LATER);
    expect(blocksOf(ws)[0].text).toBe('');
  });
});

describe('moveBlock', () => {
  it('moves a block down and up', () => {
    const ws = workspaceWith(['a', 'b', 'c', 'd'].map((id) => createBlock(id)));
    expect(idsOf(moveBlock(ws, 'p', 'a', 'c', LATER))).toEqual(['b', 'c', 'a', 'd']);
    expect(idsOf(moveBlock(ws, 'p', 'd', 'b', LATER))).toEqual(['a', 'd', 'b', 'c']);
    expect(moveBlock(ws, 'p', 'a', 'a', LATER)).toBe(ws);
  });
});

describe('splitBlock', () => {
  it('moves the text after the caret to a new paragraph', () => {
    const ws = splitBlock(
      workspaceWith([createBlock('a', 'heading1', 'HelloWorld')]),
      'p',
      'a',
      5,
      'n',
      LATER,
    );
    expect(blocksOf(ws)).toEqual([
      { id: 'a', type: 'heading1', text: 'Hello', checked: false },
      { id: 'n', type: 'paragraph', text: 'World', checked: false },
    ]);
  });

  it('continues lists with the same type and an unchecked todo', () => {
    const ws = splitBlock(
      workspaceWith([{ id: 'a', type: 'todo', text: 'Done', checked: true }]),
      'p',
      'a',
      4,
      'n',
      LATER,
    );
    expect(blocksOf(ws)[1]).toEqual({ id: 'n', type: 'todo', text: '', checked: false });
  });
});

describe('mergeWithPrevious', () => {
  it('appends the text to the previous block', () => {
    const ws = mergeWithPrevious(
      workspaceWith([createBlock('a', 'paragraph', 'Hello '), createBlock('b', 'quote', 'there')]),
      'p',
      'b',
      LATER,
    );
    expect(blocksOf(ws)).toEqual([createBlock('a', 'paragraph', 'Hello there')]);
  });

  it('removes a previous divider instead of merging into it', () => {
    const ws = mergeWithPrevious(
      workspaceWith([
        createBlock('a'),
        createBlock('d', 'divider'),
        createBlock('b', 'paragraph', 'x'),
      ]),
      'p',
      'b',
      LATER,
    );
    expect(idsOf(ws)).toEqual(['a', 'b']);
  });

  it('does nothing for the first block', () => {
    const ws = workspaceWith([createBlock('a')]);
    expect(mergeWithPrevious(ws, 'p', 'a', LATER)).toBe(ws);
  });
});

describe('getListNumber', () => {
  it('restarts numbering after a non numbered block', () => {
    const blocks = [
      createBlock('1', 'numbered'),
      createBlock('2', 'numbered'),
      createBlock('x'),
      createBlock('3', 'numbered'),
    ];
    expect([0, 1, 3].map((index) => getListNumber(blocks, index))).toEqual([1, 2, 1]);
  });
});
