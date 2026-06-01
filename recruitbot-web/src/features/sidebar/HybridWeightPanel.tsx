import React from 'react';
import useHybridWeights from '../../hooks/use-hybrid-weights';

export function HybridWeightPanel() {
  const { bm25Weight, vectorWeight, handleBm25Change, handleVectorChange, applyPreset } = useHybridWeights();

  return (
    <div className="p-3 rounded-md bg-bg-card border border-white/5">
      <div className="text-xs font-medium text-text-muted mb-3">Search Weights</div>

      <div className="mb-3">
        <div className="flex justify-between text-xs text-text-muted">
          <span>BM25</span>
          <span>{bm25Weight}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={bm25Weight}
          onChange={(e) => handleBm25Change(Number(e.target.value))}
          className="w-full"
        />
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-xs text-text-muted">
          <span>Vector</span>
          <span>{vectorWeight}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={vectorWeight}
          onChange={(e) => handleVectorChange(Number(e.target.value))}
          className="w-full"
        />
      </div>

      <div className="flex gap-2">
        <button onClick={() => applyPreset(50, 50)} className="px-2 py-1 text-xs rounded bg-white/5">50/50</button>
        <button onClick={() => applyPreset(70, 30)} className="px-2 py-1 text-xs rounded bg-white/5">70/30</button>
        <button onClick={() => applyPreset(30, 70)} className="px-2 py-1 text-xs rounded bg-white/5">30/70</button>
      </div>
    </div>
  );
}

export default HybridWeightPanel;
