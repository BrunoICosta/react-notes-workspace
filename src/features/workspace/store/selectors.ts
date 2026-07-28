import i18n from '../../../i18n';
import type { Page } from '../model/types';
import { useWorkspaceStore, type WorkspaceState } from './workspaceStore';

/**
 * Display title of a page, with a localized placeholder for untitled pages.
 * Components calling it also use `useTranslation`, so they re-render on language change.
 */
export function pageTitle(page: Pick<Page, 'title'>): string {
  return page.title.trim() || i18n.t('untitled');
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
