import type { Label } from '../types/label';
import type { AppConfig, SizeKey } from '../types/config';
import { SIZES } from '../constants/sizes';
import { code128Svg } from '../lib/barcode';
import { cleanUnit } from '../lib/units';

function esc(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function formatPrice(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + '$';
}

export function FF(key: string): string {
  const map: Record<string, string> = {
    sans:  "'Barlow', sans-serif",
    cond:  "'Barlow Condensed', sans-serif",
    serif: "'Playfair Display', serif",
    mono:  "'Space Mono', monospace",
  };
  return map[key] ?? "'Barlow', sans-serif";
}

const FS = {
  brand:  { XXXS:5, XXS:6, XS:6, S:7,  M:8,  L:9,  XL:10 },
  unit:   { XXXS:5, XXS:6, XS:7, S:7,  M:8,  L:9,  XL:10 },
  sec:    { XXXS:4, XXS:5, XS:5, S:6,  M:7,  L:7,  XL:8  },
  store:  { XXXS:4, XXS:5, XS:5, S:6,  M:7,  L:7,  XL:8  },
  erp:    { XXXS:6, XXS:6, XS:7, S:8,  M:9,  L:10, XL:11 },
  logoH:  { XXXS:8, XXS:9, XS:10,S:12, M:14, L:16, XL:18 },
} as const;

function fs(table: Record<SizeKey, number>, sz: SizeKey): number {
  return table[sz] ?? 7;
}

export function pB(l: Label, col: string, ps: number, cfg?: AppConfig): string {
  const adjPs = Math.max(10, ps + (cfg?.priceSizeAdj ?? 0));
  const ta = cfg?.nameAlign ?? 'left';
  const jc = ta === 'center' ? 'center' : ta === 'right' ? 'flex-end' : 'flex-start';
  const main = `<span style="font-size:${adjPs}px;font-weight:900;color:${col};line-height:1">${formatPrice(l.price)}</span>`;
  // Só risca o preço anterior se for realmente maior — caso contrário anunciava
  // um desconto inexistente (e ficava incoerente com o badge do modelo Desconto).
  if (l.oldPrice > l.price) {
    const old = `<span style="font-size:${Math.round(adjPs * 0.52)}px;color:#aaa;text-decoration:line-through;margin-right:2px">${formatPrice(l.oldPrice)}</span>`;
    return `<div style="display:flex;align-items:baseline;gap:1px;flex-wrap:wrap;justify-content:${jc}">${old}${main}</div>`;
  }
  return `<div style="text-align:${ta}">${main}</div>`;
}

// Barcode scale per size — XXXS/XXS too small for bars; suppress them
const BC_SCALE: Record<SizeKey, number> = {
  XXXS: 0, XXS: 0, XS: 0.55, S: 0.72, M: 1, L: 1, XL: 1.2,
};

export function ftH(l: Label, bg: string, ec: string, bc: string, sz: SizeKey, cfg: AppConfig): string {
  if (!cfg.fopts.showErp && !cfg.showBC) return '';
  const fz = fs(FS.erp, sz);
  const scale = BC_SCALE[sz];
  let bcHtml = '';
  if (cfg.showBC && scale > 0) {
    const barH = Math.max(6, Math.round(12 * scale));
    const svg = code128Svg(l.c || 'ERP-00000', barH, bc);
    bcHtml = `<div style="line-height:0;margin-bottom:1px;overflow:hidden;text-align:center">${svg}</div>`;
  }
  const erpHtml = cfg.fopts.showErp
    ? `<div style="font-size:${fz}px;color:${ec};font-family:monospace;letter-spacing:-0.3px;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(l.c)}</div>`
    : '';
  return `<div style="background:${bg};padding:2px 3px;flex-shrink:0">${bcHtml}${erpHtml}</div>`;
}

export function brandLine(l: Label, sz: SizeKey, col: string, cfg: AppConfig): string {
  if (!cfg.fopts.showBrand || !l.brand) return '';
  const ta = cfg.nameAlign ?? 'left';
  return `<div style="font-size:${fs(FS.brand, sz)}px;color:${col};text-transform:uppercase;letter-spacing:0.8px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-align:${ta}">${esc(l.brand)}</div>`;
}

export function unitLine(l: Label, sz: SizeKey, col: string, cfg: AppConfig): string {
  if (!cfg.fopts.showUnit || !l.unit) return '';
  // In very small sizes, unit competes with price — suppress it
  if (sz === 'XXXS' || sz === 'XXS') return '';
  const ta = cfg.nameAlign ?? 'left';
  return `<div style="font-size:${fs(FS.unit, sz)}px;color:${col};margin-top:1px;text-align:${ta}">${esc(cleanUnit(l.unit))}</div>`;
}

// Header (secção + loja/logo) fica vazio? Espelha as guardas de secBadge/storeName.
export function headerEmpty(l: Label, cfg: AppConfig): boolean {
  const hasSec = cfg.fopts.showSec && !!l.section;
  const hasStore = !!cfg.logoB64 || (cfg.fopts.showStore && !!l.store);
  return !hasSec && !hasStore;
}

export function secBadge(l: Label, sz: SizeKey, style: string, cfg: AppConfig): string {
  if (!cfg.fopts.showSec || !l.section) return '';
  return `<span style="font-size:${fs(FS.sec, sz)}px;${style};padding:0 3px;border-radius:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:60%;display:inline-block">${esc(l.section)}</span>`;
}

export function storeName(l: Label, sz: SizeKey, style: string, cfg: AppConfig): string {
  if (cfg.logoB64) {
    return `<img src="${cfg.logoB64}" style="height:${fs(FS.logoH, sz)}px;max-width:48%;object-fit:contain" alt="" />`;
  }
  if (!cfg.fopts.showStore || !l.store) return '';
  return `<span style="font-size:${fs(FS.store, sz)}px;${style};font-weight:700;letter-spacing:0.3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:48%;display:inline-block">${esc(l.store)}</span>`;
}

export function nameDiv(l: Label, sz: SizeKey, cfg: AppConfig, col: string, baseWeight = '600', fontOverride?: string): string {
  const fz = Math.max(6, SIZES[sz].fontSize + (cfg.nameSizeAdj ?? 0));
  const fw = cfg.nameBold ? '900' : baseWeight;
  const fi = cfg.nameItalic ? 'italic' : 'normal';
  const ta = cfg.nameAlign ?? 'left';
  const ff = fontOverride ?? FF(cfg.selFont);
  const name = esc(l.name);
  return `<div style="font-family:${ff};font-size:${fz}px;font-weight:${fw};font-style:${fi};text-align:${ta};color:${col};line-height:1.2;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical">${name}</div>`;
}

export function rbn(cfg: AppConfig): string {
  if (!cfg.ribbon) return '';
  const lines = cfg.ribbon.split('\n');
  const text = lines.map(ln => `<div style="line-height:1.1">${esc(ln)}</div>`).join('');
  const fz = lines.length > 1 ? 6 : 8;
  return `<div style="position:absolute;top:0;right:0;width:52px;height:52px;overflow:hidden;z-index:10;pointer-events:none">
    <div style="position:absolute;top:10px;right:-16px;background:${cfg.ribColor};color:#fff;font-size:${fz}px;font-weight:900;text-align:center;transform:rotate(45deg);width:56px;padding:2px 0;letter-spacing:0.3px">${text}</div>
  </div>`;
}
