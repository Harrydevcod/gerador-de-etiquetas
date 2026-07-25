import { describe, expect, it } from 'vitest';
import { SIZES } from '../constants/sizes';
import { DEFAULT_CONFIG } from '../types/config';
import type { AppConfig, ModelKey, SizeKey } from '../types/config';
import type { Label } from '../types/label';
import { MODELS } from './index';

const ALL_MODEL_KEYS = [
  'classico',
  'premium',
  'minimal',
  'promo',
  'eco',
  'retro',
  'neon',
  'corporate',
  'bold',
  'farmacia',
  'talho',
  'kraft',
  'desconto',
  'boutique',
  'tech',
  'split',
  'peixaria',
  'padaria',
  'infantil',
  'atacado',
] as const satisfies readonly ModelKey[];

const NEW_MODEL_KEYS = [
  'talho',
  'kraft',
  'desconto',
  'boutique',
  'tech',
  'split',
  'peixaria',
  'padaria',
  'infantil',
  'atacado',
] as const satisfies readonly ModelKey[];

const SIZE_KEYS = Object.keys(SIZES) as SizeKey[];

function label(overrides: Partial<Label> = {}): Label {
  return {
    id: 'test-label',
    c: 'ERP-00001',
    name: 'Arroz agulha 5kg',
    brand: 'Bom Sucesso',
    price: 850,
    oldPrice: 950,
    unit: 'por fardo',
    section: 'Mercearia',
    store: 'Minimarket',
    createdAt: '2026-07-24T00:00:00.000Z',
    ...overrides,
  };
}

function config(overrides: Partial<AppConfig> = {}): AppConfig {
  return {
    ...DEFAULT_CONFIG,
    fopts: { ...DEFAULT_CONFIG.fopts },
    ...overrides,
  };
}

describe('MODELS', () => {
  it('registers exactly the supported 20 models', () => {
    expect(Object.keys(MODELS)).toEqual([...ALL_MODEL_KEYS]);
  });

  it.each(NEW_MODEL_KEYS)('%s renders fixed root dimensions at every size', (modelKey) => {
    for (const sizeKey of SIZE_KEYS) {
      const html = MODELS[modelKey].fn(label(), sizeKey, config());
      expect(html).toContain(`width:${SIZES[sizeKey].w}px`);
      expect(html).toContain(`height:${SIZES[sizeKey].h}px`);
      expect(html).toMatch(/^<div\b/);
    }
  });

  it.each(NEW_MODEL_KEYS)('%s escapes label-derived markup', (modelKey) => {
    const attack = '<img src=x onerror=alert(1)>';
    const html = MODELS[modelKey].fn(label({ name: attack }), 'M', config());

    expect(html).not.toContain(attack);
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
  });

  it.each(NEW_MODEL_KEYS)('%s respects custom color', (modelKey) => {
    const html = MODELS[modelKey].fn(
      label(),
      'M',
      config({ useCC: true, customC: '#123456' }),
    );

    expect(html).toContain('#123456');
  });

  it.each(NEW_MODEL_KEYS)('%s hides optional metadata', (modelKey) => {
    const hiddenConfig = config({
      showBC: false,
      fopts: {
        showBrand: false,
        showErp: false,
        showSec: false,
        showUnit: false,
        showStore: false,
      },
    });
    const html = MODELS[modelKey].fn(
      label({
        c: 'HIDDEN-ERP',
        brand: 'HIDDEN-BRAND',
        unit: 'HIDDEN-UNIT',
        section: 'HIDDEN-SECTION',
        store: 'HIDDEN-STORE',
      }),
      'M',
      hiddenConfig,
    );

    expect(html).not.toContain('HIDDEN-ERP');
    expect(html).not.toContain('HIDDEN-BRAND');
    expect(html).not.toContain('HIDDEN-UNIT');
    expect(html).not.toContain('HIDDEN-SECTION');
    expect(html).not.toContain('HIDDEN-STORE');
  });
});
