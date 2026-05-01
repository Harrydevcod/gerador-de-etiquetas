import type { AppConfig } from '../../types/config';

interface Props {
  fopts: AppConfig['fopts'];
  onChange: (key: keyof AppConfig['fopts'], val: boolean) => void;
}

const OPTS: { key: keyof AppConfig['fopts']; label: string }[] = [
  { key: 'showBrand', label: 'Marca'         },
  { key: 'showErp',   label: 'Cod. ERP'      },
  { key: 'showSec',   label: 'Secção'        },
  { key: 'showUnit',  label: 'Unidade'       },
  { key: 'showStore', label: 'Nome da loja'  },
];

export function FooterOpts({ fopts, onChange }: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      {OPTS.map(({ key, label }) => (
        <label key={key} className="flex items-center justify-between cursor-pointer py-1">
          <span className="text-xs text-[var(--txt2)]">{label}</span>
          <button
            type="button"
            role="switch"
            aria-checked={fopts[key]}
            onClick={() => onChange(key, !fopts[key])}
            className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${fopts[key] ? 'bg-[var(--acc)]' : 'bg-[var(--bdr2)]'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${fopts[key] ? 'translate-x-4' : 'translate-x-0'}`} />
          </button>
        </label>
      ))}
    </div>
  );
}
