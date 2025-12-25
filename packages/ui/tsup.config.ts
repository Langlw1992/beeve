import { defineConfig } from 'tsup'
import { solidPlugin } from 'esbuild-plugin-solid'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  esbuildPlugins: [solidPlugin()],
  external: ['solid-js'],
})
