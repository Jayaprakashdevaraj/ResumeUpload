import React, { createContext, useContext, useState, useCallback } from 'react';

type ToastType = 'info' | 'success' | 'error';
type ToastItem = { id: string; type: ToastType; message: string };

const ToastContext = createContext<{
  show: (type: ToastType, message: string) => void;
  info: (m: string) => void;
  success: (m: string) => void;
  error: (m: string) => void;
} | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const show = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).slice(2, 9);
    const item: ToastItem = { id, type, message };
    setToasts((t) => [item, ...t]);
    setTimeout(() => remove(id), 5000);
  }, [remove]);

  const info = (m: string) => show('info', m);
  const success = (m: string) => show('success', m);
  const error = (m: string) => show('error', m);

  return (
    <ToastContext.Provider value={{ show, info, success, error }}>
      {children}
      <div className="toast-root">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

export default useToast;
