import { describe, expect, it } from 'vitest';
import { BLOCK_TYPES } from '../model/types';
import { sanitizeWorkspace } from '../store/migrations';
import { createSeedWorkspace } from './seedWorkspace';

describe('createSeedWorkspace', () => {
  const ws = createSeedWorkspace(42);

  it('opens the welcome page, which is a favorite with nested guides', () => {
    const welcome = ws.pages[ws.activePageId as string];
    expect(welcome.title).toBe('Bem-vindo ao Notes Workspace');
    expect(welcome.favorite).toBe(true);
    expect(welcome.childIds).toHaveLength(3);
  });

  it('showcases every block type', () => {
    const used = new Set(Object.values(ws.pages).flatMap((page) => page.blocks.map((b) => b.type)));
    expect([...used].sort()).toEqual([...BLOCK_TYPES].sort());
  });

  it('produces a consistent tree with unique block ids', () => {
    expect(sanitizeWorkspace(ws)).toEqual(ws);
    const blockIds = Object.values(ws.pages).flatMap((page) => page.blocks.map((b) => b.id));
    expect(new Set(blockIds).size).toBe(blockIds.length);
  });
});
