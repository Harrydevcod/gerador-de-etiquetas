import React from 'react';
import { X, Barcode, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { useToast } from '../../lib/toast';
import type { AppConfig, FontKey, NameAlign } from '../../types/config';
import { FooterOpts }    from './FooterOpts';
import { LogoUpload }    from './LogoUpload';
import { CorPicker }     from './CorPicker';
import { FontPicker }    from './FontPicker';
import { RibbonPicker }  from './RibbonPicker';
import { PainelImpressao } from '../impressao/PainelImpressao';

interface Props {
  cfg: AppConfig;
  open: boolean;
  labelCount: number;
  onClose: () => void;
  setConfig: (patch: Partial<AppConfig>) => void;
  setFopt: (key: keyof AppConfig['fopts'], val: boolean) => void;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-[var(--bdr)] pb-4 mb-4 last:border-0 last:mb-0 last:pb-0">
      <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--txt3)] mb-3">{title}</p>
      {children}
    </div>
  );
}

export function PainelPersonalizar({ cfg, open, labelCount, onClose, setConfig, setFopt }: Props) {
  const { toast } = useToast();
  return (
    <>
      {/* Backdrop */}
      {open && <div className="fixed inset-0 z-30 bg-black/20 backdrop-blur-[1px] no-print" onClick={onClose} />}

      {/* Panel */}
      <aside
        className={`no-print fixed top-0 right-0 z-40 h-full w-72 bg-[var(--bg2)] border-l border-[var(--bdr)] shadow-2xl flex flex-col transition-transform duration-200 ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-[var(--bdr)] flex-shrink-0">
          <span className="text-sm font-semibold text-[var(--txt)]">Personalizar</span>
          <button onClick={onClose} className="p-1 rounded-lg text-[var(--txt3)] hover:bg-[var(--bg3)] hover:text-[var(--txt)] transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-0">

          <Section title="Cor do cabeçalho">
            <CorPicker
              useCC={cfg.useCC}
              customC={cfg.customC}
              onToggle={v => setConfig({ useCC: v })}
              onColor={c => setConfig({ customC: c })}
            />
          </Section>

          <Section title="Tipografia">
            <FontPicker selFont={cfg.selFont} onChange={(f: FontKey) => setConfig({ selFont: f })} />
          </Section>

          <Section title="Texto do produto">
            <div className="space-y-2.5">
              <div>
                <p className="text-[10px] text-[var(--txt3)] mb-1.5">Tamanho</p>
                <div className="flex gap-1">
                  {([-2,-1,0,1,2,3] as number[]).map(n => (
                    <button key={n} onClick={() => setConfig({ nameSizeAdj: n })}
                      className={`flex-1 py-1 text-xs font-medium rounded-lg transition-colors ${cfg.nameSizeAdj === n ? 'bg-[var(--acc)] text-white' : 'bg-[var(--bg3)] text-[var(--txt2)] hover:bg-[var(--bg)]'}`}>
                      {n > 0 ? `+${n}` : n}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <p className="text-[10px] text-[var(--txt3)] mb-1.5">Estilo</p>
                  <div className="flex gap-1">
                    <button onClick={() => setConfig({ nameBold: !cfg.nameBold })}
                      className={`flex-1 py-1.5 text-xs font-black rounded-lg transition-colors ${cfg.nameBold ? 'bg-[var(--acc)] text-white' : 'bg-[var(--bg3)] text-[var(--txt2)] hover:bg-[var(--bg)]'}`}>B</button>
                    <button onClick={() => setConfig({ nameItalic: !cfg.nameItalic })}
                      className={`flex-1 py-1.5 text-xs italic font-semibold rounded-lg transition-colors ${cfg.nameItalic ? 'bg-[var(--acc)] text-white' : 'bg-[var(--bg3)] text-[var(--txt2)] hover:bg-[var(--bg)]'}`}>I</button>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-[10px] text-[var(--txt3)] mb-1.5">Alinhamento</p>
                  <div className="flex gap-1">
                    {([['left', AlignLeft], ['center', AlignCenter], ['right', AlignRight]] as [NameAlign, React.ElementType][]).map(([val, Icon]) => (
                      <button key={val} onClick={() => setConfig({ nameAlign: val })}
                        className={`flex-1 py-1.5 flex items-center justify-center rounded-lg transition-colors ${cfg.nameAlign === val ? 'bg-[var(--acc)] text-white' : 'bg-[var(--bg3)] text-[var(--txt2)] hover:bg-[var(--bg)]'}`}>
                        <Icon size={12} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Section>

          <Section title="Ribbon">
            <RibbonPicker
              ribbon={cfg.ribbon}
              ribColor={cfg.ribColor}
              onRibbon={v => setConfig({ ribbon: v })}
              onColor={c => setConfig({ ribColor: c })}
            />
          </Section>

          <Section title="Logo da loja">
            <LogoUpload logoB64={cfg.logoB64} onChange={b64 => setConfig({ logoB64: b64 })} onError={msg => toast(msg, 'error')} />
          </Section>

          <Section title="Impressão">
            <PainelImpressao cfg={cfg} labelCount={labelCount} setConfig={setConfig} />
          </Section>

          <Section title="Elementos visíveis">
            <FooterOpts fopts={cfg.fopts} onChange={setFopt} />
            <label className="flex items-center justify-between cursor-pointer py-1 mt-1">
              <span className="text-xs text-[var(--txt2)] flex items-center gap-1.5">
                <Barcode size={12} className="text-[var(--txt3)]" />
                Código de barras
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={cfg.showBC}
                onClick={() => setConfig({ showBC: !cfg.showBC })}
                className={`relative w-9 h-5 rounded-full transition-colors ${cfg.showBC ? 'bg-[var(--acc)]' : 'bg-[var(--bdr2)]'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${cfg.showBC ? 'translate-x-4' : 'translate-x-0'}`} />
              </button>
            </label>
          </Section>

        </div>
      </aside>
    </>
  );
}
