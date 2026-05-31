import EmbeddingService from '../../src/services/EmbeddingService';

describe('EmbeddingService', () => {
  test('generateEmbedding returns zero vector without API key', async () => {
    const svc = new EmbeddingService({ apiKey: '' });
    const emb = await svc.generateEmbedding('test');
    expect(Array.isArray(emb)).toBe(true);
    expect(emb.length).toBeGreaterThan(0);
    expect(emb.every((v) => v === 0)).toBe(true);
  });

  test('generateEmbedding returns embedding when API responds', async () => {
    const fakeEmbedding = Array.from({ length: 4 }, (_, i) => i + 0.1);
    // mock undici.fetch
    jest.spyOn(require('undici'), 'fetch' as any).mockImplementation(async () => ({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({ data: [{ embedding: fakeEmbedding }] })
    }));

    const svc = new EmbeddingService({ apiKey: 'fake', defaultModel: 'mistral-embed' });
    const emb = await svc.generateEmbedding('hello');
    expect(emb).toEqual(fakeEmbedding);
  });
});
