export const SECTION_COLORS: Record<string, string> = {
  'Mercearia': '#2c3e50',
  'Frescos':   '#27ae60',
  'Bebidas':   '#1a6fbd',
  'Talho':     '#8e44ad',
  'Peixaria':  '#2980b9',
  'Padaria':   '#d4a017',
  'Higiene':   '#16a085',
  'Limpeza':   '#34495e',
  'Promoção':  '#c0392b',
};

export const SECTIONS = Object.keys(SECTION_COLORS);

export function scCol(section: string): string {
  return SECTION_COLORS[section] ?? '#2c3e50';
}
