import type { FontKey } from '../types/config';

export const FONTS: Record<FontKey, { label: string; family: string; sample: string }> = {
  sans:  { label: 'Sans-serif',     family: "'Barlow', sans-serif",               sample: 'Barlow'   },
  cond:  { label: 'Condensada',     family: "'Barlow Condensed', sans-serif",      sample: 'Condensed'},
  serif: { label: 'Serif',          family: "'Playfair Display', serif",           sample: 'Playfair' },
  mono:  { label: 'Monospace',      family: "'Space Mono', monospace",             sample: 'Mono'     },
};
