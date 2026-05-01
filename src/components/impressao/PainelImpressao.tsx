import type { AppConfig, MarginKey, SizeKey } from '../../types/config';
import { SIZES } from '../../constants/sizes';

interface Props {
  cfg: AppConfig;
  labelCount: number;
  setConfig: (patch: Partial<AppConfig>) => void;
}

const MARGIN_LABELS: Record<MarginKey, string> = {
  '0':   'Nenhuma',
  '0.3': 'Pequena',
  '0.5': 'Normal',
  '1':   'Grande',
};

function estimateSheets(count: number, cols: number, margKey: MarginKey, sizeKey: SizeKey): number {
  if (count === 0) return 0;
  const sz = SIZES[sizeKey];
  const marg = parseFloat(margKey) * 37.8;
  const printH = 1123 - 2 * marg;
  const gap = 8;
  const rows = Math.max(1, Math.floor((printH + gap) / (sz.h + gap)));
  return Math.ceil(count / Math.max(1, rows * cols));
}

export function PainelImpressao({ cfg, labelCount, setConfig }: Props) {
  const sheets = estimateSheets(labelCount, cfg.pcols, cfg.pmarg, cfg.selSize);

  return (
    <div className="space-y-3">
      <div>
        <p className="text-[10px] text-[var(--txt3)] mb-2">Colunas por página</p>
        <div className="flex gap-1">
          {[2, 3, 4, 5, 6].map(n => (
            <button
              key={n}
              onClick={() => setConfig({ pcols: n })}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                cfg.pcols === n
                  ? 'bg-[var(--acc)] text-white'
                  : 'bg-[var(--bg3)] text-[var(--txt2)] hover:bg-[var(--bg)]'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[10px] text-[var(--txt3)] mb-2">Margens</p>
        <div className="grid grid-cols-2 gap-1">
          {(['0', '0.3', '0.5', '1'] as MarginKey[]).map(m => (
            <button
              key={m}
              onClick={() => setConfig({ pmarg: m })}
              className={`py-1.5 text-xs font-medium rounded-lg transition-colors ${
                cfg.pmarg === m
                  ? 'bg-[var(--acc)] text-white'
                  : 'bg-[var(--bg3)] text-[var(--txt2)] hover:bg-[var(--bg)]'
              }`}
            >
              {MARGIN_LABELS[m]}
            </button>
          ))}
        </div>
      </div>

      {/* Orientation */}
      <div>
        <p className="text-[10px] text-[var(--txt3)] mb-2">Orientação</p>
        <div className="flex gap-1">
          {[{ v: true, label: '⬛ Horizontal' }, { v: false, label: '⬜ Vertical' }].map(({ v, label }) => (
            <button
              key={String(v)}
              onClick={() => setConfig({ printLandscape: v })}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                cfg.printLandscape === v
                  ? 'bg-[var(--acc)] text-white'
                  : 'bg-[var(--bg3)] text-[var(--txt2)] hover:bg-[var(--bg)]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Price size */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] text-[var(--txt3)]">Tamanho do preço</p>
          <span className="text-[10px] font-semibold text-[var(--acc)] tabular-nums">
            {cfg.priceSizeAdj > 0 ? '+' : ''}{cfg.priceSizeAdj}px
          </span>
        </div>
        <input
          type="range" min={-16} max={16} step={2}
          value={cfg.priceSizeAdj}
          onChange={e => setConfig({ priceSizeAdj: Number(e.target.value) })}
          className="w-full accent-[var(--acc)]"
        />
      </div>

      {labelCount > 0 && (
        <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-[var(--bg3)]">
          <span className="text-[10px] text-[var(--txt3)]">Estimativa A4</span>
          <span className="text-xs font-semibold text-[var(--txt)] tabular-nums">
            ~{sheets} folha{sheets !== 1 ? 's' : ''}
          </span>
        </div>
      )}
    </div>
  );
}
