import type { Label } from '../types/label';
import type { AppConfig, SizeKey } from '../types/config';
import { SIZES } from '../constants/sizes';
import { pB, ftH, brandLine, unitLine, secBadge, storeName, nameDiv, headerEmpty } from './helpers';

export function drogaria(l: Label, sz: SizeKey, cfg: AppConfig): string {
  const s = SIZES[sz];
  const blue = cfg.useCC ? cfg.customC : '#0284c7';
  const ink = '#0c2536';
  const muted = '#7793a6';
  const hdrH = Math.max(13, Math.round(s.h * 0.2));

  // Faixa em gradiente (azul → ciano) — leitura "limpeza", distinta das faixas
  // sólidas dos outros modelos.
  const header = headerEmpty(l, cfg) ? '' : `<div style="background:linear-gradient(90deg,${blue},#22d3ee);padding:2px 5px;display:flex;align-items:center;justify-content:space-between;height:${hdrH}px;gap:2px;overflow:hidden;flex-shrink:0">
    ${secBadge(l, sz, 'background:rgba(255,255,255,0.28);color:#fff;font-weight:700', cfg)}
    ${storeName(l, sz, 'color:#fff', cfg)}
  </div>`;

  const body = `<div style="padding:2px 5px;flex:1;display:flex;flex-direction:column;justify-content:space-between;overflow:hidden;min-height:0">
    <div>
      ${brandLine(l, sz, muted, cfg)}
      ${nameDiv(l, sz, cfg, ink)}
    </div>
    <div style="background:${blue}12;border-radius:4px;padding:1px 4px">
      ${pB(l, blue, s.priceSize, cfg)}
      ${unitLine(l, sz, muted, cfg)}
    </div>
  </div>`;

  const footer = ftH(l, '#eff9fd', muted, blue, sz, cfg);

  return `<div style="background:#fff;width:${s.w}px;height:${s.h}px;overflow:hidden;display:flex;flex-direction:column;font-family:'Barlow',sans-serif;border:1px solid ${blue}40">${header}${body}${footer}</div>`;
}
