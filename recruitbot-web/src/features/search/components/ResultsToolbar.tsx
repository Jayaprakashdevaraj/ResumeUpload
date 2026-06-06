import React, { useEffect, useState } from 'react';

export default function ResultsToolbar({ results, onChange }: { results: any[]; onChange: (r: any[]) => void }) {
  const [sort, setSort] = useState<'relevance' | 'experience' | 'name'>('relevance');
  const [filterBm25, setFilterBm25] = useState(false);
  const [filterVector, setFilterVector] = useState(false);
  const [term, setTerm] = useState('');

  useEffect(() => {
    let out = Array.isArray(results) ? [...results] : [];

    if (filterBm25) out = out.filter((r) => r.contributions && r.contributions.bm25 !== undefined);
    if (filterVector) out = out.filter((r) => r.contributions && r.contributions.vector !== undefined);
    if (term && term.trim()) {
      const t = term.trim().toLowerCase();
      out = out.filter((r) => (r.matchedTerms || []).some((m: string) => String(m).toLowerCase().includes(t)) || String(r.content || '').toLowerCase().includes(t));
    }

    if (sort === 'relevance') out.sort((a, b) => (b.score || 0) - (a.score || 0));
    if (sort === 'experience') out.sort((a, b) => (b.experienceYears || 0) - (a.experienceYears || 0));
    if (sort === 'name') out.sort((a, b) => ((a.name || '').localeCompare(b.name || '')));

    onChange(out);
  }, [results, sort, filterBm25, filterVector, term, onChange]);

  return (
    <div className="flex items-center gap-3">
      <div className="text-xs text-text-muted">Sort</div>
      <select value={sort} onChange={(e) => setSort(e.target.value as any)} className="text-sm p-1 rounded bg-bg-surface">
        <option value="relevance">Relevance</option>
        <option value="experience">Experience</option>
        <option value="name">Name</option>
      </select>

      <label className="text-xs flex items-center gap-1">
        <input type="checkbox" checked={filterBm25} onChange={(e) => setFilterBm25(e.target.checked)} />
        <span className="text-xs">Has BM25</span>
      </label>
      <label className="text-xs flex items-center gap-1">
        <input type="checkbox" checked={filterVector} onChange={(e) => setFilterVector(e.target.checked)} />
        <span className="text-xs">Has Vector</span>
      </label>

      <input placeholder="Filter terms" value={term} onChange={(e) => setTerm(e.target.value)} className="ml-2 text-sm p-1 rounded bg-bg-surface" />
    </div>
  );
}
