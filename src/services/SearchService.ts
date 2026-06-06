import { EmbeddingService } from './EmbeddingService';
import { LLMService, Candidate } from './LLMService';
import { connectToMongo } from '../lib/mongo';
import config from '../config';

export class SearchService {
  private embeddingService: EmbeddingService;
  private llmService: LLMService;

  constructor(embeddingService?: EmbeddingService, llmService?: LLMService) {
    this.embeddingService = embeddingService || new EmbeddingService();
    this.llmService = llmService || new LLMService();
  }

  async bm25Search(query: string, filters: any, topK = 10) {
    if (!query || !String(query).trim()) return [];

    // During automated tests, avoid attempting external MongoDB/Alias Search calls.
    if (process.env.NODE_ENV === 'test') return [] as Candidate[];

    try {
      const client = await connectToMongo();
      const col = client.db(config.mongodbDbName).collection(config.mongodbCollectionName);

      const pipeline: any[] = [
        {
          $search: {
            index: config.mongodbBm25Index,
            compound: {
              should: [
                { text: { query, path: 'text', score: { boost: { value: 3 } } } },
                { text: { query, path: 'skills', score: { boost: { value: 2 } } } },
                { text: { query, path: ['role', 'experienceSummary', 'name', 'education'], score: { boost: { value: 1 } } } }
              ]
            }
          }
        },
        { $limit: topK },
        {
          $project: {
            _id: 1,
            name: 1,
            role: 1,
            skills: 1,
            text: 1,
            score: { $meta: 'searchScore' },
            highlights: { $meta: 'searchHighlights' }
          }
        }
      ];

      const docs = await col.aggregate(pipeline).toArray();

      const candidates: Candidate[] = docs.map((d: any) => {
        let snippet = '';
        try {
          if (Array.isArray(d.highlights) && d.highlights.length > 0) {
            const firstField = d.highlights[0];
            const firstHighlight = firstField.highlights?.[0];
            snippet = firstHighlight?.text || (d.text ? String(d.text).slice(0, 500) : '');
          } else {
            snippet = d.text ? String(d.text).slice(0, 500) : '';
          }
        } catch (e) {
          snippet = d.text ? String(d.text).slice(0, 500) : '';
        }

        const highlights = Array.isArray(d.highlights) ? d.highlights : [];
        const metadata = { name: d.name, role: d.role, skills: d.skills, score: d.score, bm25Score: d.score, highlights, matchedTerms: extractMatchedTerms(query, snippet) };
        return { resumeId: String(d._id), snippet, metadata };
      });

      return candidates;
    } catch (err: any) {
      console.error('SearchService.bm25Search error:', err?.message || err);
      return [];
    }
  }

