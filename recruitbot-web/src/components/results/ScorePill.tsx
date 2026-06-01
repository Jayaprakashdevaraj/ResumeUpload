import React from 'react';
import { SearchMode } from '../../types/search.types';

export function ScorePill({ score, searchType }: { score: number; searchType: SearchMode }) {
  const cls = searchType === 'vector' ? 'text-score-vector bg-score-vector/10' : searchType === 'bm25' ? 'text-score-bm25 bg-score-bm25/10' : 'text-score-hybrid bg-score-hybrid/10';
  return <div className={`px-2 py-1 rounded text-sm font-semibold ${cls}`}>{score.toFixed(2)}</div>;
}

export default ScorePill;
