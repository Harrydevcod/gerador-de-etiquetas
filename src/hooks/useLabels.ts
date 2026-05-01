import { useState, useEffect, useCallback } from 'react';
import type { Label } from '../types/label';

const KEY = 'etq_labels_v2';
export const LAST_SESSION_KEY = 'etq_last_session';
const MAX_HISTORY = 50;

function genErp(): string {
  return 'ERP-' + Math.floor(10000 + Math.random() * 90000);
}

function load(): Label[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const labels = JSON.parse(raw) as Label[];
    if (labels.length > 0) {
      localStorage.setItem(LAST_SESSION_KEY, JSON.stringify({ savedAt: new Date().toISOString(), labels }));
      localStorage.removeItem(KEY);
    }
    return [];
  } catch {
    return [];
  }
}

export function useLabels() {
  const [labels, setLabels]   = useState<Label[]>(load);
  const [past,   setPast]     = useState<Label[][]>([]);
  const [future, setFuture]   = useState<Label[][]>([]);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(labels));
  }, [labels]);

  function add(data: Omit<Label, 'id' | 'createdAt'>): Label {
    const label: Label = {
      ...data,
      c: data.c?.trim() || genErp(),
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setLabels(prev => {
      setPast(p => [...p.slice(-(MAX_HISTORY - 1)), prev]);
      setFuture([]);
      return [label, ...prev];
    });
    return label;
  }

  function update(id: string, data: Partial<Omit<Label, 'id' | 'createdAt'>>): void {
    setLabels(prev => {
      setPast(p => [...p.slice(-(MAX_HISTORY - 1)), prev]);
      setFuture([]);
      return prev.map(l => l.id === id ? { ...l, ...data } : l);
    });
  }

  function duplicate(id: string): void {
    setLabels(prev => {
      const idx = prev.findIndex(l => l.id === id);
      if (idx === -1) return prev;
      const copy: Label = { ...prev[idx], id: crypto.randomUUID(), c: genErp(), createdAt: new Date().toISOString() };
      const next = [...prev];
      next.splice(idx + 1, 0, copy);
      setPast(p => [...p.slice(-(MAX_HISTORY - 1)), prev]);
      setFuture([]);
      return next;
    });
  }

  function remove(id: string): void {
    setLabels(prev => {
      setPast(p => [...p.slice(-(MAX_HISTORY - 1)), prev]);
      setFuture([]);
      return prev.filter(l => l.id !== id);
    });
  }

  function restore(savedLabels: Label[]): void {
    setLabels(prev => {
      setPast(p => [...p.slice(-(MAX_HISTORY - 1)), prev]);
      setFuture([]);
      return savedLabels;
    });
  }

  function seedSamples(): void {
    const samples: Omit<Label, 'id' | 'createdAt'>[] = [
      { c: '', name: 'Arroz agulha 5kg',      brand: 'Bom Sucesso', price: 850,  oldPrice: 950, unit: 'por fardo',  section: 'Mercearia', store: 'Minimarket' },
      { c: '', name: 'Óleo alimentar 1L',      brand: 'Fula',        price: 295,  oldPrice: 0,   unit: 'por litro',  section: 'Mercearia', store: 'Minimarket' },
      { c: '', name: 'Frango inteiro',          brand: '',            price: 450,  oldPrice: 520, unit: 'por kg',     section: 'Talho',     store: 'Minimarket' },
      { c: '', name: 'Leite UHT 1L',            brand: 'Mimosa',      price: 180,  oldPrice: 0,   unit: 'por unid.',  section: 'Bebidas',   store: 'Minimarket' },
      { c: '', name: 'Pão de forma integral',   brand: 'Panidor',     price: 220,  oldPrice: 250, unit: 'por unid.',  section: 'Padaria',   store: 'Minimarket' },
      { c: '', name: 'Tomate cherry 500g',      brand: '',            price: 120,  oldPrice: 0,   unit: 'por 500g',   section: 'Frescos',   store: 'Minimarket' },
    ];
    setLabels(prev => {
      setPast(p => [...p.slice(-(MAX_HISTORY - 1)), prev]);
      setFuture([]);
      return [...samples.map(s => ({ ...s, c: genErp(), id: crypto.randomUUID(), createdAt: new Date().toISOString() })), ...prev];
    });
  }

  function reorder(activeId: string, overId: string): void {
    setLabels(prev => {
      const from = prev.findIndex(l => l.id === activeId);
      const to   = prev.findIndex(l => l.id === overId);
      if (from === -1 || to === -1 || from === to) return prev;
      const next = [...prev];
      next.splice(to, 0, next.splice(from, 1)[0]);
      setPast(p => [...p.slice(-(MAX_HISTORY - 1)), prev]);
      setFuture([]);
      return next;
    });
  }

  const undo = useCallback(() => {
    if (past.length === 0) return false;
    setLabels(current => {
      const prev = past[past.length - 1];
      setPast(p => p.slice(0, -1));
      setFuture(f => [current, ...f.slice(0, MAX_HISTORY - 1)]);
      return prev;
    });
    return true;
  }, [past]);

  const redo = useCallback(() => {
    if (future.length === 0) return false;
    setLabels(current => {
      const next = future[0];
      setFuture(f => f.slice(1));
      setPast(p => [...p.slice(-(MAX_HISTORY - 1)), current]);
      return next;
    });
    return true;
  }, [future]);

  return {
    labels,
    add, update, duplicate, remove, reorder, seedSamples, restore,
    undo, redo,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
  };
}
