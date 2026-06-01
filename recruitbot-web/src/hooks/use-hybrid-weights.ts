import { useCallback } from 'react';
import { useSearchStore } from '../lib/stores/search.store';

export function useHybridWeights() {
  const { bm25Weight, vectorWeight, setWeights } = useSearchStore();

  const handleBm25Change = useCallback((value: number) => {
    setWeights(value, 100 - value);
  }, [setWeights]);

  const handleVectorChange = useCallback((value: number) => {
    setWeights(100 - value, value);
  }, [setWeights]);

  const applyPreset = useCallback((bm25: number, vector: number) => {
    setWeights(bm25, vector);
  }, [setWeights]);

  return { bm25Weight, vectorWeight, handleBm25Change, handleVectorChange, applyPreset };
}

export default useHybridWeights;
