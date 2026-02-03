import {defineConfig} from 'tsup'
import {solidPlugin} from 'esbuild-plugin-solid'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  // 使用默认的 DOM 模式 - 这是浏览器运行时需要的
  // SSR 框架（如 Astro）会通过 package.json 的 "solid" 条件导出获取源码自行编译
  esbuildPlugins: [solidPlugin()],
  external: ['solid-js', 'solid-js/web', 'solid-js/store'],
})
