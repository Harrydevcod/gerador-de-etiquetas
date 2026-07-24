import { describe, it, expect } from 'vitest';
import { applyPriceOp } from './priceOp';

describe('applyPriceOp', () => {
  it('aumenta por percentagem', () => {
    expect(applyPriceOp(100, { type: 'percent_up', value: 10, roundTo: 1 })).toBe(110);
  });

  it('baixa por percentagem', () => {
    expect(applyPriceOp(200, { type: 'percent_down', value: 25, roundTo: 1 })).toBe(150);
  });

  it('define valor fixo', () => {
    expect(applyPriceOp(999, { type: 'fixed_set', value: 500, roundTo: 1 })).toBe(500);
  });

  it('soma valor fixo', () => {
    expect(applyPriceOp(450, { type: 'fixed_up', value: 50, roundTo: 1 })).toBe(500);
  });

  it('subtrai valor fixo', () => {
    expect(applyPriceOp(450, { type: 'fixed_down', value: 50, roundTo: 1 })).toBe(400);
  });

  it('arredonda para o múltiplo pedido', () => {
    expect(applyPriceOp(123, { type: 'percent_up', value: 0, roundTo: 50 })).toBe(100);
    expect(applyPriceOp(176, { type: 'percent_up', value: 0, roundTo: 50 })).toBe(200);
  });

  it('nunca desce abaixo de 1 (piso de preço)', () => {
    expect(applyPriceOp(30, { type: 'fixed_down', value: 100, roundTo: 1 })).toBe(1);
    expect(applyPriceOp(100, { type: 'percent_down', value: 100, roundTo: 1 })).toBe(1);
  });

  it('devolve inteiros', () => {
    const r = applyPriceOp(333, { type: 'percent_up', value: 10, roundTo: 1 });
    expect(Number.isInteger(r)).toBe(true);
  });
});
