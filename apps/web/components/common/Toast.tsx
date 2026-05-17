'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

type ToastType = 'success' | 'error';
interface Toast { id: number; message: string; type: ToastType; }

const ToastContext = createContext<(message: string, type?: ToastType) => void>(() => {});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((message: string, type: ToastType = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 5000);
  }, []);

  const dismiss = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl pointer-events-auto"
            style={{
              backgroundColor: '#1a1a1a',
              border: `1px solid ${t.type === 'success' ? '#166534' : '#7f1d1d'}`,
              minWidth: '280px',
              maxWidth: '400px',
              animation: 'slideIn 0.2s ease-out',
            }}
          >
            {t.type === 'success'
              ? <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#22c55e' }} />
              : <XCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#ef4444' }} />}
            <p className="text-sm flex-1" style={{ color: '#d1d5db' }}>{t.message}</p>
            <button onClick={() => dismiss(t.id)} className="flex-shrink-0 hover:opacity-70 transition-opacity">
              <X className="w-4 h-4" style={{ color: '#6b7280' }} />
            </button>
          </div>
        ))}
      </div>
      <style>{`@keyframes slideIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </ToastContext.Provider>
  );
}
