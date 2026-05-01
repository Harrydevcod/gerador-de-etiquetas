import { useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import type { ModelKey, SizeKey } from '../../types/config';
import { DEFAULT_CONFIG } from '../../types/config';
import { MODELS } from '../../renderers';
import { SIZES } from '../../constants/sizes';
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
  showBC: false,
  useCC: false,
  ribbon: '',
  logoB64: '',
  fopts: { showBrand: true, showErp: false, showSec: true, showUnit: true, showStore: true },
};

// Model tooltip: renders at M × 1.5
const MODEL_SCALE = 1.5;
const MODEL_SZ = SIZES['M'];
const MODEL_TIP_W = Math.round(MODEL_SZ.w * MODEL_SCALE);
const MODEL_TIP_H = Math.round(MODEL_SZ.h * MODEL_SCALE);

type TooltipState =
  | { kind: 'model'; key: ModelKey; x: number; y: number }
  | { kind: 'size';  key: SizeKey;  x: number; y: number };

interface Props {
  selModel: ModelKey;
  selSize: SizeKey;
  onSetModel: (m: ModelKey) => void;
  onSetSize: (s: SizeKey) => void;
}

const pill = (active: boolean) =>
  `px-2.5 py-1 text-[11px] font-medium rounded-md whitespace-nowrap transition-all cursor-pointer flex-shrink-0 ${
    active
      ? 'bg-[var(--acc)] text-white shadow-sm'
      : 'text-[var(--txt3)] hover:text-[var(--txt)] hover:bg-[var(--bg3)]'
  }`;

function clampX(x: number, width: number) {
  return Math.max(8, Math.min(x, window.innerWidth - width - 8));
}

export function ModelSizeBar({ selModel, selSize, onSetModel, onSetSize }: Props) {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((tip: TooltipState) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setTooltip(tip);
  }, []);

  const hide = useCallback(() => {
    timerRef.current = setTimeout(() => setTooltip(null), 120);
  }, []);

  const keep = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  function onModelHover(k: ModelKey, el: HTMLButtonElement) {
    const rect = el.getBoundingClientRect();
    const x = clampX(rect.left + rect.width / 2 - MODEL_TIP_W / 2, MODEL_TIP_W);
    show({ kind: 'model', key: k, x, y: rect.bottom + 8 });
  }

  function onSizeHover(k: SizeKey, el: HTMLButtonElement) {
    const sz = SIZES[k];
    const tipW = sz.w + 24;
    const rect = el.getBoundingClientRect();
    const x = clampX(rect.left + rect.width / 2 - tipW / 2, tipW);
    show({ kind: 'size', key: k, x, y: rect.bottom + 8 });
  }

  // ── Tooltip content ─────────────────────────────────────────────────────

  let tipContent: React.ReactNode = null;

  if (tooltip?.kind === 'model') {
    const { key } = tooltip;
    tipContent = (
      <div style={{ width: MODEL_TIP_W }} className="pointer-events-auto">
        <div style={{ left: MODEL_TIP_W / 2 - 5 }} className="absolute -top-1.5 w-3 h-3 rotate-45 bg-[var(--bg2)] border-l border-t border-[var(--bdr)]" />
        <div className="rounded-xl border border-[var(--bdr)] bg-[var(--bg2)] shadow-2xl overflow-hidden">
          <div className="px-3 py-1.5 border-b border-[var(--bdr)] flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[var(--txt)]">{MODELS[key].label}</span>
            {key === selModel && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[var(--acc)]/15 text-[var(--acc)] font-medium">activo</span>
            )}
          </div>
          <div className="p-3 flex items-center justify-center bg-[var(--bg3)]">
            <div style={{ width: MODEL_TIP_W - 24, height: MODEL_TIP_H, overflow: 'hidden', position: 'relative' }} className="rounded-md shadow-md">
              <div
                style={{ transform: `scale(${MODEL_SCALE})`, transformOrigin: 'top left', width: MODEL_SZ.w, height: MODEL_SZ.h, pointerEvents: 'none' }}
                dangerouslySetInnerHTML={{ __html: MODELS[key].fn(PREVIEW_LABEL, 'M', PREVIEW_CFG) }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (tooltip?.kind === 'size') {
    const { key } = tooltip;
    const sz = SIZES[key];
    const tipW = sz.w + 24;
    const cm = sz.label.split(' — ')[1];
    tipContent = (
      <div style={{ width: tipW }} className="pointer-events-auto">
        <div style={{ left: tipW / 2 - 5 }} className="absolute -top-1.5 w-3 h-3 rotate-45 bg-[var(--bg2)] border-l border-t border-[var(--bdr)]" />
        <div className="rounded-xl border border-[var(--bdr)] bg-[var(--bg2)] shadow-2xl overflow-hidden">
          <div className="px-3 py-1.5 border-b border-[var(--bdr)] flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[var(--txt)]">{key}</span>
            <span className="text-[10px] text-[var(--txt3)]">{cm} cm</span>
            {key === selSize && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[var(--acc)]/15 text-[var(--acc)] font-medium">activo</span>
            )}
          </div>
          <div className="p-3 flex items-center justify-center bg-[var(--bg3)]">
            <div style={{ overflow: 'hidden', position: 'relative', display: 'inline-block' }} className="rounded-md shadow-md">
              <div
                style={{ width: sz.w, height: sz.h, pointerEvents: 'none' }}
                dangerouslySetInnerHTML={{ __html: MODELS[selModel].fn(PREVIEW_LABEL, key, { ...PREVIEW_CFG, selSize: key }) }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="no-print sticky top-[45px] z-20 flex items-center gap-0 bg-[var(--bg2)] border-b border-[var(--bdr)] px-4 py-1.5 overflow-x-auto scrollbar-none">

        {/* Modelos */}
        <span className="text-[10px] font-semibold text-[var(--txt3)] uppercase tracking-wider mr-2 flex-shrink-0">
          Modelo
        </span>
        <div className="flex items-center gap-0.5 mr-4">
          {(Object.entries(MODELS) as [ModelKey, { label: string }][]).map(([k, v]) => (
            <button
              key={k}
              onClick={() => onSetModel(k)}
              onMouseEnter={e => onModelHover(k, e.currentTarget)}
              onMouseLeave={hide}
              className={pill(selModel === k)}
            >
              {v.label}
            </button>
          ))}
        </div>

        <div className="w-px h-4 bg-[var(--bdr)] flex-shrink-0 mr-4" />

        {/* Tamanhos */}
        <span className="text-[10px] font-semibold text-[var(--txt3)] uppercase tracking-wider mr-2 flex-shrink-0">
          Tamanho
        </span>
        <div className="flex items-center gap-0.5">
          {(Object.entries(SIZES) as [SizeKey, { label: string }][]).map(([k, v]) => {
            const cm = v.label.split(' — ')[1];
            const active = selSize === k;
            return (
              <button
                key={k}
                onClick={() => onSetSize(k)}
                onMouseEnter={e => onSizeHover(k, e.currentTarget)}
                onMouseLeave={hide}
                className={pill(active)}
              >
                <span className="block leading-none">{k}</span>
                <span className={`block text-[9px] leading-none mt-0.5 ${active ? 'text-white/75' : 'text-[var(--txt3)]'}`}>
                  {cm} cm
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {tooltip && tipContent && createPortal(
        <div
          onMouseEnter={keep}
          onMouseLeave={hide}
          style={{ position: 'fixed', top: tooltip.y, left: tooltip.x, zIndex: 9999 }}
        >
          {tipContent}
        </div>,
        document.body
      )}
    </>
  );
}
