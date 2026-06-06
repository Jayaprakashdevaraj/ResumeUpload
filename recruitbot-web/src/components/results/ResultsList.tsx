import React, { useEffect, useState } from 'react';
import ResultSummary from './ResultSummary';
import ResultCard from './ResultCard';
import EmptyState from './EmptyState';
import { SearchResult, SearchMode } from '../../types/search.types';

export function ResultsList({ results, searchType, duration, query }: { results: SearchResult[]; searchType: SearchMode | string; duration: number; query: string }) {
  const [local, setLocal] = useState(results);

  useEffect(() => setLocal(results), [results]);

  const normalizedSearchType: SearchMode =
    searchType === 'keyword' ? 'bm25' : searchType === 'vector' || searchType === 'bm25' || searchType === 'hybrid' ? (searchType as SearchMode) : 'bm25';

  function handleSelect(id: string) {
    window.dispatchEvent(new CustomEvent('recruitbot:openCandidate', { detail: { id } }));
  }

  if (!results || results.length === 0) return <EmptyState />;

  return (
    <div>
      {/* aria-live announcement for screen readers */}
      <div aria-live="polite" style={{position: 'absolute', left: -10000, top: 'auto', width: 1, height: 1, overflow: 'hidden'}}>
        Found {results.length} candidates for "{query || ''}"
      </div>
      <ResultSummary count={results.length} searchType={normalizedSearchType} duration={duration} />
      <div className="flex flex-col gap-3">
        {results.map((r, i) => (
          <ResultCard key={r.candidateId} result={r} rank={i + 1} onSelect={handleSelect} searchType={normalizedSearchType} />
        ))}
      </div>
    </div>
  );
}

export default ResultsList;
