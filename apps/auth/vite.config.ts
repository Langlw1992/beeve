import {defineConfig} from 'vite'
import {devtools} from '@tanstack/devtools-vite'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import {tanstackStart} from '@tanstack/solid-start/plugin/vite'
import solidPlugin from 'vite-plugin-solid'

export default defineConfig(({command}) => ({
  plugins: [
    ...(command === 'serve' ? [devtools()] : []),
    viteTsConfigPaths(),
    tailwindcss(),
    tanstackStart(),
    solidPlugin({ssr: true}),
  ],
}))
