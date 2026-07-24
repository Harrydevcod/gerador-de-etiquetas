import { describe, it, expect } from 'vitest';
import { cleanUnit } from './units';

describe('cleanUnit', () => {
  it('remove o prefixo "por " (dados legados)', () => {
    expect(cleanUnit('por kg')).toBe('kg');
    expect(cleanUnit('por unid.')).toBe('unid.');
    expect(cleanUnit('por 500g')).toBe('500g');
  });

  it('é case-insensitive no prefixo', () => {
    expect(cleanUnit('Por litro')).toBe('litro');
  });

  it('deixa unidades sem "por" intactas', () => {
    expect(cleanUnit('kg')).toBe('kg');
    expect(cleanUnit('unid.')).toBe('unid.');
  });

  it('não corta "por" no meio da palavra', () => {
    expect(cleanUnit('porção')).toBe('porção');
  });

  it('lida com string vazia', () => {
    expect(cleanUnit('')).toBe('');
  });
});
