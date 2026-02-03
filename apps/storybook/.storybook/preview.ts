import type {Preview, Decorator} from 'storybook-solidjs-vite'
import {withThemeByClassName} from '@storybook/addon-themes'
import {
  applyThemeToDOM,
  type BaseColorName,
  type ThemeColorName,
} from '@beeve/ui'

import './styles.css'

// 主题色选项
const BASE_COLORS: BaseColorName[] = [
  'neutral',
  'zinc',
  'stone',
  'gray',
  'slate',
]
const THEME_COLORS: ThemeColorName[] = [
  'blue',
  'green',
  'pink',
  'orange',
  'violet',
  'red',
  'rose',
  'yellow',
  'amber',
  'cyan',
  'emerald',
  'fuchsia',
  'indigo',
  'lime',
  'purple',
  'sky',
  'teal',
]
const RADIUS_OPTIONS = [
  {value: 0, title: '0 (None)'},
  {value: 0.3, title: '0.3 (Small)'},
  {value: 0.5, title: '0.5 (Medium)'},
  {value: 0.625, title: '0.625 (Default)'},
  {value: 0.75, title: '0.75 (Large)'},
  {value: 1, title: '1 (XL)'},
]

// 主题装饰器 - 应用主题变量
const withThemeVariables: Decorator = (Story, context) => {
  const {theme} = context.globals
  const baseColor = (context.globals.baseColor || 'zinc') as BaseColorName
  const themeColor = (context.globals.themeColor || 'blue') as ThemeColorName
  const radius = context.globals.radius ?? 0.625
  const mode = theme === 'dark' ? 'dark' : 'light'

  // 应用主题到 DOM
  applyThemeToDOM(baseColor, themeColor, radius, mode)

  return Story()
}

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      disable: true,
    },
  },
  globalTypes: {
    baseColor: {
      description: '基础灰色调',
      toolbar: {
        title: 'Base',
        icon: 'paintbrush',
        items: BASE_COLORS.map((c) => ({value: c, title: c})),
        dynamicTitle: true,
      },
    },
    themeColor: {
      description: '主题强调色',
      toolbar: {
        title: 'Theme',
        icon: 'heart',
        items: THEME_COLORS.map((c) => ({value: c, title: c})),
        dynamicTitle: true,
      },
    },
    radius: {
      description: '圆角大小',
      toolbar: {
        title: 'Radius',
        icon: 'circle',
        items: RADIUS_OPTIONS,
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    baseColor: 'zinc',
    themeColor: 'blue',
    radius: 0.625,
  },
  decorators: [
    withThemeVariables,
    withThemeByClassName({
      themes: {
        light: '',
        dark: 'dark',
      },
      defaultTheme: 'light',
    }),
  ],
}

export default preview
