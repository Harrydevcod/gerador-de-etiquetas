import { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, X, Check, AlertCircle, ChevronRight } from 'lucide-react';
import type { Label } from '../../types/label';
import { SECTIONS } from '../../constants/sections';

type FieldKey = 'name' | 'price' | 'brand' | 'oldPrice' | 'unit' | 'section' | 'store' | 'c';

interface FieldSpec { label: string; required: boolean }

const FIELDS: Record<FieldKey, FieldSpec> = {
  name:     { label: 'Produto',         required: true  },
  price:    { label: 'Preço',           required: true  },
  brand:    { label: 'Marca',           required: false },
  oldPrice: { label: 'Preço anterior',  required: false },
  unit:     { label: 'Unidade',         required: false },
  section:  { label: 'Secção',          required: false },
  store:    { label: 'Loja',            required: false },
  c:        { label: 'Cod. ERP',        required: false },
};

const ALIASES: Record<FieldKey, string[]> = {
  name:     ['produto', 'name', 'nome', 'artigo', 'description', 'item'],
  price:    ['preço', 'preco', 'price', 'valor', 'pvp'],
  brand:    ['marca', 'brand', 'fabricante', 'manufacturer', 'fornecedor'],
  oldPrice: ['preço anterior', 'preco anterior', 'old price', 'promo', 'desconto'],
  unit:     ['unidade', 'unit', 'und', 'un', 'tipo'],
  section:  ['secção', 'seccao', 'section', 'categoria', 'category', 'departamento'],
  store:    ['loja', 'store', 'estabelecimento', 'mercado'],
  c:        ['cod erp', 'codigo erp', 'erp', 'code', 'sku', 'ref', 'referencia'],
};

function autoDetect(headers: string[]): Partial<Record<FieldKey, string>> {
  const mapping: Partial<Record<FieldKey, string>> = {};
  for (const [field, aliases] of Object.entries(ALIASES) as [FieldKey, string[]][]) {
    const match = headers.find(h => aliases.some(a => h.toLowerCase().trim() === a));
    if (match) mapping[field] = match;
  }
  return mapping;
}

async function parseFile(file: File): Promise<{ headers: string[]; rows: Record<string, string>[] }> {
  // SheetJS (via xlsx-js-style, o mesmo fork usado no export) carregado sob
  // demanda — só quando o utilizador importa, fora do chunk inicial.
  const XLSX = (await import('xlsx-js-style')).default;
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const data = e.target?.result;
        const wb = XLSX.read(data, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json<Record<string, string>>(ws, { defval: '' });
        if (!json.length) { reject(new Error('Ficheiro vazio ou sem dados')); return; }
        const headers = Object.keys(json[0]);
        resolve({ headers, rows: json as Record<string, string>[] });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Erro ao ler ficheiro'));
    reader.readAsBinaryString(file);
  });
}

interface Props {
  onImport: (labels: Omit<Label, 'id' | 'createdAt'>[]) => void;
  onClose: () => void;
}

type Step = 'drop' | 'map' | 'done';

const inputCls = 'w-full px-2.5 py-1.5 text-xs bg-[var(--inp)] border border-[var(--bdr)] rounded-lg text-[var(--txt)] focus:outline-none focus:border-[var(--acc)] transition-colors';

