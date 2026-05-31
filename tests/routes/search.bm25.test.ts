import request from 'supertest';
import app from '../../src/app';
import { SearchService } from '../../src/services/SearchService';

describe('POST /v1/search/bm25', () => {
  let spy: jest.SpyInstance;

  beforeAll(() => {
    spy = jest
      .spyOn(SearchService.prototype, 'bm25Search')
      .mockResolvedValueOnce([
        { resumeId: '1', snippet: 'candidate one snippet', metadata: { score: 0.9 } },
        { resumeId: '2', snippet: 'candidate two snippet', metadata: { score: 0.8 } }
      ] as any);
  });

  afterAll(() => {
    spy.mockRestore();
  });

  test('returns results', async () => {
    const res = await request(app)
      .post('/v1/search/bm25')
      .send({ query: 'senior node.js' })
      .set('Accept', 'application/json');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('results');
    expect(Array.isArray(res.body.results)).toBe(true);
    expect(res.body.results.length).toBeGreaterThan(0);
  });
});
