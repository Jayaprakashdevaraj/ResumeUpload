import React from 'react';

export function EmptyState({ title, subtitle }: { title?: string; subtitle?: string }) {
  return (
    <div className="text-center py-8">
      <div className="text-lg font-semibold">{title || 'No candidates found'}</div>
      <div className="text-sm text-text-muted mt-2">{subtitle || 'Try a different query or adjust search weights'}</div>
    </div>
  );
}

export default EmptyState;
