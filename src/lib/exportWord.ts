import {
  Document, Packer, Paragraph, Table, TableRow, TableCell,
  TextRun, HeadingLevel, WidthType, BorderStyle,
  ShadingType,
} from 'docx';
import type { Label } from '../types/label';
import { cleanUnit } from './units';
import type { AppConfig } from '../types/config';
import { SECTION_COLORS } from '../constants/sections';
import { formatPrice } from '../renderers/helpers';

function hex(color: string): string {
  return color.replace('#', '').toUpperCase();
}

function border() {
  return { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' };
}

function labelCell(l: Label, cfg: AppConfig): TableCell {
  const sectionColor = hex(SECTION_COLORS[l.section] ?? '#2c3e50');
  const children: Paragraph[] = [];

  // Section header row
  if (cfg.fopts.showSec) {
    children.push(new Paragraph({
      children: [new TextRun({ text: l.section, bold: true, size: 18, color: 'FFFFFF' })],
      shading: { type: ShadingType.SOLID, fill: sectionColor },
      spacing: { before: 0, after: 40 },
    }));
  }

  // Brand
  if (cfg.fopts.showBrand && l.brand) {
    children.push(new Paragraph({
      children: [new TextRun({ text: l.brand.toUpperCase(), size: 14, color: '888888', bold: true })],
      spacing: { before: 0, after: 20 },
    }));
  }

  // Product name
  children.push(new Paragraph({
    children: [new TextRun({ text: l.name, bold: true, size: 20 })],
    spacing: { before: 20, after: 40 },
  }));

  // Price
  const priceRuns: TextRun[] = [];
  if (l.oldPrice > 0) {
    priceRuns.push(new TextRun({ text: formatPrice(l.oldPrice) + '  ', size: 20, color: 'AAAAAA', strike: true }));
  }
  priceRuns.push(new TextRun({ text: formatPrice(l.price), bold: true, size: 36, color: 'E67E22' }));
  children.push(new Paragraph({ children: priceRuns, spacing: { before: 0, after: 40 } }));

  // Unit
  if (cfg.fopts.showUnit && l.unit) {
    children.push(new Paragraph({
      children: [new TextRun({ text: cleanUnit(l.unit), size: 14, color: '888888' })],
      spacing: { before: 0, after: 20 },
    }));
  }

  // Store
  if (cfg.fopts.showStore && l.store) {
    children.push(new Paragraph({
      children: [new TextRun({ text: l.store, bold: true, size: 14, color: '444444' })],
      spacing: { before: 0, after: 20 },
    }));
  }

  // ERP
  if (cfg.fopts.showErp) {
    children.push(new Paragraph({
      children: [new TextRun({ text: l.c, size: 12, color: '999999' })],
    }));
  }

  return new TableCell({
    children,
    width: { size: 3333, type: WidthType.DXA },
    margins: { top: 80, bottom: 80, left: 80, right: 80 },
    borders: { top: border(), bottom: border(), left: border(), right: border() },
  });
}

function emptyCell(): TableCell {
  return new TableCell({
    children: [new Paragraph({ text: '' })],
    width: { size: 3333, type: WidthType.DXA },
    borders: { top: border(), bottom: border(), left: border(), right: border() },
  });
}


export async function exportWord(labels: Label[], cfg: AppConfig): Promise<void> {
  const today = new Date().toLocaleDateString('pt-PT');

  // Label grid (3 per row)
  const chunks: Label[][] = [];
  for (let i = 0; i < labels.length; i += 3) chunks.push(labels.slice(i, i + 3));

  const gridRows = chunks.map(chunk => {
    const cells = chunk.map(l => labelCell(l, cfg));
    while (cells.length < 3) cells.push(emptyCell());
    return new TableRow({ children: cells });
  });

  const gridTable = new Table({
    rows: gridRows,
    width: { size: 100, type: WidthType.PERCENTAGE },
  });

  const doc = new Document({
    sections: [{
      children: [
        new Paragraph({
          children: [new TextRun({ text: `Etiquetas de Preços — ${today}`, bold: true, size: 36 })],
          heading: HeadingLevel.HEADING_1,
          spacing: { after: 200 },
        }),
        new Paragraph({
          children: [new TextRun({ text: `${labels.length} etiqueta${labels.length !== 1 ? 's' : ''}`, size: 20, color: '666666' })],
          spacing: { after: 400 },
        }),
        gridTable,
      ],
    }],
  });

  const defaultName = `etiquetas_${new Date().toISOString().split('T')[0]}.docx`;
  const blob = await Packer.toBlob(doc);

  const api = window.electronAPI;
  if (api?.saveWordDialog) {
    const filePath: string | null = await api.saveWordDialog(defaultName);
    if (!filePath) return;
    const arrayBuffer = await blob.arrayBuffer();
    await api.writeFile(filePath, arrayBuffer);
    await api.openPath(filePath);
  } else {
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
