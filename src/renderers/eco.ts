import type { Label } from '../types/label';
import type { AppConfig, SizeKey } from '../types/config';
import { SIZES } from '../constants/sizes';
import { pB, ftH, brandLine, unitLine, secBadge, storeName, nameDiv, headerEmpty } from './helpers';

export function eco(l: Label, sz: SizeKey, cfg: AppConfig): string {
  const s = SIZES[sz];
  const green = cfg.useCC ? cfg.customC : '#27ae60';
  const darkGreen = '#1e8449';
  const hdrH = Math.max(14, Math.round(s.h * 0.22));

  const header = headerEmpty(l, cfg) ? '' : `<div style="background:${green};padding:2px 4px;display:flex;align-items:center;justify-content:space-between;height:${hdrH}px;gap:2px;overflow:hidden;flex-shrink:0">
    ${secBadge(l, sz, 'background:rgba(255,255,255,0.25);color:#fff', cfg)}
    ${storeName(l, sz, 'color:#fff', cfg)}
  </div>`;

  const body = `<div style="background:#f0faf3;padding:2px 4px;flex:1;display:flex;flex-direction:column;justify-content:space-between;overflow:hidden;min-height:0">
    <div>
      ${brandLine(l, sz, '#5d8a6a', cfg)}
      ${nameDiv(l, sz, cfg, '#1a3a22')}
    </div>
    <div>
      ${pB(l, darkGreen, s.priceSize, cfg)}
      ${unitLine(l, sz, '#5d8a6a', cfg)}
    </div>
  </div>`;

  const footer = ftH(l, '#d6f0de', '#3a7a4a', darkGreen, sz, cfg);

  return `<div style="background:#f0faf3;width:${s.w}px;height:${s.h}px;overflow:hidden;display:flex;flex-direction:column;font-family:'Barlow',sans-serif;border:1px solid ${green}">${header}${body}${footer}</div>`;
}
