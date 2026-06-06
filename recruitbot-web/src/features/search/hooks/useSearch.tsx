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
      // Use the backward-compatible alias so behavior matches the chat flow (maps 'keyword' <-> 'bm25')
      const apiType = state.searchType === 'bm25' ? 'keyword' : (state.searchType as any);
      console.debug('[useSearch] query=', query, 'searchType=', state.searchType, 'apiType=', apiType, 'topK=', state.topK);
      const resp = await (searchApi as any).searchResumes({ query: query.trim(), topK: state.topK, searchType: apiType });
      // `searchResumes` returns the normalized SearchResponse shape
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
