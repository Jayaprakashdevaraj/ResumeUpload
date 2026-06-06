import { SearchService } from '../src/services/SearchService';

describe('SearchService (unit)', () => {
  it('endToEndSearch merges and uses LLM reranker', async () => {
    const fakeBm25 = [
      { resumeId: 'r1', snippet: 'candidate one', metadata: { name: 'A' } },
      { resumeId: 'r2', snippet: 'candidate two', metadata: { name: 'B' } }
    ];
    const fakeVector = [
      { resumeId: 'r3', snippet: 'candidate three', metadata: { name: 'C' } }
    ];

    const fakeRerank = [
      { resumeId: 'r3', score: 0.95, rationale: 'Top match' },
      { resumeId: 'r1', score: 0.7, rationale: 'Good fit' }
    ];

    const svc = new SearchService();
    // stub the internal searches
    (svc as any).bm25Search = jest.fn().mockResolvedValue(fakeBm25);
    (svc as any).vectorSearch = jest.fn().mockResolvedValue(fakeVector);
    // stub llm reranker
    (svc as any).llmService = { rerankCandidates: jest.fn().mockResolvedValue(fakeRerank) } as any;

    const out = await svc.endToEndSearch('engineer', {}, { topK: 5 });

    expect(Array.isArray(out.results)).toBe(true);
    expect(out.results.length).toBe(2);
    expect(out.results[0].resumeId).toBe('r3');
    expect(out.results[0].rationale).toBe('Top match');
  });
});
