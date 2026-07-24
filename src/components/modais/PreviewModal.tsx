import { useEffect, useRef, useState, useCallback } from 'react';
import { X, ZoomIn, ZoomOut, Printer, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import type { Label } from '../../types/label';
import type { AppConfig } from '../../types/config';
import { SIZES } from '../../constants/sizes';
import { renderLabel } from '../../renderers';
import { rbn } from '../../renderers/helpers';

interface Props {
  labels: Label[];
  cfg: AppConfig;
  onClose: () => void;
  onPrint: () => void;
}

const A4_SHORT = 794;
const A4_LONG  = 1123;
const GAP = 8;
const THUMB_W = 56;

function calcPages(labels: Label[], cfg: AppConfig): Label[][] {
  if (labels.length === 0) return [[]];
  const pageH = cfg.printLandscape ? A4_SHORT : A4_LONG;
  const marg = parseFloat(cfg.pmarg) * 37.8;
  const printH = pageH - 2 * marg;
  const sz = SIZES[cfg.selSize];
  const rows = Math.max(1, Math.floor((printH + GAP) / (sz.h + GAP)));
  const perPage = Math.max(1, rows * cfg.pcols);
  const pages: Label[][] = [];
  for (let i = 0; i < labels.length; i += perPage) {
    pages.push(labels.slice(i, i + perPage));
  }
  return pages;
}

export function PreviewModal({ labels, cfg, onClose, onPrint }: Props) {
  const [zoom, setZoom] = useState(0.8);
  const [page, setPage] = useState(0);
  const mainRef = useRef<HTMLDivElement>(null);

  const pageW = cfg.printLandscape ? A4_LONG  : A4_SHORT;
  const pageH = cfg.printLandscape ? A4_SHORT : A4_LONG;
  const thumbScale = THUMB_W / pageW;

  const pages = calcPages(labels, cfg);
  const totalPages = pages.length;
  const marginPx = parseFloat(cfg.pmarg) * 37.8;
  const ribbonHtml = rbn(cfg);
  // Clamp derivado em render (evita sincronizar `page` via setState num effect).
  const safePage = Math.max(0, Math.min(page, totalPages - 1));
  const curLabels = pages[safePage] ?? [];

  const fitZoom = useCallback(() => {
    if (!mainRef.current) return;
    const { clientWidth, clientHeight } = mainRef.current;
    const zw = (clientWidth - 64) / pageW;
    const zh = (clientHeight - 64) / pageH;
    setZoom(Math.min(zw, zh, 1));
  }, [pageW, pageH]);

  useEffect(() => {
    const t = setTimeout(fitZoom, 60);
    return () => clearTimeout(t);
  }, [fitZoom]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        setZoom(z => Math.min(2.5, parseFloat((z + 0.1).toFixed(2))));
        return;
      }
      if (e.key === '-') {
        e.preventDefault();
        setZoom(z => Math.max(0.2, parseFloat((z - 0.1).toFixed(2))));
        return;
      }
      if (e.key === 'ArrowRight') { e.preventDefault(); setPage(p => Math.min(totalPages - 1, p + 1)); return; }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); setPage(p => Math.max(0, p - 1)); return; }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, totalPages]);

  function adjustZoom(delta: number) {
    setZoom(z => Math.min(2.5, Math.max(0.2, parseFloat((z + delta).toFixed(2)))));
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: '#161618' }}>
      {/* Top bar */}
      <div
        className="flex items-center gap-2 px-4 py-2.5 flex-shrink-0"
        style={{ background: '#1e1e22', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      >
        <span className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.9)' }}>
          Pré-visualização A4
        </span>
        <span className="text-xs tabular-nums" style={{ color: 'rgba(255,255,255,0.3)' }}>
          Pág. {safePage + 1}/{totalPages}
        </span>

        <div className="flex-1" />

        {/* Zoom control */}
        <div
          className="flex items-center gap-0.5 rounded-lg overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.07)' }}
        >
          <button
            onClick={() => adjustZoom(-0.1)}
            className="p-1.5 transition-colors"
            style={{ color: 'rgba(255,255,255,0.5)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'white')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
            title="Reduzir (-)"
          >
            <ZoomOut size={14} />
          </button>
          <span
            className="text-[11px] tabular-nums min-w-[38px] text-center select-none"
            style={{ color: 'rgba(255,255,255,0.45)' }}
          >
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => adjustZoom(0.1)}
            className="p-1.5 transition-colors"
            style={{ color: 'rgba(255,255,255,0.5)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'white')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
            title="Aumentar (+)"
          >
            <ZoomIn size={14} />
          </button>
        </div>

        <button
          onClick={fitZoom}
          className="p-1.5 rounded-lg transition-colors"
          style={{ color: 'rgba(255,255,255,0.4)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.8)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
          title="Ajustar à janela (Fit)"
        >
          <Maximize2 size={14} />
        </button>

        <div className="w-px h-5 mx-1" style={{ background: 'rgba(255,255,255,0.1)' }} />

        <button
          onClick={onPrint}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity"
          style={{ background: '#1a6fbd', color: 'white' }}
        >
          <Printer size={13} />
          Imprimir
        </button>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg transition-colors ml-1"
          style={{ color: 'rgba(255,255,255,0.35)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.8)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
          title="Fechar (Escape)"
        >
          <X size={16} />
        </button>
      </div>

      {/* Main preview area */}
      <div ref={mainRef} className="flex-1 overflow-auto" style={{ background: '#1e1e22' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            padding: 32,
            minHeight: '100%',
          }}
        >
          {/* Outer spacer: sized to scaled A4 so scroll works correctly */}
          <div
            style={{
              position: 'relative',
              width: pageW * zoom,
              height: pageH * zoom,
              flexShrink: 0,
            }}
          >
            {/* Actual A4 page, scaled via transform */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: pageW,
                height: pageH,
                transform: `scale(${zoom})`,
                transformOrigin: 'top left',
                background: 'white',
                boxShadow: '0 8px 48px rgba(0,0,0,0.55)',
                padding: marginPx,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${cfg.pcols}, max-content)`,
                  gap: GAP,
                  alignContent: 'start',
                }}
              >
                {curLabels.map((l, i) => (
                  <div
                    key={i}
                    style={{ position: 'relative', overflow: 'hidden', display: 'inline-block' }}
                    dangerouslySetInnerHTML={{ __html: renderLabel(l, cfg.selSize, cfg) + ribbonHtml }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar: navigation + thumbnails */}
      <div
        className="flex-shrink-0"
        style={{ background: '#141416', borderTop: '1px solid rgba(255,255,255,0.07)' }}
      >
        {/* Page navigation */}
        <div className="flex items-center justify-center gap-3 py-2">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={safePage === 0}
            className="p-1.5 rounded-lg transition-colors disabled:opacity-25"
            style={{ color: 'rgba(255,255,255,0.5)' }}
            title="Página anterior (←)"
          >
            <ChevronLeft size={16} />
          </button>

          {totalPages <= 12 ? (
            <div className="flex items-center gap-1">
              {pages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className="rounded-full transition-all"
                  style={{
                    width: i === safePage ? 16 : 8,
                    height: 8,
                    background: i === safePage ? '#1a6fbd' : 'rgba(255,255,255,0.2)',
                    flexShrink: 0,
                  }}
                  title={`Página ${i + 1}`}
                />
              ))}
            </div>
          ) : (
            <span className="text-xs tabular-nums" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {safePage + 1} / {totalPages}
            </span>
          )}

          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={safePage === totalPages - 1}
            className="p-1.5 rounded-lg transition-colors disabled:opacity-25"
            style={{ color: 'rgba(255,255,255,0.5)' }}
            title="Próxima página (→)"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Thumbnails — only when multiple pages */}
        {totalPages > 1 && (
          <div
            className="flex items-end gap-2 px-4 pb-3 overflow-x-auto"
            style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.15) transparent' }}
          >
            {pages.map((pageLabels, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className="flex-shrink-0 rounded transition-all"
                style={{
                  width: THUMB_W,
                  height: Math.round(THUMB_W * (pageH / pageW)),
                  overflow: 'hidden',
                  background: 'white',
                  outline: i === safePage
                    ? '2px solid #1a6fbd'
                    : '1px solid rgba(255,255,255,0.1)',
                  outlineOffset: i === safePage ? 1 : 0,
                  position: 'relative',
                  flexDirection: 'column',
                }}
                title={`Página ${i + 1}`}
              >
                <div
                  style={{
                    width: pageW,
                    transform: `scale(${thumbScale})`,
                    transformOrigin: 'top left',
                    padding: marginPx,
                    pointerEvents: 'none',
                  }}
                >
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: `repeat(${cfg.pcols}, max-content)`,
                      gap: GAP,
                      alignContent: 'start',
                    }}
                  >
                    {pageLabels.slice(0, 16).map((l, j) => (
                      <div
                        key={j}
                        dangerouslySetInnerHTML={{ __html: renderLabel(l, cfg.selSize, cfg) }}
                      />
                    ))}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
