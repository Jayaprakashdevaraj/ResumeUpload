import apiClient from './client';
import { CandidateProfile } from '../../types/candidate.types';

export const candidateApi = {
  async getCandidate(id: string): Promise<CandidateProfile> {
    const res = await apiClient.get(`/candidate/${id}`);
    return res.data as CandidateProfile;
  },
};

export default candidateApi;