  async vectorSearch(query: string, filters: any, topK = 10) {
    const embedding = await this.embeddingService.embed(query);

    // During automated tests, avoid attempting external MongoDB/Atlas vector calls.
    if (process.env.NODE_ENV === 'test') return [] as Candidate[];

    try {
      const client = await connectToMongo();
      const col = client.db(config.mongodbDbName).collection(config.mongodbCollectionName);

      // Attempt to use Atlas Search vector operator (non-beta). If the server does not
      // support this operator we'll fall back to a client-side similarity computation.
      const pipeline: any[] = [
        {
          $search: {
            index: config.mongodbVectorIndex,
            vector: {
              path: 'embedding',
              queryVector: embedding,
              k: topK
            }
          }
        },
        { $limit: topK },
        {
          $project: {
            _id: 1,
            name: 1,
            role: 1,
            skills: 1,
            text: 1,
            score: { $meta: 'searchScore' },
            highlights: { $meta: 'searchHighlights' }
          }
        }
      ];

      const docs = await col.aggregate(pipeline).toArray();

      const candidates: Candidate[] = docs.map((d: any) => {
        const snippet = d.text ? String(d.text).slice(0, 500) : '';
        const metadata = { name: d.name, role: d.role, skills: d.skills, score: d.score, vectorScore: d.score, matchedTerms: extractMatchedTerms(query, snippet) };
        return { resumeId: String(d._id), snippet, metadata };
      });

      return candidates;
    } catch (err: any) {
      console.error('SearchService.vectorSearch failed (atlas vector operator), falling back to client-side similarity:', err?.message || err);

      // Fallback: fetch candidates with embeddings and compute cosine similarity locally.
      try {
        const client = await connectToMongo();
        const col = client.db(config.mongodbDbName).collection(config.mongodbCollectionName);

        // Limit scanning to a reasonable number to avoid OOMs in fallback.
        const docs = await col
          .find({ embedding: { $exists: true, $ne: [] } }, { projection: { embedding: 1, text: 1, name: 1, role: 1, skills: 1 } })
          .limit(500)
          .toArray();

        const scores = docs
          .map((d: any) => {
            const vec = Array.isArray(d.embedding) ? d.embedding.map(Number) : [];
            const score = vec.length && embedding.length === vec.length ? cosineSimilarity(embedding, vec) : 0;
            return { doc: d, score };
          })
          .sort((a: any, b: any) => b.score - a.score)
          .slice(0, topK);

        const candidates: Candidate[] = scores.map((s: any) => ({
          resumeId: String(s.doc._id),
          snippet: s.doc.text ? String(s.doc.text).slice(0, 500) : '',
          metadata: { name: s.doc.name, role: s.doc.role, skills: s.doc.skills, score: s.score, vectorScore: s.score, matchedTerms: extractMatchedTerms(query, s.doc.text ? String(s.doc.text).slice(0, 500) : '') }
        }));

        return candidates;
      } catch (err2: any) {
        console.error('SearchService.vectorSearch fallback failed:', err2?.message || err2);
        return [] as Candidate[];
      }
    }
  }

  async hybridSearch(query: string, filters: any, topK = 10) {
    const [bm25, vector] = await Promise.all([this.bm25Search(query, filters, topK), this.vectorSearch(query, filters, topK)]);
    return { bm25, vector };
  }

  async endToEndSearch(query: string, filters: any, options?: any) {
    // Minimal scaffold: run both searches and call heuristic reranker
    const { bm25, vector } = await this.hybridSearch(query, filters, options?.topK || 10);
    const candidates = [...bm25, ...vector].slice(0, options?.topK || 10);
    const reranked = await this.llmService.rerankCandidates(query, candidates, options?.topK || 10);

    // Attach snippet/metadata to reranked results so callers can summarize if needed
    const mergedResults = reranked.map((r) => {
      const c = candidates.find((x) => x.resumeId === r.resumeId);
      const snippet = c?.snippet || '';
      const metadata = c?.metadata || {};
      const matchedTerms = (metadata && Array.isArray(metadata.matchedTerms) && metadata.matchedTerms.length > 0) ? metadata.matchedTerms : extractMatchedTerms(query, snippet);
      const contributions: any = { bm25: metadata?.bm25Score, vector: metadata?.vectorScore };
      return {
        resumeId: String(r.resumeId),
        score: Number(r.score),
        rationale: String(r.rationale),
        snippet,
        metadata,
        matchedTerms,
        contributions
      };
    });

    return { results: mergedResults, candidates };
  }
}

function cosineSimilarity(a: number[], b: number[]) {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    const va = a[i] || 0;
    const vb = b[i] || 0;
    dot += va * vb;
    na += va * va;
    nb += vb * vb;
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

function extractMatchedTerms(query: string, text: string) {
  try {
    if (!query || !text) return [];
    const qTokens = String(query || '').toLowerCase().split(/\W+/).filter(Boolean);
    const tTokens = String(text || '').toLowerCase().split(/\W+/).filter(Boolean);
    const qSet = new Set(qTokens);
    const matched = Array.from(new Set(tTokens.filter((t) => qSet.has(t))));
    return matched.slice(0, 12);
  } catch (e) {
    return [];
  }
}
