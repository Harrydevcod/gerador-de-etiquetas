import type { SizeKey } from '../types/config';

export interface SizeSpec {
  label: string;
  w: number;
  h: number;
  priceSize: number;
  fontSize: number;
}

export const SIZES: Record<SizeKey, SizeSpec> = {
  XXXS: { label: 'XXXS — 3×2',  w: 72,  h: 48,  priceSize: 16, fontSize: 8  },
  XXS:  { label: 'XXS — 4×2.5', w: 94,  h: 59,  priceSize: 20, fontSize: 9  },
  XS:   { label: 'XS — 5×3',    w: 116, h: 70,  priceSize: 24, fontSize: 10 },
  S:    { label: 'S — 7×4',     w: 148, h: 85,  priceSize: 30, fontSize: 12 },
  M:    { label: 'M — 9×5',     w: 180, h: 100, priceSize: 38, fontSize: 13 },
  L:    { label: 'L — 11×6',    w: 226, h: 123, priceSize: 46, fontSize: 14 },
  XL:   { label: 'XL — 13×8',   w: 280, h: 172, priceSize: 56, fontSize: 15 },
};
