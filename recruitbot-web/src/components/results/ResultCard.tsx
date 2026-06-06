import React, { useMemo, useState } from 'react';
import { SearchResult, SearchMode } from '../../types/search.types';
import RankBadge from './RankBadge';
import ScorePill from './ScorePill';

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
  const matched = result.matchedTerms || [];

  function escapeRegExp(s: string) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  const highlightedSnippet = useMemo(() => {
    const text = result.content || '';
    if (!text || !matched || matched.length === 0) return text;
    const safeTerms = matched.map((t) => escapeRegExp(String(t)));
    const re = new RegExp(`(${safeTerms.join('|')})`, 'gi');
    const parts = String(text).split(re);
    return parts.map((part, i) => {
      if (!part) return null;
      const isMatch = safeTerms.some((t) => part.toLowerCase() === t.toLowerCase());
      return isMatch ? (
        <span key={i} className="bg-yellow-300 text-black px-1 rounded">{part}</span>
      ) : (
        <span key={i}>{part}</span>
      );
    });
  }, [result.content, matched]);
  return (
    <button onClick={() => onSelect(result.candidateId)} className="w-full text-left p-3 rounded-md border border-white/5 hover:shadow-lg">
      <div className="flex items-start gap-3">
        <RankBadge rank={rank} />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">{result.name}</div>
            <ScorePill score={result.score} searchType={searchType} />
          </div>
          <div className="mt-2 flex items-center gap-2">
            {result.contributions?.bm25 !== undefined && (
              <div className="text-xs px-2 py-1 rounded bg-score-bm25/10 text-score-bm25">BM25: {Number(result.contributions.bm25).toFixed(2)}</div>
            )}
            {result.contributions?.vector !== undefined && (
              <div className="text-xs px-2 py-1 rounded bg-score-vector/10 text-score-vector">Vector: {Number(result.contributions.vector).toFixed(2)}</div>
            )}
            {result.contributions && (result.contributions.bm25 !== undefined || result.contributions.vector !== undefined) && (
              <div className="flex-1 ml-2">
                <div className="h-2 w-full bg-white/5 rounded overflow-hidden">
                  {/* Contribution bar: bm25 then vector */}
                  <div
                    className="h-2 bg-score-bm25"
                    style={{ width: `${Number(result.contributions.bm25 ?? 0) * 100}%`, display: 'inline-block' }}
                  />
                  <div
                    className="h-2 bg-score-vector"
                    style={{ width: `${Number(result.contributions.vector ?? 0) * 100}%`, display: 'inline-block' }}
                  />
                </div>
              </div>
            )}
            {matched.length > 0 && (
              <div className="text-xs text-text-muted">Matched: {matched.slice(0,5).map((t,i) => <span key={t} className="px-1">{t}{i < Math.min(matched.length,5)-1 ? ',' : ''}</span>)}</div>
            )}
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
          <div className="text-xs text-text-muted mt-2">{Array.isArray(highlightedSnippet) ? <>{highlightedSnippet}</> : String(highlightedSnippet).slice(0, 200)}{String(result.content || '').length > 200 ? '...' : ''}</div>
        </div>
      </div>
    </button>
  );
}

export default ResultCard;
