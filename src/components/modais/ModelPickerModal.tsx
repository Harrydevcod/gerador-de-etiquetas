import { useEffect, useRef } from 'react';
import { X, Check } from 'lucide-react';
import { MODELS } from '../../renderers';
import { DEFAULT_CONFIG } from '../../types/config';
import { SIZES } from '../../constants/sizes';
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

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onMouseDown={e => { if (e.target === backdropRef.current) onClose(); }}
    >
      <div className="bg-[var(--bg2)] border border-[var(--bdr)] rounded-2xl shadow-2xl w-full max-w-[720px] overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--bdr)]">
          <div>
            <h2 className="text-sm font-semibold text-[var(--txt)]">Escolher modelo</h2>
            <p className="text-[11px] text-[var(--txt3)] mt-0.5">Selecione o estilo visual das etiquetas</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--txt3)] hover:bg-[var(--bg3)] transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* Grid */}
        <div className="p-5 grid grid-cols-5 gap-3">
          {(Object.entries(MODELS) as [ModelKey, { label: string; fn: (l: Label, sz: string, cfg: typeof PREVIEW_CFG) => string }][]).map(([key, model]) => {
            const html = model.fn(PREVIEW_LABEL, 'M', PREVIEW_CFG);
            const isActive = key === current;

            return (
              <button
                key={key}
                onClick={() => { onSelect(key); onClose(); }}
                className={`group flex flex-col items-center gap-2 p-2 rounded-xl border transition-all cursor-pointer ${
                  isActive
                    ? 'border-[var(--acc)] bg-[var(--acc)]/10 shadow-sm'
                    : 'border-[var(--bdr)] hover:border-[var(--acc)]/50 hover:bg-[var(--bg3)]'
                }`}
              >
                {/* Preview container */}
                <div
                  style={{ width: CARD_W, height: CARD_H }}
                  className="relative overflow-hidden rounded-md flex-shrink-0 shadow-sm"
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

                {/* Model name */}
                <span className={`text-[10px] font-medium leading-none transition-colors ${
                  isActive ? 'text-[var(--acc)]' : 'text-[var(--txt2)] group-hover:text-[var(--txt)]'
                }`}>
                  {model.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
