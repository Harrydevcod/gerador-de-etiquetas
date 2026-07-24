// Tira o prefixo "por " de unidades (etiquetas antigas guardavam "por kg", "por unid." etc.)
export const cleanUnit = (u: string): string => u.replace(/^por\s+/i, '');
