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

const pill = (active: boolean) =>
  `px-2.5 py-1 text-[11px] font-medium rounded-md whitespace-nowrap transition-all cursor-pointer flex-shrink-0 ${
    active
      ? 'bg-[var(--acc)] text-white shadow-sm'
      : 'text-[var(--txt3)] hover:text-[var(--txt)] hover:bg-[var(--bg3)]'
  }`;

function clampX(x: number, width: number) {
  return Math.max(8, Math.min(x, window.innerWidth - width - 8));
}

// Tooltip de hover partilhado pelas duas barras: um só estado, um só portal.
function useHoverTip<T>() {
  const [tip, setTip] = useState<{ data: T; x: number; y: number } | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((data: T, el: HTMLElement, width: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const rect = el.getBoundingClientRect();
    setTip({ data, x: clampX(rect.left + rect.width / 2 - width / 2, width), y: rect.bottom + 8 });
  }, []);

  const hide = useCallback(() => {
    timerRef.current = setTimeout(() => setTip(null), 120);
  }, []);

  const keep = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  function render(content: React.ReactNode) {
    if (!tip) return null;
    return createPortal(
      <div
        onMouseEnter={keep}
        onMouseLeave={hide}
        style={{ position: 'fixed', top: tip.y, left: tip.x, zIndex: 9999 }}
      >
        {content}
      </div>,
      document.body,
    );
  }

  return { tip, show, hide, render };
}

function TipShell({ width, title, active, children }: {
  width: number;
  title: React.ReactNode;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <div style={{ width }} className="pointer-events-auto">
      <div style={{ left: width / 2 - 5 }} className="absolute -top-1.5 w-3 h-3 rotate-45 bg-[var(--bg2)] border-l border-t border-[var(--bdr)]" />
      <div className="rounded-xl border border-[var(--bdr)] bg-[var(--bg2)] shadow-2xl overflow-hidden">
        <div className="px-3 py-1.5 border-b border-[var(--bdr)] flex items-center justify-between gap-2">
          {title}
          {active && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[var(--acc)]/15 text-[var(--acc)] font-medium">activo</span>
          )}
        </div>
        <div className="p-3 flex items-center justify-center bg-[var(--bg3)]">{children}</div>
      </div>
    </div>
  );
}

// ── Barra de modelos (faixa por baixo da header) ─────────────────────────────

interface ModelBarProps {
  selModel: ModelKey;
  onSetModel: (m: ModelKey) => void;
}

export function ModelBar({ selModel, onSetModel }: ModelBarProps) {
  const { tip, show, hide, render } = useHoverTip<ModelKey>();

  return (
    <>
      <div className="no-print sticky top-[45px] z-20 flex items-center gap-0 bg-[var(--bg2)] border-b border-[var(--bdr)] px-4 py-1.5 overflow-x-auto scrollbar-none">
        <span className="text-[10px] font-semibold text-[var(--txt3)] uppercase tracking-wider mr-2 flex-shrink-0">
          Modelo
        </span>
        <div className="flex items-center gap-0.5">
          {(Object.entries(MODELS) as [ModelKey, { label: string }][]).map(([k, v]) => (
            <button
              key={k}
              onClick={() => onSetModel(k)}
              onMouseEnter={e => show(k, e.currentTarget, MODEL_TIP_W)}
              onMouseLeave={hide}
              className={pill(selModel === k)}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {tip && render(
        <TipShell
          width={MODEL_TIP_W}
          active={tip.data === selModel}
          title={<span className="text-[11px] font-semibold text-[var(--txt)]">{MODELS[tip.data].label}</span>}
        >
          <div style={{ width: MODEL_TIP_W - 24, height: MODEL_TIP_H, overflow: 'hidden', position: 'relative' }} className="rounded-md shadow-md">
            <div
              style={{ transform: `scale(${MODEL_SCALE})`, transformOrigin: 'top left', width: MODEL_SZ.w, height: MODEL_SZ.h, pointerEvents: 'none' }}
              dangerouslySetInnerHTML={{ __html: MODELS[tip.data].fn(PREVIEW_LABEL, 'M', PREVIEW_CFG) }}
            />
          </div>
        </TipShell>,
      )}
    </>
  );
}

// ── Seletor de tamanho (dentro da header, ao lado do modelo) ─────────────────

interface SizeBarProps {
  selModel: ModelKey;
  selSize: SizeKey;
  onSetSize: (s: SizeKey) => void;
}

export function SizeBar({ selModel, selSize, onSetSize }: SizeBarProps) {
  const { tip, show, hide, render } = useHoverTip<SizeKey>();

  return (
    <>
      {/* ponytail: flex-shrink-0 como os restantes controlos da header — em ecrãs
          estreitos rola com ela, em vez de encolher até desaparecer. */}
      <div className="flex flex-shrink-0 items-center gap-1.5">
      <span className="text-[10px] font-semibold text-[var(--txt3)] uppercase tracking-wider">
        Tamanho
      </span>
      <div className="flex items-center gap-0.5 rounded-lg border border-[var(--bdr)] bg-[var(--bg3)] p-0.5">
        {(Object.entries(SIZES) as [SizeKey, { label: string }][]).map(([k, v]) => {
          const cm = v.label.split(' — ')[1];
          const active = selSize === k;
          return (
            <button
              key={k}
              onClick={() => onSetSize(k)}
              onMouseEnter={e => show(k, e.currentTarget, SIZES[k].w + 24)}
              onMouseLeave={hide}
              title={`${k} — ${cm} cm`}
              className={`px-2 py-0.5 rounded-md leading-none transition-all cursor-pointer flex-shrink-0 ${
                active
                  ? 'bg-[var(--acc)] text-white shadow-sm'
                  : 'text-[var(--txt3)] hover:text-[var(--txt)] hover:bg-[var(--bg2)]'
              }`}
            >
              <span className="block text-[11px] font-semibold">{k}</span>
              <span className={`hidden lg:block text-[9px] mt-0.5 ${active ? 'text-white/75' : 'text-[var(--txt3)]'}`}>
                {cm} cm
              </span>
            </button>
          );
        })}
        </div>
      </div>

      {tip && render(
        <TipShell
          width={SIZES[tip.data].w + 24}
          active={tip.data === selSize}
          title={
            <>
              <span className="text-[11px] font-semibold text-[var(--txt)]">{tip.data}</span>
              <span className="text-[10px] text-[var(--txt3)]">{SIZES[tip.data].label.split(' — ')[1]} cm</span>
            </>
          }
        >
          <div style={{ overflow: 'hidden', position: 'relative', display: 'inline-block' }} className="rounded-md shadow-md">
            <div
              style={{ width: SIZES[tip.data].w, height: SIZES[tip.data].h, pointerEvents: 'none' }}
              dangerouslySetInnerHTML={{ __html: MODELS[selModel].fn(PREVIEW_LABEL, tip.data, { ...PREVIEW_CFG, selSize: tip.data }) }}
            />
          </div>
        </TipShell>,
      )}
    </>
  );
}
