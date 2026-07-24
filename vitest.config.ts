import { defineConfig } from 'vitest/config';

// Testes de lógica pura — ambiente node, sem plugins do Vite.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
