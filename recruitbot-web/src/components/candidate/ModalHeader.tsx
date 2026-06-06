import React from 'react';

export function ModalHeader({ name, title, onClose, onPrint, titleId }: { name?: string; title?: string; onClose: () => void; onPrint?: () => void; titleId?: string }) {
  return (
    <div className="flex items-center justify-between sticky top-0 bg-bg-surface p-4 border-b border-white/5">
      <div>
        <div id={titleId} className="text-lg font-semibold">{name}</div>
        {title && <div className="text-xs text-text-muted">{title}</div>}
      </div>
      <div>
        {onPrint && (
          <button onClick={onPrint} aria-label="Print" className="px-3 py-1 rounded bg-white/5 mr-2">🖨️</button>
        )}
        <button onClick={onClose} aria-label="Close" className="px-3 py-1 rounded bg-white/5">✕</button>
      </div>
    </div>
  );
}

export default ModalHeader;
