import { useCallback, useEffect, useState } from 'react';
import candidateApi from '../lib/api/candidate.api';
import { CandidateProfile } from '../types/candidate.types';

export function useCandidateModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [candidate, setCandidate] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState(false);

  const openCandidateModal = useCallback(async (id: string) => {
    setIsOpen(true);
    setLoading(true);
    try {
      const data = await candidateApi.getCandidate(id);
      setCandidate(data);
    } catch (err) {
      console.error('Failed to load candidate', err);
      setIsOpen(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setCandidate(null);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { id?: string };
      if (detail?.id) openCandidateModal(detail.id);
    };
    window.addEventListener('recruitbot:openCandidate', handler as EventListener);
    return () => window.removeEventListener('recruitbot:openCandidate', handler as EventListener);
  }, [openCandidateModal]);

  return { isOpen, candidate, loading, openCandidateModal, closeModal };
}

export default useCandidateModal;
