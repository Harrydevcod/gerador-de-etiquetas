import { useState, useRef, useEffect } from 'react';
import { Plus, Moon, Sun, Tag, Trash2, SlidersHorizontal, Upload, Download, FileSpreadsheet, FileText, Eye, Printer, CheckSquare, Square, Loader2, FileDown, FileImage, LayoutGrid, ChevronDown } from 'lucide-react';
import type { AppConfig, ModelKey } from '../../types/config';
import { MODELS } from '../../renderers';
import { ModelPickerModal } from '../modais/ModelPickerModal';

interface Props {
  cfg: AppConfig;
  labelCount: number;
  panelOpen: boolean;
  selectionMode: boolean;
  isLoading?: boolean;
  onAddNew: () => void;
  onToggleDark: () => void;
  onSetModel: (m: ModelKey) => void;
  onSeed: () => void;
  onClearAll: () => void;
  onTogglePanel: () => void;
  onImport: () => void;
  onExportExcel: () => void;
  onExportWord: () => void;
  onExportCsv: () => void;
  onExportPdf: () => void;
  onToggleSelection: () => void;
  onPreview: () => void;
  onPrint: () => void;
}

const selCls = 'text-xs px-2 py-1.5 bg-[var(--bg3)] border border-[var(--bdr)] rounded-lg text-[var(--txt)] focus:outline-none focus:border-[var(--acc)] cursor-pointer transition-colors hover:border-[var(--bdr2)]';
const iconBtn = 'p-1.5 rounded-lg transition-colors text-[var(--txt2)] hover:bg-[var(--bg3)]';

