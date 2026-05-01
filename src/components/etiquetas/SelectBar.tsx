import { Eye, Printer, X, Pencil } from 'lucide-react';

interface Props {
  total: number;
  selected: number;
  onSelectAll: () => void;
  onSelectNone: () => void;
  onBulkEdit: () => void;
  onPrint: () => void;
  onPreview: () => void;
  onExit: () => void;
}

export function SelectBar({ total, selected, onSelectAll, onSelectNone, onBulkEdit, onPrint, onPreview, onExit }: Props) {
  const btnCls = 'px-3 py-1.5 text-xs font-medium rounded-lg border border-[var(--bdr)] text-[var(--txt2)] hover:bg-[var(--bg3)] transition-colors';

  return (
    <div className="no-print sticky top-[44px] z-20 flex items-center gap-2 px-4 py-2 bg-[var(--acc)]/10 border-b border-[var(--acc)]/30 backdrop-blur-sm">
      <span className="text-xs font-semibold text-[var(--acc)] tabular-nums min-w-[80px]">
        {selected} selecionada{selected !== 1 ? 's' : ''}
      </span>
      <button onClick={onSelectAll}  className={btnCls}>Todas ({total})</button>
      <button onClick={onSelectNone} className={btnCls}>Nenhuma</button>
      <div className="flex-1" />
      <button
        onClick={onBulkEdit}
        disabled={selected === 0}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--txt2)] border border-[var(--bdr)] rounded-lg hover:bg-[var(--bg3)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Pencil size={13} /> Editar
      </button>
      <button onClick={onPreview} disabled={selected === 0} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--txt2)] border border-[var(--bdr)] rounded-lg hover:bg-[var(--bg3)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
        <Eye size={13} /> Pré-visualizar
      </button>
      <button onClick={onPrint} disabled={selected === 0} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[var(--acc)] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed">
        <Printer size={13} /> Imprimir
      </button>
      <button onClick={onExit} className="p-1.5 text-[var(--txt3)] hover:text-[var(--txt)] hover:bg-[var(--bg3)] rounded-lg transition-colors" title="Sair da seleção">
        <X size={15} />
      </button>
    </div>
  );
}
