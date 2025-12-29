// @ts-check
import { defineConfig } from 'astro/config'
import starlight from '@astrojs/starlight'
import solidJs from '@astrojs/solid-js'
import tailwindcss from '@tailwindcss/vite'
import starlightThemeNova from 'starlight-theme-nova'

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      title: 'Beeve',
      description: 'Beeve UI 组件库与低代码平台文档',
      defaultLocale: 'root',
      locales: {
        root: {
          label: '简体中文',
          lang: 'zh-CN',
        },
      },
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/example/beeve' },
      ],
      sidebar: [
        {
          label: '开始使用',
          items: [
            { label: '介绍', slug: 'guides/introduction' },
            { label: '快速开始', slug: 'guides/getting-started' },
          ],
        },
        {
          label: '组件',
          autogenerate: { directory: 'components' },
        },
      ],
      plugins: [starlightThemeNova()],
      customCss: ['./src/styles/global.css'],
    }),
    solidJs({
      include: ['**/demos/**', '**/components/**/*.tsx'],
    }),
  ],
  vite: {
    // @ts-expect-error - Vite version mismatch between @tailwindcss/vite and Astro
    plugins: [tailwindcss()],
    ssr: {
      noExternal: ['@beeve/ui', 'tailwind-variants'],
    },
  },
})
