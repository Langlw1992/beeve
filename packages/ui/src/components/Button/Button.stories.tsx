import type {Meta, StoryObj} from 'storybook-solidjs-vite'
import {createSignal} from 'solid-js'
import {Button} from '@beeve/ui'
import {action} from 'storybook/actions'

/**
 * # Button 按钮
 *
 * 按钮用于触发一个操作或事件，如提交表单、打开对话框、取消操作或执行删除操作。
 *
 * ## 何时使用
 *
 * - 标记一个（或封装一组）操作命令
 * - 响应用户点击后触发相应的业务逻辑
 *
 * ## 设计指南
 *
 * - 一个页面只应该有一个 Primary 按钮
 * - 同一区域不宜放置超过 3 个按钮
 * - 危险操作按钮应使用 destructive 变体
 */
const meta = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    // 文档页面配置
    docs: {
      description: {
        component:
          '按钮是最基础的交互组件，用于触发操作或事件。支持多种变体和尺寸。',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'primary',
        'secondary',
        'outline',
        'ghost',
        'destructive',
        'link',
      ],
      description: '按钮变体样式',
      table: {
        category: '外观',
        defaultValue: {summary: 'primary'},
        type: {
          summary: 'primary | secondary | outline | ghost | destructive | link',
        },
      },
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'icon'],
      description: '按钮尺寸',
      table: {
        category: '外观',
        defaultValue: {summary: 'md'},
        type: {summary: 'sm | md | lg | icon'},
      },
    },
    disabled: {
      control: 'boolean',
      description: '是否禁用按钮',
      table: {
        category: '状态',
        defaultValue: {summary: 'false'},
      },
    },
    loading: {
      control: 'boolean',
      description: '是否显示加载状态',
      table: {
        category: '状态',
        defaultValue: {summary: 'false'},
      },
    },
    type: {
      control: 'select',
      options: ['button', 'submit', 'reset'],
      description: '原生 button 类型',
      table: {
        category: 'HTML 属性',
        defaultValue: {summary: 'button'},
      },
    },
    children: {
      control: 'text',
      description: '按钮内容',
      table: {
        category: '内容',
      },
    },
    onClick: {
      action: 'clicked',
      description: '点击事件回调',
      table: {
        category: '事件',
      },
    },
  },
  args: {
    children: 'Button',
    variant: 'primary',
    size: 'md',
    onClick: action('clicked'),
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

/**
 * ## Playground
 *
 * 交互式演示，通过下方 Controls 面板调整属性，实时查看效果。
 */
export const Playground: Story = {}

/**
 * ## 按钮变体
 *
 * 提供 6 种变体样式，适用于不同场景：
 *
 * | 变体 | 使用场景 |
 * |------|----------|
 * | `primary` | 主要操作，一个页面通常只有一个 |
 * | `secondary` | 次要操作，用于辅助功能 |
 * | `outline` | 带边框按钮，低强调的操作 |
 * | `ghost` | 幽灵按钮，最低视觉强调 |
 * | `destructive` | 危险操作，如删除 |
 * | `link` | 链接样式，看起来像超链接 |
 */
export const Variants: Story = {
  render: () => (
    <div class="flex flex-wrap items-center gap-4">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
  parameters: {
    controls: {disable: true},
    docs: {
      description: {
        story: '六种按钮变体，覆盖不同的使用场景。',
      },
    },
  },
}

/**
 * ## 按钮尺寸
 *
 * 提供 4 种尺寸：
 * - `sm`: 小按钮，用于紧凑空间
 * - `md`: 默认尺寸
 * - `lg`: 大按钮，用于强调
 * - `icon`: 图标按钮，正方形
 */
export const Sizes: Story = {
  render: () => (
    <div class="flex items-end gap-4">
      <Button size="lg">Large</Button>
      <Button size="md">Medium</Button>
      <Button size="sm">Small</Button>
      <Button size="icon">🔔</Button>
    </div>
  ),
  parameters: {
    controls: {disable: true},
    docs: {
      description: {
        story: '四种尺寸适配不同的 UI 需求。',
      },
    },
  },
}

/**
 * ## 禁用状态
 *
 * 设置 `disabled` 属性禁用按钮，按钮将变为半透明且不可点击。
 */
export const Disabled: Story = {
  render: () => (
    <div class="flex flex-wrap items-center gap-4">
      <Button disabled>Primary Disabled</Button>
      <Button
        variant="secondary"
        disabled
      >
        Secondary Disabled
      </Button>
      <Button
        variant="outline"
        disabled
      >
        Outline Disabled
      </Button>
      <Button
        variant="destructive"
        disabled
      >
        Destructive Disabled
      </Button>
    </div>
  ),
  parameters: {
    controls: {disable: true},
    docs: {
      description: {
        story: '禁用状态下按钮不可交互，常用于表单验证未通过时。',
      },
    },
  },
}

/**
 * ## 带图标按钮
 *
 * 可以在按钮中添加图标，图标可以放在文字前面或后面。
 */
export const WithIcons: Story = {
  render: () => (
    <div class="flex flex-wrap items-center gap-4">
      <Button>
        <svg
          class="size-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4v16m8-8H4"
          />
        </svg>
        新建
      </Button>
      <Button variant="outline">
        <svg
          class="size-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
          />
        </svg>
        上传
      </Button>
      <Button variant="secondary">
        设置
        <svg
          class="size-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5l7 7-7 7"
          />
        </svg>
      </Button>
      <Button variant="destructive">
        <svg
          class="size-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
        删除
      </Button>
    </div>
  ),
  parameters: {
    controls: {disable: true},
    docs: {
      description: {
        story: '图标可以增强按钮的语义表达，让用户更快理解按钮功能。',
      },
    },
  },
}

/**
 * ## 按钮组合
 *
 * 常见的按钮组合模式。
 */
export const ButtonGroups: Story = {
  render: () => (
    <div class="flex flex-col gap-8">
      {/* 确认/取消 */}
      <div class="space-y-2">
        <p class="text-sm text-muted-foreground">确认/取消</p>
        <div class="flex gap-4">
          <Button variant="outline">取消</Button>
          <Button>确定</Button>
        </div>
      </div>
      {/* 表单提交 */}
      <div class="space-y-2">
        <p class="text-sm text-muted-foreground">表单提交</p>
        <div class="flex gap-4">
          <Button variant="ghost">重置</Button>
          <Button variant="outline">保存草稿</Button>
          <Button>提交</Button>
        </div>
      </div>
      {/* 危险操作确认 */}
      <div class="space-y-2">
        <p class="text-sm text-muted-foreground">危险操作确认</p>
        <div class="flex gap-4">
          <Button variant="outline">取消</Button>
          <Button variant="destructive">确认删除</Button>
        </div>
      </div>
    </div>
  ),
  parameters: {
    controls: {disable: true},
    docs: {
      description: {
        story: '常见的按钮组合模式：确认/取消、表单提交、危险操作确认。',
      },
    },
  },
}

/**
 * ## 加载状态
 *
 * 设置 `loading` 属性显示加载动画，按钮将禁用交互并显示旋转图标。
 * 常用于异步操作（如提交表单）时的反馈。
 */
export const Loading: Story = {
  render: () => {
    const [loading, setLoading] = createSignal(false)

    const handleClick = () => {
      setLoading(true)
      setTimeout(() => setLoading(false), 2000)
    }

    return (
      <div class="flex flex-col gap-8">
        {/* 静态展示 */}
        <div class="space-y-2">
          <p class="text-sm text-muted-foreground">各变体加载状态</p>
          <div class="flex flex-wrap items-center gap-4">
            <Button loading>Loading</Button>
            <Button
              variant="secondary"
              loading
            >
              Secondary
            </Button>
            <Button
              variant="outline"
              loading
            >
              Outline
            </Button>
            <Button
              variant="destructive"
              loading
            >
              Destructive
            </Button>
          </div>
        </div>
        {/* 交互演示 */}
        <div class="space-y-2">
          <p class="text-sm text-muted-foreground">交互演示</p>
          <div class="flex items-center gap-4">
            <Button
              loading={loading()}
              onClick={handleClick}
            >
              {loading() ? '提交中...' : '点击提交'}
            </Button>
            <span class="text-sm text-muted-foreground">
              点击按钮体验加载效果
            </span>
          </div>
        </div>
      </div>
    )
  },
  parameters: {
    controls: {disable: true},
    docs: {
      description: {
        story: '加载状态会自动禁用按钮并显示旋转图标，适用于异步操作场景。',
      },
    },
  },
}
