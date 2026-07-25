import { useEffect, useMemo, useRef, useState } from 'react';
import { X, Check, Search } from 'lucide-react';
import { MODELS } from '../../renderers';
import { DEFAULT_CONFIG } from '../../types/config';
import { SIZES } from '../../constants/sizes';
import { matchesModelQuery } from './modelPickerSearch';
import type { ModelKey } from '../../types/config';
import type { Label } from '../../types/label';

const PREVIEW_LABEL: Label = {
  id: 'preview',
  c: 'ERP-00001',
  name: 'Arroz agulha 5kg',
  brand: 'Bom Sucesso',
  price: 850,
  oldPrice: 950,
  unit: 'por fardo',
  section: 'Mercearia',
  store: 'Minimarket',
  createdAt: new Date().toISOString(),
};

const PREVIEW_CFG = {
  ...DEFAULT_CONFIG,
  selSize: 'M' as const,
  showBC: false,
  useCC: false,
  ribbon: '',
  logoB64: '',
  fopts: {
    showBrand: true,
    showErp: false,
    showSec: true,
    showUnit: true,
    showStore: true,
  },
};

const SCALE = 0.78;
const sz = SIZES['M'];
const CARD_W = Math.round(sz.w * SCALE);
const CARD_H = Math.round(sz.h * SCALE);

interface Props {
  current: ModelKey;
  onSelect: (m: ModelKey) => void;
  onClose: () => void;
}

export function ModelPickerModal({ current, onSelect, onClose }: Props) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');

  const modelEntries = useMemo(
    () => Object.entries(MODELS) as [ModelKey, (typeof MODELS)[ModelKey]][],
    [],
  );
  const filteredModels = useMemo(
    () => modelEntries.filter(([, model]) => matchesModelQuery(model.label, query)),
    [modelEntries, query],
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Foco entra na pesquisa e volta ao gatilho ao fechar.
  useEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const frame = window.requestAnimationFrame(() => searchRef.current?.focus());
    return () => {
      window.cancelAnimationFrame(frame);
      previousFocus?.focus();
    };
  }, []);

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-md p-4"
      onMouseDown={e => { if (e.target === backdropRef.current) onClose(); }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="model-picker-title"
        className="flex max-h-[calc(100vh-2rem)] w-full max-w-[960px] flex-col overflow-hidden rounded-2xl border border-[var(--bdr)] bg-[var(--bg2)] shadow-2xl"
      >

        {/* Header fixo */}
        <div className="flex-shrink-0 border-b border-[var(--bdr)] px-5 py-3.5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 id="model-picker-title" className="text-sm font-semibold text-[var(--txt)]">Escolher modelo</h2>
              <p className="text-[11px] text-[var(--txt3)] mt-0.5">Selecione o estilo visual das etiquetas</p>
            </div>
            <button
              onClick={onClose}
              aria-label="Fechar seletor de modelos"
              className="p-1.5 rounded-lg text-[var(--txt3)] hover:bg-[var(--bg3)] transition-colors"
            >
              <X size={14} />
            </button>
          </div>

          <label className="relative mt-3 block">
            <Search
              size={14}
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--txt3)]"
            />
            <input
              ref={searchRef}
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              aria-label="Pesquisar modelos"
              placeholder={`Pesquisar entre ${modelEntries.length} modelos`}
              className="w-full rounded-xl border border-[var(--bdr)] bg-[var(--bg3)] py-2 pl-9 pr-3 text-sm text-[var(--txt)] outline-none transition-colors placeholder:text-[var(--txt3)] focus:border-[var(--acc)]"
            />
          </label>
        </div>

        {/* Grid rolável */}
        <div
          className="grid min-h-0 flex-1 gap-3 overflow-y-auto p-5"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(144px, 1fr))' }}
        >
          {filteredModels.map(([key, model]) => {
            const html = model.fn(PREVIEW_LABEL, 'M', PREVIEW_CFG);
            const isActive = key === current;

            return (
              <button
                key={key}
                onClick={() => { onSelect(key); onClose(); }}
                aria-pressed={isActive}
                className={`group flex flex-col items-center gap-2 p-2 rounded-xl border transition-all cursor-pointer ${
                  isActive
                    ? 'border-[var(--acc)] bg-[var(--acc)]/10 shadow-sm'
                    : 'border-[var(--bdr)] hover:border-[var(--acc)]/50 hover:bg-[var(--bg3)]'
                }`}
              >
                {/* Preview container */}
                <div
                  style={{ width: CARD_W, height: CARD_H }}
                  className="relative max-w-full overflow-hidden rounded-md flex-shrink-0 shadow-sm"
                >
                  <div
                    style={{
                      transform: `scale(${SCALE})`,
                      transformOrigin: 'top left',
                      width: sz.w,
                      height: sz.h,
                      pointerEvents: 'none',
                    }}
                    dangerouslySetInnerHTML={{ __html: html }}
                  />
                  {isActive && (
                    <div className="absolute top-1 right-1 w-4 h-4 bg-[var(--acc)] rounded-full flex items-center justify-center shadow">
                      <Check size={9} className="text-white" strokeWidth={3} />
                    </div>
                  )}
                </div>

                {/* Nome do modelo */}
                <span className={`text-[10px] font-medium leading-none transition-colors ${
                  isActive ? 'text-[var(--acc)]' : 'text-[var(--txt2)] group-hover:text-[var(--txt)]'
                }`}>
                  {model.label}
                </span>
              </button>
            );
          })}

          {filteredModels.length === 0 && (
            <div
              role="status"
              className="col-span-full flex min-h-40 items-center justify-center rounded-xl border border-dashed border-[var(--bdr)] text-sm text-[var(--txt3)]"
            >
              Nenhum modelo encontrado
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
