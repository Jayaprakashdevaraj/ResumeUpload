import request from 'supertest';
import app from '../../src/app';

jest.mock('../../src/services/ResumeingestionService', () => {
  return {
    ResumeingestionService: jest.fn().mockImplementation(() => ({
      injectResume: jest.fn(async (p: any) => ({ id: 'injected-123', timings: { totalMs: 100 }, doc: { name: 'Test' } }))
    }))
  };
});

describe('POST /v1/resume/inject', () => {
  test('orchestrates inject and returns id', async () => {
    const res = await request(app).post('/v1/resume/inject').send({ path: 'uploads/test.pdf' }).set('Content-Type', 'application/json');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.id).toBe('injected-123');
    expect(res.body.timings).toBeDefined();
  });
});