export function Toolbar({ cfg, labelCount, panelOpen, selectionMode, isLoading, onAddNew, onToggleDark, onSetModel, onSeed, onClearAll, onTogglePanel, onImport, onExportExcel, onExportWord, onExportCsv, onExportPdf, onToggleSelection, onPreview, onPrint }: Props) {
  const [exportOpen, setExportOpen] = useState(false);
  const [modelPickerOpen, setModelPickerOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setExportOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <header className="no-print sticky top-0 z-30 flex items-center gap-2 px-4 py-2.5 bg-[var(--bg2)] border-b border-[var(--bdr)]">
      {/* Logo */}
      <div className="flex items-center gap-2 mr-1 flex-shrink-0">
        <div className="w-7 h-7 rounded-lg bg-[var(--acc)] flex items-center justify-center">
          <Tag size={14} className="text-white" />
        </div>
        <div className="hidden sm:flex flex-col leading-none">
          <span className="text-[11px] font-bold text-[var(--txt)] tracking-wide">NOVA-ERP</span>
          <span className="text-[9px] text-[var(--txt3)] tracking-wider uppercase">Etiquetas</span>
        </div>
      </div>

      <div className="w-px h-5 bg-[var(--bdr)] mx-1 flex-shrink-0" />

      {/* Modelo */}
      <button
        onClick={() => setModelPickerOpen(true)}
        className={`${selCls} flex items-center gap-1.5`}
        title="Escolher modelo"
      >
        <LayoutGrid size={11} className="text-[var(--acc)] flex-shrink-0" />
        <span className="hidden sm:inline">{MODELS[cfg.selModel].label}</span>
        <ChevronDown size={10} className="text-[var(--txt3)] flex-shrink-0" />
      </button>

      {modelPickerOpen && (
        <ModelPickerModal
          current={cfg.selModel}
          onSelect={onSetModel}
          onClose={() => setModelPickerOpen(false)}
        />
      )}

      <div className="flex-1" />

      {/* Contador */}
      {labelCount > 0 && (
        <span className="text-xs text-[var(--txt3)] hidden sm:inline tabular-nums">
          {labelCount} etiqueta{labelCount !== 1 ? 's' : ''}
        </span>
      )}

      {/* Exemplos */}
      {labelCount === 0 && (
        <button onClick={onSeed} className="text-xs px-3 py-1.5 border border-[var(--bdr)] text-[var(--txt2)] rounded-lg hover:bg-[var(--bg3)] transition-colors whitespace-nowrap">
          Exemplos
        </button>
      )}

      {/* Selecionar */}
      {labelCount > 0 && (
        <button
          onClick={onToggleSelection}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
            selectionMode
              ? 'bg-[var(--acc)]/10 text-[var(--acc)] border-[var(--acc)]/40'
              : 'text-[var(--txt2)] border-transparent hover:bg-[var(--bg3)]'
          }`}
          title="Modo seleção múltipla"
        >
          {selectionMode ? <CheckSquare size={13} /> : <Square size={13} />}
          <span className="hidden sm:inline">Selecionar</span>
        </button>
      )}

      {/* Pré-visualizar */}
      {labelCount > 0 && !selectionMode && (
        <button onClick={onPreview} className={iconBtn} title="Pré-visualizar A4">
          <Eye size={15} />
        </button>
      )}

      {/* Imprimir */}
      {labelCount > 0 && !selectionMode && (
        <button onClick={onPrint} className={iconBtn} title="Imprimir tudo">
          <Printer size={15} />
        </button>
      )}

      {/* Importar */}
      <button onClick={onImport} className={iconBtn} title="Importar Excel">
        <Upload size={15} />
      </button>

      {/* Exportar */}
      {labelCount > 0 && (
        <div ref={exportRef} className="relative">
          <button
            onClick={() => setExportOpen(o => !o)}
            disabled={isLoading}
            className={`${iconBtn} ${exportOpen ? 'bg-[var(--bg3)]' : ''} disabled:opacity-50 disabled:cursor-not-allowed`}
            title="Exportar"
          >
            {isLoading
              ? <Loader2 size={15} className="animate-spin" />
              : <Download size={15} />
            }
          </button>
          {exportOpen && (
            <div className="absolute right-0 top-full mt-1.5 bg-[var(--bg2)] border border-[var(--bdr)] rounded-xl shadow-xl overflow-hidden z-50 min-w-[170px]">
              <button
                onClick={() => { onExportExcel(); setExportOpen(false); }}
                className="flex items-center gap-2.5 w-full px-4 py-2.5 text-xs text-[var(--txt)] hover:bg-[var(--bg3)] transition-colors"
              >
                <FileSpreadsheet size={14} className="text-green-500" />
                Exportar Excel
              </button>
              <button
                onClick={() => { onExportWord(); setExportOpen(false); }}
                className="flex items-center gap-2.5 w-full px-4 py-2.5 text-xs text-[var(--txt)] hover:bg-[var(--bg3)] transition-colors border-t border-[var(--bdr)]"
              >
                <FileText size={14} className="text-blue-400" />
                Exportar Word
              </button>
              <button
                onClick={() => { onExportCsv(); setExportOpen(false); }}
                className="flex items-center gap-2.5 w-full px-4 py-2.5 text-xs text-[var(--txt)] hover:bg-[var(--bg3)] transition-colors border-t border-[var(--bdr)]"
              >
                <FileDown size={14} className="text-amber-400" />
                Exportar CSV
              </button>
              <button
                onClick={() => { onExportPdf(); setExportOpen(false); }}
                className="flex items-center gap-2.5 w-full px-4 py-2.5 text-xs text-[var(--txt)] hover:bg-[var(--bg3)] transition-colors border-t border-[var(--bdr)]"
              >
                <FileImage size={14} className="text-red-400" />
                Exportar PDF
              </button>
            </div>
          )}
        </div>
      )}

      {/* Limpar tudo */}
      {labelCount > 0 && (
        <button onClick={onClearAll} className={`${iconBtn} hover:text-red-400`} title="Limpar tudo">
          <Trash2 size={15} />
        </button>
      )}

      {/* Dark mode */}
      <button onClick={onToggleDark} className={iconBtn} title="Alternar tema">
        {cfg.dark ? <Sun size={15} /> : <Moon size={15} />}
      </button>

      {/* Personalizar */}
      <button
        onClick={onTogglePanel}
        className={`p-1.5 rounded-lg transition-colors ${panelOpen ? 'bg-[var(--acc)] text-white' : 'text-[var(--txt2)] hover:bg-[var(--bg3)]'}`}
        title="Personalizar"
      >
        <SlidersHorizontal size={15} />
      </button>

      {/* Nova etiqueta */}
      <button onClick={onAddNew} className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--acc)] text-white text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity flex-shrink-0">
        <Plus size={13} />
        <span>Nova</span>
      </button>
    </header>
  );
}
