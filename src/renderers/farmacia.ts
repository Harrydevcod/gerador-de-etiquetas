import type { Label } from '../types/label';
import type { AppConfig, SizeKey } from '../types/config';
import { SIZES } from '../constants/sizes';
import { pB, ftH, brandLine, unitLine, secBadge, storeName, nameDiv } from './helpers';

export function farmacia(l: Label, sz: SizeKey, cfg: AppConfig): string {
  const s = SIZES[sz];
  const teal = cfg.useCC ? cfg.customC : '#0d9488';
  const hdrH = Math.max(14, Math.round(s.h * 0.22));
  const crossSz = Math.round(hdrH * 0.65);

  const cross = `<span style="font-size:${crossSz}px;color:#fff;font-weight:900;flex-shrink:0;line-height:1">✚</span>`;

  const header = `<div style="background:${teal};padding:2px 4px;display:flex;align-items:center;justify-content:space-between;height:${hdrH}px;gap:2px;overflow:hidden;flex-shrink:0">
    <div style="display:flex;align-items:center;gap:2px;overflow:hidden;min-width:0">
      ${cross}
      ${secBadge(l, sz, 'background:rgba(255,255,255,0.2);color:#fff', cfg)}
    </div>
    ${storeName(l, sz, 'color:#fff', cfg)}
  </div>`;

  const body = `<div style="background:#fff;padding:2px 4px;flex:1;display:flex;flex-direction:column;justify-content:space-between;overflow:hidden;min-height:0">
    <div>
      ${brandLine(l, sz, '#5a9a94', cfg)}
      ${nameDiv(l, sz, cfg, '#0a3d38')}
    </div>
    <div>
      ${pB(l, teal, s.priceSize, cfg)}
      ${unitLine(l, sz, '#5a9a94', cfg)}
    </div>
  </div>`;

  const footer = ftH(l, '#e6f7f5', '#2d7a74', teal, sz, cfg);

  return `<div style="background:#fff;width:${s.w}px;height:${s.h}px;overflow:hidden;display:flex;flex-direction:column;font-family:'Barlow',sans-serif;border:2px solid ${teal}">${header}${body}${footer}</div>`;
}
