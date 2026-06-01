import apiClient from './client';
import { SearchRequest, SearchResponse } from '../../types/search.types';

export const searchApi = {
  async searchResumes(params: SearchRequest): Promise<SearchResponse> {
    const res = await apiClient.post('/search/resumes', params);
    return res.data as SearchResponse;
  }
};

export default searchApi;
