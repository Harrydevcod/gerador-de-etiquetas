import type { Label } from '../types/label';
import type { AppConfig, SizeKey } from '../types/config';
import { SIZES } from '../constants/sizes';
import { pB, ftH, brandLine, unitLine, secBadge, storeName, nameDiv, headerEmpty } from './helpers';

export function bold(l: Label, sz: SizeKey, cfg: AppConfig): string {
  const s = SIZES[sz];
  const orange = cfg.useCC ? cfg.customC : '#e67e22';
  const dark = '#c0611a';
  const hdrH = Math.max(14, Math.round(s.h * 0.22));

  const header = headerEmpty(l, cfg) ? '' : `<div style="background:${dark};padding:2px 4px;display:flex;align-items:center;justify-content:space-between;height:${hdrH}px;gap:2px;overflow:hidden;flex-shrink:0">
    ${secBadge(l, sz, 'background:rgba(255,255,255,0.2);color:#fff', cfg)}
    ${storeName(l, sz, 'color:rgba(255,255,255,0.9)', cfg)}
  </div>`;

  const body = `<div style="background:${orange};padding:2px 4px;flex:1;display:flex;flex-direction:column;justify-content:space-between;overflow:hidden;min-height:0">
    <div>
      ${brandLine(l, sz, 'rgba(255,255,255,0.7)', cfg)}
      ${nameDiv(l, sz, cfg, '#fff', '700')}
    </div>
    <div>
      ${pB(l, '#fff', s.priceSize, cfg)}
      ${unitLine(l, sz, 'rgba(255,255,255,0.8)', cfg)}
    </div>
  </div>`;

  const footer = ftH(l, dark, '#fff', '#fff', sz, cfg);

  return `<div style="background:${orange};width:${s.w}px;height:${s.h}px;overflow:hidden;display:flex;flex-direction:column;font-family:'Barlow',sans-serif">${header}${body}${footer}</div>`;
}
