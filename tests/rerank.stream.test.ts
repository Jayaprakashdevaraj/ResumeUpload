import request from 'supertest';
import app from '../src/app';
import { LLMService } from '../src/services/LLMService';

jest.setTimeout(10000);

describe('POST /v1/search/rerank/stream', () => {
  beforeAll(() => {
    // spy on LLMService methods
    jest.spyOn(LLMService.prototype as any, 'streamSummarizeCandidateFit').mockImplementation(async (q: any, c: any, onChunk: any) => {
      onChunk('chunk1');
      onChunk('chunk2');
      return 'final summary';
    });
    jest.spyOn(LLMService.prototype as any, 'rerankCandidates').mockResolvedValue([{ resumeId: 'r1', score: 0.9, rationale: 'final' }]);
  });
  afterAll(() => {
    (LLMService.prototype as any).streamSummarizeCandidateFit.mockRestore?.();
    (LLMService.prototype as any).rerankCandidates.mockRestore?.();
  });

  it('streams rationale events and final ranked event', async () => {
    const res = await request(app)
      .post('/v1/search/rerank/stream')
      .send({ query: 'engineer', candidates: [{ resumeId: 'r1', snippet: 'foo' }] })
      .expect(200);

    const text = res.text || '';
    expect(text.includes('event: rationale')).toBeTruthy();
    expect(text.includes('event: rationale_done')).toBeTruthy();
    expect(text.includes('event: ranked')).toBeTruthy();
  });
});
