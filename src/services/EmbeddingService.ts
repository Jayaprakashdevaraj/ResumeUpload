import config from '../config';
import { EmbeddingError } from '../errors/ingestionErrors';

export interface EmbedResponse {
  object: string;
  model: string;
  data: Array<{ object: string; embedding: number[]; index: number }>;
  usage: { prompt_tokens: number; total_tokens: number };
}

export class EmbeddingService {
  private defaultModel: string;
  private apiKey?: string;
  private readonly baseUrl = 'https://api.mistral.ai/v1';
  private readonly dim: number;

  constructor(opts?: { defaultModel?: string; apiKey?: string }) {
    // store only explicit override; prefer reading env/config at call time so tests can modify process.env
    this.apiKey = opts?.apiKey;
    this.defaultModel = opts?.defaultModel || config.mistralEmbedModel;
    this.dim = config.mistralEmbedDimension;
  }

  get model() {
    return this.defaultModel;
  }

  get dimension() {
    return this.dim;
  }

  async embed(text: string, model?: string): Promise<number[]> {
    if (!text || !text.trim()) throw new Error('input text is required');

    // Resolve API key at call-time so tests can control environment variables before calling
    const apiKey = this.apiKey ?? process.env.MISTRAL_API_KEY ?? config.mistralApiKey ?? '';

    // If no API key configured, return a deterministic zero vector for tests/dev
    if (!apiKey) {
      return new Array(this.dim).fill(0);
    }

    const m = model || this.defaultModel;
    try {
      const { fetch: nodeFetch } = await import('undici');
      const response = await nodeFetch(`${this.baseUrl}/embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({ model: m, input: text })
      });

      if (!response.ok) {
        throw new EmbeddingError(`Mistral API error: ${response.status} ${response.statusText}`);
      }

      const data = (await response.json()) as EmbedResponse;
      if (!data.data || !data.data[0] || !Array.isArray(data.data[0].embedding)) {
        throw new EmbeddingError('Invalid Mistral embedding response format');
      }

      return data.data[0].embedding;
    } catch (err: any) {
      if (err instanceof EmbeddingError) throw err;
      throw new EmbeddingError(`EmbeddingService.embed failed: ${err?.message || String(err)}`);
    }
  }

  // Backwards-compatible alias used by controllers
  async generateEmbedding(text: string): Promise<number[]> {
    return this.embed(text);
  }
}

export default EmbeddingService;

