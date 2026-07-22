import { create } from 'zustand';

/** Ephemeral UI state shared across distant components (never persisted). */
interface UiState {
  pendingDeletePageId: string | null;
  searchOpen: boolean;
  /** Only meaningful on small screens, where the sidebar is a drawer. */
  sidebarOpen: boolean;
  requestDeletePage: (id: string) => void;
  cancelDeletePage: () => void;
  openSearch: () => void;
  closeSearch: () => void;
  toggleSearch: () => void;
  openSidebar: () => void;
  closeSidebar: () => void;
}

export const useUiStore = create<UiState>()((set) => ({
  pendingDeletePageId: null,
  searchOpen: false,
  sidebarOpen: false,
  requestDeletePage: (id) => set({ pendingDeletePageId: id }),
  cancelDeletePage: () => set({ pendingDeletePageId: null }),
  openSearch: () => set({ searchOpen: true, sidebarOpen: false }),
  closeSearch: () => set({ searchOpen: false }),
  toggleSearch: () => set((state) => ({ searchOpen: !state.searchOpen, sidebarOpen: false })),
  openSidebar: () => set({ sidebarOpen: true }),
  closeSidebar: () => set({ sidebarOpen: false }),
}));

/** DOM id of the sidebar, referenced by the drawer toggle's aria-controls. */
export const SIDEBAR_ID = 'app-sidebar';
