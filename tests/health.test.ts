import request from 'supertest';
import app from '../src/app';

describe('Health endpoints', () => {
  test('GET /v1/health returns basic info', async () => {
    const res = await request(app).get('/v1/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('name');
    expect(res.body).toHaveProperty('version');
    expect(res.body).toHaveProperty('uptimeSec');
  });
});
