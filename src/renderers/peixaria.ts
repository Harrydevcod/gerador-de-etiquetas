import type { Label } from '../types/label';
import type { AppConfig, SizeKey } from '../types/config';
import { SIZES } from '../constants/sizes';
import { pB, ftH, brandLine, unitLine, secBadge, storeName, nameDiv, headerEmpty } from './helpers';

export function peixaria(l: Label, sz: SizeKey, cfg: AppConfig): string {
  const s = SIZES[sz];
  const blue = cfg.useCC ? cfg.customC : '#0369a1';
  const ice = '#f0f9ff';
  const hdrH = Math.max(14, Math.round(s.h * 0.22));

  const header = headerEmpty(l, cfg) ? '' : `<div style="background:${blue};padding:2px 4px;display:flex;align-items:center;justify-content:space-between;height:${hdrH}px;gap:2px;overflow:hidden;flex-shrink:0">
    ${secBadge(l, sz, 'background:rgba(255,255,255,0.22);color:#fff', cfg)}
    ${storeName(l, sz, 'color:#fff', cfg)}
  </div>`;

  const body = `<div style="background:${ice};padding:2px 4px;flex:1;display:flex;flex-direction:column;justify-content:space-between;overflow:hidden;min-height:0">
    <div>
      ${brandLine(l, sz, '#7c9cb0', cfg)}
      ${nameDiv(l, sz, cfg, '#0c2b3d')}
    </div>
    <div>
      ${pB(l, blue, s.priceSize, cfg)}
      ${unitLine(l, sz, '#7c9cb0', cfg)}
    </div>
  </div>`;

  const footer = ftH(l, '#dceefa', '#5f8299', blue, sz, cfg);

  return `<div style="background:${ice};width:${s.w}px;height:${s.h}px;overflow:hidden;display:flex;flex-direction:column;font-family:'Barlow',sans-serif;border:1px solid ${blue}45">${header}${body}${footer}</div>`;
}
