import { useState, useEffect, useMemo, useCallback } from 'react';
import { useLabels, LAST_SESSION_KEY } from './hooks/useLabels';
import { useConfig } from './hooks/useConfig';
import { Toolbar } from './components/toolbar/Toolbar';
import { LabelGrid } from './components/etiquetas/LabelGrid';
import { SearchBar } from './components/etiquetas/SearchBar';
import { SelectBar } from './components/etiquetas/SelectBar';
import { EditModal } from './components/modais/EditModal';
import { BulkEditModal } from './components/modais/BulkEditModal';
import { PreviewModal } from './components/modais/PreviewModal';
import { PainelPersonalizar } from './components/personalizar/PainelPersonalizar';
import { ImportExcel } from './components/importar/ImportExcel';
import { LastSessionBanner } from './components/LastSessionBanner';
import { useExport } from './hooks/useExport';
import { usePrint } from './hooks/usePrint';
import { renderLabel } from './renderers';
import { ModelSizeBar } from './components/toolbar/ModelSizeBar';
import { useToast } from './lib/toast';
import { ShortcutsModal } from './components/modais/ShortcutsModal';
import { UpdateBanner } from './components/UpdateBanner';
import { applyPriceOp } from './lib/priceOp';
import { rbn } from './renderers/helpers';
import type { Label } from './types/label';
import type { ModelKey } from './types/config';
import type { SortField, SortDir } from './components/etiquetas/SearchBar';

interface LastSession { savedAt: string; labels: Label[]; }

function readLastSession(): LastSession | null {
  try {
    const raw = localStorage.getItem(LAST_SESSION_KEY);
    return raw ? (JSON.parse(raw) as LastSession) : null;
  } catch { return null; }
}

type EditTarget = Label | null | undefined;

