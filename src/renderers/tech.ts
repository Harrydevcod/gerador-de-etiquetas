import type { Label } from '../types/label';
import type { AppConfig, SizeKey } from '../types/config';
import { SIZES } from '../constants/sizes';
import { pB, ftH, brandLine, unitLine, secBadge, storeName, nameDiv, headerEmpty } from './helpers';

export function tech(l: Label, sz: SizeKey, cfg: AppConfig): string {
  const s = SIZES[sz];
  const cyan = cfg.useCC ? cfg.customC : '#22d3ee';
  const slate = '#0f172a';
  const hdrH = Math.max(14, Math.round(s.h * 0.22));

  const header = headerEmpty(l, cfg) ? '' : `<div style="background:#1e293b;border-bottom:1px solid ${cyan}40;padding:2px 5px;display:flex;align-items:center;justify-content:space-between;height:${hdrH}px;gap:2px;overflow:hidden;flex-shrink:0">
    ${secBadge(l, sz, `background:${cyan}1f;color:${cyan};border:1px solid ${cyan}40`, cfg)}
    ${storeName(l, sz, 'color:#cbd5e1', cfg)}
  </div>`;

  const body = `<div style="padding:2px 5px;flex:1;display:flex;flex-direction:column;justify-content:space-between;overflow:hidden;min-height:0">
    <div>
      ${brandLine(l, sz, '#64748b', cfg)}
      ${nameDiv(l, sz, cfg, '#e2e8f0')}
    </div>
    <div>
      ${pB(l, cyan, s.priceSize, cfg)}
      ${unitLine(l, sz, '#64748b', cfg)}
    </div>
  </div>`;

  const footer = ftH(l, '#1e293b', '#94a3b8', cyan, sz, cfg);

  return `<div style="background:${slate};width:${s.w}px;height:${s.h}px;overflow:hidden;display:flex;flex-direction:column;font-family:'Barlow',sans-serif;border:1px solid #334155">${header}${body}${footer}</div>`;
}
