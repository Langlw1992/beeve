import type {StorybookConfig} from 'storybook-solidjs-vite'
import tailwindcss from '@tailwindcss/vite'

const config: StorybookConfig = {
  stories: [
    // 从 @beeve/ui 组件包读取 stories
    '../../../packages/ui/src/**/*.stories.@(ts|tsx)',
  ],
  addons: [
    '@storybook/addon-themes',
    '@storybook/addon-docs',
  ],
  framework: 'storybook-solidjs-vite',
  async viteFinal(config) {
    const {mergeConfig} = await import('vite')

    return mergeConfig(config, {
      plugins: [tailwindcss()],
    })
  },
}

export default config
