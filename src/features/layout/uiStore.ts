import { create } from 'zustand';

/** Ephemeral UI state shared across distant components (never persisted). */
interface UiState {
  pendingDeletePageId: string | null;
  searchOpen: boolean;
  requestDeletePage: (id: string) => void;
  cancelDeletePage: () => void;
  openSearch: () => void;
  closeSearch: () => void;
  toggleSearch: () => void;
}

export const useUiStore = create<UiState>()((set) => ({
  pendingDeletePageId: null,
  searchOpen: false,
  requestDeletePage: (id) => set({ pendingDeletePageId: id }),
  cancelDeletePage: () => set({ pendingDeletePageId: null }),
  openSearch: () => set({ searchOpen: true }),
  closeSearch: () => set({ searchOpen: false }),
  toggleSearch: () => set((state) => ({ searchOpen: !state.searchOpen })),
}));
