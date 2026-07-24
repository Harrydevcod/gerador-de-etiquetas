import { useState, useCallback } from 'react';
import type { Label } from '../types/label';
import type { AppConfig } from '../types/config';
import { useToast } from '../lib/toast';

// Centraliza os 4 exports (antes eram handlers copy-paste no App): loading +
// try/catch/toast idênticos, só muda a função da lib.
export function useExport(labels: Label[], cfg: AppConfig) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const run = useCallback(async (fn: () => Promise<void>, label: string) => {
    setIsLoading(true);
    try {
      await fn();
      toast(`${label} exportado com sucesso`);
    } catch (e) {
      toast(`Erro ao gerar ${label}: ` + (e instanceof Error ? e.message : String(e)), 'error');
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Libs pesadas (docx, xlsx-js-style, jspdf, html2canvas) carregadas sob demanda
  // no clique — ficam fora do chunk inicial.
  return {
    isLoading,
    exportToWord:  () => run(async () => { const { exportWord }  = await import('../lib/exportWord');  await exportWord(labels, cfg); },  'Word'),
    exportToExcel: () => run(async () => { const { exportExcel } = await import('../lib/exportExcel'); await exportExcel(labels, cfg); }, 'Excel'),
    exportToCsv:   () => run(async () => { const { exportCsv }   = await import('../lib/exportCsv');   await exportCsv(labels); },       'CSV'),
    exportToPdf:   () => run(async () => { const { exportPdf }   = await import('../lib/exportPdf');   await exportPdf(labels, cfg); },  'PDF'),
  };
}
