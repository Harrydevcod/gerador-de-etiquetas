export type SizeKey = 'XXXS' | 'XXS' | 'XS' | 'S' | 'M' | 'L' | 'XL';
export type ModelKey = 'classico' | 'premium' | 'minimal' | 'promo' | 'eco' | 'retro' | 'neon' | 'corporate' | 'bold' | 'farmacia';
export type FontKey = 'sans' | 'cond' | 'serif' | 'mono';
export type MarginKey = '0' | '0.3' | '0.5' | '1';
export type NameAlign = 'left' | 'center' | 'right';

export interface FooterOptions {
  showBrand: boolean;
  showErp: boolean;
  showSec: boolean;
  showUnit: boolean;
  showStore: boolean;
}

export interface AppConfig {
  selModel: ModelKey;
  selSize: SizeKey;
  pcols: number;
  pmarg: MarginKey;
  printLandscape: boolean;
  dark: boolean;
  showBC: boolean;
  useCC: boolean;
  customC: string;
  selFont: FontKey;
  ribbon: string;
  ribColor: string;
  logoB64: string;
  fopts: FooterOptions;
  nameAlign: NameAlign;
  nameSizeAdj: number;
  nameBold: boolean;
  nameItalic: boolean;
  priceSizeAdj: number;
}

export const DEFAULT_CONFIG: AppConfig = {
  selModel: 'classico',
  selSize: 'M',
  pcols: 4,
  pmarg: '0.5',
  dark: true,
  showBC: false,
  useCC: false,
  customC: '#1a6fbd',
  selFont: 'sans',
  ribbon: '',
  ribColor: '#e67e22',
  logoB64: '',
  fopts: {
    showBrand: true,
    showErp: false,
    showSec: true,
    showUnit: true,
    showStore: true,
  },
  nameAlign: 'center',
  nameSizeAdj: 0,
  nameBold: false,
  nameItalic: false,
  priceSizeAdj: -4,
  printLandscape: true,
};
