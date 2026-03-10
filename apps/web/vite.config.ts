import {defineConfig} from 'vite'
import solid from 'vite-plugin-solid'
import {tanstackRouter} from '@tanstack/router-plugin/vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    // 路由插件必须在 solid 之前
    tanstackRouter({
      target: 'solid',
    }),
    solid(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
