import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Label } from '../../types/label';
import { SECTIONS } from '../../constants/sections';

const UNITS = ['por unid.', 'por kg', 'por litro', 'por 500g', 'por fardo', 'por caixa', 'por par', 'por m²'];

type FormData = Omit<Label, 'id' | 'createdAt'>;

interface Props {
  label: Label | null;
  onSave: (data: FormData, qty: number) => void;
  onClose: () => void;
}

function blank(): FormData {
  return { c: '', name: '', brand: '', price: 0, oldPrice: 0, unit: 'por unid.', section: 'Mercearia', store: 'Minimarket' };
}

const inputCls = 'w-full px-3 py-2 text-sm bg-[var(--inp)] border border-[var(--bdr)] rounded-lg text-[var(--txt)] placeholder:text-[var(--txt3)] focus:outline-none focus:border-[var(--acc)] transition-colors';

export function EditModal({ label, onSave, onClose }: Props) {
  const isNew = label === null;
  const [form, setForm] = useState<FormData>(label ? { c: label.c, name: label.name, brand: label.brand, price: label.price, oldPrice: label.oldPrice, unit: label.unit, section: label.section, store: label.store } : blank());
  const [qty, setQty] = useState(1);

  useEffect(() => {
    setForm(label ? { c: label.c, name: label.name, brand: label.brand, price: label.price, oldPrice: label.oldPrice, unit: label.unit, section: label.section, store: label.store } : blank());
    setQty(1);
  }, [label]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  function set<K extends keyof FormData>(k: K, v: FormData[K]) {
    setForm(prev => ({ ...prev, [k]: v }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || form.price <= 0) return;
    onSave({ ...form, name: form.name.trim(), brand: form.brand.trim(), store: form.store.trim() }, isNew ? Math.max(1, qty) : 1);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-[var(--bg2)] border border-[var(--bdr)] rounded-2xl shadow-2xl w-full max-w-md"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--bdr)]">
          <h2 className="text-sm font-semibold text-[var(--txt)]">{label ? 'Editar etiqueta' : 'Nova etiqueta'}</h2>
          <button onClick={onClose} className="text-[var(--txt3)] hover:text-[var(--txt)] transition-colors p-1 -mr-1 rounded-lg hover:bg-[var(--bg3)]">
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          {/* Nome */}
          <div>
            <label className="block text-xs font-medium text-[var(--txt2)] mb-1">Produto <span className="text-red-400">*</span></label>
            <input value={form.name} onChange={e => set('name', e.target.value)} maxLength={45} required placeholder="Nome do produto" className={inputCls} autoFocus />
          </div>

          {/* Marca */}
          <div>
            <label className="block text-xs font-medium text-[var(--txt2)] mb-1">Marca</label>
            <input value={form.brand} onChange={e => set('brand', e.target.value)} maxLength={30} placeholder="Marca / fabricante" className={inputCls} />
          </div>

          {/* Preços */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--txt2)] mb-1">Preço (CVE) <span className="text-red-400">*</span></label>
              <input type="number" min={1} value={form.price || ''} onChange={e => set('price', parseInt(e.target.value) || 0)} required placeholder="850" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--txt2)] mb-1">Preço anterior</label>
              <input type="number" min={0} value={form.oldPrice || ''} onChange={e => set('oldPrice', parseInt(e.target.value) || 0)} placeholder="950" className={inputCls} />
            </div>
          </div>

          {/* Unidade + Secção */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--txt2)] mb-1">Unidade</label>
              <select value={form.unit} onChange={e => set('unit', e.target.value)} className={inputCls}>
                {UNITS.map(u => <option key={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--txt2)] mb-1">Secção</label>
              <select value={form.section} onChange={e => set('section', e.target.value)} className={inputCls}>
                {SECTIONS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Loja + Cod ERP */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--txt2)] mb-1">Loja</label>
              <input value={form.store} onChange={e => set('store', e.target.value)} maxLength={22} placeholder="Minimarket" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--txt2)] mb-1">Cod. ERP</label>
              <input value={form.c} onChange={e => set('c', e.target.value)} placeholder="Auto" className={inputCls} />
            </div>
          </div>

          {/* Quantidade — apenas em modo Nova */}
          {isNew && (
            <div>
              <label className="block text-xs font-medium text-[var(--txt2)] mb-1">Quantidade de etiquetas</label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-[var(--bdr)] text-[var(--txt2)] hover:bg-[var(--bg3)] transition-colors text-base font-medium select-none"
                >
                  −
                </button>
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={qty}
                  onChange={e => setQty(Math.min(99, Math.max(1, parseInt(e.target.value) || 1)))}
                  className="w-16 text-center px-2 py-2 text-sm bg-[var(--inp)] border border-[var(--bdr)] rounded-lg text-[var(--txt)] focus:outline-none focus:border-[var(--acc)] transition-colors tabular-nums"
                />
                <button
                  type="button"
                  onClick={() => setQty(q => Math.min(99, q + 1))}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-[var(--bdr)] text-[var(--txt2)] hover:bg-[var(--bg3)] transition-colors text-base font-medium select-none"
                >
                  +
                </button>
                {qty > 1 && (
                  <span className="text-xs text-[var(--txt3)] ml-1">
                    Cria {qty} etiquetas idênticas
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 text-sm font-medium border border-[var(--bdr)] text-[var(--txt2)] rounded-xl hover:bg-[var(--bg3)] transition-colors">
              Cancelar
            </button>
            <button type="submit" className="flex-1 px-4 py-2 text-sm font-semibold bg-[var(--acc)] text-white rounded-xl hover:opacity-90 transition-opacity">
              {isNew ? (qty > 1 ? `Adicionar ${qty}` : 'Adicionar') : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
