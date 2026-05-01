import { useRef } from 'react';
import { ImagePlus, X } from 'lucide-react';

interface Props {
  logoB64: string;
  onChange: (b64: string) => void;
  onError?: (msg: string) => void;
}

const MAX_BYTES = 600 * 1024;

export function LogoUpload({ logoB64, onChange, onError }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    if (!file.type.match(/image\/(png|svg\+xml|jpeg|webp)/)) return;
    if (file.size > MAX_BYTES) { onError?.('Imagem muito grande (máx. 600 KB)'); return; }
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result as string);
    reader.readAsDataURL(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  if (logoB64) {
    return (
      <div className="flex items-center gap-3 p-2 border border-[var(--bdr)] rounded-xl bg-[var(--bg3)]">
        <img src={logoB64} alt="logo" className="h-10 max-w-[80px] object-contain rounded" />
        <span className="flex-1 text-xs text-[var(--txt3)]">Logo carregado</span>
        <button onClick={() => onChange('')} className="p-1 text-[var(--txt3)] hover:text-red-400 transition-colors">
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={e => e.preventDefault()}
      onDrop={handleDrop}
      className="flex flex-col items-center justify-center gap-2 p-4 border-2 border-dashed border-[var(--bdr2)] rounded-xl cursor-pointer hover:border-[var(--acc)] hover:bg-[var(--bg3)] transition-colors"
    >
      <ImagePlus size={20} className="text-[var(--txt3)]" />
      <span className="text-xs text-[var(--txt3)] text-center">Clica ou arrasta PNG/SVG/JPG<br /><span className="text-[10px]">máx. 600 KB</span></span>
      <input ref={inputRef} type="file" accept="image/png,image/svg+xml,image/jpeg,image/webp" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }} />
    </div>
  );
}
