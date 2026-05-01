import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastCtx {
  toast: (message: string, type?: ToastType) => void;
}

const Ctx = createContext<ToastCtx>({ toast: () => {} });

export function useToast() {
  return useContext(Ctx);
}

const ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle size={15} className="text-emerald-400 flex-shrink-0" />,
  error:   <XCircle    size={15} className="text-red-400    flex-shrink-0" />,
  info:    <Info       size={15} className="text-blue-400   flex-shrink-0" />,
  warning: <AlertTriangle size={15} className="text-amber-400 flex-shrink-0" />,
};

const BORDER: Record<ToastType, string> = {
  success: 'border-emerald-500/30',
  error:   'border-red-500/30',
  info:    'border-blue-500/30',
  warning: 'border-amber-500/30',
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  return (
    <div
      className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border bg-[var(--bg2)] shadow-xl text-[var(--txt)] text-[12px] min-w-[220px] max-w-[340px] animate-toast-in ${BORDER[toast.type]}`}
    >
      {ICONS[toast.type]}
      <span className="flex-1 leading-snug">{toast.message}</span>
      <button
        onClick={() => onDismiss(toast.id)}
        className="ml-1 text-[var(--txt3)] hover:text-[var(--txt)] transition-colors flex-shrink-0"
      >
        <X size={12} />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
    const t = timers.current.get(id);
    if (t) { clearTimeout(t); timers.current.delete(id); }
  }, []);

  const toast = useCallback((message: string, type: ToastType = 'success') => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev.slice(-4), { id, type, message }]);
    timers.current.set(id, setTimeout(() => dismiss(id), 4000));
  }, [dismiss]);

  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      {createPortal(
        <div className="fixed bottom-5 right-5 z-[99999] flex flex-col gap-2 items-end pointer-events-none">
          {toasts.map(t => (
            <div key={t.id} className="pointer-events-auto">
              <ToastItem toast={t} onDismiss={dismiss} />
            </div>
          ))}
        </div>,
        document.body
      )}
    </Ctx.Provider>
  );
}
