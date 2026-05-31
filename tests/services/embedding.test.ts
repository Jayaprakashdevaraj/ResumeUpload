import { EmbeddingService } from '../../src/services/EmbeddingService';
import * as undici from 'undici';

// Mock undici fetch
jest.mock('undici', () => ({
  fetch: jest.fn()
}));

describe('EmbeddingService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.MISTRAL_API_KEY = '';
  });

  test('returns 1024-d zero vector when no MISTRAL_API_KEY', async () => {
    const s = new EmbeddingService();
    const v = await s.embed('hello world');
    expect(Array.isArray(v)).toBe(true);
    expect(v.length).toBe(1024);
    expect(v.every((n) => n === 0)).toBe(true);
  });

  test('calls Mistral API when key is configured', async () => {
    const mockFetch = undici.fetch as jest.MockedFunction<typeof undici.fetch>;
    const mockEmbedding = new Array(1024).fill(0.1);

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce({
        data: [{ embedding: mockEmbedding }]
      })
    } as any);

    const s = new EmbeddingService({ apiKey: 'test-key', defaultModel: 'mistral-embed' });
    const v = await s.embed('hello world');

    expect(v).toEqual(mockEmbedding);
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/embeddings'), expect.any(Object));
  });

  test('throws error on invalid API response', async () => {
    const mockFetch = undici.fetch as jest.MockedFunction<typeof undici.fetch>;
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: 'Unauthorized'
    } as any);

    const s = new EmbeddingService({ apiKey: 'bad-key' });
    await expect(s.embed('text')).rejects.toThrow('Mistral API error');
  });
});
