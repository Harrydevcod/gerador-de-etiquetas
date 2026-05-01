import { Pencil, Copy, X, GripVertical } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Props {
  id: string;
  html: string;
  ribbon: string;
  selected?: boolean;
  selectionMode?: boolean;
  onEdit: () => void;
  onDuplicate: () => void;
  onRemove: () => void;
  onSelect?: () => void;
}

export function LabelWrapper({ id, html, ribbon, selected, selectionMode, onEdit, onDuplicate, onRemove, onSelect }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const dragStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : undefined,
    position: 'relative' as const,
  };

  function handleClick() {
    if (selectionMode && onSelect) onSelect();
  }

  return (
    <div
      ref={setNodeRef}
      style={dragStyle}
      className={`group inline-block align-top select-none ${selectionMode ? 'cursor-pointer' : 'cursor-default'}`}
      onClick={handleClick}
    >
      <div
        dangerouslySetInnerHTML={{ __html: html + ribbon }}
        style={{ display: 'inline-block', verticalAlign: 'top' }}
        className={`rounded transition-all ${selected ? 'ring-2 ring-[var(--acc)] ring-offset-1' : ''}`}
      />

      {/* hover overlay — hidden in selection mode */}
      {!selectionMode && (
        <>
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors rounded pointer-events-none print:hidden" />

          {/* action buttons */}
          <div className="absolute top-0 inset-x-0 flex justify-center gap-1 py-1 opacity-0 group-hover:opacity-100 transition-opacity z-20 print:hidden">
            <button onClick={e => { e.stopPropagation(); onEdit(); }} className="bg-white/95 hover:bg-white text-gray-700 rounded p-1 shadow" title="Editar">
              <Pencil size={10} />
            </button>
            <button onClick={e => { e.stopPropagation(); onDuplicate(); }} className="bg-white/95 hover:bg-white text-gray-700 rounded p-1 shadow" title="Duplicar">
              <Copy size={10} />
            </button>
            <button onClick={e => { e.stopPropagation(); onRemove(); }} className="bg-red-500 hover:bg-red-600 text-white rounded p-1 shadow" title="Remover">
              <X size={10} />
            </button>
          </div>

          {/* drag handle */}
          <div
            {...attributes}
            {...listeners}
            className="absolute bottom-0.5 left-1/2 -translate-x-1/2 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-70 transition-opacity z-20 print:hidden touch-none"
            title="Arrastar para reordenar"
            onClick={e => e.stopPropagation()}
          >
            <GripVertical size={10} className="text-white drop-shadow" />
          </div>
        </>
      )}

      {/* selection indicator */}
      {selectionMode && selected && (
        <div className="absolute top-1 left-1 w-4 h-4 bg-[var(--acc)] rounded-full flex items-center justify-center z-10 pointer-events-none print:hidden">
          <svg viewBox="0 0 10 10" className="w-2.5 h-2.5 text-white fill-current"><path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
      )}
    </div>
  );
}
