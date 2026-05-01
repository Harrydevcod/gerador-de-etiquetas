import type { Label } from '../../types/label';
import type { AppConfig } from '../../types/config';
import { renderLabel } from '../../renderers';
import { rbn } from '../../renderers/helpers';
import { LabelWrapper } from './LabelWrapper';
import { SearchX, Plus, Upload } from 'lucide-react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';

interface Props {
  labels: Label[];
  cfg: AppConfig;
  selectedIds: Set<string>;
  selectionMode: boolean;
  searchQuery?: string;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onRemove: (id: string) => void;
  onToggleSelect: (id: string) => void;
  onReorder: (activeId: string, overId: string) => void;
  onAddNew?: () => void;
  onImport?: () => void;
}

function EmptyState({ onAddNew, onImport }: { onAddNew?: () => void; onImport?: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-6 py-24 px-4">
      <svg width="72" height="72" viewBox="0 0 72 72" fill="none" className="opacity-20">
        <rect x="8" y="16" width="56" height="40" rx="6" stroke="var(--txt)" strokeWidth="2.5" />
        <circle cx="20" cy="28" r="4" stroke="var(--txt)" strokeWidth="2" />
        <line x1="30" y1="26" x2="56" y2="26" stroke="var(--txt)" strokeWidth="2" strokeLinecap="round" />
        <line x1="30" y1="32" x2="48" y2="32" stroke="var(--txt)" strokeWidth="2" strokeLinecap="round" />
        <line x1="8" y1="42" x2="64" y2="42" stroke="var(--txt)" strokeWidth="1.5" strokeDasharray="4 3" />
        <line x1="14" y1="50" x2="26" y2="50" stroke="var(--txt)" strokeWidth="2" strokeLinecap="round" />
        <line x1="30" y1="50" x2="42" y2="50" stroke="var(--txt)" strokeWidth="2" strokeLinecap="round" />
        <line x1="46" y1="50" x2="58" y2="50" stroke="var(--txt)" strokeWidth="2" strokeLinecap="round" />
        <path d="M36 4 L40 10 L32 10 Z" fill="var(--txt)" opacity="0.4" />
        <line x1="36" y1="10" x2="36" y2="16" stroke="var(--txt)" strokeWidth="2" />
      </svg>
      <div className="text-center space-y-1.5 max-w-xs">
        <p className="text-sm font-semibold text-[var(--txt)]">Nenhuma etiqueta ainda</p>
        <p className="text-xs text-[var(--txt3)] leading-relaxed">
          Adiciona produtos manualmente ou importa uma lista Excel para começar.
        </p>
      </div>
      <div className="flex items-center gap-2.5">
        {onAddNew && (
          <button onClick={onAddNew} className="flex items-center gap-2 px-4 py-2 bg-[var(--acc)] text-white text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity shadow-sm">
            <Plus size={13} />Nova etiqueta
          </button>
        )}
        {onImport && (
          <button onClick={onImport} className="flex items-center gap-2 px-4 py-2 border border-[var(--bdr)] text-[var(--txt2)] text-xs font-medium rounded-lg hover:bg-[var(--bg3)] transition-colors">
            <Upload size={13} />Importar Excel
          </button>
        )}
      </div>
    </div>
  );
}

export function LabelGrid({ labels, cfg, selectedIds, selectionMode, searchQuery, onEdit, onDuplicate, onRemove, onToggleSelect, onReorder, onAddNew, onImport }: Props) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (over && active.id !== over.id) {
      onReorder(String(active.id), String(over.id));
    }
  }

  if (labels.length === 0) {
    const isSearching = searchQuery && searchQuery.trim().length > 0;
    if (isSearching) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-[var(--txt3)] py-24">
          <SearchX size={36} className="opacity-25" />
          <p className="text-sm">Nenhuma etiqueta corresponde a <span className="text-[var(--txt2)] font-medium">"{searchQuery}"</span></p>
          <p className="text-xs opacity-60">Tenta outro termo ou limpa a pesquisa.</p>
        </div>
      );
    }
    return <EmptyState onAddNew={onAddNew} onImport={onImport} />;
  }

  const ribbonHtml = rbn(cfg);
  const ids = labels.map(l => l.id);

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={ids} strategy={rectSortingStrategy}>
        <div id="labels-panel" className="flex flex-wrap gap-3 p-4">
          {labels.map(l => (
            <LabelWrapper
              key={l.id}
              id={l.id}
              html={renderLabel(l, cfg.selSize, cfg)}
              ribbon={ribbonHtml}
              selected={selectedIds.has(l.id)}
              selectionMode={selectionMode}
              onEdit={() => onEdit(l.id)}
              onDuplicate={() => onDuplicate(l.id)}
              onRemove={() => onRemove(l.id)}
              onSelect={() => onToggleSelect(l.id)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
