import { beforeEach, describe, expect, it } from 'vitest';
import { WORKSPACE_SCHEMA_VERSION } from './migrations';
import { useWorkspaceStore, WORKSPACE_STORAGE_KEY } from './workspaceStore';

const store = () => useWorkspaceStore.getState();

describe('workspace store', () => {
  beforeEach(() => localStorage.clear());

  it('creates an active page with an empty paragraph ready to type', () => {
    const id = store().createPage({ title: 'Diário' });
    const page = store().pages[id];

    expect(store().activePageId).toBe(id);
    expect(store().rootIds).toEqual([id]);
    expect(page.blocks).toHaveLength(1);
    expect(page.blocks[0]).toMatchObject({ type: 'paragraph', text: '' });
  });

  it('creates subpages without stealing focus when asked to', () => {
    const parent = store().createPage();
    const child = store().createPage({ parentId: parent, activate: false });

    expect(store().pages[parent].childIds).toEqual([child]);
    expect(store().activePageId).toBe(parent);
  });

  it('runs block actions against the right page', () => {
    const pageId = store().createPage();
    const [first] = store().pages[pageId].blocks;

    store().updateBlockText(pageId, first.id, 'Comprar pão');
    store().changeBlockType(pageId, first.id, 'todo');
    store().toggleTodo(pageId, first.id);
    const second = store().splitBlock(pageId, first.id, 7);
    store().moveBlock(pageId, second, first.id);

    expect(store().pages[pageId].blocks).toEqual([
      { id: second, type: 'todo', text: ' pão', checked: false },
      { id: first.id, type: 'todo', text: 'Comprar', checked: true },
    ]);
  });

  it('persists only the data with the current schema version', () => {
    const id = store().createPage({ title: 'Salvo' });
    const saved = JSON.parse(localStorage.getItem(WORKSPACE_STORAGE_KEY) ?? 'null');

    expect(saved.version).toBe(WORKSPACE_SCHEMA_VERSION);
    expect(Object.keys(saved.state).sort()).toEqual(['activePageId', 'pages', 'rootIds']);
    expect(saved.state.pages[id].title).toBe('Salvo');
  });

  it('migrates v1 data found in localStorage on rehydration', async () => {
    localStorage.setItem(
      WORKSPACE_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        state: {
          pages: {
            old: {
              id: 'old',
              title: 'Página antiga',
              icon: '📜',
              parentId: null,
              childIds: [],
              blocks: [],
              collapsed: false,
              createdAt: 1,
              updatedAt: 1,
            },
          },
          rootIds: ['old'],
          activePageId: 'old',
        },
      }),
    );

    await useWorkspaceStore.persist.rehydrate();

    expect(store().pages.old).toMatchObject({ title: 'Página antiga', favorite: false });
    expect(JSON.parse(localStorage.getItem(WORKSPACE_STORAGE_KEY) ?? '{}').version).toBe(
      WORKSPACE_SCHEMA_VERSION,
    );
  });

  it('restores the welcome pages on reset', () => {
    store().createPage({ title: 'Temporária' });
    store().resetWorkspace();

    expect(store().pages[store().activePageId as string].title).toBe(
      'Bem-vindo ao Notes Workspace',
    );
    expect(Object.values(store().pages).some((page) => page.title === 'Temporária')).toBe(false);
  });
});
