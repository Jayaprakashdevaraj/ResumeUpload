import request from 'supertest';

describe('Logging middleware for /v1/resume/inject', () => {
  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  test('emits structured log with requestId, fileName and timings', async () => {
    const mockResult = {
      id: 'abc123',
      timings: { extractMs: 10, cleanMs: 5, parseMs: 20, embeddingMs: 30, mongoInsertMs: 15, totalMs: 80 },
      doc: { fileName: 'resume.pdf', name: 'Tester' }
    };

    jest.doMock('../../src/services/ResumeingestionService', () => ({
      ResumeingestionService: jest.fn().mockImplementation(() => ({
        injectResume: jest.fn(async () => mockResult)
      }))
    }));

    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const app = (await import('../../src/app')).default;

    const res = await request(app).post('/v1/resume/inject').send({ path: 'uploads/test.pdf' });
    expect(res.status).toBe(200);
    expect(consoleSpy).toHaveBeenCalled();

    // parse last console.log JSON
    const called = consoleSpy.mock.calls.find(c => typeof c[0] === 'string');
    expect(called).toBeDefined();
    const payload = JSON.parse(called![0]);
    expect(payload.requestId).toBeDefined();
    expect(payload.componentTimings).toBeDefined();
    expect(payload.componentTimings.embeddingMs).toBe(30);
    expect(payload.endpoint).toBe('/v1/resume/inject');

    consoleSpy.mockRestore();
  });
});
