import XLSXStyle from 'xlsx-js-style';
import type { Label } from '../types/label';
import type { AppConfig } from '../types/config';
import { SECTION_COLORS } from '../constants/sections';
import { formatPrice } from '../renderers/helpers';

// ── helpers ───────────────────────────────────────────────────────────────────

function hex(color: string): string {
  return color.replace('#', '').toUpperCase();
}

function ref(r: number, c: number): string {
  return XLSXStyle.utils.encode_cell({ r, c });
}

function setCell(
  ws: Record<string, unknown>,
  r: number,
  c: number,
  value: string,
  style: Record<string, unknown>,
): void {
  ws[ref(r, c)] = { v: value, t: 's', s: style };
}

// ── layout constants ──────────────────────────────────────────────────────────

const COLS_PER_LABEL = 5;
const GAP_COL = 1;
const ROWS_PER_LABEL = 7;
const GAP_ROW = 1;
const LABELS_PER_ROW = 3;

function labelCol(labelIdx: number): number {
  return labelIdx * (COLS_PER_LABEL + GAP_COL);
}

function labelRow(chunkIdx: number): number {
  return 1 + chunkIdx * (ROWS_PER_LABEL + GAP_ROW); // row 0 = title
}

// ── render one label into the worksheet ──────────────────────────────────────

function renderLabel(
  ws: Record<string, unknown>,
  merges: { s: { r: number; c: number }; e: { r: number; c: number } }[],
  rowHeights: { hpt: number }[],
  l: Label,
  cfg: AppConfig,
  startRow: number,
  startCol: number,
): void {
  const endCol = startCol + COLS_PER_LABEL - 1;
  const secColor = hex(SECTION_COLORS[l.section] ?? '#2c3e50');

  const merge = (rowOff: number) =>
    merges.push({ s: { r: startRow + rowOff, c: startCol }, e: { r: startRow + rowOff, c: endCol } });

  const thin = { style: 'thin', color: { rgb: 'D0D0D0' } };
  const border = { left: thin, right: thin, top: thin, bottom: thin };

  // Row 0 — Section header
  merge(0);
  rowHeights[startRow] = { hpt: 18 };
  if (cfg.fopts.showSec) {
    setCell(ws, startRow, startCol, l.section.toUpperCase(), {
      font: { bold: true, sz: 9, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: secColor } },
      alignment: { horizontal: 'center', vertical: 'center' },
      border,
    });
  } else {
    setCell(ws, startRow, startCol, '', {
      fill: { fgColor: { rgb: secColor } },
      border,
    });
  }

  // Row 1 — Brand
  merge(1);
  rowHeights[startRow + 1] = { hpt: cfg.fopts.showBrand && l.brand ? 13 : 4 };
  setCell(ws, startRow + 1, startCol, cfg.fopts.showBrand && l.brand ? l.brand.toUpperCase() : '', {
    font: { italic: true, sz: 8, color: { rgb: '888888' } },
    alignment: { vertical: 'center' },
    border: { left: thin, right: thin },
  });

  // Row 2 — Product name
  merge(2);
  rowHeights[startRow + 2] = { hpt: 20 };
  setCell(ws, startRow + 2, startCol, l.name, {
    font: { bold: true, sz: 11, color: { rgb: '111111' } },
    alignment: { vertical: 'center', wrapText: true },
    border: { left: thin, right: thin },
  });

  // Row 3 — Price
  merge(3);
  rowHeights[startRow + 3] = { hpt: 26 };
  const priceText = l.oldPrice > 0
    ? `${formatPrice(l.oldPrice)}  →  ${formatPrice(l.price)}`
    : formatPrice(l.price);
  setCell(ws, startRow + 3, startCol, priceText, {
    font: { bold: true, sz: 16, color: { rgb: hex('#E67E22') } },
    alignment: { vertical: 'center' },
    border: { left: thin, right: thin },
  });

  // Row 4 — Unit
  merge(4);
  rowHeights[startRow + 4] = { hpt: cfg.fopts.showUnit && l.unit ? 13 : 4 };
  setCell(ws, startRow + 4, startCol, cfg.fopts.showUnit && l.unit ? l.unit : '', {
    font: { sz: 8, color: { rgb: '888888' } },
    alignment: { vertical: 'center' },
    border: { left: thin, right: thin },
  });

  // Row 5 — Store
  merge(5);
  rowHeights[startRow + 5] = { hpt: cfg.fopts.showStore && l.store ? 13 : 4 };
  setCell(ws, startRow + 5, startCol, cfg.fopts.showStore && l.store ? l.store : '', {
    font: { bold: true, sz: 8, color: { rgb: '444444' } },
    alignment: { vertical: 'center' },
    border: { left: thin, right: thin },
  });

  // Row 6 — ERP code
  merge(6);
  rowHeights[startRow + 6] = { hpt: cfg.fopts.showErp ? 12 : 4 };
  setCell(ws, startRow + 6, startCol, cfg.fopts.showErp ? l.c : '', {
    font: { sz: 7, color: { rgb: '999999' } },
    alignment: { vertical: 'center' },
    border: { left: thin, right: thin, bottom: thin },
  });
}

