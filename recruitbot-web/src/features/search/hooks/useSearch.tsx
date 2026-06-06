import { useCallback } from 'react';
import { useSearchStore } from '../../../lib/stores/search.store';
import searchApi from '../../../lib/api/search.api';

export function useSearch() {
  const setSearching = useSearchStore((s) => s.setSearching);
  const setResults = useSearchStore((s) => s.setResults);
  const getState = useSearchStore.getState;

  const search = useCallback(async (query: string) => {
    const state = getState();
    if (!query || !String(query).trim()) {
      setResults([]);
      return;
    }
    setSearching(true);
    try {
      const resp = await searchApi.search({ query, topK: state.topK, searchType: state.searchType });
      setResults(resp.results || [], query);
    } catch (err: any) {
      console.error('useSearch.search error:', err?.message || err);
      setResults([]);
    } finally {
      setSearching(false);
    }
  }, [setResults, setSearching]);

  return { search };
}

export default useSearch;
