import { useState, useEffect } from 'react';
import type { AppConfig } from '../types/config';
import { DEFAULT_CONFIG } from '../types/config';
import { safeSetItem } from '../lib/storage';
import { useToast } from '../lib/toast';

const KEY = 'etq_config_v3';
const SCHEMA_VERSION = 1;

interface Envelope { v: number; data: Partial<AppConfig>; }

// Aceita o formato legado (config cru) e o envelope versionado. Migrações
// futuras entre versões entram aqui, por número de `v`.
function migrate(parsed: unknown): Partial<AppConfig> {
  if (parsed && typeof parsed === 'object' && 'v' in parsed && 'data' in parsed) {
    return (parsed as Envelope).data;
  }
  return parsed as Partial<AppConfig>; // legado (pré-versionamento)
}

function load(): AppConfig {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_CONFIG;
    const data = migrate(JSON.parse(raw));
    return { ...DEFAULT_CONFIG, ...data, fopts: { ...DEFAULT_CONFIG.fopts, ...data.fopts } };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function useConfig() {
  const { toast } = useToast();
  const [cfg, setCfg] = useState<AppConfig>(load);

  useEffect(() => {
    const res = safeSetItem(KEY, JSON.stringify({ v: SCHEMA_VERSION, data: cfg }));
    if (!res.ok) {
      toast(res.quota
        ? 'Armazenamento cheio — não foi possível guardar as definições (reduza o logo).'
        : 'Erro ao guardar as definições.', 'error');
    }
  }, [cfg, toast]);

  function setConfig(patch: Partial<AppConfig>): void {
    setCfg(prev => ({ ...prev, ...patch }));
  }

  function setFopt(key: keyof AppConfig['fopts'], val: boolean): void {
    setCfg(prev => ({ ...prev, fopts: { ...prev.fopts, [key]: val } }));
  }

  return { cfg, setConfig, setFopt };
}
