import type { Label } from '../types/label';
import type { AppConfig, SizeKey } from '../types/config';
import { SIZES } from '../constants/sizes';
import { pB, ftH, brandLine, unitLine, secBadge, storeName, nameDiv, headerEmpty } from './helpers';

export function split(l: Label, sz: SizeKey, cfg: AppConfig): string {
  const s = SIZES[sz];
  const accent = cfg.useCC ? cfg.customC : '#1a6fbd';
  const hdrH = Math.max(12, Math.round(s.h * 0.18));
  // Nos tamanhos minúsculos o painel de preço fica com poucos px úteis; alarga-o
  // e reduz mais a fonte para preços longos (ex.: "1 250$") não serem cortados.
  const narrow = sz === 'XXXS' || sz === 'XXS';
  const panelW = narrow ? 52 : 42;
  const priceScale = narrow ? 0.5 : 0.72;

  const header = headerEmpty(l, cfg) ? '' : `<div style="background:${accent};padding:2px 5px;display:flex;align-items:center;justify-content:space-between;height:${hdrH}px;gap:2px;overflow:hidden;flex-shrink:0">
    ${secBadge(l, sz, 'background:rgba(255,255,255,0.2);color:#fff', cfg)}
    ${storeName(l, sz, 'color:#fff', cfg)}
  </div>`;

  // Corpo horizontal: descrição à esquerda, painel de preço à direita.
  const left = `<div style="flex:1;min-width:0;padding:2px 5px;display:flex;flex-direction:column;justify-content:center;overflow:hidden">
    ${brandLine(l, sz, '#8a94a6', cfg)}
    ${nameDiv(l, sz, cfg, '#16202e')}
  </div>`;

  const right = `<div style="width:${panelW}%;flex-shrink:0;min-width:0;background:${accent}12;border-left:2px solid ${accent};padding:2px 3px;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;overflow:hidden">
    ${pB(l, accent, Math.round(s.priceSize * priceScale), cfg)}
    ${unitLine(l, sz, '#8a94a6', cfg)}
  </div>`;

  const body = `<div style="flex:1;display:flex;flex-direction:row;align-items:stretch;overflow:hidden;min-height:0">${left}${right}</div>`;

  const footer = ftH(l, '#f1f4f8', '#6b7688', accent, sz, cfg);

  return `<div style="background:#fff;width:${s.w}px;height:${s.h}px;overflow:hidden;display:flex;flex-direction:column;font-family:'Barlow',sans-serif;border:1px solid #dde0e8">${header}${body}${footer}</div>`;
}
