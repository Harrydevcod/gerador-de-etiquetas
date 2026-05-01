interface Props {
  useCC: boolean;
  customC: string;
  onToggle: (v: boolean) => void;
  onColor: (c: string) => void;
}

export function CorPicker({ useCC, customC, onToggle, onColor }: Props) {
  return (
    <div className="space-y-2">
      <label className="flex items-center justify-between cursor-pointer">
        <span className="text-xs text-[var(--txt2)]">Cor personalizada</span>
        <button
          type="button"
          role="switch"
          aria-checked={useCC}
          onClick={() => onToggle(!useCC)}
          className={`relative w-9 h-5 rounded-full transition-colors ${useCC ? 'bg-[var(--acc)]' : 'bg-[var(--bdr2)]'}`}
        >
          <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${useCC ? 'translate-x-4' : 'translate-x-0'}`} />
        </button>
      </label>
      {useCC && (
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={customC}
            onChange={e => onColor(e.target.value)}
            className="w-8 h-8 rounded cursor-pointer border border-[var(--bdr)] bg-transparent p-0.5"
          />
          <span className="text-xs font-mono text-[var(--txt3)]">{customC}</span>
          <div className="flex-1 h-5 rounded" style={{ background: customC }} />
        </div>
      )}
    </div>
  );
}