export default function App() {
  const { labels, add, update, duplicate, remove, reorder, seedSamples, restore, undo, redo } = useLabels();
  const { toast } = useToast();
  const [lastSession, setLastSession] = useState<LastSession | null>(readLastSession);
  const { cfg, setConfig, setFopt } = useConfig();

  const [editTarget, setEditTarget]   = useState<EditTarget>(undefined);
  const [panelOpen, setPanelOpen]     = useState(false);
  const [importOpen, setImportOpen]   = useState(false);

  // Search & sort
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy]           = useState<SortField>('createdAt');
  const [sortDir, setSortDir]         = useState<SortDir>('desc');

  // Export (loading + handlers) e impressão controlada — extraídos para hooks
  const { isLoading, exportToWord, exportToExcel, exportToCsv, exportToPdf } = useExport(labels, cfg);
  const { printQueue, triggerPrint } = usePrint(cfg.printLandscape);

  // Selection
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds]     = useState<Set<string>>(new Set());
  const [bulkEditOpen, setBulkEditOpen]   = useState(false);

  // Preview modal
  const [previewOpen, setPreviewOpen]     = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [previewLabels, setPreviewLabels] = useState<Label[]>([]);

  // Filtered + sorted labels
  const filteredLabels = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const result = q
      ? labels.filter(l =>
          l.name.toLowerCase().includes(q) ||
          l.brand.toLowerCase().includes(q) ||
          l.c.toLowerCase().includes(q) ||
          l.section.toLowerCase().includes(q) ||
          l.store.toLowerCase().includes(q)
        )
      : [...labels];

    result.sort((a, b) => {
      let cmp: number;
      if (sortBy === 'name')      cmp = a.name.localeCompare(b.name);
      else if (sortBy === 'price') cmp = a.price - b.price;
      else if (sortBy === 'section') cmp = a.section.localeCompare(b.section);
      else                         cmp = a.createdAt.localeCompare(b.createdAt);
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [labels, searchQuery, sortBy, sortDir]);

  // Dark mode sync
  useEffect(() => {
    document.documentElement.classList.toggle('dark', cfg.dark);
  }, [cfg.dark]);

  // Keyboard shortcuts
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const mod = e.ctrlKey || e.metaKey;
      const tag = (e.target as HTMLElement).tagName;
      const inInput = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (e.target as HTMLElement).isContentEditable;

      // Ctrl/Cmd shortcuts always active
      if (mod) {
        if (e.key === 'z' && !e.shiftKey) { e.preventDefault(); if (undo()) toast('Acção desfeita', 'info'); }
        if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) { e.preventDefault(); if (redo()) toast('Acção refeita', 'info'); }
        return;
      }

      // Single-key shortcuts — skip when typing in a field
      if (inInput) return;

      switch (e.key) {
        case 'n': case 'N': setEditTarget(null); break;
        case 'i': case 'I': setImportOpen(true); break;
        case 'p': case 'P': if (labels.length) triggerPrint(filteredLabels); break;
        case 'v': case 'V': if (labels.length) openPreview(filteredLabels); break;
        case 's': case 'S': toggleSelectionMode(); break;
        case '?': setShortcutsOpen(true); break;
        case 'a': case 'A':
          if (selectionMode) setSelectedIds(new Set(labels.map(l => l.id)));
          break;
        case 'd': case 'D':
          if (selectionMode) setSelectedIds(new Set());
          break;
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [undo, redo, toast, labels, filteredLabels, selectionMode, triggerPrint]);

  // ── Handlers ────────────────────────────────────────────────────────────

  function handleSave(data: Omit<Label, 'id' | 'createdAt'>, qty = 1) {
    if (editTarget === null) {
      for (let i = 0; i < qty; i++) add(data);
      toast(qty > 1 ? `${qty} etiquetas adicionadas` : 'Etiqueta adicionada');
    } else if (editTarget) {
      update(editTarget.id, data);
      toast('Etiqueta actualizada');
    }
  }

  function handleClearAll() {
    if (labels.length === 0) return;
    const count = labels.length;
    labels.forEach(l => remove(l.id));
    toast(`${count} etiqueta${count !== 1 ? 's' : ''} removida${count !== 1 ? 's' : ''}`, 'warning');
  }

  function handleRestoreSession() {
    if (!lastSession) return;
    restore(lastSession.labels);
    localStorage.removeItem(LAST_SESSION_KEY);
    setLastSession(null);
    toast(`${lastSession.labels.length} etiquetas restauradas`);
  }

  function handleDismissSession() {
    localStorage.removeItem(LAST_SESSION_KEY);
    setLastSession(null);
  }

  function handleImport(newLabels: Omit<Label, 'id' | 'createdAt'>[]) {
    newLabels.forEach(l => add(l));
    toast(`${newLabels.length} etiqueta${newLabels.length !== 1 ? 's' : ''} importada${newLabels.length !== 1 ? 's' : ''}`);
  }

  // ── Selection ────────────────────────────────────────────────────────────

  const handleDuplicate = useCallback((id: string) => {
    duplicate(id);
    toast('Etiqueta duplicada');
  }, [duplicate, toast]);

  const handleRemove = useCallback((id: string) => {
    remove(id);
    toast('Etiqueta removida', 'warning');
  }, [remove, toast]);

  const handleSeed = useCallback(() => {
    seedSamples();
    toast('6 exemplos adicionados');
  }, [seedSamples, toast]);

  function handleBulkEdit(changes: import('./components/modais/BulkEditModal').BulkChanges) {
    selectedIds.forEach(id => {
      const { priceOp, ...fields } = changes;
      const base: Record<string, unknown> = { ...fields };
      if (priceOp) {
        const label = labels.find(l => l.id === id);
        if (label) base.price = applyPriceOp(label.price, priceOp);
      }
      update(id, base as Parameters<typeof update>[1]);
    });
    toast(`${selectedIds.size} etiqueta${selectedIds.size !== 1 ? 's' : ''} actualizadas`);
  }

  function toggleSelectionMode() {
    setSelectionMode(m => {
      if (m) setSelectedIds(new Set());
      return !m;
    });
  }

  const toggleSelectId = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleEdit = useCallback((id: string) => {
    setEditTarget(labels.find(l => l.id === id) ?? null);
  }, [labels]);

  const selectedList = labels.filter(l => selectedIds.has(l.id));

  // ── Preview & Print ──────────────────────────────────────────────────────

  function openPreview(labelsToShow: Label[]) {
    setPreviewLabels(labelsToShow);
    setPreviewOpen(true);
  }

  // ── Render ───────────────────────────────────────────────────────────────

  const ribbonHtml = rbn(cfg);

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col">
      <Toolbar
        cfg={cfg}
        labelCount={labels.length}
        panelOpen={panelOpen}
        selectionMode={selectionMode}
        isLoading={isLoading}
        onAddNew={() => setEditTarget(null)}
        onToggleDark={() => setConfig({ dark: !cfg.dark })}
        onSetModel={(m: ModelKey) => setConfig({ selModel: m })}
        onSeed={handleSeed}
        onClearAll={handleClearAll}
        onTogglePanel={() => setPanelOpen(p => !p)}
        onImport={() => setImportOpen(true)}
        onExportExcel={exportToExcel}
        onExportWord={exportToWord}
        onExportCsv={exportToCsv}
        onExportPdf={exportToPdf}
        onToggleSelection={toggleSelectionMode}
        onPreview={() => openPreview(filteredLabels)}
        onPrint={() => triggerPrint(filteredLabels)}
      />

      <ModelSizeBar
        selModel={cfg.selModel}
        selSize={cfg.selSize}
        onSetModel={(m) => setConfig({ selModel: m })}
        onSetSize={(s) => setConfig({ selSize: s })}
      />

      {labels.length > 0 && (
        <SearchBar
          query={searchQuery}
          sortBy={sortBy}
          sortDir={sortDir}
          totalCount={labels.length}
          filteredCount={filteredLabels.length}
          onQuery={setSearchQuery}
          onSortBy={setSortBy}
          onToggleSortDir={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}
        />
      )}

      {lastSession && (
        <LastSessionBanner
          savedAt={lastSession.savedAt}
          count={lastSession.labels.length}
          onRestore={handleRestoreSession}
          onDismiss={handleDismissSession}
        />
      )}

      {selectionMode && (
        <SelectBar
          total={labels.length}
          selected={selectedIds.size}
          onSelectAll={() => setSelectedIds(new Set(labels.map(l => l.id)))}
          onSelectNone={() => setSelectedIds(new Set())}
          onBulkEdit={() => setBulkEditOpen(true)}
          onPrint={() => triggerPrint(selectedList)}
          onPreview={() => openPreview(selectedList)}
          onExit={toggleSelectionMode}
        />
      )}

      <main className="flex-1 flex flex-col">
        <LabelGrid
          labels={filteredLabels}
          cfg={cfg}
          selectedIds={selectedIds}
          selectionMode={selectionMode}
          searchQuery={searchQuery}
          onEdit={handleEdit}
          onDuplicate={handleDuplicate}
          onRemove={handleRemove}
          onReorder={reorder}
          onAddNew={() => setEditTarget(null)}
          onImport={() => setImportOpen(true)}
          onToggleSelect={toggleSelectId}
        />
      </main>

      <PainelPersonalizar
        cfg={cfg}
        open={panelOpen}
        labelCount={labels.length}
        onClose={() => setPanelOpen(false)}
        setConfig={setConfig}
        setFopt={setFopt}
      />

      {importOpen && (
        <ImportExcel
          onImport={handleImport}
          onClose={() => setImportOpen(false)}
        />
      )}

      {bulkEditOpen && (
        <BulkEditModal
          count={selectedIds.size}
          onApply={handleBulkEdit}
          onClose={() => setBulkEditOpen(false)}
        />
      )}

      {editTarget !== undefined && (
        <EditModal
          key={editTarget === null ? 'new' : editTarget.id}
          label={editTarget}
          onSave={handleSave}
          onClose={() => setEditTarget(undefined)}
        />
      )}

      {previewOpen && (
        <PreviewModal
          labels={previewLabels}
          cfg={cfg}
          onClose={() => setPreviewOpen(false)}
          onPrint={() => {
            setPreviewOpen(false);
            triggerPrint(previewLabels);
          }}
        />
      )}

      {shortcutsOpen && <ShortcutsModal onClose={() => setShortcutsOpen(false)} />}

      <UpdateBanner />

      {/* Print area — hidden on screen, visible only during controlled print */}
      <div id="print-area" aria-hidden="true" style={{ display: 'none' }}>
        {printQueue !== null && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${cfg.pcols}, max-content)`,
              gap: '8px',
              padding: `${cfg.pmarg}cm`,
              background: 'white',
            }}
          >
            {printQueue.map((l, i) => (
              <div
                key={i}
                style={{ position: 'relative', overflow: 'hidden', display: 'inline-block' }}
                dangerouslySetInnerHTML={{ __html: renderLabel(l, cfg.selSize, cfg) + ribbonHtml }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
