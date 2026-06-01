export type SearchMode = 'vector' | 'bm25' | 'hybrid';

export interface SearchRequest {
  query: string;
  searchType: 'vector' | 'keyword' | 'hybrid';
  topK: number;
  bm25Weight?: number;
  vectorWeight?: number;
}

export interface SearchResult {
  candidateId: string;
  name: string;
  email?: string;
  phoneNumber?: string;
  score: number;
  experienceYears?: number;
  content: string;
}

export interface SearchResponse {
  query: string;
  searchType: string;
  topK: number;
  resultCount: number;
  duration: number;
  results: SearchResult[];
}
