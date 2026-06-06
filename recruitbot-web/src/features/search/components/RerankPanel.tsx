import React, { useState } from 'react';
import { useSearchStore } from '../../../lib/stores/search.store';
import searchApi from '../../../lib/api/search.api';

export default function RerankPanel() {
  const results = useSearchStore((s) => s.results);
  const lastQuery = useSearchStore((s) => s.lastQuery);
  const setResults = useSearchStore((s) => s.setResults);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<Record<string, boolean>>({});

  function updateResultRationale(resumeId: string, text: string, persisted = false) {
    const curr = (useSearchStore.getState().results || []) as any[];
    const updated = curr.map((r) => (r.candidateId === resumeId ? { ...r, rationale: text, rationalePersisted: persisted } : r));
    setResults(updated, lastQuery);
  }

  async function onRerank() {
    if (!lastQuery || results.length === 0) return;
    setLoading(true);
    try {
      const candidates = results.map((r: any) => ({ resumeId: r.candidateId, snippet: r.content, metadata: r }));

      // Try streaming rerank (POST streaming). We'll send a POST to /v1/search/rerank/stream
      const url = (searchApi as any).baseUrl ? `${(searchApi as any).baseUrl}/v1/search/rerank/stream` : '/v1/search/rerank/stream';
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: lastQuery, candidates, topK: results.length })
      });

      if (!resp.ok || !resp.body) {
        // fallback to non-streaming rerank
        const reranked = await searchApi.rerank(lastQuery, candidates, results.length);
        setResults(reranked, lastQuery);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      // map of resumeId -> accumulated rationale
      const rationaleMap: Record<string, string> = {};

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // SSE parsing: split by double newline
        let idx;
        while ((idx = buffer.indexOf('\n\n')) !== -1) {
          const rawEvent = buffer.slice(0, idx).trim();
          buffer = buffer.slice(idx + 2);
          const lines = rawEvent.split(/\r?\n/);
          let ev: string | null = null;
          let data: string | null = null;
          for (const line of lines) {
            if (line.startsWith('event:')) ev = line.replace('event:', '').trim();
            if (line.startsWith('data:')) data = line.replace('data:', '').trim();
          }
          if (!ev || !data) continue;
          try {
            const payload = JSON.parse(data);
            if (ev === 'rationale') {
              const { resumeId, chunk } = payload as any;
              rationaleMap[resumeId] = (rationaleMap[resumeId] || '') + String(chunk || '');
              updateResultRationale(resumeId, rationaleMap[resumeId], false);
            } else if (ev === 'rationale_done') {
              const { resumeId, summary } = payload as any;
              rationaleMap[resumeId] = String(summary || rationaleMap[resumeId] || '');
              updateResultRationale(resumeId, rationaleMap[resumeId], true);
            } else if (ev === 'ranked') {
              const ranked = payload as any[];
              // map ranked results into frontend shape
              const mapped = ranked.map((r: any) => ({
                candidateId: r.resumeId,
                name: (r.metadata && r.metadata.name) || '',
                email: (r.metadata && r.metadata.email) || '',
                phoneNumber: (r.metadata && r.metadata.phone) || '',
                score: Number(r.score || 0),
                experienceYears: (r.metadata && r.metadata.experienceYears) || 0,
                content: r.snippet || '',
                rationale: r.rationale || ''
              }));
              setResults(mapped, lastQuery);
            }
          } catch (e) {
            // ignore parse errors
          }
        }
      }
      // reader done
    } catch (err: any) {
      console.error('Rerank failed', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button onClick={onRerank} disabled={loading || results.length === 0} className="px-3 py-2 rounded bg-indigo-600 text-white">
        {loading ? 'Reranking...' : 'Rerank Results'}
      </button>
      <div className="text-sm text-text-muted">Rerank uses the LLM to refine ordering and provides rationales.</div>
    </div>
  );
}
