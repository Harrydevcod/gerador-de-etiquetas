// Code128-B SVG generator — pure TypeScript, no dependencies
// Encodes ASCII 32–126. Each symbol = 6 elements (bar/space alternating), sum = 11 modules.

const PATTERNS: string[] = [
  '212222','222122','222221','121223','121322','131222','122213','122312',
  '132212','221213','221312','231212','112232','122132','122231','113222',
  '123122','123221','223211','221132','221231','213212','223112','312131',
  '311222','321122','321221','312212','322112','322211','212123','212321',
  '232121','111323','131123','131321','112313','132113','132311','211313',
  '231113','231311','112133','112331','132133','113123','113321','133121',
  '313121','211331','231131','213113','213311','213131','311123','311321',
  '331121','312113','312311','332111','314111','221411','431111','111224',
  '111422','121124','121421','141122','141221','112214','112412','122114',
  '122411','142112','142211','241211','221114','413111','241112','134111',
  '111242','121142','121241','114212','124112','124211','411212','421112',
  '421211','212141','214121','412121','111143','111341','131141','114113',
  '114311','411113','411311','113141','114131','311141','411131','211412',
  '211214','211232',
];
const STOP = '2331112';
const START_B = 104;
const QUIET = 6; // quiet zone modules each side

export function code128Svg(text: string, barH: number, color = '#000'): string {
  const chars = text.split('').filter(c => {
    const n = c.charCodeAt(0);
    return n >= 32 && n <= 126;
  });
  if (chars.length === 0) return '';

  // Build symbol value list: [start_B, ...data, checksum]
  const syms: number[] = [START_B];
  for (const c of chars) syms.push(c.charCodeAt(0) - 32);

  let check = START_B;
  for (let i = 1; i < syms.length; i++) check += i * syms[i];
  syms.push(check % 103);

  // Expand to modules [width, isBar]
  type Seg = [number, boolean];
  const segs: Seg[] = [];

  for (const v of syms) {
    const pat = PATTERNS[v];
    for (let i = 0; i < pat.length; i++) {
      segs.push([parseInt(pat[i]), i % 2 === 0]);
    }
  }
  // Stop
  for (let i = 0; i < STOP.length; i++) {
    segs.push([parseInt(STOP[i]), i % 2 === 0]);
  }

  const totalModules = segs.reduce((s, [w]) => s + w, 0) + QUIET * 2;

  let x = QUIET;
  let rects = '';
  for (const [w, bar] of segs) {
    if (bar) rects += `<rect x="${x}" y="0" width="${w}" height="${barH}"/>`;
    x += w;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalModules}" height="${barH}" viewBox="0 0 ${totalModules} ${barH}" fill="${color}" shape-rendering="crispEdges" style="display:block;max-width:100%;height:auto">${rects}</svg>`;
}
