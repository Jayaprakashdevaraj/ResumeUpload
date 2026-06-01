import { create } from 'zustand';

interface UIState {
  loading: boolean;
  setLoading: (v: boolean) => void;
  modalOpen: boolean;
  setModalOpen: (v: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  loading: false,
  setLoading: (v) => set({ loading: v }),
  modalOpen: false,
  setModalOpen: (v) => set({ modalOpen: v })
}));
