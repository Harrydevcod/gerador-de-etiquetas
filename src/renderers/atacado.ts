import type { Label } from '../types/label';
import type { AppConfig, SizeKey } from '../types/config';
import { SIZES } from '../constants/sizes';
import { pB, ftH, brandLine, unitLine, secBadge, storeName, nameDiv, headerEmpty } from './helpers';

export function atacado(l: Label, sz: SizeKey, cfg: AppConfig): string {
  const s = SIZES[sz];
  const orange = cfg.useCC ? cfg.customC : '#ea580c';
  const steel = '#3f4652';
  const hdrH = Math.max(14, Math.round(s.h * 0.22));

  const header = headerEmpty(l, cfg) ? '' : `<div style="background:${steel};border-bottom:2px solid ${orange};padding:2px 4px;display:flex;align-items:center;justify-content:space-between;height:${hdrH}px;gap:2px;overflow:hidden;flex-shrink:0">
    ${secBadge(l, sz, `background:${orange};color:#fff`, cfg)}
    ${storeName(l, sz, 'color:#e5e7eb', cfg)}
  </div>`;

  const body = `<div style="background:#f8fafc;padding:2px 4px;flex:1;display:flex;flex-direction:column;justify-content:space-between;overflow:hidden;min-height:0">
    <div>
      ${brandLine(l, sz, '#7c8794', cfg)}
      ${nameDiv(l, sz, cfg, '#1f2731', '800')}
    </div>
    <div>
      ${pB(l, steel, s.priceSize, cfg)}
      ${unitLine(l, sz, orange, cfg)}
    </div>
  </div>`;

  const footer = ftH(l, '#e8ecf1', '#6b7688', steel, sz, cfg);

  return `<div style="background:#f8fafc;width:${s.w}px;height:${s.h}px;overflow:hidden;display:flex;flex-direction:column;font-family:'Barlow',sans-serif;border:1px solid ${steel}40">${header}${body}${footer}</div>`;
}
