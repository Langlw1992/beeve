import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'

import { tanstackStart } from '@tanstack/solid-start/plugin/vite'

import solidPlugin from 'vite-plugin-solid'
export default defineConfig({
  plugins: [
    devtools(),
    viteTsConfigPaths(),
    tailwindcss(),
    tanstackStart(),
    solidPlugin({ ssr: true }),
  ],
})
