import { defineConfig } from 'vitest/config'
import solidPlugin from 'vite-plugin-solid'

export default defineConfig({
  plugins: [solidPlugin()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/components/**/*.tsx'],
      exclude: ['**/*.stories.tsx', '**/*.test.tsx', '**/index.ts'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
    // SolidJS 需要的转换配置
    deps: {
      optimizer: {
        web: {
          include: ['solid-js', 'lucide-solid'],
        },
      },
    },
    server: {
      deps: {
        inline: ['lucide-solid'],
      },
    },
  },
  resolve: {
    conditions: ['development', 'browser'],
  },
})

