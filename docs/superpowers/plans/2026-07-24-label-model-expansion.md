# Label Model Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> superpowers:subagent-driven-development (recommended) or
> superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish, harden, and ship the ten pending label models as a tested,
accessible 20-model experience.

**Architecture:** Keep every renderer as a pure function behind the existing
typed `MODELS` registry. Add characterization and invariant coverage around
the inherited renderer work, isolate model-search logic as pure functions,
and make the registry-driven picker responsive and accessible without
changing application state or the Phase 4 print flow.

**Tech Stack:** React 19, TypeScript 6, Vite 8, Vitest 4, Tailwind CSS 3,
Lucide React, and existing string-based label renderers.

## Global Constraints

- Keep the existing renderer signature:
  `(label: Label, size: SizeKey, config: AppConfig) => string`.
- Support exactly 20 models after this delivery.
- Support all seven sizes from `XXXS` through `XL`.
- Preserve active personalization settings, A4 preview, and print behavior.
- Don't add a declarative renderer framework.
- Don't change persistence, exports, or the Phase 4 print architecture.
- Don't add models beyond the ten already present in the working tree.
- Don't add runtime dependencies.
- Preserve all existing user-authored working-tree changes.

---

### Task 1: Lock the 20-model registry and renderer invariants

**Files:**

- Create: `src/renderers/index.test.ts`
- Modify: `src/types/config.ts`
- Modify: `src/renderers/index.ts`
- Preserve and stage: `src/renderers/talho.ts`
- Preserve and stage: `src/renderers/kraft.ts`
- Preserve and stage: `src/renderers/desconto.ts`
- Preserve and stage: `src/renderers/boutique.ts`
- Preserve and stage: `src/renderers/tech.ts`
- Preserve and stage: `src/renderers/split.ts`
- Preserve and stage: `src/renderers/peixaria.ts`
- Preserve and stage: `src/renderers/padaria.ts`
- Preserve and stage: `src/renderers/infantil.ts`
- Preserve and stage: `src/renderers/atacado.ts`

**Interfaces:**

- Consumes: `Label`, `AppConfig`, `SizeKey`, `ModelKey`, `SIZES`, and the ten
  inherited renderer functions.
- Produces: the existing typed `MODELS` record containing exactly 20 entries
  and `renderLabel(label, size, config): string`.

The ten renderers predate this plan and already exist in the working tree.
Preserve them. Add characterization tests before correcting any renderer. If
a characterization exposes a defect, add a focused failing regression test
for that defect before changing production code.

- [x] **Step 1: Write registry and renderer characterization tests**

