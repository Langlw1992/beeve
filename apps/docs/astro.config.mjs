// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

import solidJs from '@astrojs/solid-js';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  integrations: [starlight({
      title: 'Beeve UI',
      social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/beeve/beeve' }],
      customCss: ['./src/styles/global.css'],
      sidebar: [
          {
              label: '开始',
              items: [
                  { label: '介绍', slug: 'guides/introduction' },
                  { label: '快速开始', slug: 'guides/getting-started' },
              ],
          },
          {
              label: '通用组件',
              items: [
                  { label: 'Button 按钮', slug: 'components/button' },
                  { label: 'Badge 徽标', slug: 'components/badge' },
              ],
          },
          {
              label: '数据录入',
              items: [
                  { label: 'Checkbox 复选框', slug: 'components/checkbox' },
                  { label: 'Input 输入框', slug: 'components/input' },
                  { label: 'Radio 单选框', slug: 'components/radio' },
                  { label: 'Select 选择器', slug: 'components/select' },
                  { label: 'Slider 滑块', slug: 'components/slider' },
                  { label: 'Switch 开关', slug: 'components/switch' },
              ],
          },
          {
              label: '数据展示',
              items: [
                  { label: 'Card 卡片', slug: 'components/card' },
                  { label: 'Progress 进度条', slug: 'components/progress' },
                  { label: 'Skeleton 骨架屏', slug: 'components/skeleton' },
                  { label: 'Tooltip 文字提示', slug: 'components/tooltip' },
              ],
          },
          {
              label: '反馈组件',
              items: [
                  { label: 'Dialog 对话框', slug: 'components/dialog' },
              ],
          },
          {
              label: '导航组件',
              items: [
                  { label: 'Menu 菜单', slug: 'components/menu' },
                  { label: 'NavMenu 导航菜单', slug: 'components/navmenu' },
                  { label: 'Sidebar 侧边栏', slug: 'components/sidebar' },
              ],
          },
          {
              label: '表单组件',
              items: [
                  { label: 'Label 标签', slug: 'components/label' },
              ],
          },
      ],
      }), solidJs()],

  vite: {
    plugins: [tailwindcss()],
  },
});
