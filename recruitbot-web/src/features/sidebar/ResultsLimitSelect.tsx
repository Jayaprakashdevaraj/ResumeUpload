import React from 'react';
import { useSearchStore } from '../../lib/stores/search.store';

export function ResultsLimitSelect() {
  const { topK, setTopK } = useSearchStore();

  return (
    <div className="flex items-center gap-2">
      <label className="text-xs text-text-muted">Show top</label>
      <select
        value={topK}
        onChange={(e) => setTopK(Number(e.target.value))}
        className="bg-bg-card text-text-primary text-sm rounded px-2 py-1"
      >
        <option value={3}>3</option>
        <option value={5}>5</option>
        <option value={10}>10</option>
        <option value={20}>20</option>
      </select>
      <span className="text-xs text-text-muted">results</span>
    </div>
  );
}

export default ResultsLimitSelect;
