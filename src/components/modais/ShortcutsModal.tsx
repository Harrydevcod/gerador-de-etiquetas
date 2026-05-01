import { useEffect } from 'react';
import { X } from 'lucide-react';

const SHORTCUTS = [
  { group: 'Geral',    keys: [['N'],          ['Nova etiqueta']] },
  { group: '',         keys: [['I'],          ['Importar Excel']] },
  { group: '',         keys: [['P'],          ['Imprimir tudo']] },
  { group: '',         keys: [['V'],          ['Pré-visualizar A4']] },
  { group: '',         keys: [['S'],          ['Modo seleção']] },
  { group: '',         keys: [['?'],          ['Mostrar atalhos']] },
  { group: '',         keys: [['Esc'],        ['Fechar modal']] },
  { group: 'Histórico',keys: [['Ctrl','Z'],   ['Desfazer']] },
  { group: '',         keys: [['Ctrl','Y'],   ['Refazer']] },
  { group: 'Seleção',  keys: [['A'],          ['Selecionar tudo (em modo seleção)']] },
  { group: '',         keys: [['D'],          ['Limpar seleção']] },
] as const;

function Kbd({ children }: { children: string }) {
  return (
    <kbd className="inline-flex items-center px-1.5 py-0.5 rounded border border-[var(--bdr2)] bg-[var(--bg3)] text-[10px] font-mono text-[var(--txt2)] shadow-sm">
      {children}
    </kbd>
  );
}

interface Props { onClose: () => void; }

export function ShortcutsModal({ onClose }: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-[var(--bg2)] border border-[var(--bdr)] rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">

        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--bdr)]">
          <div>
            <h2 className="text-sm font-semibold text-[var(--txt)]">Atalhos de teclado</h2>
            <p className="text-[11px] text-[var(--txt3)] mt-0.5">Atalhos rápidos disponíveis</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-[var(--txt3)] hover:bg-[var(--bg3)] transition-colors">
            <X size={14} />
          </button>
        </div>

        <div className="p-4 space-y-0.5 max-h-[70vh] overflow-y-auto">
          {SHORTCUTS.map((row, i) => (
            <div key={i} className={`flex items-center justify-between px-2 py-1.5 rounded-lg ${i % 2 === 0 ? 'bg-[var(--bg3)]/40' : ''}`}>
              <span className="text-[11px] text-[var(--txt2)]">{row.keys[1][0]}</span>
              <div className="flex items-center gap-1">
                {row.keys[0].map((k, j) => (
                  <Kbd key={j}>{k}</Kbd>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="px-5 py-3 border-t border-[var(--bdr)]">
          <p className="text-[10px] text-[var(--txt3)] text-center">
            Os atalhos de letra são desactivados quando um campo de texto está focado.
          </p>
        </div>
      </div>
    </div>
  );
}
