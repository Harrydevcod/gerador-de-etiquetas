import type { FontKey } from '../../types/config';
import { FONTS } from '../../constants/fonts';

interface Props {
  selFont: FontKey;
  onChange: (f: FontKey) => void;
}

export function FontPicker({ selFont, onChange }: Props) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {(Object.entries(FONTS) as [FontKey, typeof FONTS[FontKey]][]).map(([key, { label, family, sample }]) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className={`p-2.5 rounded-xl border text-left transition-all ${selFont === key ? 'border-[var(--acc)] bg-[var(--acc)]/10' : 'border-[var(--bdr)] hover:border-[var(--bdr2)] bg-[var(--bg3)]'}`}
        >
          <div className="text-[13px] font-semibold text-[var(--txt)]" style={{ fontFamily: family }}>{sample}</div>
          <div className="text-[10px] text-[var(--txt3)] mt-0.5">{label}</div>
        </button>
      ))}
    </div>
  );
}
