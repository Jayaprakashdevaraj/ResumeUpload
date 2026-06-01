import React from 'react';
import { useSearchStore } from '../../lib/stores/search.store';

const MODES: { key: 'vector' | 'bm25' | 'hybrid'; title: string; desc: string }[] = [
  { key: 'vector', title: 'Vector Search', desc: 'Semantic similarity' },
  { key: 'bm25', title: 'BM25 Keyword', desc: 'Keyword match' },
  { key: 'hybrid', title: 'Hybrid', desc: 'Combined ranking' },
];

export function SearchModeNav() {
  const { searchType, setSearchType } = useSearchStore();

  return (
    <div className="grid gap-2">
      {MODES.map((m) => {
        const active = searchType === m.key;
        return (
          <button
            key={m.key}
            onClick={() => setSearchType(m.key)}
            className={`w-full text-left p-3 rounded-md border ${
              active ? 'bg-indigo-600/10 border-indigo-400/30' : 'border-white/5'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-text-primary">{m.title}</div>
                <div className="text-xs text-text-muted">{m.desc}</div>
              </div>
              <div className="text-xs text-text-muted">{active ? '✓' : ''}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export default SearchModeNav;
