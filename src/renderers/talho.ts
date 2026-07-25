import type { Label } from '../types/label';
import type { AppConfig, SizeKey } from '../types/config';
import { SIZES } from '../constants/sizes';
import { pB, ftH, brandLine, unitLine, secBadge, storeName, nameDiv, headerEmpty } from './helpers';

export function talho(l: Label, sz: SizeKey, cfg: AppConfig): string {
  const s = SIZES[sz];
  const red = cfg.useCC ? cfg.customC : '#a4161a';
  const hdrH = Math.max(14, Math.round(s.h * 0.22));

  const header = headerEmpty(l, cfg) ? '' : `<div style="background:${red};padding:2px 4px;display:flex;align-items:center;justify-content:space-between;height:${hdrH}px;gap:2px;overflow:hidden;flex-shrink:0">
    ${secBadge(l, sz, 'background:rgba(255,255,255,0.2);color:#fff', cfg)}
    ${storeName(l, sz, 'color:#fff', cfg)}
  </div>`;

  const body = `<div style="background:#fffaf9;border-left:3px solid ${red};padding:2px 4px;flex:1;display:flex;flex-direction:column;justify-content:space-between;overflow:hidden;min-height:0">
    <div>
      ${brandLine(l, sz, '#a07a7a', cfg)}
      ${nameDiv(l, sz, cfg, '#2b0f10')}
    </div>
    <div>
      ${pB(l, red, s.priceSize, cfg)}
      ${unitLine(l, sz, '#a07a7a', cfg)}
    </div>
  </div>`;

  const footer = ftH(l, '#f6e7e6', '#8a5a5a', red, sz, cfg);

  return `<div style="background:#fffaf9;width:${s.w}px;height:${s.h}px;overflow:hidden;display:flex;flex-direction:column;font-family:'Barlow',sans-serif;border:1px solid ${red}40">${header}${body}${footer}</div>`;
}
