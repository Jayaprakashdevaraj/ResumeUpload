import request from 'supertest';
import app from '../../src/app';
import { SearchService } from '../../src/services/SearchService';

describe('POST /v1/search/vector', () => {
  let spy: jest.SpyInstance;

  beforeAll(() => {
    spy = jest
      .spyOn(SearchService.prototype, 'vectorSearch')
      .mockResolvedValueOnce([
        { resumeId: 'v1', snippet: 'vector candidate one', metadata: { score: 0.95 } },
        { resumeId: 'v2', snippet: 'vector candidate two', metadata: { score: 0.9 } }
      ] as any);
  });

  afterAll(() => {
    spy.mockRestore();
  });

  test('returns vector results', async () => {
    const res = await request(app)
      .post('/v1/search/vector')
      .send({ query: 'fullstack engineer' })
      .set('Accept', 'application/json');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('results');
    expect(Array.isArray(res.body.results)).toBe(true);
    expect(res.body.results.length).toBeGreaterThan(0);
  });
});