Create `src/renderers/index.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { SIZES } from '../constants/sizes';
import { DEFAULT_CONFIG } from '../types/config';
import type {
  AppConfig,
  ModelKey,
  SizeKey,
} from '../types/config';
import type { Label } from '../types/label';
import { MODELS } from './index';

const ALL_MODEL_KEYS = [
  'classico',
  'premium',
  'minimal',
  'promo',
  'eco',
  'retro',
  'neon',
  'corporate',
  'bold',
  'farmacia',
  'talho',
  'kraft',
  'desconto',
  'boutique',
  'tech',
  'split',
  'peixaria',
  'padaria',
  'infantil',
  'atacado',
] as const satisfies readonly ModelKey[];

const NEW_MODEL_KEYS = [
  'talho',
  'kraft',
  'desconto',
  'boutique',
  'tech',
  'split',
  'peixaria',
  'padaria',
  'infantil',
  'atacado',
] as const satisfies readonly ModelKey[];

const SIZE_KEYS = Object.keys(SIZES) as SizeKey[];

function label(overrides: Partial<Label> = {}): Label {
  return {
    id: 'test-label',
    c: 'ERP-00001',
    name: 'Arroz agulha 5kg',
    brand: 'Bom Sucesso',
    price: 850,
    oldPrice: 950,
    unit: 'por fardo',
    section: 'Mercearia',
    store: 'Minimarket',
    createdAt: '2026-07-24T00:00:00.000Z',
    ...overrides,
  };
}

function config(overrides: Partial<AppConfig> = {}): AppConfig {
  return {
    ...DEFAULT_CONFIG,
    fopts: { ...DEFAULT_CONFIG.fopts },
    ...overrides,
  };
}

describe('MODELS', () => {
  it('registers exactly the supported 20 models', () => {
    expect(Object.keys(MODELS)).toEqual(ALL_MODEL_KEYS);
  });

  it.each(NEW_MODEL_KEYS)('%s renders fixed root dimensions at every size',
    (modelKey) => {
      for (const sizeKey of SIZE_KEYS) {
        const html = MODELS[modelKey].fn(label(), sizeKey, config());
        expect(html).toContain(`width:${SIZES[sizeKey].w}px`);
        expect(html).toContain(`height:${SIZES[sizeKey].h}px`);
        expect(html).toMatch(/^<div\b/);
      }
    });

  it.each(NEW_MODEL_KEYS)('%s escapes label-derived markup', (modelKey) => {
    const attack = '<img src=x onerror=alert(1)>';
    const html = MODELS[modelKey].fn(
      label({ name: attack }),
      'M',
      config(),
    );

    expect(html).not.toContain(attack);
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
  });

  it.each(NEW_MODEL_KEYS)('%s respects custom color', (modelKey) => {
    const html = MODELS[modelKey].fn(
      label(),
      'M',
      config({ useCC: true, customC: '#123456' }),
    );

    expect(html).toContain('#123456');
  });

  it.each(NEW_MODEL_KEYS)('%s hides optional metadata', (modelKey) => {
    const hiddenConfig = config({
      showBC: false,
      fopts: {
        showBrand: false,
        showErp: false,
        showSec: false,
        showUnit: false,
        showStore: false,
      },
    });
    const html = MODELS[modelKey].fn(
      label({
        c: 'HIDDEN-ERP',
        brand: 'HIDDEN-BRAND',
        unit: 'HIDDEN-UNIT',
        section: 'HIDDEN-SECTION',
        store: 'HIDDEN-STORE',
      }),
      'M',
      hiddenConfig,
    );

    expect(html).not.toContain('HIDDEN-ERP');
    expect(html).not.toContain('HIDDEN-BRAND');
    expect(html).not.toContain('HIDDEN-UNIT');
    expect(html).not.toContain('HIDDEN-SECTION');
    expect(html).not.toContain('HIDDEN-STORE');
  });
});
```

- [x] **Step 2: Run the characterization suite**

Run:

```powershell
npm.cmd test -- src/renderers/index.test.ts
```

Expected: the registry and inherited renderers satisfy the tests. A failure is
evidence of a real integration defect, not permission to weaken an assertion.

- [x] **Step 3: Fix only demonstrated renderer defects**

If Step 2 exposes a defect, add one narrower `it(...)` case that reproduces
the exact failure, run it to observe the failure, then correct the responsible
renderer using the existing helpers. Don't refactor unrelated renderers.

The allowed correction pattern is:

```ts
// User-derived text must flow through a helper that calls esc(...).
${nameDiv(label, size, config, textColor)}
${brandLine(label, size, mutedColor, config)}
${unitLine(label, size, mutedColor, config)}
${secBadge(label, size, badgeStyle, config)}
${storeName(label, size, storeStyle, config)}
```

- [x] **Step 4: Run renderer and existing tests**

Run:

```powershell
npm.cmd test
```

Expected: all existing and new tests pass.

- [x] **Step 5: Commit the model expansion**

Run:

```powershell
git add -- src/types/config.ts src/renderers/index.ts `
  src/renderers/index.test.ts src/renderers/talho.ts `
  src/renderers/kraft.ts src/renderers/desconto.ts `
  src/renderers/boutique.ts src/renderers/tech.ts `
  src/renderers/split.ts src/renderers/peixaria.ts `
  src/renderers/padaria.ts src/renderers/infantil.ts `
  src/renderers/atacado.ts
git commit -m "feat(models): add ten retail label designs"
```

---

### Task 2: Add accent-insensitive model discovery

**Files:**

- Create: `src/components/modais/modelPickerSearch.ts`
- Create: `src/components/modais/modelPickerSearch.test.ts`

**Interfaces:**

- Consumes: model display labels and a user-entered query.
- Produces:
  `normalizeModelQuery(value: string): string` and
  `matchesModelQuery(label: string, query: string): boolean`.

- [x] **Step 1: Write the failing search tests**

