import {defineConfig} from 'vite'
import {devtools} from '@tanstack/devtools-vite'
import tailwindcss from '@tailwindcss/vite'
import {tanstackStart} from '@tanstack/solid-start/plugin/vite'
import solidPlugin from 'vite-plugin-solid'

export default defineConfig(({command}) => ({
  plugins: [
    ...(command === 'serve' ? [devtools()] : []),
    tailwindcss(),
    tanstackStart(),
    solidPlugin({ssr: true}),
  ],
  resolve: {
    conditions: ['solid'],
    tsconfigPaths: true,
  },
  ssr: {
    noExternal: ['lucide-solid'],
  },
}))
