import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { createId } from '../../../shared/lib/createId';
import * as blocks from '../model/blocks';
import * as tree from '../model/tree';
import type { BlockType, WorkspaceData } from '../model/types';
import { createSeedWorkspace } from '../seed/seedWorkspace';
import { migrateWorkspace, sanitizeWorkspace, WORKSPACE_SCHEMA_VERSION } from './migrations';

export const WORKSPACE_STORAGE_KEY = 'notes-workspace:data';

export interface CreatePageOptions {
  parentId?: string | null;
  title?: string;
  icon?: string;
  /** Makes the new page the active one (default: true). */
  activate?: boolean;
}

export interface WorkspaceActions {
  createPage: (options?: CreatePageOptions) => string;
  renamePage: (id: string, title: string) => void;
  setPageIcon: (id: string, icon: string) => void;
  toggleFavorite: (id: string) => void;
  toggleCollapsed: (id: string) => void;
  deletePage: (id: string) => void;
  indentPage: (id: string) => void;
  outdentPage: (id: string) => void;
  setActivePage: (id: string | null) => void;
  /** Replaces everything with the welcome pages. */
  resetWorkspace: () => void;

  insertBlock: (pageId: string, afterId: string | null, type?: BlockType, text?: string) => string;
  updateBlockText: (pageId: string, blockId: string, text: string) => void;
  toggleTodo: (pageId: string, blockId: string) => void;
  changeBlockType: (pageId: string, blockId: string, type: BlockType) => void;
  removeBlock: (pageId: string, blockId: string) => void;
  /** Splits a block at the caret and returns the id of the new block. */
  splitBlock: (pageId: string, blockId: string, caret: number) => string;
  mergeWithPrevious: (pageId: string, blockId: string) => void;
  moveBlock: (pageId: string, activeId: string, overId: string) => void;
}

export type WorkspaceState = WorkspaceData & WorkspaceActions;

export function selectWorkspaceData(state: WorkspaceState): WorkspaceData {
  return { pages: state.pages, rootIds: state.rootIds, activePageId: state.activePageId };
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      // First visit: start with the welcome pages (persisted data replaces them on hydration).
      ...createSeedWorkspace(),

      createPage: (options = {}) => {
        const id = createId();
        set((state) => {
          const next = tree.addPage(state, {
            id,
            now: Date.now(),
            parentId: options.parentId ?? null,
            title: options.title,
            icon: options.icon,
            blocks: [blocks.createBlock(createId())],
          });
          return options.activate === false ? next : tree.setActivePage(next, id);
        });
        return id;
      },
      renamePage: (id, title) => set((state) => tree.updatePage(state, id, { title }, Date.now())),
      setPageIcon: (id, icon) => set((state) => tree.updatePage(state, id, { icon }, Date.now())),
      toggleFavorite: (id) => set((state) => tree.toggleFavorite(state, id)),
      toggleCollapsed: (id) => set((state) => tree.toggleCollapsed(state, id)),
      deletePage: (id) => set((state) => tree.deletePage(state, id)),
      indentPage: (id) => set((state) => tree.indentPage(state, id)),
      outdentPage: (id) => set((state) => tree.outdentPage(state, id)),
      setActivePage: (id) => set((state) => tree.setActivePage(state, id)),
      resetWorkspace: () => set(createSeedWorkspace()),

      insertBlock: (pageId, afterId, type = 'paragraph', text = '') => {
        const block = blocks.createBlock(createId(), type, text);
        set((state) => blocks.insertBlockAfter(state, pageId, afterId, block, Date.now()));
        return block.id;
      },
      updateBlockText: (pageId, blockId, text) =>
        set((state) => blocks.updateBlock(state, pageId, blockId, { text }, Date.now())),
      toggleTodo: (pageId, blockId) =>
        set((state) => {
          const block = state.pages[pageId]?.blocks.find((item) => item.id === blockId);
          if (!block) return state;
          return blocks.updateBlock(
            state,
            pageId,
            blockId,
            { checked: !block.checked },
            Date.now(),
          );
        }),
      changeBlockType: (pageId, blockId, type) =>
        set((state) => blocks.changeBlockType(state, pageId, blockId, type, Date.now())),
      removeBlock: (pageId, blockId) =>
        set((state) => blocks.removeBlock(state, pageId, blockId, Date.now())),
      splitBlock: (pageId, blockId, caret) => {
        const id = createId();
        set((state) => blocks.splitBlock(state, pageId, blockId, caret, id, Date.now()));
        return id;
      },
      mergeWithPrevious: (pageId, blockId) =>
        set((state) => blocks.mergeWithPrevious(state, pageId, blockId, Date.now())),
      moveBlock: (pageId, activeId, overId) =>
        set((state) => blocks.moveBlock(state, pageId, activeId, overId, Date.now())),
    }),
    {
      name: WORKSPACE_STORAGE_KEY,
      version: WORKSPACE_SCHEMA_VERSION,
      storage: createJSONStorage(() => localStorage),
      partialize: selectWorkspaceData,
      migrate: (persisted, version) => migrateWorkspace(persisted, version),
      // Sanitize on every hydration so hand-edited or corrupted storage cannot crash the app.
      merge: (persisted, current) =>
        persisted === undefined ? current : { ...current, ...sanitizeWorkspace(persisted) },
    },
  ),
);
