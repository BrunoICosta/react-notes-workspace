import { describe, expect, it } from 'vitest';
import i18n, { SUPPORTED_LANGUAGES } from '../../../i18n';
import { BLOCK_TYPES } from '../model/types';
import { sanitizeWorkspace } from '../store/migrations';
import { useWorkspaceStore } from '../store/workspaceStore';
import { createSeedWorkspace } from './seedWorkspace';

describe.each(SUPPORTED_LANGUAGES)('createSeedWorkspace (%s)', (language) => {
  const ws = createSeedWorkspace(42, language);

  it('opens the welcome page, which is a favorite with nested guides', () => {
    const welcome = ws.pages[ws.activePageId as string];
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

describe('localized seed', () => {
  it('has the same structure in every language', () => {
    const shape = (language: (typeof SUPPORTED_LANGUAGES)[number]) => {
      const ws = createSeedWorkspace(1, language);
      return Object.values(ws.pages).map((page) => [page.id, page.blocks.map((b) => b.type)]);
    };
    expect(shape('en')).toEqual(shape('pt-BR'));
  });

  it('is written in the active language when restoring the examples', async () => {
    await i18n.changeLanguage('en');
    useWorkspaceStore.getState().resetWorkspace();
    const state = useWorkspaceStore.getState();
    expect(state.pages[state.activePageId as string].title).toBe('Welcome to Notes Workspace');

    // Existing pages are kept as they are when the language changes later.
    await i18n.changeLanguage('pt-BR');
    expect(useWorkspaceStore.getState().pages['seed-welcome'].title).toBe(
      'Welcome to Notes Workspace',
    );
  });
});
