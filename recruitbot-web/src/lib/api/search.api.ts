import apiClient from './client';
import { SearchResponse } from '../../types/search.types';

export const searchApi = {
  async search(params: { query: string; topK?: number; searchType?: 'vector' | 'bm25' | 'hybrid' }): Promise<SearchResponse> {
    const { query, topK, searchType } = params;
    // choose backend endpoint
    let url = '/v1/search';
    if (searchType === 'bm25') url = '/v1/search/bm25';
    if (searchType === 'vector') url = '/v1/search/vector';
    if (searchType === 'hybrid') url = '/v1/search/hybrid';

    const resp = await apiClient.post(url, { query, topK });
    const data = resp.data || {};

    const rawResults = Array.isArray(data.results) ? data.results : [];
    const results = rawResults.map((r: any) => ({
      candidateId: r.resumeId || r._id || r.id,
      name: (r.metadata && r.metadata.name) || r.name || '',
      email: (r.metadata && r.metadata.email) || r.email || '',
      phoneNumber: (r.metadata && r.metadata.phone) || r.phone || '',
      score: Number(r.score || 0),
      experienceYears: (r.metadata && r.metadata.experienceYears) || r.experienceYears || 0,
      content: r.snippet || r.content || r.text || '',
      snippet: r.snippet || r.content || r.text || '',
      matchedTerms: r.matchedTerms || (r.metadata && r.metadata.matchedTerms) || [],
      contributions: r.contributions || { bm25: (r.metadata && r.metadata.bm25Score) || undefined, vector: (r.metadata && r.metadata.vectorScore) || undefined }
    }));

    const out: SearchResponse = {
      query: query,
      searchType: searchType || 'hybrid',
      topK: topK || results.length,
      resultCount: results.length,
      duration: data.duration || 0,
      results
    };

    return out;
  }
  ,
  // backward-compatible alias used by some older hooks
  async searchResumes(params: { query: string; searchType?: string; topK?: number; bm25Weight?: number; vectorWeight?: number }) {
    const mapType = (params.searchType === 'keyword' ? 'bm25' : params.searchType === 'vector' ? 'vector' : 'hybrid') as 'vector' | 'bm25' | 'hybrid';
    return await (searchApi as any).search({ query: params.query, topK: params.topK, searchType: mapType });
  },

  async rerank(query: string, candidates: Array<{ resumeId: string; snippet?: string; metadata?: any }>, topK = 10) {
    const resp = await apiClient.post('/v1/search/rerank', { query, candidates, topK });
    const data = resp.data || {};
    const results = Array.isArray(data.results) ? data.results : [];
    // normalize to frontend SearchResult shape
    return results.map((r: any) => ({
      candidateId: r.resumeId,
      name: (r.metadata && r.metadata.name) || r.name || '',
      email: (r.metadata && r.metadata.email) || r.email || '',
      phoneNumber: (r.metadata && r.metadata.phone) || r.phone || '',
      score: Number(r.score || 0),
      experienceYears: (r.metadata && r.metadata.experienceYears) || r.experienceYears || 0,
      content: r.snippet || r.content || r.text || '',
      snippet: r.snippet || r.content || r.text || '',
      matchedTerms: r.matchedTerms || (r.metadata && r.metadata.matchedTerms) || [],
      contributions: r.contributions || { bm25: (r.metadata && r.metadata.bm25Score) || undefined, vector: (r.metadata && r.metadata.vectorScore) || undefined },
      rationale: r.rationale || ''
    }));
  }
};

export default searchApi;
