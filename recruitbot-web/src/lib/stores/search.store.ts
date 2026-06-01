import { create } from 'zustand';

export type SearchMode = 'vector' | 'bm25' | 'hybrid';

interface SearchState {
  searchType: SearchMode;
  bm25Weight: number;
  vectorWeight: number;
  topK: number;
  results: any[];
  isSearching: boolean;
  lastQuery: string;
  setSearchType: (m: SearchMode) => void;
  setWeights: (bm25: number, vector: number) => void;
  setTopK: (k: number) => void;
  setResults: (r: any[], q?: string) => void;
  setSearching: (v: boolean) => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  searchType: 'vector',
  bm25Weight: 50,
  vectorWeight: 50,
  topK: 5,
  results: [],
  isSearching: false,
  lastQuery: '',
  setSearchType: (m) => set({ searchType: m }),
  setWeights: (bm25, vector) => set({ bm25Weight: bm25, vectorWeight: vector }),
  setTopK: (k) => set({ topK: k }),
  setResults: (r, q) => set({ results: r, lastQuery: q || '' }),
  setSearching: (v) => set({ isSearching: v })
}));
