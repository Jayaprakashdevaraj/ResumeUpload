import React from 'react';
import { cx } from '../utils';

export type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
};

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className={cx('bg-card p-4 rounded-md z-10 max-w-lg w-full', className)} role="document">
        {title && <h2 className="text-lg font-medium mb-2">{title}</h2>}
        {children}
        <div className="mt-4 text-right">
          <button onClick={onClose} className="px-3 py-1 rounded bg-white/5">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default Modal;
