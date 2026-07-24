import { useState, useEffect } from 'react';
import type { Label } from '../types/label';

// Orquestração de impressão controlada: enfileira etiquetas, espera o DOM
// pintar o #print-area, injeta @page com a orientação e chama window.print().
export function usePrint(landscape: boolean) {
  const [printQueue, setPrintQueue] = useState<Label[] | null>(null);

  useEffect(() => {
    if (printQueue === null) return;
    const t = setTimeout(() => {
      const styleEl = document.createElement('style');
      styleEl.id = '__print-page__';
      styleEl.textContent = `@page { size: A4 ${landscape ? 'landscape' : 'portrait'}; margin: 0; }`;
      document.head.appendChild(styleEl);
      document.body.setAttribute('data-printing', 'true');
      window.print();
      document.body.removeAttribute('data-printing');
      document.head.removeChild(styleEl);
      setPrintQueue(null);
    }, 80);
    return () => clearTimeout(t);
  }, [printQueue, landscape]);

  return { printQueue, triggerPrint: setPrintQueue };
}
