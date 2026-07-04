import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { createId } from '../../../shared/lib/createId';
import * as tree from '../model/tree';
import type { WorkspaceData } from '../model/types';

export const WORKSPACE_STORAGE_KEY = 'notes-workspace:data';
export const WORKSPACE_STORAGE_VERSION = 1;

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
  toggleCollapsed: (id: string) => void;
  deletePage: (id: string) => void;
  indentPage: (id: string) => void;
  outdentPage: (id: string) => void;
  setActivePage: (id: string | null) => void;
}

export type WorkspaceState = WorkspaceData & WorkspaceActions;

export function selectWorkspaceData(state: WorkspaceState): WorkspaceData {
  return { pages: state.pages, rootIds: state.rootIds, activePageId: state.activePageId };
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      ...tree.createEmptyWorkspace(),

      createPage: (options = {}) => {
        const id = createId();
        set((state) => {
          const next = tree.addPage(state, {
            id,
            now: Date.now(),
            parentId: options.parentId ?? null,
            title: options.title,
            icon: options.icon,
          });
          return options.activate === false ? next : tree.setActivePage(next, id);
        });
        return id;
      },
      renamePage: (id, title) => set((state) => tree.updatePage(state, id, { title }, Date.now())),
      setPageIcon: (id, icon) => set((state) => tree.updatePage(state, id, { icon }, Date.now())),
      toggleCollapsed: (id) => set((state) => tree.toggleCollapsed(state, id)),
      deletePage: (id) => set((state) => tree.deletePage(state, id)),
      indentPage: (id) => set((state) => tree.indentPage(state, id)),
      outdentPage: (id) => set((state) => tree.outdentPage(state, id)),
      setActivePage: (id) => set((state) => tree.setActivePage(state, id)),
    }),
    {
      name: WORKSPACE_STORAGE_KEY,
      version: WORKSPACE_STORAGE_VERSION,
      storage: createJSONStorage(() => localStorage),
      partialize: selectWorkspaceData,
    },
  ),
);
