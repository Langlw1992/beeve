/**
 * @beeve/ui - Menu Stories
 * 采用 Ant Design 风格的数据驱动 API
 */

import type {Meta, StoryObj} from 'storybook-solidjs-vite'
import {createSignal} from 'solid-js'
import {Dropdown, ContextMenu} from './Menu'
import type {MenuItemType} from '../../primitives/menu'
import {Button} from '../Button'
import {
  Copy,
  Scissors,
  Clipboard,
  Trash2,
  SquarePen,
  Share2,
  Download,
} from 'lucide-solid'

/**
 * # Menu 菜单
 *
 * 弹出式菜单组件，支持下拉菜单、右键菜单和嵌套子菜单。
 * 采用 Ant Design 风格的数据驱动 API。
 *
 * ## 何时使用
 *
 * - 需要弹出一个菜单给用户选择操作
 * - 需要右键菜单功能
 * - 需要多级嵌套菜单结构
 *
 * ## 特性
 *
 * - ✅ 下拉菜单（Dropdown）
 * - ✅ 右键菜单（ContextMenu）
 * - ✅ 嵌套子菜单（多级）
 * - ✅ Radio/Checkbox 选项
 * - ✅ 键盘导航（↑↓ 选择，→ 展开子菜单，← 返回，Enter 确认，Esc 关闭）
 * - ✅ 完整的无障碍支持
 *
 * ## API 风格
 *
 * ```tsx
 * const items = [
 *   { key: 'edit', label: '编辑', icon: <SquarePen /> },
 *   { key: 'copy', label: '复制' },
 *   { type: 'divider' },
 *   { key: 'delete', label: '删除', danger: true },
 * ]
 *
 * <Dropdown items={items} onClick={(key) => console.log(key)}>
 *   <Button>操作</Button>
 * </Dropdown>
 * ```
 */
