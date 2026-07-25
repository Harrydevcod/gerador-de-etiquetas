import type { Label } from '../types/label';
import type { AppConfig, SizeKey } from '../types/config';
import { SIZES } from '../constants/sizes';
import { pB, ftH, brandLine, unitLine, secBadge, storeName, nameDiv, headerEmpty } from './helpers';

export function kraft(l: Label, sz: SizeKey, cfg: AppConfig): string {
  const s = SIZES[sz];
  const ink = cfg.useCC ? cfg.customC : '#5b4636';
  const paper = '#dcc7a8';
  const hdrH = Math.max(14, Math.round(s.h * 0.22));

  const header = headerEmpty(l, cfg) ? '' : `<div style="border-bottom:1px dashed ${ink}80;padding:2px 5px;display:flex;align-items:center;justify-content:space-between;height:${hdrH}px;gap:2px;overflow:hidden;flex-shrink:0">
    ${secBadge(l, sz, `background:${ink};color:${paper}`, cfg)}
    ${storeName(l, sz, `color:${ink}`, cfg)}
  </div>`;

  const body = `<div style="padding:2px 5px;flex:1;display:flex;flex-direction:column;justify-content:space-between;overflow:hidden;min-height:0">
    <div>
      ${brandLine(l, sz, `${ink}b0`, cfg)}
      ${nameDiv(l, sz, cfg, ink, '600', "'Playfair Display', serif")}
    </div>
    <div>
      ${pB(l, ink, s.priceSize, cfg)}
      ${unitLine(l, sz, `${ink}b0`, cfg)}
    </div>
  </div>`;

  const footer = ftH(l, 'rgba(91,70,54,0.10)', ink, ink, sz, cfg);

  return `<div style="background:${paper};width:${s.w}px;height:${s.h}px;overflow:hidden;display:flex;flex-direction:column;font-family:'Barlow',sans-serif;border:1px solid ${ink}60">${header}${body}${footer}</div>`;
}