Create `src/components/modais/modelPickerSearch.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import {
  matchesModelQuery,
  normalizeModelQuery,
} from './modelPickerSearch';

describe('normalizeModelQuery', () => {
  it('normalizes whitespace, case, and Portuguese accents', () => {
    expect(normalizeModelQuery('  ClÁSSICO  ')).toBe('classico');
  });
});

describe('matchesModelQuery', () => {
  it('matches an accentless query against an accented model name', () => {
    expect(matchesModelQuery('Clássico', 'classico')).toBe(true);
  });

  it('matches a partial query case-insensitively', () => {
    expect(matchesModelQuery('Farmácia', 'MAC')).toBe(true);
  });

  it('matches every model when the query is blank', () => {
    expect(matchesModelQuery('Boutique', '   ')).toBe(true);
  });

  it('rejects unrelated model names', () => {
    expect(matchesModelQuery('Tech', 'padaria')).toBe(false);
  });
});
```

- [x] **Step 2: Run the search test and verify RED**

Run:

```powershell
npm.cmd test -- src/components/modais/modelPickerSearch.test.ts
```

Expected: FAIL because `modelPickerSearch.ts` doesn't exist.

- [x] **Step 3: Implement the minimal pure search logic**

Create `src/components/modais/modelPickerSearch.ts`:

```ts
export function normalizeModelQuery(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()
    .toLocaleLowerCase('pt');
}

export function matchesModelQuery(label: string, query: string): boolean {
  return normalizeModelQuery(label).includes(normalizeModelQuery(query));
}
```

- [x] **Step 4: Run the search tests and verify GREEN**

Run:

```powershell
npm.cmd test -- src/components/modais/modelPickerSearch.test.ts
```

Expected: 4 tests pass.

- [x] **Step 5: Commit the discovery logic**

Run:

```powershell
git add -- src/components/modais/modelPickerSearch.ts `
  src/components/modais/modelPickerSearch.test.ts
git commit -m "feat(models): add accent-insensitive model search"
```

---

### Task 3: Make the 20-model picker responsive and accessible

**Files:**

- Create: `src/components/modais/ModelPickerModal.test.tsx`
- Modify: `src/components/modais/ModelPickerModal.tsx`
- Modify: `vitest.config.ts`

**Interfaces:**

- Consumes: `MODELS`, `matchesModelQuery`, current `ModelKey`, `onSelect`, and
  `onClose`.
- Produces: a modal dialog with search, responsive scrolling, accessible
  selection state, focus entry, and focus restoration.

- [x] **Step 1: Enable TSX component tests**

Change `vitest.config.ts` to include both TypeScript test extensions:

```ts
import { defineConfig } from 'vitest/config';

// Pure logic and server-rendered component contracts; no browser globals.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
```

- [x] **Step 2: Write the failing server-rendered accessibility contract**

Create `src/components/modais/ModelPickerModal.test.tsx`:

```tsx
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { ModelPickerModal } from './ModelPickerModal';

