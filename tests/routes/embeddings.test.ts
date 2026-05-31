import request from 'supertest';
import app from '../../src/app';
import config from '../../src/config';
import { EmbeddingService } from '../../src/services/EmbeddingService';

describe('POST /v1/embeddings', () => {
  let spy: jest.SpyInstance;

  beforeAll(() => {
    spy = jest
      .spyOn(EmbeddingService.prototype, 'embed')
      .mockResolvedValue(new Array(config.mistralEmbedDimension).fill(0.1));
  });

  afterAll(() => {
    spy.mockRestore();
  });

  test('returns embedding and model', async () => {
    const res = await request(app)
      .post('/v1/embeddings')
      .send({ input: 'senior node.js engineer' })
      .set('Accept', 'application/json');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('embedding');
    expect(Array.isArray(res.body.embedding)).toBe(true);
    expect(res.body.embedding.length).toBe(config.mistralEmbedDimension);
    expect(res.body.model).toBeDefined();
  });

  test('returns 400 for invalid payload', async () => {
    const res = await request(app)
      .post('/v1/embeddings')
      .send({})
      .set('Accept', 'application/json');

    expect(res.status).toBe(400);
  });
});
