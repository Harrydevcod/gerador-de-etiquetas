import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { ModelPickerModal } from './ModelPickerModal';

describe('ModelPickerModal', () => {
  it('renders an accessible searchable selection dialog', () => {
    const html = renderToStaticMarkup(
      <ModelPickerModal current="classico" onSelect={vi.fn()} onClose={vi.fn()} />,
    );

    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toContain('aria-labelledby="model-picker-title"');
    expect(html).toContain('aria-label="Pesquisar modelos"');
    expect(html).toContain('aria-label="Fechar seletor de modelos"');
    expect(html).toContain('aria-pressed="true"');
  });
});
