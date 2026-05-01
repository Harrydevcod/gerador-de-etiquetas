import { useState, useEffect } from 'react';
import { Download, RefreshCw, X, AlertCircle } from 'lucide-react';

type UpdateState =
  | { phase: 'idle' }
  | { phase: 'available'; version: string }
  | { phase: 'downloading'; percent: number }
  | { phase: 'ready' }
  | { phase: 'error'; message: string };

const api = (window as Window & { electronAPI?: { isElectron?: boolean; onUpdateAvailable?: (cb: (i: { version: string }) => void) => () => void; onUpdateProgress?: (cb: (i: { percent: number }) => void) => () => void; onUpdateDownloaded?: (cb: () => void) => () => void; onUpdateError?: (cb: (i: { message: string }) => void) => () => void; downloadUpdate?: () => void; installUpdate?: () => void } }).electronAPI;

export function UpdateBanner() {
  const [state, setState] = useState<UpdateState>({ phase: 'idle' });
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!api?.isElectron) return;

    const off1 = api.onUpdateAvailable?.((info) => {
      setState({ phase: 'available', version: info.version });
      setDismissed(false);
    });
    const off2 = api.onUpdateProgress?.((info) => {
      setState({ phase: 'downloading', percent: info.percent });
    });
    const off3 = api.onUpdateDownloaded?.(() => {
      setState({ phase: 'ready' });
    });
    const off4 = api.onUpdateError?.((info) => {
      setState({ phase: 'error', message: info.message });
    });

    return () => { off1?.(); off2?.(); off3?.(); off4?.(); };
  }, []);

  if (!api?.isElectron || state.phase === 'idle' || dismissed) return null;

  return (
    <div
      role="status"
      className="fixed bottom-4 right-4 z-[9999] flex items-center gap-3 rounded-xl border border-white/10 bg-[#1a1a2e]/95 px-4 py-3 shadow-2xl backdrop-blur-md text-sm text-white max-w-sm"
    >
      {state.phase === 'available' && (
        <>
          <Download size={16} className="shrink-0 text-blue-400" />
          <span className="flex-1">
            Nova versão <strong className="text-blue-300">{state.version}</strong> disponível
          </span>
          <button
            onClick={() => api?.downloadUpdate?.()}
            className="rounded-lg bg-blue-600 hover:bg-blue-500 px-3 py-1 text-xs font-semibold transition-colors"
          >
            Atualizar
          </button>
          <button onClick={() => setDismissed(true)} className="text-white/40 hover:text-white/80 transition-colors">
            <X size={14} />
          </button>
        </>
      )}

      {state.phase === 'downloading' && (
        <>
          <Download size={16} className="shrink-0 text-blue-400 animate-pulse" />
          <div className="flex-1 min-w-0">
            <div className="text-white/70 mb-1">A descarregar... {state.percent}%</div>
            <div className="h-1 w-full rounded-full bg-white/10">
              <div
                className="h-1 rounded-full bg-blue-500 transition-all duration-300"
                style={{ width: `${state.percent}%` }}
              />
            </div>
          </div>
        </>
      )}

      {state.phase === 'ready' && (
        <>
          <RefreshCw size={16} className="shrink-0 text-green-400" />
          <span className="flex-1">Atualização pronta para instalar</span>
          <button
            onClick={() => api?.installUpdate?.()}
            className="rounded-lg bg-green-600 hover:bg-green-500 px-3 py-1 text-xs font-semibold transition-colors"
          >
            Reiniciar
          </button>
          <button onClick={() => setDismissed(true)} className="text-white/40 hover:text-white/80 transition-colors">
            <X size={14} />
          </button>
        </>
      )}

      {state.phase === 'error' && (
        <>
          <AlertCircle size={16} className="shrink-0 text-red-400" />
          <span className="flex-1 text-red-200 truncate">Erro: {state.message}</span>
          <button onClick={() => { setState({ phase: 'idle' }); setDismissed(true); }} className="text-white/40 hover:text-white/80 transition-colors">
            <X size={14} />
          </button>
        </>
      )}
    </div>
  );
}
