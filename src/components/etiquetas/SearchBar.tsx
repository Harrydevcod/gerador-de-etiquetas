import { Search, X, ArrowUp, ArrowDown } from 'lucide-react';

export type SortField = 'name' | 'price' | 'section' | 'createdAt';
export type SortDir = 'asc' | 'desc';

interface Props {
  query: string;
  sortBy: SortField;
  sortDir: SortDir;
  totalCount: number;
  filteredCount: number;
  onQuery: (q: string) => void;
  onSortBy: (s: SortField) => void;
  onToggleSortDir: () => void;
}

const SORT_LABELS: Record<SortField, string> = {
  name: 'Nome',
  price: 'Preço',
  section: 'Secção',
  createdAt: 'Adicionado',
};

const selCls =
  'text-xs px-2 py-1.5 bg-[var(--bg3)] border border-[var(--bdr)] rounded-lg text-[var(--txt)] focus:outline-none focus:border-[var(--acc)] cursor-pointer transition-colors hover:border-[var(--bdr2)]';

export function SearchBar({
  query,
  sortBy,
  sortDir,
  totalCount,
  filteredCount,
  onQuery,
  onSortBy,
  onToggleSortDir,
}: Props) {
  const isFiltered = query.trim().length > 0;

  return (
    <div className="no-print flex items-center gap-2 px-4 py-2 bg-[var(--bg2)] border-b border-[var(--bdr)]">
      <div className="relative flex-1 max-w-xs">
        <Search
          size={13}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--txt3)] pointer-events-none"
        />
        <input
          type="text"
          value={query}
          onChange={e => onQuery(e.target.value)}
          placeholder="Pesquisar por nome, marca, código…"
          className="w-full pl-7 pr-7 py-1.5 text-xs bg-[var(--bg3)] border border-[var(--bdr)] rounded-lg text-[var(--txt)] placeholder-[var(--txt3)] focus:outline-none focus:border-[var(--acc)] transition-colors"
        />
        {isFiltered && (
          <button
            onClick={() => onQuery('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--txt3)] hover:text-[var(--txt)] transition-colors"
          >
            <X size={12} />
          </button>
        )}
      </div>

      <select
        value={sortBy}
        onChange={e => onSortBy(e.target.value as SortField)}
        className={selCls}
      >
        {(Object.entries(SORT_LABELS) as [SortField, string][]).map(([k, v]) => (
          <option key={k} value={k}>
            {v}
          </option>
        ))}
      </select>

      <button
        onClick={onToggleSortDir}
        className="p-1.5 rounded-lg text-[var(--txt2)] hover:bg-[var(--bg3)] transition-colors"
        title={sortDir === 'asc' ? 'Ordem crescente' : 'Ordem decrescente'}
      >
        {sortDir === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
      </button>

      <div className="flex-1" />

      {totalCount > 0 && (
        <span className="text-xs text-[var(--txt3)] tabular-nums">
          {isFiltered
            ? `${filteredCount} de ${totalCount}`
            : `${totalCount} etiqueta${totalCount !== 1 ? 's' : ''}`}
        </span>
      )}
    </div>
  );
}
