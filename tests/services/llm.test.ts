import { LLMService } from '../../src/services/LLMService';
import * as undici from 'undici';

jest.mock('undici', () => ({
  fetch: jest.fn()
}));

describe('LLMService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.GROQ_API_KEY;
  });

  test('rerankCandidates falls back to heuristic when no API key', async () => {
    const svc = new LLMService();
    const candidates = [
      { resumeId: '1', snippet: 'node.js mongodb express' },
      { resumeId: '2', snippet: 'java spring' }
    ];
    const reranked = await svc.rerankCandidates('node.js', candidates, 10); // Request more than candidates
    expect(reranked.length).toBeGreaterThanOrEqual(1); // At least first candidate
    expect(reranked[0].resumeId).toBe('1'); // node.js should rank higher
  });

  test('rerankCandidates returns all candidates when topK >= candidate count', async () => {
    const svc = new LLMService();
    const candidates = [
      { resumeId: '1', snippet: 'node.js mongodb express' },
      { resumeId: '2', snippet: 'java spring' }
    ];
    const reranked = await svc.rerankCandidates('node.js', candidates, 100);
    expect(reranked.length).toBe(2); // Should get both
    expect(reranked[0].score).toBeGreaterThan(reranked[1].score); // First should score higher
  });

  test('calls GROQ API when key is configured', async () => {
    const mockFetch = undici.fetch as jest.MockedFunction<typeof undici.fetch>;
    const mockRerankedJson = {
      ranked: [
        { resumeId: '1', score: 0.9, rationale: 'Perfect match' },
        { resumeId: '2', score: 0.6, rationale: 'Partial match' }
      ]
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce({
        choices: [{ message: { content: JSON.stringify(mockRerankedJson) } }]
      })
    } as any);

    const svc = new LLMService({ apiKey: 'test-key' });
    const candidates = [
      { resumeId: '1', snippet: 'Senior node.js engineer' },
      { resumeId: '2', snippet: 'Java developer' }
    ];
    const reranked = await svc.rerankCandidates('node.js', candidates, 2);

    expect(reranked.length).toBe(2);
    expect(reranked[0].resumeId).toBe('1');
    expect(reranked[0].score).toBe(0.9);
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/chat/completions'), expect.any(Object));
  });

  test('summarizeCandidateFit returns result from GROQ', async () => {
    const mockFetch = undici.fetch as jest.MockedFunction<typeof undici.fetch>;
    const mockSummary = {
      summary: 'Strong fit for the role',
      fitScore: 0.85,
      highlights: ['Node.js expert', 'MongoDB experience']
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce({
        choices: [{ message: { content: JSON.stringify(mockSummary) } }]
      })
    } as any);

    const svc = new LLMService({ apiKey: 'test-key' });
    const candidate = { resumeId: '1', snippet: 'Senior node.js engineer with MongoDB' };
    const result = await svc.summarizeCandidateFit('Backend engineer', candidate, { style: 'short' });

    expect(result.summary).toBe('Strong fit for the role');
    expect(result.fitScore).toBe(0.85);
    expect(result.highlights).toContain('Node.js expert');
  });

  test('handles malformed LLM response gracefully', async () => {
    const mockFetch = undici.fetch as jest.MockedFunction<typeof undici.fetch>;
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce({
        choices: [{ message: { content: 'Invalid JSON' } }]
      })
    } as any);

    const svc = new LLMService({ apiKey: 'test-key' });
    const candidates = [{ resumeId: '1', snippet: 'text' }];
    const reranked = await svc.rerankCandidates('query', candidates);

    // Should fall back to heuristic
    expect(reranked).toBeDefined();
    expect(reranked.length).toBeGreaterThan(0);
  });
});
