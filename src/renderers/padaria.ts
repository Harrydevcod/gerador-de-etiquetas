import type { Label } from '../types/label';
import type { AppConfig, SizeKey } from '../types/config';
import { SIZES } from '../constants/sizes';
import { pB, ftH, brandLine, unitLine, secBadge, storeName, nameDiv, headerEmpty } from './helpers';

export function padaria(l: Label, sz: SizeKey, cfg: AppConfig): string {
  const s = SIZES[sz];
  const wheat = cfg.useCC ? cfg.customC : '#b45309';
  const warm = '#fffbf2';
  const hdrH = Math.max(14, Math.round(s.h * 0.22));

  const header = headerEmpty(l, cfg) ? '' : `<div style="background:${wheat};padding:2px 4px;display:flex;align-items:center;justify-content:space-between;height:${hdrH}px;gap:2px;overflow:hidden;flex-shrink:0">
    ${secBadge(l, sz, 'background:rgba(255,255,255,0.25);color:#fff', cfg)}
    ${storeName(l, sz, 'color:#fff', cfg)}
  </div>`;

  const body = `<div style="background:${warm};padding:2px 4px;flex:1;display:flex;flex-direction:column;justify-content:space-between;overflow:hidden;min-height:0">
    <div>
      ${brandLine(l, sz, '#b09068', cfg)}
      ${nameDiv(l, sz, cfg, '#43301c', '600', "'Playfair Display', serif")}
    </div>
    <div>
      ${pB(l, wheat, s.priceSize, cfg)}
      ${unitLine(l, sz, '#b09068', cfg)}
    </div>
  </div>`;

  const footer = ftH(l, '#fdf0dc', '#977448', wheat, sz, cfg);

  return `<div style="background:${warm};width:${s.w}px;height:${s.h}px;overflow:hidden;display:flex;flex-direction:column;font-family:'Barlow',sans-serif;border:1px solid ${wheat}45">${header}${body}${footer}</div>`;
}
