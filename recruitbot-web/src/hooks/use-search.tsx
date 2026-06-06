import { useCallback, useEffect } from 'react';
import { useSearchStore } from '../lib/stores/search.store';
import { useChatStore } from '../lib/stores/chat.store';
import searchApi from '../lib/api/search.api';
import queryClient from '../lib/queryClient';

export function useSearch() {
  const { searchType, bm25Weight, vectorWeight, topK, setSearching, setResults } = useSearchStore();
  const { addBotMessage } = useChatStore();

  const submitQuery = useCallback(async (query: string) => {
    if (!query || !query.trim()) return;
    setSearching(true);
    try {
      const apiType = searchType === 'bm25' ? 'keyword' : searchType;
      const key = ['search', query.trim(), apiType, topK];
      const data = await queryClient.fetchQuery(key, () => (searchApi as any).searchResumes({
        query: query.trim(),
        searchType: apiType as any,
        topK,
        bm25Weight: bm25Weight / 100,
        vectorWeight: vectorWeight / 100,
      }));

      setResults(data.results || [], data.query || query);
      addBotMessage(<div></div>);
      // render ResultsList in Phase 13 UI by dispatching event
      window.dispatchEvent(new CustomEvent('recruitbot:results', { detail: { data } }));
    } catch (err) {
      addBotMessage(<p className="text-red-400">Search failed. Please try again.</p>);
    } finally {
      setSearching(false);
    }
  }, [searchType, bm25Weight, vectorWeight, topK, setSearching, setResults, addBotMessage]);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { query: string };
      if (detail?.query) submitQuery(detail.query);
    };
    window.addEventListener('recruitbot:search', handler as EventListener);
    return () => window.removeEventListener('recruitbot:search', handler as EventListener);
  }, [submitQuery]);

  return { submitQuery };
}

export default useSearch;
