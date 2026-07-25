import type { Label } from '../types/label';
import type { AppConfig, SizeKey } from '../types/config';
import { SIZES } from '../constants/sizes';
import { pB, ftH, brandLine, unitLine, secBadge, storeName, nameDiv, headerEmpty } from './helpers';

export function bebidas(l: Label, sz: SizeKey, cfg: AppConfig): string {
  const s = SIZES[sz];
  const accent = cfg.useCC ? cfg.customC : '#38bdf8';
  const deep = '#0b2a3f';
  const muted = '#5c748a';
  // Zona de preço escura em baixo (leitura de tabuleta de frio), corpo claro em
  // cima — o inverso das faixas coloridas no topo dos outros modelos. A altura
  // sai do conteúdo: com altura fixa, o preço dos tamanhos grandes cortava a
  // linha da unidade.

  const header = headerEmpty(l, cfg) ? '' : `<div style="padding:2px 5px 0;display:flex;align-items:center;justify-content:space-between;gap:2px;overflow:hidden;flex-shrink:0">
    ${secBadge(l, sz, `background:${deep};color:${accent};font-weight:700`, cfg)}
    ${storeName(l, sz, `color:${muted}`, cfg)}
  </div>`;

  const top = `<div style="padding:2px 5px;flex:1;display:flex;flex-direction:column;justify-content:center;overflow:hidden;min-height:0">
    ${brandLine(l, sz, muted, cfg)}
    ${nameDiv(l, sz, cfg, deep, '700')}
  </div>`;

  const priceZone = `<div style="background:linear-gradient(160deg,${deep},#06405f);border-top:2px solid ${accent};padding:2px 5px 3px;flex-shrink:0;display:flex;flex-direction:column;justify-content:center;overflow:hidden">
    ${pB(l, '#fff', s.priceSize, cfg)}
    ${unitLine(l, sz, accent, cfg)}
  </div>`;

  const footer = ftH(l, '#eef4f8', muted, deep, sz, cfg);

  return `<div style="background:#f7fbfd;width:${s.w}px;height:${s.h}px;overflow:hidden;display:flex;flex-direction:column;font-family:'Barlow',sans-serif;border:1px solid #cfe0ea">${header}${top}${priceZone}${footer}</div>`;
}
