import { useState, useEffect } from 'react';
import { X, Pencil, TrendingUp, TrendingDown, Equal, Plus, Minus } from 'lucide-react';
import { SECTIONS } from '../../constants/sections';

const UNITS = ['por unid.', 'por kg', 'por litro', 'por 500g', 'por fardo', 'por caixa', 'por par', 'por m²'];

interface Fields {
  section: string;
  store: string;
  unit: string;
  brand: string;
}
type FieldKey = keyof Fields;

type PriceOpType = 'percent_up' | 'percent_down' | 'fixed_set' | 'fixed_up' | 'fixed_down';
type RoundTo = 1 | 10 | 50 | 100;

export interface PriceOp {
  type: PriceOpType;
  value: number;
  roundTo: RoundTo;
}

export interface BulkChanges extends Partial<Fields> {
  priceOp?: PriceOp;
}

interface Props {
  count: number;
  onApply: (changes: BulkChanges) => void;
  onClose: () => void;
}

const inputCls = 'w-full px-3 py-2 text-sm bg-[var(--inp)] border border-[var(--bdr)] rounded-lg text-[var(--txt)] placeholder:text-[var(--txt3)] focus:outline-none focus:border-[var(--acc)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed';

const FIELD_DEFS: { key: FieldKey; label: string; type: 'text' | 'select'; options?: string[] }[] = [
  { key: 'section', label: 'Secção',  type: 'select', options: SECTIONS },
  { key: 'store',   label: 'Loja',    type: 'text' },
  { key: 'unit',    label: 'Unidade', type: 'select', options: UNITS },
  { key: 'brand',   label: 'Marca',   type: 'text' },
];

const PRICE_OPS: { type: PriceOpType; label: string; icon: React.ReactNode; placeholder: string }[] = [
  { type: 'percent_up',   label: '+ %',      icon: <TrendingUp size={12} />,   placeholder: 'ex: 10' },
  { type: 'percent_down', label: '− %',      icon: <TrendingDown size={12} />, placeholder: 'ex: 5'  },
  { type: 'fixed_set',    label: '= valor',  icon: <Equal size={12} />,        placeholder: 'ex: 500' },
  { type: 'fixed_up',     label: '+ fixo',   icon: <Plus size={12} />,         placeholder: 'ex: 50' },
  { type: 'fixed_down',   label: '− fixo',   icon: <Minus size={12} />,        placeholder: 'ex: 50' },
];

const ROUND_OPTS: { v: RoundTo; label: string }[] = [
  { v: 1,   label: '1$'   },
  { v: 10,  label: '10$'  },
  { v: 50,  label: '50$'  },
  { v: 100, label: '100$' },
];

export function applyPriceOp(price: number, op: PriceOp): number {
  let n = price;
  if (op.type === 'percent_up')   n = price * (1 + op.value / 100);
  if (op.type === 'percent_down') n = price * (1 - op.value / 100);
  if (op.type === 'fixed_set')    n = op.value;
  if (op.type === 'fixed_up')     n = price + op.value;
  if (op.type === 'fixed_down')   n = price - op.value;
  if (op.roundTo > 1) n = Math.round(n / op.roundTo) * op.roundTo;
  return Math.max(1, Math.round(n));
}

function fmt(n: number) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + '$';
}

