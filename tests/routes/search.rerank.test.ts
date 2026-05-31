import request from 'supertest';
import app from '../../src/app';
import { LLMService } from '../../src/services/LLMService';

describe('POST /v1/search/rerank', () => {
  let spy: jest.SpyInstance;

  beforeAll(() => {
    spy = jest
      .spyOn(LLMService.prototype, 'rerankCandidates')
      .mockResolvedValueOnce([
        { resumeId: '1', score: 0.95, rationale: 'good match' },
        { resumeId: '2', score: 0.9, rationale: 'also good' }
      ] as any);
  });

  afterAll(() => {
    spy.mockRestore();
  });

  test('returns reranked results', async () => {
    const res = await request(app)
      .post('/v1/search/rerank')
      .send({
        query: 'senior node.js',
        candidates: [
          { resumeId: '1', snippet: 'candidate one snippet' },
          { resumeId: '2', snippet: 'candidate two snippet' }
        ]
      })
      .set('Accept', 'application/json');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('results');
    expect(Array.isArray(res.body.results)).toBe(true);
    expect(res.body.results.length).toBeGreaterThan(0);
  });
});
