import { RIBBONS } from '../../constants/ribbons';

interface Props {
  ribbon: string;
  ribColor: string;
  onRibbon: (v: string) => void;
  onColor: (c: string) => void;
}

export function RibbonPicker({ ribbon, ribColor, onRibbon, onColor }: Props) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {RIBBONS.map(r => (
          <button
            key={r.v}
            type="button"
            onClick={() => onRibbon(r.v)}
            className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg border transition-all ${ribbon === r.v ? 'border-[var(--acc)] bg-[var(--acc)] text-white' : 'border-[var(--bdr)] text-[var(--txt2)] hover:border-[var(--bdr2)] bg-[var(--bg3)]'}`}
          >
            {r.label}
          </button>
        ))}
      </div>
      {ribbon && (
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={ribColor}
            onChange={e => onColor(e.target.value)}
            className="w-8 h-8 rounded cursor-pointer border border-[var(--bdr)] bg-transparent p-0.5"
          />
          <span className="text-xs text-[var(--txt3)]">Cor do ribbon</span>
          <div className="flex-1 h-5 rounded" style={{ background: ribColor }} />
        </div>
      )}
    </div>
  );
}
