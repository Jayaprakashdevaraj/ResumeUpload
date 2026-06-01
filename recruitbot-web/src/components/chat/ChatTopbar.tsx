import React from 'react';
import { useSearchStore } from '../../lib/stores/search.store';

export function ChatTopbar() {
  const { searchType } = useSearchStore();

  const badgeClass =
    searchType === 'vector' ? 'text-score-vector bg-score-vector/10' : searchType === 'bm25' ? 'text-score-bm25 bg-score-bm25/10' : 'text-score-hybrid bg-score-hybrid/10';

  return (
    <div className="flex items-center justify-between p-3 border-b border-white/5">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-bg-card flex items-center justify-center text-sm font-semibold">RB</div>
        <div>
          <div className="text-sm font-semibold">RecruitBot</div>
          <div className="text-xs text-text-muted">{searchType === 'bm25' ? 'BM25 · Keyword' : searchType === 'vector' ? 'Vector · Semantic similarity' : 'Hybrid · Combined'}</div>
        </div>
      </div>
      <div className={`px-2 py-1 rounded text-xs font-medium ${badgeClass}`}>{searchType.toUpperCase()}</div>
    </div>
  );
}

export default ChatTopbar;
