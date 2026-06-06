import React from 'react';
import { SearchMode } from '../../types/search.types';

export function ScorePill({ score, searchType }: { score: number; searchType: SearchMode | string }) {
  const mode = searchType === 'vector' ? 'Vector' : searchType === 'bm25' ? 'BM25' : 'Hybrid';
  const cls = searchType === 'vector' ? 'text-score-vector bg-score-vector/10' : searchType === 'bm25' ? 'text-score-bm25 bg-score-bm25/10' : 'text-score-hybrid bg-score-hybrid/10';
  return (
    <div className={`px-2 py-1 rounded text-sm font-semibold flex items-center gap-2 ${cls}`}>
      <span className="text-xs opacity-80">{mode}</span>
      <span>{Number(score || 0).toFixed(2)}</span>
    </div>
  );
}

export default ScorePill;
