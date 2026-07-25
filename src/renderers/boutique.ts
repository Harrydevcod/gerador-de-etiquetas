import type { Label } from '../types/label';
import type { AppConfig, SizeKey } from '../types/config';
import { SIZES } from '../constants/sizes';
import { pB, ftH, brandLine, unitLine, secBadge, storeName, nameDiv, headerEmpty } from './helpers';

export function boutique(l: Label, sz: SizeKey, cfg: AppConfig): string {
  const s = SIZES[sz];
  const gold = cfg.useCC ? cfg.customC : '#a98b52';
  const cream = '#faf6ee';
  const ink = '#3a332a';
  const hdrH = Math.max(12, Math.round(s.h * 0.18));

  // Header discreto — sem fundo, só uma linha fina dourada.
  const header = headerEmpty(l, cfg) ? '' : `<div style="border-bottom:1px solid ${gold}55;padding:2px 6px;display:flex;align-items:center;justify-content:space-between;height:${hdrH}px;gap:2px;overflow:hidden;flex-shrink:0">
    ${secBadge(l, sz, `background:transparent;color:${gold};letter-spacing:1px`, cfg)}
    ${storeName(l, sz, `color:${gold}`, cfg)}
  </div>`;

  const body = `<div style="padding:3px 6px;flex:1;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;gap:2px;overflow:hidden;min-height:0">
    <div style="width:100%">
      ${brandLine(l, sz, `${gold}`, cfg)}
      ${nameDiv(l, sz, cfg, ink, '400', "'Playfair Display', serif")}
    </div>
    <div style="width:100%">
      ${pB(l, ink, Math.round(s.priceSize * 0.82), cfg)}
      ${unitLine(l, sz, '#9c9285', cfg)}
    </div>
  </div>`;

  const footer = ftH(l, 'transparent', '#b3a794', gold, sz, cfg);

  return `<div style="background:${cream};width:${s.w}px;height:${s.h}px;overflow:hidden;display:flex;flex-direction:column;font-family:'Barlow',sans-serif;border:1px solid ${gold}50">${header}${body}${footer}</div>`;
}
