import {defineConfig} from 'vite'
import {devtools} from '@tanstack/devtools-vite'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'

import {tanstackStart} from '@tanstack/solid-start/plugin/vite'

import solidPlugin from 'vite-plugin-solid'

export default defineConfig({
  server: {
    port: 8000,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  plugins: [
    devtools(),
    // this is the plugin that enables path aliases
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tailwindcss(),
    tanstackStart(),
    solidPlugin({ssr: true}),
  ],
})
