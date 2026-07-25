import type { Label } from '../types/label';
import type { AppConfig, SizeKey } from '../types/config';
import { SIZES } from '../constants/sizes';
import { pB, ftH, brandLine, unitLine, secBadge, storeName, nameDiv, headerEmpty } from './helpers';

export function desconto(l: Label, sz: SizeKey, cfg: AppConfig): string {
  const s = SIZES[sz];
  const yellow = cfg.useCC ? cfg.customC : '#ffd400';
  const hdrH = Math.max(14, Math.round(s.h * 0.22));

  // Percentagem calculada do preço anterior. Exige ambos positivos e oldPrice
  // maior — evita divisão por zero e valores não finitos.
  const pct = (l.oldPrice > 0 && l.price > 0 && l.oldPrice > l.price)
    ? Math.round((1 - l.price / l.oldPrice) * 100)
    : 0;
  const badge = pct > 0
    ? `<span style="font-size:${s.fontSize + 1}px;background:${yellow};color:#111;font-weight:900;padding:0 4px;border-radius:2px;letter-spacing:-0.3px;flex-shrink:0">-${pct}%</span>`
    : '';

  // Header visível se houver badge OU conteúdo normal de header (secção/loja/logo).
  const header = (!badge && headerEmpty(l, cfg)) ? '' : `<div style="background:#111;padding:2px 5px;display:flex;align-items:center;justify-content:space-between;height:${hdrH}px;gap:2px;overflow:hidden;flex-shrink:0">
    <div style="display:flex;align-items:center;gap:3px;overflow:hidden;min-width:0">
      ${badge}
      ${secBadge(l, sz, `background:${yellow}26;color:${yellow}`, cfg)}
    </div>
    ${storeName(l, sz, `color:${yellow}`, cfg)}
  </div>`;

  const body = `<div style="background:#111;padding:2px 5px;flex:1;display:flex;flex-direction:column;justify-content:space-between;overflow:hidden;min-height:0">
    <div>
      ${brandLine(l, sz, 'rgba(255,255,255,0.55)', cfg)}
      ${nameDiv(l, sz, cfg, '#fff')}
    </div>
    <div>
      ${pB(l, yellow, s.priceSize, cfg)}
      ${unitLine(l, sz, 'rgba(255,255,255,0.6)', cfg)}
    </div>
  </div>`;

  const footer = ftH(l, 'rgba(255,255,255,0.08)', 'rgba(255,255,255,0.7)', '#fff', sz, cfg);

  return `<div style="background:#111;width:${s.w}px;height:${s.h}px;overflow:hidden;display:flex;flex-direction:column;font-family:'Barlow',sans-serif;border:2px solid ${yellow}">${header}${body}${footer}</div>`;
}
