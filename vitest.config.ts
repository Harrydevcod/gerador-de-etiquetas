import { defineConfig } from 'vitest/config';

// Lógica pura e contratos de componentes renderizados no servidor — sem globais de browser.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
