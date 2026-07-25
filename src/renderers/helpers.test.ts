import { describe, it, expect } from 'vitest';
import { headerEmpty, pB } from './helpers';
import { DEFAULT_CONFIG } from '../types/config';
import type { Label } from '../types/label';
import type { AppConfig } from '../types/config';

function label(over: Partial<Label> = {}): Label {
  return {
    id: '1', c: '', name: 'Produto', brand: '', price: 100, oldPrice: 0,
    unit: 'unid.', section: 'Mercearia', store: 'Minimarket',
    createdAt: '2026-01-01', ...over,
  };
}
function cfg(over: Partial<AppConfig> = {}): AppConfig {
  return { ...DEFAULT_CONFIG, logoB64: '', ...over };
}

describe('headerEmpty', () => {
  it('não vazio quando há secção e loja', () => {
    expect(headerEmpty(label(), cfg())).toBe(false);
  });

  it('vazio quando secção e loja em branco (sem logo)', () => {
    expect(headerEmpty(label({ section: '', store: '' }), cfg())).toBe(true);
  });

  it('não vazio se só a loja tem valor', () => {
    expect(headerEmpty(label({ section: '', store: 'Loja' }), cfg())).toBe(false);
  });

  it('não vazio se só a secção tem valor', () => {
    expect(headerEmpty(label({ section: 'Talho', store: '' }), cfg())).toBe(false);
  });

  it('não vazio quando há logo, mesmo sem secção/loja', () => {
    expect(headerEmpty(label({ section: '', store: '' }), cfg({ logoB64: 'data:image/png;base64,AAAA' }))).toBe(false);
  });

  it('vazio quando showSec/showStore desligados apesar de haver valores', () => {
    const c = cfg();
    c.fopts = { ...c.fopts, showSec: false, showStore: false };
    expect(headerEmpty(label(), c)).toBe(true);
  });
});

describe('pB — preço anterior riscado', () => {
  const risca = (price: number, oldPrice: number) =>
    pB(label({ price, oldPrice }), '#000', 20, cfg()).includes('line-through');

  it('risca quando o preço anterior é maior (desconto real)', () => {
    expect(risca(850, 950)).toBe(true);
  });

  it('não risca quando não há preço anterior', () => {
    expect(risca(850, 0)).toBe(false);
  });

  it('não risca quando o preço anterior é igual (não é desconto)', () => {
    expect(risca(850, 850)).toBe(false);
  });

  it('não risca quando o preço anterior é menor (seria anunciar aumento como desconto)', () => {
    expect(risca(850, 700)).toBe(false);
  });
});
