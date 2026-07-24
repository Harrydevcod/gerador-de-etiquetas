import type { Label } from '../types/label';
import type { AppConfig, SizeKey } from '../types/config';
import { SIZES } from '../constants/sizes';
import { pB, ftH, brandLine, unitLine, secBadge, storeName, nameDiv, headerEmpty } from './helpers';

export function neon(l: Label, sz: SizeKey, cfg: AppConfig): string {
  const s = SIZES[sz];
  const cyan = cfg.useCC ? cfg.customC : '#00e5ff';
  const bg = '#0d0d14';
  const hdrH = Math.max(14, Math.round(s.h * 0.22));

  const header = headerEmpty(l, cfg) ? '' : `<div style="background:#080810;border-bottom:1px solid ${cyan}60;padding:2px 4px;display:flex;align-items:center;justify-content:space-between;height:${hdrH}px;gap:2px;overflow:hidden;flex-shrink:0">
    ${secBadge(l, sz, `background:transparent;color:${cyan};border:1px solid ${cyan}50`, cfg)}
    ${storeName(l, sz, `color:${cyan}90`, cfg)}
  </div>`;

  const body = `<div style="background:${bg};padding:2px 4px;flex:1;display:flex;flex-direction:column;justify-content:space-between;overflow:hidden;min-height:0">
    <div>
      ${brandLine(l, sz, `${cyan}70`, cfg)}
      ${nameDiv(l, sz, cfg, '#c8f8ff')}
    </div>
    <div>
      ${pB(l, cyan, s.priceSize, cfg)}
      ${unitLine(l, sz, `${cyan}80`, cfg)}
    </div>
  </div>`;

  const footer = ftH(l, '#08080f', `${cyan}90`, cyan, sz, cfg);

  return `<div style="background:${bg};width:${s.w}px;height:${s.h}px;overflow:hidden;display:flex;flex-direction:column;font-family:'Barlow',sans-serif;border:1px solid ${cyan}60">${header}${body}${footer}</div>`;
}
