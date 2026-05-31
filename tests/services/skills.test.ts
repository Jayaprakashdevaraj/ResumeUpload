import request from 'supertest';
import app from '../../src/app';

describe('POST /v1/resume/skills', () => {
  test('detects skills from text', async () => {
    const res = await request(app)
      .post('/v1/resume/skills')
      .send({ text: 'Experienced in Java, Selenium and MongoDB' })
      .set('Content-Type', 'application/json');

    expect(res.status).toBe(200);
    expect(res.body.skills).toEqual(expect.arrayContaining(['Java', 'Selenium', 'MongoDB']));
  });

  test('returns 400 when no text provided', async () => {
    const res = await request(app)
      .post('/v1/resume/skills')
      .send({})
      .set('Content-Type', 'application/json');
    expect(res.status).toBe(400);
  });
});
