import request from 'supertest';
import app from '../../src/app';
import { SearchService } from '../../src/services/SearchService';

describe('POST /v1/search/hybrid', () => {
  let spy: jest.SpyInstance;

  beforeAll(() => {
    spy = jest
      .spyOn(SearchService.prototype, 'hybridSearch')
      .mockResolvedValueOnce({
        bm25: [
          { resumeId: '1', snippet: 'bm25 candidate one', metadata: { score: 0.9 } }
        ],
        vector: [
          { resumeId: 'v1', snippet: 'vector candidate one', metadata: { score: 0.95 } }
        ]
      } as any);
  });

  afterAll(() => {
    spy.mockRestore();
  });

  test('returns bm25 and vector results', async () => {
    const res = await request(app)
      .post('/v1/search/hybrid')
      .send({ query: 'backend engineer' })
      .set('Accept', 'application/json');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('bm25');
    expect(res.body).toHaveProperty('vector');
    expect(Array.isArray(res.body.bm25)).toBe(true);
    expect(Array.isArray(res.body.vector)).toBe(true);
  });
});
