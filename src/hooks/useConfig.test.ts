import { describe, expect, it } from 'vitest';
import { sanitizeConfig } from './useConfig';
import { DEFAULT_CONFIG } from '../types/config';
import type { AppConfig } from '../types/config';

describe('sanitizeConfig', () => {
  it('mantém modelo e tamanho válidos', () => {
    const cfg = sanitizeConfig({ selModel: 'talho', selSize: 'XL' });
    expect(cfg.selModel).toBe('talho');
    expect(cfg.selSize).toBe('XL');
  });

  it('repõe o modelo por omissão quando o guardado já não existe', () => {
    // Config escrita por uma versão com outros modelos.
    const cfg = sanitizeConfig({ selModel: 'inexistente' as AppConfig['selModel'] });
    expect(cfg.selModel).toBe(DEFAULT_CONFIG.selModel);
  });

  it('repõe o tamanho por omissão quando o guardado já não existe', () => {
    const cfg = sanitizeConfig({ selSize: 'XXL' as AppConfig['selSize'] });
    expect(cfg.selSize).toBe(DEFAULT_CONFIG.selSize);
  });

  it('funde fopts parciais com os valores por omissão', () => {
    const cfg = sanitizeConfig({ fopts: { showBrand: false } as AppConfig['fopts'] });
    expect(cfg.fopts.showBrand).toBe(false);
    expect(cfg.fopts.showErp).toBe(DEFAULT_CONFIG.fopts.showErp);
  });
});
