import type { Label } from '../types/label';
import type { AppConfig, SizeKey } from '../types/config';
import { SIZES } from '../constants/sizes';
import { pB, ftH, brandLine, unitLine, secBadge, storeName, nameDiv } from './helpers';

export function premium(l: Label, sz: SizeKey, cfg: AppConfig): string {
  const s = SIZES[sz];
  const gold = '#c9a84c';
  const bg = '#0e0e0e';
  const hdrH = Math.max(14, Math.round(s.h * 0.22));

  const header = `<div style="background:#181206;border-bottom:1px solid ${gold};padding:2px 5px;display:flex;align-items:center;justify-content:space-between;height:${hdrH}px;gap:2px;overflow:hidden;flex-shrink:0">
    ${secBadge(l, sz, `background:transparent;color:${gold};border:1px solid ${gold}40`, cfg)}
    ${storeName(l, sz, `color:${gold}`, cfg)}
  </div>`;

  const body = `<div style="background:${bg};padding:2px 5px;flex:1;display:flex;flex-direction:column;justify-content:space-between;overflow:hidden;min-height:0">
    <div>
      ${brandLine(l, sz, '#7a6520', cfg)}
      ${nameDiv(l, sz, cfg, '#e8e0c8')}
    </div>
    <div>
      ${pB(l, gold, s.priceSize, cfg)}
      ${unitLine(l, sz, '#7a6520', cfg)}
    </div>
  </div>`;

  const footer = ftH(l, '#100f0a', gold, gold, sz, cfg);

  return `<div style="background:${bg};width:${s.w}px;height:${s.h}px;overflow:hidden;display:flex;flex-direction:column;font-family:'Barlow',sans-serif;border:1px solid ${gold}">${header}${body}${footer}</div>`;
}
