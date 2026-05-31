import request from 'supertest';
import app from '../../src/app';
import { SearchService } from '../../src/services/SearchService';
import { LLMService } from '../../src/services/LLMService';

describe('POST /v1/search (end-to-end)', () => {
  let svcSpy: jest.SpyInstance;
  let sumSpy: jest.SpyInstance;

  afterEach(() => {
    if (svcSpy) svcSpy.mockRestore();
    if (sumSpy) sumSpy.mockRestore();
  });

  test('returns reranked results', async () => {
    svcSpy = jest
      .spyOn(SearchService.prototype, 'endToEndSearch')
      .mockResolvedValueOnce({
        results: [
          { resumeId: 'r1', score: 0.95, rationale: 'top', snippet: 's1', metadata: {} }
        ],
        candidates: [{ resumeId: 'r1', snippet: 's1', metadata: {} }]
      } as any);

    const res = await request(app).post('/v1/search').send({ query: 'senior backend' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('results');
    expect(Array.isArray(res.body.results)).toBe(true);
    expect(res.body.results[0].resumeId).toBe('r1');
  });

  test('returns summaries for top candidates when requested', async () => {
    svcSpy = jest
      .spyOn(SearchService.prototype, 'endToEndSearch')
      .mockResolvedValueOnce({
        results: [
          { resumeId: 'r1', score: 0.95, rationale: 'top', snippet: 's1', metadata: {} },
          { resumeId: 'r2', score: 0.85, rationale: 'second', snippet: 's2', metadata: {} }
        ],
        candidates: [
          { resumeId: 'r1', snippet: 's1', metadata: {} },
          { resumeId: 'r2', snippet: 's2', metadata: {} }
        ]
      } as any);

    sumSpy = jest
      .spyOn(LLMService.prototype, 'summarizeCandidateFit')
      .mockResolvedValue({ summary: 'Good fit', fitScore: 0.9, highlights: ['Node.js'] } as any);

    const res = await request(app)
      .post('/v1/search')
      .send({ query: 'senior backend', summarize: true, summarizeTopK: 1 });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('results');
    expect(res.body.results[0].summary).toBeDefined();
    expect(res.body.results[0].summary.summary).toBe('Good fit');
  });
});
