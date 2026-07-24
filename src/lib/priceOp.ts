// Operações de preço em lote — lógica de dinheiro pura, testável isoladamente.

export type PriceOpType = 'percent_up' | 'percent_down' | 'fixed_set' | 'fixed_up' | 'fixed_down';
export type RoundTo = 1 | 10 | 50 | 100;

export interface PriceOp {
  type: PriceOpType;
  value: number;
  roundTo: RoundTo;
}

export function applyPriceOp(price: number, op: PriceOp): number {
  let n = price;
  if (op.type === 'percent_up')   n = price * (1 + op.value / 100);
  if (op.type === 'percent_down') n = price * (1 - op.value / 100);
  if (op.type === 'fixed_set')    n = op.value;
  if (op.type === 'fixed_up')     n = price + op.value;
  if (op.type === 'fixed_down')   n = price - op.value;
  if (op.roundTo > 1) n = Math.round(n / op.roundTo) * op.roundTo;
  return Math.max(1, Math.round(n));
}
