import { describe, expect, it } from 'vitest';
import { migrateWorkspace, sanitizeWorkspace, WORKSPACE_SCHEMA_VERSION } from './migrations';

const v1Page = (id: string, extra: Record<string, unknown> = {}) => ({
  id,
  title: id.toUpperCase(),
  icon: '📄',
  parentId: null,
  childIds: [],
  blocks: [{ id: `${id}-b1`, type: 'paragraph', text: 'hello', checked: false }],
  collapsed: false,
  createdAt: 1,
  updatedAt: 1,
  ...extra,
});

describe('migrateWorkspace', () => {
  it('adds the favorite flag to v1 pages', () => {
    const migrated = migrateWorkspace(
      { pages: { a: v1Page('a') }, rootIds: ['a'], activePageId: 'a' },
      1,
    );
    expect(migrated.pages.a.favorite).toBe(false);
    expect(migrated.pages.a.blocks[0].text).toBe('hello');
    expect(migrated.activePageId).toBe('a');
  });

  it('keeps data that is already on the current version', () => {
    const data = {
      pages: { a: v1Page('a', { favorite: true }) },
      rootIds: ['a'],
      activePageId: 'a',
    };
    expect(migrateWorkspace(data, WORKSPACE_SCHEMA_VERSION).pages.a.favorite).toBe(true);
  });

  it('returns an empty workspace for garbage input', () => {
    expect(migrateWorkspace('not an object', 0)).toEqual({
      pages: {},
      rootIds: [],
      activePageId: null,
    });
  });
});

describe('sanitizeWorkspace', () => {
  it('drops dangling ids and promotes orphan pages to the root', () => {
    const result = sanitizeWorkspace({
      pages: {
        a: v1Page('a', { childIds: ['missing', 'b'] }),
        b: v1Page('b', { parentId: 'a' }),
        orphan: v1Page('orphan', { parentId: 'gone', childIds: ['child'] }),
        child: v1Page('child', { parentId: 'orphan' }),
      },
      rootIds: ['a', 'ghost'],
      activePageId: 'ghost',
    });

    expect(result.rootIds).toEqual(['a', 'orphan']);
    expect(result.pages.a.childIds).toEqual(['b']);
    expect(result.pages.orphan).toMatchObject({ parentId: null, childIds: ['child'] });
    expect(result.activePageId).toBe('a');
  });

  it('never lets a page appear twice in the tree', () => {
    const result = sanitizeWorkspace({
      pages: {
        a: v1Page('a', { childIds: ['c'] }),
        b: v1Page('b', { childIds: ['c'] }),
        c: v1Page('c', { parentId: 'a' }),
      },
      rootIds: ['a', 'b', 'a'],
      activePageId: 'c',
    });

    expect(result.rootIds).toEqual(['a', 'b']);
    expect(result.pages.a.childIds).toEqual(['c']);
    expect(result.pages.b.childIds).toEqual([]);
  });

  it('normalizes invalid blocks', () => {
    const result = sanitizeWorkspace({
      pages: {
        a: v1Page('a', {
          blocks: [{ id: 'x', type: 'video', text: 42 }, null, { type: 'todo' }],
        }),
      },
      rootIds: ['a'],
      activePageId: 'a',
    });
    expect(result.pages.a.blocks).toEqual([
      { id: 'x', type: 'paragraph', text: '', checked: false },
    ]);
  });
});
