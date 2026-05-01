import type { Label } from '../types/label';
import type { AppConfig, SizeKey } from '../types/config';
import { SIZES } from '../constants/sizes';
import { pB, ftH, brandLine, unitLine, storeName, nameDiv } from './helpers';

export function promo(l: Label, sz: SizeKey, cfg: AppConfig): string {
  const s = SIZES[sz];
  const red = cfg.useCC ? cfg.customC : '#c0392b';
  const hdrH = Math.max(14, Math.round(s.h * 0.22));

  const badge = `<span style="font-size:${s.fontSize - 1}px;background:#fff;color:${red};font-weight:900;padding:0 3px;border-radius:2px;letter-spacing:0.5px;flex-shrink:0">PROMO</span>`;

  const header = `<div style="background:${red};padding:2px 4px;display:flex;align-items:center;justify-content:space-between;height:${hdrH}px;gap:2px;overflow:hidden;flex-shrink:0">
    ${badge}
    ${storeName(l, sz, 'color:#fff', cfg)}
  </div>`;

  const body = `<div style="background:${red};padding:2px 4px;flex:1;display:flex;flex-direction:column;justify-content:space-between;overflow:hidden;min-height:0">
    <div>
      ${brandLine(l, sz, 'rgba(255,255,255,0.75)', cfg)}
      ${nameDiv(l, sz, cfg, '#fff')}
    </div>
    <div>
      ${pB(l, '#fff', s.priceSize, cfg)}
      ${unitLine(l, sz, 'rgba(255,255,255,0.8)', cfg)}
    </div>
  </div>`;

  const footer = ftH(l, 'rgba(0,0,0,0.25)', '#fff', '#fff', sz, cfg);

  return `<div style="background:${red};width:${s.w}px;height:${s.h}px;overflow:hidden;display:flex;flex-direction:column;font-family:'Barlow',sans-serif">${header}${body}${footer}</div>`;
}
