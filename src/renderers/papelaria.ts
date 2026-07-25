import type { Label } from '../types/label';
import type { AppConfig, SizeKey } from '../types/config';
import { SIZES } from '../constants/sizes';
import { pB, ftH, brandLine, unitLine, secBadge, storeName, nameDiv, headerEmpty } from './helpers';

export function papelaria(l: Label, sz: SizeKey, cfg: AppConfig): string {
  const s = SIZES[sz];
  const inkBlue = cfg.useCC ? cfg.customC : '#1d4ed8';
  const rule = '#c7d3ef';
  const muted = '#8792ab';
  const tiny = sz === 'XXXS' || sz === 'XXS';
  // Papel pautado: linhas horizontais + margem vermelha à esquerda, como um
  // caderno. Nos tamanhos minúsculos as linhas viram ruído — só fundo liso.
  const paper = tiny
    ? '#fffef8'
    : `repeating-linear-gradient(#fffef8,#fffef8 11px,${rule} 11px,${rule} 12px)`;

  const header = headerEmpty(l, cfg) ? '' : `<div style="padding:2px 5px 0;display:flex;align-items:center;justify-content:space-between;gap:2px;overflow:hidden;flex-shrink:0">
    ${secBadge(l, sz, `background:${inkBlue}18;color:${inkBlue};font-weight:700`, cfg)}
    ${storeName(l, sz, `color:${muted}`, cfg)}
  </div>`;

  const body = `<div style="padding:2px 5px;flex:1;display:flex;flex-direction:column;justify-content:space-between;overflow:hidden;min-height:0">
    <div>
      ${brandLine(l, sz, muted, cfg)}
      ${nameDiv(l, sz, cfg, '#152340')}
    </div>
    <div>
      ${pB(l, inkBlue, s.priceSize, cfg)}
      ${unitLine(l, sz, muted, cfg)}
    </div>
  </div>`;

  const footer = ftH(l, '#f3f4ef', muted, inkBlue, sz, cfg);

  return `<div style="background:${paper};width:${s.w}px;height:${s.h}px;overflow:hidden;display:flex;flex-direction:column;font-family:'Barlow',sans-serif;border:1px solid #ddd8c4;border-left:2px solid #e05252">${header}${body}${footer}</div>`;
}
