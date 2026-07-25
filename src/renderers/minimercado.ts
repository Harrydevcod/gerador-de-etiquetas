import type { Label } from '../types/label';
import type { AppConfig, SizeKey } from '../types/config';
import { SIZES } from '../constants/sizes';
import { pB, ftH, brandLine, unitLine, secBadge, storeName, nameDiv, headerEmpty } from './helpers';

export function minimercado(l: Label, sz: SizeKey, cfg: AppConfig): string {
  const s = SIZES[sz];
  const accent = cfg.useCC ? cfg.customC : '#0f766e';
  const ink = '#0f1720';
  const muted = '#7b8794';
  const tiny = sz === 'XXXS' || sz === 'XXS';
  const pad = tiny ? '2px 4px' : '3px 7px';

  // Sem faixa de cor no topo: a assinatura é a keyline lateral e a régua sob o
  // preço. Secção e loja ficam numa linha leve, alinhada à base do texto.
  const header = headerEmpty(l, cfg) ? '' : `<div style="display:flex;align-items:center;justify-content:space-between;gap:2px;padding:${pad};padding-bottom:0;overflow:hidden;flex-shrink:0">
    ${secBadge(l, sz, `background:${accent}14;color:${accent};font-weight:700;letter-spacing:0.4px`, cfg)}
    ${storeName(l, sz, `color:${muted}`, cfg)}
  </div>`;

  // Régua curta sob o preço — só onde há altura para ela. Segue o alinhamento do
  // texto, senão fica um traço solto ao lado de um preço centrado.
  const align = cfg.nameAlign ?? 'left';
  const ruleMargin = align === 'center' ? '2px auto 0' : align === 'right' ? '2px 0 0 auto' : '2px 0 0 0';
  const rule = tiny ? '' : `<div style="width:18px;height:2px;background:${accent};border-radius:1px;margin:${ruleMargin}"></div>`;

  const body = `<div style="padding:${pad};flex:1;display:flex;flex-direction:column;justify-content:space-between;overflow:hidden;min-height:0">
    <div>
      ${brandLine(l, sz, muted, cfg)}
      ${nameDiv(l, sz, cfg, ink, '700')}
    </div>
    <div>
      ${pB(l, ink, s.priceSize, cfg)}
      ${rule}
      ${unitLine(l, sz, muted, cfg)}
    </div>
  </div>`;

  const footer = ftH(l, '#f6f8f9', muted, ink, sz, cfg);

  return `<div style="background:#fff;width:${s.w}px;height:${s.h}px;overflow:hidden;display:flex;flex-direction:column;font-family:'Barlow',sans-serif;border:1px solid #e4e8eb;border-left:3px solid ${accent}">${header}${body}${footer}</div>`;
}
