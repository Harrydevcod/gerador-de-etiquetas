import type { Label } from '../types/label';
import type { AppConfig, SizeKey } from '../types/config';
import { SIZES } from '../constants/sizes';
import { scCol } from '../constants/sections';
import { pB, ftH, brandLine, unitLine, secBadge, storeName, nameDiv, headerEmpty } from './helpers';

export function classico(l: Label, sz: SizeKey, cfg: AppConfig): string {
  const s = SIZES[sz];
  const hdrCol = cfg.useCC ? cfg.customC : scCol(l.section);
  const hdrH = Math.max(14, Math.round(s.h * 0.22));

  const header = headerEmpty(l, cfg) ? '' : `<div style="background:${hdrCol};padding:2px 4px;display:flex;align-items:center;justify-content:space-between;height:${hdrH}px;gap:2px;overflow:hidden;flex-shrink:0">
    ${secBadge(l, sz, 'background:rgba(255,255,255,0.22);color:#fff', cfg)}
    ${storeName(l, sz, 'color:#fff', cfg)}
  </div>`;

  const body = `<div style="padding:2px 4px;flex:1;display:flex;flex-direction:column;justify-content:space-between;overflow:hidden;min-height:0">
    <div>
      ${brandLine(l, sz, '#888', cfg)}
      ${nameDiv(l, sz, cfg, '#1a1a2e')}
    </div>
    <div>
      ${pB(l, '#e67e22', s.priceSize, cfg)}
      ${unitLine(l, sz, '#888', cfg)}
    </div>
  </div>`;

  const footer = ftH(l, '#f0f0f0', '#666', '#2c3e50', sz, cfg);

  return `<div style="background:#fff;width:${s.w}px;height:${s.h}px;overflow:hidden;display:flex;flex-direction:column;font-family:'Barlow',sans-serif;border:1px solid #dde0e8">${header}${body}${footer}</div>`;
}
