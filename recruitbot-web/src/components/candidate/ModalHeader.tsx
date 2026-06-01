import React from 'react';

export function ModalHeader({ name, title, onClose }: { name?: string; title?: string; onClose: () => void }) {
  return (
    <div className="flex items-center justify-between sticky top-0 bg-bg-surface p-4 border-b border-white/5">
      <div>
        <div className="text-lg font-semibold">{name}</div>
        {title && <div className="text-xs text-text-muted">{title}</div>}
      </div>
      <div>
        <button onClick={onClose} aria-label="Close" className="px-3 py-1 rounded bg-white/5">✕</button>
      </div>
    </div>
  );
}

export default ModalHeader;
