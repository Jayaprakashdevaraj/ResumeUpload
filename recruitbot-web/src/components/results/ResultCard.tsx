import React from 'react';
import { SearchResult, SearchMode } from '../../types/search.types';
import RankBadge from './RankBadge';
import ScorePill from './ScorePill';
import { useState } from 'react';

export function ResultCard({
  result,
  rank,
  onSelect,
  searchType,
}: {
  result: SearchResult;
  rank: number;
  onSelect: (id: string) => void;
  searchType: SearchMode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <button onClick={() => onSelect(result.candidateId)} className="w-full text-left p-3 rounded-md border border-white/5 hover:shadow-lg">
      <div className="flex items-start gap-3">
        <RankBadge rank={rank} />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">{result.name}</div>
            <ScorePill score={result.score} searchType={searchType} />
          </div>
          {result.rationale && (
            <div className="mt-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen((v) => !v);
                }}
                className="text-xs text-primary underline"
              >
                {open ? 'Hide Rationale' : 'View Rationale'}
              </button>
              {open && <div className="text-xs text-text-muted mt-1">{result.rationale}</div>}
            </div>
          )}
          <div className="text-xs text-text-muted mt-1">{result.experienceYears ? `${result.experienceYears} yrs` : ''} {result.email ? `· ${result.email}` : ''}</div>
          <div className="text-xs text-text-muted mt-2">{result.content.slice(0, 200)}{result.content.length > 200 ? '...' : ''}</div>
        </div>
      </div>
    </button>
  );
}

export default ResultCard;
