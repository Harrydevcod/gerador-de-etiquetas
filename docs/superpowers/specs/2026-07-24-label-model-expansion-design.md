# Label model expansion design

## Objective

Finish and harden the ten pending label models: Talho, Kraft, Desconto,
Boutique, Tech, Split, Peixaria, Padaria, Infantil, and Atacado. Integrate
them with the existing ten models without changing the completed Phase 4
printing workflow.

## Scope

The delivery includes:

- A typed registry containing all 20 models.
- A model picker that remains usable on narrow and short screens.
- Search and keyboard-friendly selection when the model list is large.
- Compatibility with all seven label sizes, from `XXXS` through `XL`.
- Compatibility with active personalization settings, A4 preview, and print.
- Automated coverage for registry completeness and renderer invariants.
- Visual validation of representative models at `XXXS`, `M`, and `XL`.

The delivery excludes:

- A declarative renderer framework.
- Changes to label persistence or export formats.
- Changes to the completed Phase 4 print architecture.
- Additional models beyond the ten already present in the working tree.

## Architecture

Each model remains a pure function with the existing signature:

```ts
(label: Label, size: SizeKey, config: AppConfig) => string
```

`src/renderers/index.ts` remains the single model registry. It exposes display
metadata and renderer functions keyed by `ModelKey`. The picker derives its
content from this registry, so adding a registered model makes it available
without a second list.

The picker owns only discovery and selection. It adds a local search query,
filters models by display name, keeps the active model visible, and uses a
responsive, scrollable grid. It doesn't own or duplicate application config.

## Renderer requirements

Every new renderer must:

- Return one fixed-size root element using the selected entry in `SIZES`.
- Escape all label-derived text through the existing renderer helpers.
- Respect `useCC`, `customC`, `fopts`, `showBC`, typography adjustments, and
  configured visibility rules where those controls apply.
- Avoid scriptable markup, external URLs, and runtime event attributes.
- Preserve legibility and prevent content from expanding the root dimensions.
- Render missing optional fields without empty structural gaps.
- Remain deterministic for the same label, size, and configuration.

The visual language remains intentionally distinct by model. Shared mechanics
stay in `helpers.ts`; visual composition remains inside each renderer.

## Model picker behavior

The picker must:

- Use a responsive column count instead of a fixed five-column grid.
- Constrain its height to the viewport and scroll only the model collection.
- Provide a labeled search field when 20 models are available.
- Match model names case-insensitively and accent-insensitively.
- Show a useful empty state when no model matches.
- Preserve Escape-to-close and backdrop-to-close behavior.
- Add an accessible name to icon-only controls and expose the selected state.
- Move focus into the dialog on open and restore normal keyboard flow on close.

Selecting a model applies it immediately and closes the picker, preserving the
current interaction contract.

## Data flow

1. `Toolbar` opens `ModelPickerModal` with the current `ModelKey`.
2. The picker reads model metadata from `MODELS`.
3. The user filters or selects a model.
4. The picker calls `onSelect(modelKey)` and closes.
5. `App` persists the new `selModel` through the existing config hook.
6. The grid, A4 preview, exports, and print queue render through `renderLabel`.

No new persistent state or migration is required.

## Error handling and safety

The renderer registry is closed over `ModelKey`, preventing a configured model
without an implementation. Tests reject missing or extra registry entries.

Search normalization handles empty input and Unicode diacritics without
throwing. The picker renders an explicit empty state instead of an empty grid.

The existing HTML rendering boundary remains unchanged. New models must use
the escaping helpers for user content, and automated tests scan representative
output for unsafe tags and event attributes.

## Testing strategy

Use test-driven development for every new behavior:

1. Add failing registry tests for the complete 20-model key set.
2. Add failing invariant tests across every new model and all seven sizes.
3. Add failing tests for conditional fields, custom color, and unsafe input.
4. Extract and test search normalization and model filtering as pure functions.
5. Implement responsive and accessible picker behavior after its logic tests.

Run the full verification gate:

```text
npm test
npm run lint
npm run build
git diff --check
```

Then inspect the picker and representative labels at desktop and narrow
viewports. Validate `XXXS`, `M`, and `XL`, plus A4 preview in portrait and
landscape orientations.

## Acceptance criteria

The expansion is complete when:

- All 20 models appear in the picker and can become the active model.
- All new models render at every size without escaping their root dimensions.
- Optional fields and personalization settings behave consistently.
- The picker is usable with keyboard input and at narrow viewport widths.
- The A4 preview and print flow render the selected new model.
- Tests, lint, production build, and whitespace checks pass.
- Visual inspection finds no clipping that obscures product name or price.

