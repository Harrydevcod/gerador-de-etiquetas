import type { Label } from '../types/label';
import { cleanUnit } from './units';

export async function exportCsv(labels: Label[]): Promise<void> {
  const BOM = '﻿';
  const headers = ['Código', 'Nome', 'Marca', 'Preço', 'Preço Antigo', 'Unidade', 'Secção', 'Loja'];

  const rows = labels.map(l => [
    l.c,
    l.name,
    l.brand,
    l.price.toString(),
    l.oldPrice > 0 ? l.oldPrice.toString() : '',
    cleanUnit(l.unit),
    l.section,
    l.store,
  ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(';'));

  const csv = BOM + [headers.map(h => `"${h}"`).join(';'), ...rows].join('\r\n');
  const defaultName = `etiquetas_${new Date().toISOString().split('T')[0]}.csv`;

  const api = window.electronAPI;
  if (api?.saveCsvDialog) {
    const filePath: string | null = await api.saveCsvDialog(defaultName);
    if (!filePath) return;
    const encoder = new TextEncoder();
    await api.writeFile(filePath, encoder.encode(csv).buffer);
    await api.openPath(filePath);
  } else {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = defaultName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
