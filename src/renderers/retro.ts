import type { Label } from '../types/label';
import type { AppConfig, SizeKey } from '../types/config';
import { SIZES } from '../constants/sizes';
import { pB, ftH, brandLine, unitLine, secBadge, storeName, nameDiv, headerEmpty } from './helpers';

export function retro(l: Label, sz: SizeKey, cfg: AppConfig): string {
  const s = SIZES[sz];
  const yellow = '#f5e642';
  const hdrH = Math.max(14, Math.round(s.h * 0.22));
  const mono = "'Space Mono', monospace";

  const header = headerEmpty(l, cfg) ? '' : `<div style="background:#111;padding:2px 4px;display:flex;align-items:center;justify-content:space-between;height:${hdrH}px;gap:2px;overflow:hidden;flex-shrink:0">
    ${secBadge(l, sz, `background:${yellow};color:#111`, cfg)}
    ${storeName(l, sz, `color:${yellow}`, cfg)}
  </div>`;

  const body = `<div style="background:${yellow};padding:2px 4px;flex:1;display:flex;flex-direction:column;justify-content:space-between;overflow:hidden;min-height:0">
    <div>
      ${brandLine(l, sz, '#555', cfg)}
      ${nameDiv(l, sz, cfg, '#111', '700', mono)}
    </div>
    <div>
      ${pB(l, '#111', s.priceSize, cfg)}
      ${unitLine(l, sz, '#444', cfg)}
    </div>
  </div>`;

  const footer = ftH(l, '#e8d820', '#333', '#111', sz, cfg);

  return `<div style="background:${yellow};width:${s.w}px;height:${s.h}px;overflow:hidden;display:flex;flex-direction:column;font-family:${mono};border:2px solid #111">${header}${body}${footer}</div>`;
}