const meta = {
  title: 'Components/Menu',
  component: Dropdown,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Dropdown>

export default meta
type Story = StoryObj<typeof meta>

/** 基础下拉菜单 */
export const Basic: Story = {
  render: () => {
    const items: MenuItemType[] = [
      {key: 'edit', label: '编辑'},
      {key: 'copy', label: '复制'},
      {type: 'divider'},
      {key: 'delete', label: '删除'},
    ]

    return (
      <Dropdown
        items={items}
        onClick={(key) => console.log('点击:', key)}
      >
        <Button>操作</Button>
      </Dropdown>
    )
  },
}

/** Context Menu（右键菜单） */
export const ContextMenuStory: Story = {
  name: 'Context Menu',
  render: () => {
    const items: MenuItemType[] = [
      {key: 'copy', label: '复制', icon: <Copy class="size-4" />},
      {key: 'cut', label: '剪切', icon: <Scissors class="size-4" />},
      {key: 'paste', label: '粘贴', icon: <Clipboard class="size-4" />},
      {type: 'divider'},
      {
        key: 'delete',
        label: '删除',
        icon: <Trash2 class="size-4" />,
        danger: true,
      },
    ]

    return (
      <ContextMenu
        items={items}
        onClick={(key) => console.log('点击:', key)}
      >
        <div class="flex size-64 items-center justify-center rounded-lg border-2 border-dashed border-border text-muted-foreground">
          右键点击此处
        </div>
      </ContextMenu>
    )
  },
}

/** 嵌套子菜单 */
export const Nested: Story = {
  render: () => {
    const items: MenuItemType[] = [
      {key: 'new', label: '新建'},
      {key: 'open', label: '打开'},
      {type: 'divider'},
      {
        key: 'share',
        label: '分享到...',
        icon: <Share2 class="size-4" />,
        children: [
          {key: 'wechat', label: '微信'},
          {key: 'email', label: '邮件'},
          {key: 'link', label: '复制链接'},
        ],
      },
      {
        key: 'export',
        label: '导出为...',
        icon: <Download class="size-4" />,
        children: [
          {key: 'pdf', label: 'PDF'},
          {key: 'word', label: 'Word'},
          {key: 'excel', label: 'Excel'},
        ],
      },
      {type: 'divider'},
      {key: 'print', label: '打印'},
    ]

    return (
      <Dropdown
        items={items}
        onClick={(key) => console.log('点击:', key)}
      >
        <Button>文件</Button>
      </Dropdown>
    )
  },
}

/** Radio 和 Checkbox 选项 */
export const WithOptions: Story = {
  render: () => {
    const [order, setOrder] = createSignal('asc')
    const [showEmail, setShowEmail] = createSignal(true)
    const [showPhone, setShowPhone] = createSignal(false)
    const [showAddress, setShowAddress] = createSignal(false)

    const items = (): MenuItemType[] => [
      {
        type: 'group',
        key: 'sort',
        label: '排序',
        children: [
          {
            type: 'radio',
            key: 'order',
            name: 'order',
            value: order(),
            onChange: setOrder,
            children: [
              {key: 'asc', label: '升序'},
              {key: 'desc', label: '降序'},
            ],
          },
        ],
      },
      {type: 'divider'},
      {
        type: 'group',
        key: 'types',
        label: '类型',
        children: [
          {
            type: 'checkbox',
            key: 'email',
            label: '邮件',
            checked: showEmail(),
            onChange: setShowEmail,
          },
          {
            type: 'checkbox',
            key: 'phone',
            label: '电话',
            checked: showPhone(),
            onChange: setShowPhone,
          },
          {
            type: 'checkbox',
            key: 'address',
            label: '地址',
            checked: showAddress(),
            onChange: setShowAddress,
          },
        ],
      },
    ]

    return (
      <div class="flex flex-col gap-4">
        <Dropdown items={items()}>
          <Button>设置</Button>
        </Dropdown>

        <div class="text-sm text-muted-foreground">
          <div>当前排序: {order()}</div>
          <div>
            已选类型:{' '}
            {[
              showEmail() && '邮件',
              showPhone() && '电话',
              showAddress() && '地址',
            ]
              .filter(Boolean)
              .join(', ') || '无'}
          </div>
        </div>
      </div>
    )
  },
}

/** 不同尺寸 */
export const Sizes: Story = {
  render: () => {
    const items: MenuItemType[] = [
      {key: '1', label: '选项 1'},
      {key: '2', label: '选项 2'},
      {key: '3', label: '选项 3'},
    ]

    return (
      <div class="flex gap-4">
        <Dropdown
          items={items}
          size="sm"
        >
          <Button size="sm">小尺寸</Button>
        </Dropdown>

        <Dropdown
          items={items}
          size="md"
        >
          <Button size="md">中尺寸</Button>
        </Dropdown>

        <Dropdown
          items={items}
          size="lg"
        >
          <Button size="lg">大尺寸</Button>
        </Dropdown>
      </div>
    )
  },
}

/** 带图标和快捷键 */
export const WithIconsAndShortcuts: Story = {
  render: () => {
    const items: MenuItemType[] = [
      {
        key: 'cut',
        label: '剪切',
        icon: <Scissors class="size-4" />,
        shortcut: '⌘X',
      },
      {
        key: 'copy',
        label: '复制',
        icon: <Copy class="size-4" />,
        shortcut: '⌘C',
      },
      {
        key: 'paste',
        label: '粘贴',
        icon: <Clipboard class="size-4" />,
        shortcut: '⌘V',
      },
      {type: 'divider'},
      {
        key: 'delete',
        label: '删除',
        icon: <Trash2 class="size-4" />,
        shortcut: '⌫',
        danger: true,
      },
    ]

    return (
      <Dropdown
        items={items}
        onClick={(key) => console.log('点击:', key)}
      >
        <Button>编辑</Button>
      </Dropdown>
    )
  },
}

/** 禁用状态 */
export const Disabled: Story = {
  render: () => {
    const items: MenuItemType[] = [
      {key: 'edit', label: '编辑'},
      {key: 'duplicate', label: '复制（禁用）', disabled: true},
      {key: 'archive', label: '归档（禁用）', disabled: true},
      {type: 'divider'},
      {key: 'delete', label: '删除（禁用）', disabled: true},
    ]

    return (
      <Dropdown
        items={items}
        onClick={(key) => console.log('点击:', key)}
      >
        <Button>操作</Button>
      </Dropdown>
    )
  },
}

/** 危险操作项 */
export const DangerItems: Story = {
  render: () => {
    const items: MenuItemType[] = [
      {key: 'edit', label: '编辑', icon: <SquarePen class="size-4" />},
      {key: 'duplicate', label: '复制', icon: <Copy class="size-4" />},
      {type: 'divider'},
      {
        key: 'delete',
        label: '删除',
        icon: <Trash2 class="size-4" />,
        danger: true,
      },
    ]

    return (
      <Dropdown
        items={items}
        onClick={(key) => console.log('点击:', key)}
      >
        <Button>操作</Button>
      </Dropdown>
    )
  },
}

/** 复杂示例 - 组合使用 */
export const Complex: Story = {
  render: () => {
    const [showIcons, setShowIcons] = createSignal(true)
    const [theme, setTheme] = createSignal('light')

    const items = (): MenuItemType[] => [
      {
        type: 'group',
        key: 'display',
        label: '显示选项',
        children: [
          {
            type: 'checkbox',
            key: 'icons',
            label: '显示图标',
            checked: showIcons(),
            onChange: setShowIcons,
          },
        ],
      },
      {type: 'divider'},
      {
        type: 'group',
        key: 'theme-group',
        label: '主题',
        children: [
          {
            type: 'radio',
            key: 'theme',
            name: 'theme',
            value: theme(),
            onChange: setTheme,
            children: [
              {key: 'light', label: '亮色'},
              {key: 'dark', label: '暗色'},
              {key: 'auto', label: '自动'},
            ],
          },
        ],
      },
      {type: 'divider'},
      {
        key: 'advanced',
        label: '高级设置',
        children: [
          {key: 'performance', label: '性能'},
          {key: 'security', label: '安全'},
          {key: 'privacy', label: '隐私'},
        ],
      },
    ]

    return (
      <div class="flex flex-col gap-4">
        <Dropdown
          items={items()}
          onClick={(key) => console.log('点击:', key)}
        >
          <Button>视图</Button>
        </Dropdown>

        <div class="text-sm text-muted-foreground">
          <div>显示图标: {showIcons() ? '是' : '否'}</div>
          <div>当前主题: {theme()}</div>
        </div>
      </div>
    )
  },
}
