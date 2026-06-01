import React from 'react';
import { SearchMode } from '../../types/search.types';

export function ResultSummary({ count, searchType, duration }: { count: number; searchType: SearchMode; duration: number }) {
  const modeLabel = searchType === 'bm25' ? 'BM25' : searchType === 'vector' ? 'Vector' : 'Hybrid';
  return (
    <div className="flex items-center justify-between mb-2">
      <div className="text-sm text-text-primary">Found <strong>{count}</strong> candidates · {modeLabel} Search</div>
      <div className="text-xs text-text-muted">{duration} ms</div>
    </div>
  );
}

export default ResultSummary;
