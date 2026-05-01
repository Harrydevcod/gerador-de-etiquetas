import type { Label } from '../types/label';
import type { AppConfig, SizeKey } from '../types/config';
import { SIZES } from '../constants/sizes';
import { pB, ftH, brandLine, unitLine, secBadge, storeName, nameDiv } from './helpers';

export function corporate(l: Label, sz: SizeKey, cfg: AppConfig): string {
  const s = SIZES[sz];
  const navy = cfg.useCC ? cfg.customC : '#1e3a5f';
  const hdrH = Math.max(14, Math.round(s.h * 0.22));

  const header = `<div style="background:${navy};padding:2px 5px;display:flex;align-items:center;justify-content:space-between;height:${hdrH}px;gap:2px;overflow:hidden;flex-shrink:0">
    ${secBadge(l, sz, 'background:rgba(255,255,255,0.15);color:#d0dff5', cfg)}
    ${storeName(l, sz, 'color:#d0dff5', cfg)}
  </div>`;

  const body = `<div style="background:#f8f9fc;padding:2px 5px;flex:1;display:flex;flex-direction:column;justify-content:space-between;overflow:hidden;min-height:0">
    <div>
      ${brandLine(l, sz, '#8a9ab8', cfg)}
      ${nameDiv(l, sz, cfg, '#1a2a40')}
    </div>
    <div>
      ${pB(l, navy, s.priceSize, cfg)}
      ${unitLine(l, sz, '#6a7a98', cfg)}
    </div>
  </div>`;

  const footer = ftH(l, '#eef1f8', '#5a6a88', navy, sz, cfg);

  return `<div style="background:#f8f9fc;width:${s.w}px;height:${s.h}px;overflow:hidden;display:flex;flex-direction:column;font-family:'Barlow',sans-serif;border:1px solid #d0d8ea">${header}${body}${footer}</div>`;
}
