import request from 'supertest';
import app from '../../src/app';

jest.mock('../../src/repositories/ResumeingestionRepository', () => {
  return {
    ResumeingestionRepository: jest.fn().mockImplementation(() => ({
      save: jest.fn(async (doc: any) => 'mocked-id-123')
    }))
  };
});

describe('POST /v1/resume/store', () => {
  test('stores resume document and returns id', async () => {
    const payload = {
      rawText: 'Name\nSkills: Java',
      parsed: { name: 'Name', skills: ['Java'] },
      embedding: [0.1, 0.2, 0.3]
    };

    const res = await request(app).post('/v1/resume/store').send(payload).set('Content-Type', 'application/json');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.id).toBe('mocked-id-123');
  });

  test('returns 400 when required fields missing', async () => {
    const res = await request(app).post('/v1/resume/store').send({}).set('Content-Type', 'application/json');
    expect(res.status).toBe(400);
  });
});
