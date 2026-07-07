import { create } from 'zustand';

/** Ephemeral UI state shared across distant components (never persisted). */
interface UiState {
  pendingDeletePageId: string | null;
  requestDeletePage: (id: string) => void;
  cancelDeletePage: () => void;
}

export const useUiStore = create<UiState>()((set) => ({
  pendingDeletePageId: null,
  requestDeletePage: (id) => set({ pendingDeletePageId: id }),
  cancelDeletePage: () => set({ pendingDeletePageId: null }),
}));
