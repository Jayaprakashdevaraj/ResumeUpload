import request from 'supertest';
import app from '../../src/app';
import { LLMService } from '../../src/services/LLMService';

describe('POST /v1/search/summarize', () => {
  let spy: jest.SpyInstance;

  beforeAll(() => {
    spy = jest
      .spyOn(LLMService.prototype, 'summarizeCandidateFit')
      .mockResolvedValueOnce({ summary: 'Strong fit', fitScore: 0.88, highlights: ['Node.js', 'MongoDB'] } as any);
  });

  afterAll(() => {
    spy.mockRestore();
  });

  test('returns a summary result', async () => {
    const res = await request(app)
      .post('/v1/search/summarize')
      .send({
        query: 'senior backend engineer',
        candidate: { resumeId: '1', snippet: 'Experienced backend engineer with Node.js and MongoDB' },
        style: 'short',
        maxTokens: 200
      })
      .set('Accept', 'application/json');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('result');
    expect(res.body.result.summary).toBeDefined();
    expect(typeof res.body.result.fitScore).toBe('number');
  });
});