export function BulkEditModal({ count, onApply, onClose }: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const [enabled, setEnabled] = useState<Record<FieldKey, boolean>>({
    section: false, store: false, unit: false, brand: false,
  });
  const [values, setValues] = useState<Fields>({
    section: SECTIONS[0], store: '', unit: UNITS[0], brand: '',
  });

  // Price op state
  const [priceEnabled, setPriceEnabled]   = useState(false);
  const [priceOpType, setPriceOpType]     = useState<PriceOpType>('percent_up');
  const [priceValue, setPriceValue]       = useState('');
  const [roundTo, setRoundTo]             = useState<RoundTo>(1);

  function toggleField(key: FieldKey) {
    setEnabled(prev => ({ ...prev, [key]: !prev[key] }));
  }

  const priceNum = parseFloat(priceValue) || 0;
  const priceOpValid = priceEnabled && priceNum > 0;
  const examplePrice = 850;
  const exampleResult = priceOpValid
    ? applyPriceOp(examplePrice, { type: priceOpType, value: priceNum, roundTo })
    : null;

  function handleApply() {
    const changes: BulkChanges = {};
    (Object.keys(enabled) as FieldKey[]).forEach(k => {
      if (enabled[k]) changes[k] = values[k];
    });
    if (priceOpValid) {
      changes.priceOp = { type: priceOpType, value: priceNum, roundTo };
    }
    if (Object.keys(changes).length === 0) { onClose(); return; }
    onApply(changes);
    onClose();
  }

  const activeCount = Object.values(enabled).filter(Boolean).length + (priceOpValid ? 1 : 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[var(--bg2)] border border-[var(--bdr)] rounded-2xl shadow-2xl w-full max-w-sm max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--bdr)] flex-shrink-0">
          <div>
            <h2 className="text-sm font-semibold text-[var(--txt)]">Editar em lote</h2>
            <p className="text-xs text-[var(--txt3)] mt-0.5">
              {count} etiqueta{count !== 1 ? 's' : ''} selecionada{count !== 1 ? 's' : ''}
            </p>
          </div>
          <button onClick={onClose} className="text-[var(--txt3)] hover:text-[var(--txt)] p-1 -mr-1 rounded-lg hover:bg-[var(--bg3)] transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-4">
          <p className="text-xs text-[var(--txt3)]">Ativa os campos que queres alterar. Os desativados ficam inalterados.</p>

          {/* Text / select fields */}
          {FIELD_DEFS.map(({ key, label, type, options }) => (
            <div key={key} className="flex items-center gap-3">
              <button
                onClick={() => toggleField(key)}
                className={`flex-shrink-0 w-8 h-8 rounded-lg border transition-colors flex items-center justify-center ${
                  enabled[key]
                    ? 'bg-[var(--acc)] border-[var(--acc)] text-white'
                    : 'border-[var(--bdr)] text-[var(--txt3)] hover:border-[var(--bdr2)]'
                }`}
              >
                <Pencil size={12} />
              </button>
              <div className="flex-1">
                <label className="block text-xs font-medium text-[var(--txt2)] mb-1">{label}</label>
                {type === 'select' ? (
                  <select value={values[key]} onChange={e => setValues(p => ({ ...p, [key]: e.target.value }))} disabled={!enabled[key]} className={inputCls}>
                    {options!.map(o => <option key={o}>{o}</option>)}
                  </select>
                ) : (
                  <input type="text" value={values[key]} onChange={e => setValues(p => ({ ...p, [key]: e.target.value }))} disabled={!enabled[key]} placeholder={`Nova ${label.toLowerCase()}…`} className={inputCls} />
                )}
              </div>
            </div>
          ))}

          {/* Divider */}
          <div className="border-t border-[var(--bdr)] pt-3">
            <div className="flex items-center gap-3 mb-3">
              <button
                onClick={() => setPriceEnabled(p => !p)}
                className={`flex-shrink-0 w-8 h-8 rounded-lg border transition-colors flex items-center justify-center ${
                  priceEnabled
                    ? 'bg-[var(--acc2)] border-[var(--acc2)] text-white'
                    : 'border-[var(--bdr)] text-[var(--txt3)] hover:border-[var(--bdr2)]'
                }`}
              >
                <TrendingUp size={12} />
              </button>
              <span className="text-xs font-medium text-[var(--txt2)]">Actualizar preços</span>
            </div>

            {priceEnabled && (
              <div className="space-y-3 pl-11">
                {/* Operation type */}
                <div className="flex flex-wrap gap-1.5">
                  {PRICE_OPS.map(op => (
                    <button
                      key={op.type}
                      onClick={() => setPriceOpType(op.type)}
                      className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-lg border transition-colors ${
                        priceOpType === op.type
                          ? 'bg-[var(--acc2)]/15 border-[var(--acc2)] text-[var(--acc2)]'
                          : 'border-[var(--bdr)] text-[var(--txt3)] hover:border-[var(--bdr2)]'
                      }`}
                    >
                      {op.icon}{op.label}
                    </button>
                  ))}
                </div>

                {/* Value input */}
                <input
                  type="number"
                  min="0"
                  value={priceValue}
                  onChange={e => setPriceValue(e.target.value)}
                  placeholder={PRICE_OPS.find(o => o.type === priceOpType)?.placeholder}
                  className={inputCls}
                />

                {/* Rounding */}
                <div>
                  <p className="text-[10px] text-[var(--txt3)] mb-1.5">Arredondar para</p>
                  <div className="flex gap-1.5">
                    {ROUND_OPTS.map(r => (
                      <button
                        key={r.v}
                        onClick={() => setRoundTo(r.v)}
                        className={`flex-1 py-1 text-[11px] font-medium rounded-lg border transition-colors ${
                          roundTo === r.v
                            ? 'bg-[var(--bg3)] border-[var(--bdr2)] text-[var(--txt)]'
                            : 'border-[var(--bdr)] text-[var(--txt3)]'
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preview */}
                {exampleResult !== null && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--bg3)] text-[11px]">
                    <span className="text-[var(--txt3)]">Ex:</span>
                    <span className="text-[var(--txt2)] line-through">{fmt(examplePrice)}</span>
                    <span className="text-[var(--txt3)]">→</span>
                    <span className={`font-bold ${exampleResult > examplePrice ? 'text-emerald-400' : exampleResult < examplePrice ? 'text-red-400' : 'text-[var(--txt)]'}`}>
                      {fmt(exampleResult)}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-5 pb-5 pt-3 border-t border-[var(--bdr)] flex-shrink-0">
          <button onClick={onClose} className="flex-1 px-4 py-2 text-sm font-medium border border-[var(--bdr)] text-[var(--txt2)] rounded-xl hover:bg-[var(--bg3)] transition-colors">
            Cancelar
          </button>
          <button
            onClick={handleApply}
            disabled={activeCount === 0}
            className="flex-1 px-4 py-2 text-sm font-semibold bg-[var(--acc)] text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {activeCount > 0 ? `Aplicar ${activeCount} campo${activeCount !== 1 ? 's' : ''}` : 'Aplicar'}
          </button>
        </div>
      </div>
    </div>
  );
}
