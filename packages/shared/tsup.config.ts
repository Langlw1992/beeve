import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/types/index.ts', 'src/utils/index.ts', 'src/validators/index.ts'],
  format: ['esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
})
