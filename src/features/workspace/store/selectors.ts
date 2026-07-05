import type { Page } from '../model/types';
import { useWorkspaceStore, type WorkspaceState } from './workspaceStore';

export const UNTITLED_PAGE = 'Sem título';

export function pageTitle(page: Pick<Page, 'title'>): string {
  return page.title.trim() || UNTITLED_PAGE;
}

export function selectActivePage(state: WorkspaceState): Page | null {
  return state.activePageId ? (state.pages[state.activePageId] ?? null) : null;
}

export function useActivePage(): Page | null {
  return useWorkspaceStore(selectActivePage);
}

export function usePage(id: string): Page | undefined {
  return useWorkspaceStore((state) => state.pages[id]);
}