// ── main export ───────────────────────────────────────────────────────────────

export async function exportExcel(labels: Label[], cfg: AppConfig): Promise<void> {
  const wb = XLSXStyle.utils.book_new();

  // ── Sheet 1: Visual label grid ────────────────────────────────────────────
  const wsGrid: Record<string, unknown> = {};
  const merges: { s: { r: number; c: number }; e: { r: number; c: number } }[] = [];
  const rowHeights: { hpt: number }[] = [];
  const totalCols = LABELS_PER_ROW * (COLS_PER_LABEL + GAP_COL);
  const colWidths = Array.from({ length: totalCols }, (_, i) => {
    const posInGroup = i % (COLS_PER_LABEL + GAP_COL);
    return posInGroup < COLS_PER_LABEL ? { wch: 14 } : { wch: 2 };
  });

  // Title row
  const today = new Date().toLocaleDateString('pt-PT');
  const titleText = `Etiquetas de Preços — ${today}  (${labels.length} etiqueta${labels.length !== 1 ? 's' : ''})`;
  wsGrid[ref(0, 0)] = {
    v: titleText, t: 's',
    s: { font: { bold: true, sz: 14, color: { rgb: '1A3A6A' } }, alignment: { vertical: 'center' } },
  };
  merges.push({ s: { r: 0, c: 0 }, e: { r: 0, c: totalCols - 1 } });
  rowHeights[0] = { hpt: 28 };

  // Render labels in grid
  const chunks: Label[][] = [];
  for (let i = 0; i < labels.length; i += LABELS_PER_ROW) chunks.push(labels.slice(i, i + LABELS_PER_ROW));

  chunks.forEach((chunk, chunkIdx) => {
    chunk.forEach((label, colIdx) => {
      renderLabel(wsGrid, merges, rowHeights, label, cfg, labelRow(chunkIdx), labelCol(colIdx));
    });
  });

  // Set sheet range
  const lastRow = labelRow(chunks.length - 1) + ROWS_PER_LABEL - 1;
  wsGrid['!ref'] = XLSXStyle.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: lastRow, c: totalCols - 1 } });
  wsGrid['!merges'] = merges;
  wsGrid['!cols'] = colWidths;
  wsGrid['!rows'] = rowHeights;

  XLSXStyle.utils.book_append_sheet(wb, wsGrid, 'Etiquetas');

  // ── Sheet 2: Summary ──────────────────────────────────────────────────────
  const headerStyle = {
    font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 10 },
    fill: { fgColor: { rgb: '1A6FBD' } },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: { left: { style: 'thin', color: { rgb: '1A6FBD' } }, right: { style: 'thin', color: { rgb: '1A6FBD' } } },
  };
  const counts: Record<string, number> = {};
  labels.forEach(l => { counts[l.section] = (counts[l.section] ?? 0) + 1; });

  const summaryRows: (string | number)[][] = [
    ['Secção', 'Nº Etiquetas'],
    ...Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([s, n]) => [s, n]),
    ['TOTAL', labels.length],
  ];
  const wsSummary = XLSXStyle.utils.aoa_to_sheet(summaryRows);
  wsSummary['!cols'] = [{ wch: 24 }, { wch: 14 }];
  ['A1', 'B1'].forEach(r => {
    if (wsSummary[r]) (wsSummary[r] as Record<string, unknown>).s = headerStyle;
  });
  Object.keys(counts).forEach((section, i) => {
    const secHex = hex(SECTION_COLORS[section] ?? '#2c3e50');
    const cellRef = XLSXStyle.utils.encode_cell({ r: i + 1, c: 0 });
    if (wsSummary[cellRef]) {
      (wsSummary[cellRef] as Record<string, unknown>).s = {
        fill: { fgColor: { rgb: secHex } },
        font: { color: { rgb: 'FFFFFF' }, bold: true },
      };
    }
  });
  XLSXStyle.utils.book_append_sheet(wb, wsSummary, 'Resumo');

  // ── Guardar e abrir ───────────────────────────────────────────────────────
  const defaultName = `etiquetas_${new Date().toISOString().split('T')[0]}.xlsx`;
  const wbout: Uint8Array = XLSXStyle.write(wb, { bookType: 'xlsx', type: 'array' });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const api = (window as any).electronAPI;
  if (api?.saveExcelDialog) {
    const filePath: string | null = await api.saveExcelDialog(defaultName);
    if (!filePath) return;
    await api.writeFile(filePath, wbout.buffer);
    await api.openPath(filePath);
  } else {
    const blob = new Blob([wbout.buffer as ArrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
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