describe('ModelPickerModal', () => {
  it('renders an accessible searchable selection dialog', () => {
    const html = renderToStaticMarkup(
      <ModelPickerModal
        current="classico"
        onSelect={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toContain('aria-labelledby="model-picker-title"');
    expect(html).toContain('aria-label="Pesquisar modelos"');
    expect(html).toContain(
      'aria-label="Fechar seletor de modelos"',
    );
    expect(html).toContain('aria-pressed="true"');
  });
});
```

- [x] **Step 3: Run the component test and verify RED**

Run:

```powershell
npm.cmd test -- src/components/modais/ModelPickerModal.test.tsx
```

Expected: FAIL because the current picker has no dialog semantics, search
field, accessible close name, or selected-state attribute.

- [x] **Step 4: Implement search state and focus behavior**

Update imports and component state in
`src/components/modais/ModelPickerModal.tsx`:

```tsx
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Check, Search, X } from 'lucide-react';
import { matchesModelQuery } from './modelPickerSearch';

// Inside ModelPickerModal:
const [query, setQuery] = useState('');
const backdropRef = useRef<HTMLDivElement>(null);
const searchRef = useRef<HTMLInputElement>(null);

const modelEntries = useMemo(
  () => Object.entries(MODELS) as [
    ModelKey,
    (typeof MODELS)[ModelKey],
  ][],
  [],
);
const filteredModels = useMemo(
  () => modelEntries.filter(([, model]) =>
    matchesModelQuery(model.label, query)),
  [modelEntries, query],
);

useEffect(() => {
  const previousFocus = document.activeElement instanceof HTMLElement
    ? document.activeElement
    : null;
  const frame = window.requestAnimationFrame(() => searchRef.current?.focus());

  return () => {
    window.cancelAnimationFrame(frame);
    previousFocus?.focus();
  };
}, []);
```

Keep the existing Escape listener in a separate effect so its cleanup remains
independent.

- [x] **Step 5: Implement the responsive dialog shell**

Use this structure for the backdrop and panel:

```tsx
<div
  ref={backdropRef}
  className="fixed inset-0 z-50 flex items-center justify-center
    bg-black/65 backdrop-blur-md p-4"
  onMouseDown={(event) => {
    if (event.target === backdropRef.current) onClose();
  }}
>
  <section
    role="dialog"
    aria-modal="true"
    aria-labelledby="model-picker-title"
    className="flex max-h-[calc(100vh-2rem)] w-full max-w-[960px]
      flex-col overflow-hidden rounded-2xl border border-[var(--bdr)]
      bg-[var(--bg2)] shadow-2xl"
  >
    {/* Fixed header and search; scrollable collection follows. */}
  </section>
</div>
```

Give the title `id="model-picker-title"` and the close button:

```tsx
aria-label="Fechar seletor de modelos"
```

- [x] **Step 6: Add the search field, empty state, and responsive grid**

Add the search control below the dialog title:

```tsx
<label className="relative block">
  <Search
    size={14}
    aria-hidden="true"
    className="pointer-events-none absolute left-3 top-1/2
      -translate-y-1/2 text-[var(--txt3)]"
  />
  <input
    ref={searchRef}
    type="search"
    value={query}
    onChange={(event) => setQuery(event.target.value)}
    aria-label="Pesquisar modelos"
    placeholder="Pesquisar entre 20 modelos"
    className="w-full rounded-xl border border-[var(--bdr)]
      bg-[var(--bg3)] py-2 pl-9 pr-3 text-sm text-[var(--txt)]
      outline-none transition-colors placeholder:text-[var(--txt3)]
      focus:border-[var(--acc)]"
  />
</label>
```

Render the filtered collection in:

```tsx
<div
  className="grid min-h-0 flex-1 gap-3 overflow-y-auto p-5"
  style={{
    gridTemplateColumns:
      'repeat(auto-fit, minmax(144px, 1fr))',
  }}
>
```

Map `filteredModels`, and set this attribute on every model button:

```tsx
aria-pressed={isActive}
```

When `filteredModels.length === 0`, render:

```tsx
<div
  role="status"
  className="col-span-full flex min-h-40 items-center justify-center
    rounded-xl border border-dashed border-[var(--bdr)]
    text-sm text-[var(--txt3)]"
>
  Nenhum modelo encontrado
</div>
```

- [x] **Step 7: Run focused tests and verify GREEN**

Run:

```powershell
npm.cmd test -- src/components/modais/modelPickerSearch.test.ts `
  src/components/modais/ModelPickerModal.test.tsx
```

Expected: all focused tests pass.

- [x] **Step 8: Run the full automated gate**

Run:

```powershell
npm.cmd test
npm.cmd run lint
npm.cmd run build
git diff --check
```

Expected: tests, lint, build, and whitespace checks pass. The existing Vite
dependency deprecation warnings may remain; no new warning may be introduced.

- [x] **Step 9: Commit the picker**

Run:

```powershell
git add -- vitest.config.ts `
  src/components/modais/ModelPickerModal.tsx `
  src/components/modais/ModelPickerModal.test.tsx
git commit -m "feat(models): improve model picker discovery"
```

---

### Task 4: Validate the visual system and print integration

**Files:**

- Test any renderer correction in: `src/renderers/index.test.ts`
- Modify only when inspection demonstrates a defect:
  `src/renderers/talho.ts`
- Modify only when inspection demonstrates a defect:
  `src/renderers/kraft.ts`
- Modify only when inspection demonstrates a defect:
  `src/renderers/desconto.ts`
- Modify only when inspection demonstrates a defect:
  `src/renderers/boutique.ts`
- Modify only when inspection demonstrates a defect:
  `src/renderers/tech.ts`
- Modify only when inspection demonstrates a defect:
  `src/renderers/split.ts`
- Modify only when inspection demonstrates a defect:
  `src/renderers/peixaria.ts`
- Modify only when inspection demonstrates a defect:
  `src/renderers/padaria.ts`
- Modify only when inspection demonstrates a defect:
  `src/renderers/infantil.ts`
- Modify only when inspection demonstrates a defect:
  `src/renderers/atacado.ts`
- Modify only when picker inspection demonstrates a defect:
  `src/components/modais/ModelPickerModal.tsx`

**Interfaces:**

- Consumes: the built application, all 20 `MODELS`, all seven `SIZES`, A4
  preview, portrait orientation, and landscape orientation.
- Produces: visual evidence that model discovery, label legibility, preview,
  and print composition remain usable.

- [x] **Step 1: Start the development server**

Run:

```powershell
npm.cmd run dev -- --host 127.0.0.1
```

Expected: Vite reports a local URL without compilation errors.

- [x] **Step 2: Inspect the picker at desktop width**

At a viewport near `1440 × 1000`:

1. Open **Escolher modelo**.
2. Confirm all 20 models appear without horizontal overflow.
3. Search `classico` and confirm **Clássico** remains.
4. Search `farmacia` and confirm **Farmácia** remains.
5. Search an impossible term and confirm **Nenhum modelo encontrado**.
6. Clear search, choose each new model, and confirm the selection applies.
7. Close with Escape, reopen, close with the close button, and close through
   the backdrop.

- [x] **Step 3: Inspect the picker at narrow width**

At a viewport near `390 × 844`:

1. Open the picker and confirm the dialog stays inside the viewport.
2. Confirm search and the close button remain visible while models scroll.
3. Confirm model cards don't overlap or cause horizontal page scrolling.
4. Navigate controls with Tab and confirm focus is visible.
5. Close the picker and confirm focus returns to the model trigger.

- [x] **Step 4: Inspect representative renderer extremes**

For Talho, Desconto, Boutique, Tech, Split, and Infantil:

1. Render `XXXS`, `M`, and `XL`.
2. Confirm the product name and current price remain legible.
3. Toggle brand, section, unit, store, ERP code, and barcode.
4. Set a custom color and confirm the model applies it.
5. Add a two-line ribbon and confirm it doesn't cover the price.
6. Use long label values and confirm no content escapes the root.

- [x] **Step 5: Inspect A4 preview integration**

1. Select a new model and open **Pré-visualização A4**.
2. Confirm page count, zoom, thumbnails, and navigation.
3. Validate portrait and landscape orientations.
4. Confirm configured columns and margins match the preview.
5. Trigger print and confirm the print queue uses the selected model.

- [x] **Step 6: Correct only observed defects through regression tests**

For each observed renderer defect:

1. Add a focused failing case to `src/renderers/index.test.ts`.
2. Run the focused case and confirm it fails for the observed reason.
3. Apply the smallest renderer correction.
4. Run the focused case and the full renderer suite.

For a picker-only layout defect, apply the smallest class or layout correction
and repeat both viewport inspections.

- [x] **Step 7: Commit visual corrections when needed**

If files changed during inspection:

```powershell
git add -- src/renderers/index.test.ts `
  src/renderers/talho.ts src/renderers/kraft.ts `
  src/renderers/desconto.ts src/renderers/boutique.ts `
  src/renderers/tech.ts src/renderers/split.ts `
  src/renderers/peixaria.ts src/renderers/padaria.ts `
  src/renderers/infantil.ts src/renderers/atacado.ts `
  src/components/modais/ModelPickerModal.tsx
git commit -m "fix(models): resolve visual validation defects"
```

If no file changed, don't create an empty commit.

---

### Task 5: Run the release-quality verification gate

**Files:**

- Verify: all files changed by Tasks 1 through 4.
- Don't modify generated `dist/` or `release/` artifacts.

**Interfaces:**

- Consumes: the complete implementation and test suite.
- Produces: a clean, reviewed working tree containing only intentional
  changes and a commit sequence suitable for release.

- [x] **Step 1: Run all automated checks from a clean process**

Run:

```powershell
npm.cmd test
npm.cmd run lint
npm.cmd run build
git diff --check
```

Expected:

- All tests pass.
- ESLint reports zero errors.
- TypeScript and Vite production build complete.
- `git diff --check` reports no whitespace errors.

- [x] **Step 2: Review the final change set**

Run:

```powershell
git status --short
git diff --stat HEAD~4..HEAD
git log -5 --oneline
```

Confirm that:

- No source file outside the approved scope changed.
- No generated artifact is staged.
- The ten new renderers, tests, search logic, and picker changes are present.
- The design and plan documents remain committed.

- [x] **Step 3: Record verification evidence**

Report:

- Test file and test counts.
- Lint result.
- Build result and only pre-existing warnings.
- Desktop and narrow picker results.
- Renderer sizes inspected.
- Portrait and landscape A4 results.
- Final commit hashes.
