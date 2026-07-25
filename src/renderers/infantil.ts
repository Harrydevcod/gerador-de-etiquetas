import type { Label } from '../types/label';
import type { AppConfig, SizeKey } from '../types/config';
import { SIZES } from '../constants/sizes';
import { pB, ftH, brandLine, unitLine, secBadge, storeName, nameDiv, headerEmpty } from './helpers';

export function infantil(l: Label, sz: SizeKey, cfg: AppConfig): string {
  const s = SIZES[sz];
  const pink = cfg.useCC ? cfg.customC : '#ec4899';
  const sky = '#22c1e8';
  const hdrH = Math.max(14, Math.round(s.h * 0.22));

  const header = headerEmpty(l, cfg) ? '' : `<div style="background:linear-gradient(90deg,${pink},${sky});padding:2px 5px;display:flex;align-items:center;justify-content:space-between;height:${hdrH}px;gap:2px;overflow:hidden;flex-shrink:0">
    ${secBadge(l, sz, 'background:rgba(255,255,255,0.3);color:#fff', cfg)}
    ${storeName(l, sz, 'color:#fff', cfg)}
  </div>`;

  const body = `<div style="background:#fffdf7;padding:2px 5px;flex:1;display:flex;flex-direction:column;justify-content:space-between;overflow:hidden;min-height:0">
    <div>
      ${brandLine(l, sz, sky, cfg)}
      ${nameDiv(l, sz, cfg, '#3b2a4d', '800')}
    </div>
    <div>
      ${pB(l, pink, s.priceSize, cfg)}
      ${unitLine(l, sz, '#a394b5', cfg)}
    </div>
  </div>`;

  const footer = ftH(l, '#fdf2fa', '#a394b5', pink, sz, cfg);

  return `<div style="background:#fffdf7;width:${s.w}px;height:${s.h}px;overflow:hidden;display:flex;flex-direction:column;font-family:'Barlow',sans-serif;border:2px solid ${pink}50;border-radius:6px">${header}${body}${footer}</div>`;
}
