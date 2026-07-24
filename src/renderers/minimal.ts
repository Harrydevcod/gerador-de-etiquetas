import type { Label } from '../types/label';
import type { AppConfig, SizeKey } from '../types/config';
import { SIZES } from '../constants/sizes';
import { pB, ftH, brandLine, unitLine, secBadge, storeName, nameDiv, headerEmpty } from './helpers';

export function minimal(l: Label, sz: SizeKey, cfg: AppConfig): string {
  const s = SIZES[sz];
  const accent = cfg.useCC ? cfg.customC : '#000';
  const hdrH = Math.max(12, Math.round(s.h * 0.20));

  const header = headerEmpty(l, cfg) ? '' : `<div style="border-bottom:1px solid #000;padding:2px 4px;display:flex;align-items:center;justify-content:space-between;height:${hdrH}px;gap:2px;overflow:hidden;flex-shrink:0">
    ${secBadge(l, sz, `background:${accent};color:#fff`, cfg)}
    ${storeName(l, sz, 'color:#000', cfg)}
  </div>`;

  const body = `<div style="padding:2px 4px;flex:1;display:flex;flex-direction:column;justify-content:space-between;overflow:hidden;min-height:0">
    <div>
      ${brandLine(l, sz, '#555', cfg)}
      ${nameDiv(l, sz, cfg, '#000')}
    </div>
    <div>
      ${pB(l, accent, s.priceSize, cfg)}
      ${unitLine(l, sz, '#555', cfg)}
    </div>
  </div>`;

  const footer = ftH(l, '#f5f5f5', '#333', '#000', sz, cfg);

  return `<div style="background:#fff;width:${s.w}px;height:${s.h}px;overflow:hidden;display:flex;flex-direction:column;font-family:'Barlow',sans-serif;border:2px solid #000">${header}${body}${footer}</div>`;
}
