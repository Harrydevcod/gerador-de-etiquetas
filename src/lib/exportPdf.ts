import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { Label } from '../types/label';
import type { AppConfig } from '../types/config';
import { SIZES } from '../constants/sizes';
import { renderLabel } from '../renderers';
import { rbn } from '../renderers/helpers';

export async function exportPdf(labels: Label[], cfg: AppConfig): Promise<void> {
  const isLandscape = cfg.printLandscape;
  const ribbonHtml = rbn(cfg);
  const s = SIZES[cfg.selSize];

  await document.fonts.ready;

  const gap_px = 8;
  const margin_px = parseFloat(cfg.pmarg) * 37.795; // cm → px @96dpi

  // Container width = exactly pcols labels + gaps + margins
  // so flex-wrap breaks at the right column count
  const contentW_px = cfg.pcols * s.w + (cfg.pcols - 1) * gap_px;
  const containerW_px = contentW_px + 2 * margin_px;

  // Wrapper: zero-size clipping box — html2canvas captures inner at full opacity
  const wrapper = document.createElement('div');
  wrapper.style.cssText = [
    'position:fixed', 'left:0', 'top:0',
    'width:0', 'height:0', 'overflow:hidden',
    'z-index:2147483647',
  ].join(';');

  const container = document.createElement('div');
  container.style.cssText = [
    `width:${containerW_px}px`,
    'background:white',
    'display:flex',
    'flex-wrap:wrap',
    'align-content:flex-start',
    `gap:${gap_px}px`,
    `padding:${margin_px}px`,
    'box-sizing:border-box',
  ].join(';');

  labels.forEach(l => {
    const cell = document.createElement('div');
    // Width + flex-shrink only — the label root HTML already has its own
    // width/height/overflow:hidden, so we don't double-clip and lose 1-2px
    cell.style.cssText = [
      `width:${s.w}px`,
      'flex-shrink:0',
      'position:relative',
      'line-height:0',
    ].join(';');
    cell.innerHTML = renderLabel(l, cfg.selSize, cfg) + ribbonHtml;
    container.appendChild(cell);
  });

  wrapper.appendChild(container);
  document.body.appendChild(wrapper);

  // Two rAF: layout + font paint
  await new Promise<void>(r => requestAnimationFrame(() => requestAnimationFrame(() => r())));

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      scrollX: 0,
      scrollY: 0,
      windowWidth: containerW_px,
      windowHeight: container.scrollHeight,
    });

    // containerW_px maps to A4 page width (we scale-fit to A4)
    const pageW_mm = isLandscape ? 297 : 210;
    const pageH_mm = isLandscape ? 210 : 297;

    // px/mm: canvas.width (= containerW_px * scale) ↔ pageW_mm
    const pxPerMm = canvas.width / pageW_mm;
    const totalH_mm = canvas.height / pxPerMm;

    const pdf = new jsPDF({
      orientation: isLandscape ? 'landscape' : 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    let yMm = 0;
    let firstPage = true;

    while (yMm < totalH_mm) {
      if (!firstPage) pdf.addPage();
      firstPage = false;

      const sliceH_mm = Math.min(pageH_mm, totalH_mm - yMm);
      const srcY = Math.round(yMm * pxPerMm);
      const srcH = Math.min(Math.round(sliceH_mm * pxPerMm), canvas.height - srcY);
      if (srcH <= 0) break;

      const slice = document.createElement('canvas');
      slice.width = canvas.width;
      slice.height = srcH;
      const ctx = slice.getContext('2d')!;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, slice.width, slice.height);
      ctx.drawImage(canvas, 0, srcY, canvas.width, srcH, 0, 0, canvas.width, srcH);

      pdf.addImage(slice.toDataURL('image/png'), 'PNG', 0, 0, pageW_mm, sliceH_mm);

      yMm += pageH_mm;
    }

    const fileName = `etiquetas_${new Date().toISOString().split('T')[0]}.pdf`;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const api = (window as any).electronAPI;
    if (api?.savePdfDialog) {
      const filePath: string | null = await api.savePdfDialog(fileName);
      if (!filePath) return;
      await api.writeFile(filePath, pdf.output('arraybuffer'));
      await api.openPath(filePath);
    } else {
      pdf.save(fileName);
    }
  } finally {
    document.body.removeChild(wrapper);
  }
}
