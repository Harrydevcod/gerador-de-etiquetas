import { Clock, RotateCcw, X } from 'lucide-react';

interface Props {
  savedAt: string;
  count: number;
  onRestore: () => void;
  onDismiss: () => void;
}

export function LastSessionBanner({ savedAt, count, onRestore, onDismiss }: Props) {
  const date = new Date(savedAt);
  const label = date.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' })
    + ' ' + date.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-blue-950/50 border-b border-blue-800/30 text-sm">
      <span className="flex items-center gap-2 text-blue-300">
        <Clock size={13} className="shrink-0 opacity-70" />
        Sessão de {label} · <span className="font-semibold text-blue-200">{count} etiqueta{count !== 1 ? 's' : ''}</span>
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={onRestore}
          className="flex items-center gap-1.5 px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors"
        >
          <RotateCcw size={11} />
          Restaurar
        </button>
        <button
          onClick={onDismiss}
          className="flex items-center gap-1 px-2 py-1 rounded text-blue-400 hover:text-white hover:bg-white/10 text-xs transition-colors"
        >
          <X size={12} />
          Ignorar
        </button>
      </div>
    </div>
  );
}
