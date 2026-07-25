import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({ include: ['buffer', 'process', 'stream', 'util'] }),
  ],
  base: './',
  build: {
    // ponytail: o único chunk acima de 500 kB é o SheetJS (xlsx-js-style, ~967 kB),
    // carregado sob demanda no import/export — nunca no arranque. Substituí-lo
    // custava o suporte a .xls e um escritor OOXML com estilos à mão, por 0 ms de
    // ganho numa app de desktop. Limite subido para o aviso voltar a ser sinal;
    // se algo passar de 1 MB, é regressão a investigar.
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Vendor estável separado do código da app → melhor cache entre releases.
        advancedChunks: {
          groups: [
            { name: 'react', test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/ },
            { name: 'dnd', test: /[\\/]node_modules[\\/]@dnd-kit[\\/]/ },
          ],
        },
      },
    },
  },
})
