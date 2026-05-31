import { SearchService } from '../../src/services/SearchService';
import { EmbeddingService } from '../../src/services/EmbeddingService';
import { LLMService } from '../../src/services/LLMService';

describe('SearchService', () => {
  test('endToEndSearch orchestrates embed, search, rerank', async () => {
    const mockEmbed = jest.spyOn(EmbeddingService.prototype, 'embed').mockResolvedValue(new Array(1024).fill(0.1));

    const svc = new SearchService();
    const result = await svc.endToEndSearch('senior node.js', {}, { topK: 5 });

    expect(result).toBeDefined();
    expect(result.results).toBeDefined();
    expect(Array.isArray(result.results)).toBe(true);

    mockEmbed.mockRestore();
  });

  test('hybridSearch returns bm25 and vector results', async () => {
    const svc = new SearchService();
    const result = await svc.hybridSearch('backend engineer', {}, 10);

    expect(result).toHaveProperty('bm25');
    expect(result).toHaveProperty('vector');
    expect(Array.isArray(result.bm25)).toBe(true);
    expect(Array.isArray(result.vector)).toBe(true);
  });
});
