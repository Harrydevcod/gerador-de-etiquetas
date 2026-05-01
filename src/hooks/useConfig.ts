import { useState, useEffect } from 'react';
import type { AppConfig } from '../types/config';
import { DEFAULT_CONFIG } from '../types/config';

const KEY = 'etq_config_v3';

function load(): AppConfig {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_CONFIG;
    const parsed = JSON.parse(raw) as Partial<AppConfig>;
    return { ...DEFAULT_CONFIG, ...parsed, fopts: { ...DEFAULT_CONFIG.fopts, ...parsed.fopts } };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function useConfig() {
  const [cfg, setCfg] = useState<AppConfig>(load);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(cfg));
  }, [cfg]);

  function setConfig(patch: Partial<AppConfig>): void {
    setCfg(prev => ({ ...prev, ...patch }));
  }

  function setFopt(key: keyof AppConfig['fopts'], val: boolean): void {
    setCfg(prev => ({ ...prev, fopts: { ...prev.fopts, [key]: val } }));
  }

  return { cfg, setConfig, setFopt };
}
