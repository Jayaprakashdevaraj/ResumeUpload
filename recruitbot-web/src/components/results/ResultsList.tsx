import React, { useEffect, useState } from 'react';
import ResultSummary from './ResultSummary';
import ResultCard from './ResultCard';
import EmptyState from './EmptyState';
import { SearchResult, SearchMode } from '../../types/search.types';

export function ResultsList({ results, searchType, duration, query }: { results: SearchResult[]; searchType: SearchMode; duration: number; query: string }) {
  const [local, setLocal] = useState(results);

  useEffect(() => setLocal(results), [results]);

  function handleSelect(id: string) {
    window.dispatchEvent(new CustomEvent('recruitbot:openCandidate', { detail: { id } }));
  }

  if (!results || results.length === 0) return <EmptyState />;

  return (
    <div>
      <ResultSummary count={results.length} searchType={searchType} duration={duration} />
      <div className="flex flex-col gap-3">
        {results.map((r, i) => (
          <ResultCard key={r.candidateId} result={r} rank={i + 1} onSelect={handleSelect} />
        ))}
      </div>
    </div>
  );
}

export default ResultsList;
