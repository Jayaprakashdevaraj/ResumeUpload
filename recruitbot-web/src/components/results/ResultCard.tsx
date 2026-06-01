import React from 'react';
import { SearchResult, SearchMode } from '../../types/search.types';
import RankBadge from './RankBadge';
import ScorePill from './ScorePill';

export function ResultCard({ result, rank, onSelect }: { result: SearchResult; rank: number; onSelect: (id: string) => void }) {
  return (
    <button onClick={() => onSelect(result.candidateId)} className="w-full text-left p-3 rounded-md border border-white/5 hover:shadow-lg">
      <div className="flex items-start gap-3">
        <RankBadge rank={rank} />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">{result.name}</div>
            <ScorePill score={result.score} searchType={'vector' as SearchMode} />
          </div>
          <div className="text-xs text-text-muted mt-1">{result.experienceYears ? `${result.experienceYears} yrs` : ''} {result.email ? `· ${result.email}` : ''}</div>
          <div className="text-xs text-text-muted mt-2">{result.content.slice(0, 200)}{result.content.length > 200 ? '...' : ''}</div>
        </div>
      </div>
    </button>
  );
}

export default ResultCard;
