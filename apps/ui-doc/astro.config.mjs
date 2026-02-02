import { defineConfig } from 'astro/config'
import starlight from '@astrojs/starlight'
import solidJs from '@astrojs/solid-js'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  integrations: [
    starlight({
      title: 'Beeve UI',
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/anthropics/beeve' },
      ],
      customCss: ['./src/styles/global.css'],
      sidebar: [
        {
          label: '开始',
          items: [
            { label: '介绍', slug: 'guides/introduction' },
          ],
        },
        {
          label: '组件',
          items: [
            { label: 'Button 按钮', slug: 'components/button' },
            { label: 'Input 输入框', slug: 'components/input' },
            { label: 'Checkbox 复选框', slug: 'components/checkbox' },
            { label: 'Radio 单选框', slug: 'components/radio' },
            { label: 'Select 选择器', slug: 'components/select' },
            { label: 'Switch 开关', slug: 'components/switch' },
          ],
        },
      ],
    }),
    solidJs(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
})