export function ImportExcel({ onImport, onClose }: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const [step, setStep] = useState<Step>('drop');
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [mapping, setMapping] = useState<Partial<Record<FieldKey, string>>>({});
  const [report, setReport] = useState<{ imported: number; skipped: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError('');
    try {
      const { headers: h, rows: r } = await parseFile(file);
      setHeaders(h);
      setRows(r);
      setMapping(autoDetect(h));
      setStep('map');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao processar ficheiro');
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  // handleFile only closes over stable setState setters — safe to omit
  }, []);

  function setMap(field: FieldKey, col: string) {
    setMapping(prev => ({ ...prev, [field]: col || undefined }));
  }

  function doImport() {
    const results: Omit<Label, 'id' | 'createdAt'>[] = [];
    let skipped = 0;

    for (const row of rows) {
      const nameCol = mapping.name ? row[mapping.name] : '';
      const priceCol = mapping.price ? row[mapping.price] : '';
      const name = String(nameCol ?? '').trim();
      const price = parseInt(String(priceCol).replace(/\D/g, ''), 10);
      if (!name || !price) { skipped++; continue; }

      results.push({
        c:        mapping.c        ? String(row[mapping.c]        ?? '').trim() : '',
        name,
        brand:    mapping.brand    ? String(row[mapping.brand]    ?? '').trim() : '',
        price,
        oldPrice: mapping.oldPrice ? parseInt(String(row[mapping.oldPrice]).replace(/\D/g, ''), 10) || 0 : 0,
        unit:     mapping.unit     ? String(row[mapping.unit]     ?? '').trim() || 'unid.' : 'unid.',
        section:  mapping.section && SECTIONS.includes(String(row[mapping.section])) ? String(row[mapping.section]) : '',
        store:    mapping.store    ? String(row[mapping.store]    ?? '').trim() : '',
      });
    }

    onImport(results);
    setReport({ imported: results.length, skipped });
    setStep('done');
  }

  const preview = rows.slice(0, 5);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[var(--bg2)] border border-[var(--bdr)] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--bdr)] flex-shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-[var(--txt)]">Importar Excel</h2>
            {step !== 'drop' && (
              <span className="flex items-center gap-1 text-[10px] text-[var(--txt3)]">
                <span className={step === 'map' ? 'text-[var(--acc)]' : 'text-[var(--txt3)]'}>Mapear colunas</span>
                <ChevronRight size={10} />
                <span className={step === 'done' ? 'text-[var(--acc)]' : 'text-[var(--txt3)]'}>Resultado</span>
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-[var(--txt3)] hover:bg-[var(--bg3)] hover:text-[var(--txt)] transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">

          {/* Step 1: Drop zone */}
          {step === 'drop' && (
            <div>
              <div
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={`flex flex-col items-center justify-center gap-3 p-10 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${dragging ? 'border-[var(--acc)] bg-[var(--acc)]/5' : 'border-[var(--bdr2)] hover:border-[var(--acc)] hover:bg-[var(--bg3)]'}`}
              >
                <Upload size={32} className="text-[var(--txt3)]" />
                <div className="text-center">
                  <p className="text-sm font-medium text-[var(--txt)]">Arrasta ou clica para seleccionar</p>
                  <p className="text-xs text-[var(--txt3)] mt-1">Suporta .xlsx, .xls, .csv</p>
                </div>
              </div>
              <input ref={inputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }} />
              {error && (
                <div className="flex items-center gap-2 mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400">
                  <AlertCircle size={14} />
                  {error}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Map */}
          {step === 'map' && (
            <div className="space-y-4">
              {/* Column mapping */}
              <div>
                <p className="text-xs font-semibold text-[var(--txt2)] mb-3">Mapeamento de colunas <span className="text-[var(--txt3)] font-normal">({rows.length} linhas detectadas)</span></p>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.entries(FIELDS) as [FieldKey, FieldSpec][]).map(([field, spec]) => (
                    <div key={field}>
                      <label className="block text-[10px] font-medium text-[var(--txt3)] mb-1">
                        {spec.label} {spec.required && <span className="text-red-400">*</span>}
                      </label>
                      <select value={mapping[field] ?? ''} onChange={e => setMap(field, e.target.value)} className={inputCls}>
                        <option value="">— ignorar —</option>
                        {headers.map(h => <option key={h} value={h}>{h}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              {/* Preview */}
              {preview.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-[var(--txt2)] mb-2">Pré-visualização (5 primeiras linhas)</p>
                  <div className="overflow-x-auto rounded-xl border border-[var(--bdr)]">
                    <table className="text-[10px] w-full">
                      <thead>
                        <tr className="bg-[var(--bg3)] border-b border-[var(--bdr)]">
                          {(Object.entries(FIELDS) as [FieldKey, FieldSpec][])
                            .filter(([f]) => mapping[f])
                            .map(([f, spec]) => (
                              <th key={f} className="px-2 py-1.5 text-left text-[var(--txt2)] font-semibold whitespace-nowrap">{spec.label}</th>
                            ))}
                        </tr>
                      </thead>
                      <tbody>
                        {preview.map((row, i) => (
                          <tr key={i} className="border-b border-[var(--bdr)] last:border-0">
                            {(Object.entries(FIELDS) as [FieldKey, FieldSpec][])
                              .filter(([f]) => mapping[f])
                              .map(([f]) => (
                                <td key={f} className="px-2 py-1.5 text-[var(--txt)] max-w-[120px] truncate">{String(row[mapping[f]!] ?? '')}</td>
                              ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Done */}
          {step === 'done' && report && (
            <div className="flex flex-col items-center gap-4 py-6">
              <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center">
                <Check size={28} className="text-green-500" />
              </div>
              <div className="text-center">
                <p className="text-base font-semibold text-[var(--txt)]">{report.imported} etiqueta{report.imported !== 1 ? 's' : ''} importada{report.imported !== 1 ? 's' : ''}</p>
                {report.skipped > 0 && (
                  <p className="text-xs text-[var(--txt3)] mt-1">{report.skipped} linha{report.skipped !== 1 ? 's' : ''} ignorada{report.skipped !== 1 ? 's' : ''} (sem nome ou preço)</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {step === 'map' && (
          <div className="flex gap-3 px-5 pb-5 flex-shrink-0">
            <button onClick={() => setStep('drop')} className="flex-1 px-4 py-2 text-sm border border-[var(--bdr)] text-[var(--txt2)] rounded-xl hover:bg-[var(--bg3)] transition-colors">
              Voltar
            </button>
            <button
              onClick={doImport}
              disabled={!mapping.name || !mapping.price}
              className="flex-1 px-4 py-2 text-sm font-semibold bg-[var(--acc)] text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Gerar etiquetas ({rows.length} linhas)
            </button>
          </div>
        )}
        {step === 'done' && (
          <div className="px-5 pb-5 flex-shrink-0">
            <button onClick={onClose} className="w-full px-4 py-2 text-sm font-semibold bg-[var(--acc)] text-white rounded-xl hover:opacity-90 transition-opacity">
              Fechar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
