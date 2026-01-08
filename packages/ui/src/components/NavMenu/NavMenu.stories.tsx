/**
 * NavMenu Stories
 */

import type { Meta, StoryObj } from 'storybook-solidjs'
import { createSignal } from 'solid-js'
import {
  Home,
  FileText,
  Edit,
  Settings,
  Users,
  BarChart3,
  Shield,
  Bell,
  HelpCircle,
} from 'lucide-solid'
import { NavMenu, type NavMenuItemType } from './index'

const meta = {
  title: 'Components/NavMenu',
  component: NavMenu,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div class="w-64 bg-sidebar p-2 rounded-lg border">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof NavMenu>

export default meta
type Story = StoryObj<typeof meta>

/** 基础导航菜单 */
export const Basic: Story = {
  render: () => {
    const [value, setValue] = createSignal('home')

    const items: NavMenuItemType[] = [
      { key: 'home', label: '首页', icon: <Home class="size-4" /> },
      { key: 'pages', label: '页面', icon: <FileText class="size-4" /> },
      { key: 'posts', label: '文章', icon: <Edit class="size-4" /> },
      { key: 'users', label: '用户', icon: <Users class="size-4" /> },
    ]

    return (
      <NavMenu
        items={items}
        value={value()}
        onValueChange={setValue}
      />
    )
  },
}

/** 带分组的菜单 */
export const WithGroups: Story = {
  render: () => {
    const [value, setValue] = createSignal('home')

    const items: NavMenuItemType[] = [
      { key: 'home', label: '首页', icon: <Home class="size-4" /> },
      { type: 'divider' },
      {
        type: 'group',
        key: 'content',
        label: '内容管理',
        children: [
          { key: 'pages', label: '页面', icon: <FileText class="size-4" /> },
          { key: 'posts', label: '文章', icon: <Edit class="size-4" />, badge: 12 },
        ],
      },
      {
        type: 'group',
        key: 'system',
        label: '系统管理',
        children: [
          { key: 'users', label: '用户', icon: <Users class="size-4" /> },
          { key: 'analytics', label: '统计', icon: <BarChart3 class="size-4" /> },
        ],
      },
    ]

    return (
      <NavMenu
        items={items}
        value={value()}
        onValueChange={setValue}
      />
    )
  },
}

/** 带子菜单（可折叠） */
export const WithSubMenu: Story = {
  render: () => {
    const [value, setValue] = createSignal('home')

    const items: NavMenuItemType[] = [
      { key: 'home', label: '首页', icon: <Home class="size-4" /> },
      { key: 'pages', label: '页面', icon: <FileText class="size-4" /> },
      {
        key: 'settings',
        label: '设置',
        icon: <Settings class="size-4" />,
        children: [
          { key: 'profile', label: '个人资料' },
          { key: 'security', label: '安全设置' },
          { key: 'notifications', label: '通知设置' },
        ],
      },
      {
        key: 'system',
        label: '系统',
        icon: <Shield class="size-4" />,
        children: [
          { key: 'users', label: '用户管理' },
          { key: 'roles', label: '角色管理' },
          { key: 'logs', label: '操作日志' },
        ],
      },
    ]

    return (
      <NavMenu
        items={items}
        value={value()}
        onValueChange={setValue}
        defaultExpandedKeys={['settings']}
      />
    )
  },
}

/** 带徽标 */
export const WithBadges: Story = {
  render: () => {
    const [value, setValue] = createSignal('home')

    const items: NavMenuItemType[] = [
      { key: 'home', label: '首页', icon: <Home class="size-4" /> },
      { key: 'notifications', label: '通知', icon: <Bell class="size-4" />, badge: 5 },
      { key: 'posts', label: '文章', icon: <Edit class="size-4" />, badge: 'New' },
      { key: 'help', label: '帮助', icon: <HelpCircle class="size-4" /> },
    ]

    return (
      <NavMenu
        items={items}
        value={value()}
        onValueChange={setValue}
      />
    )
  },
}

/** 多层级嵌套子菜单 */
export const MultiLevel: Story = {
  render: () => {
    const [value, setValue] = createSignal('dashboard')
    const [expanded, setExpanded] = createSignal(['content', 'content-pages'])

    const items: NavMenuItemType[] = [
      { key: 'dashboard', label: '仪表盘', icon: <Home class="size-4" /> },
      {
        key: 'content',
        label: '内容管理',
        icon: <FileText class="size-4" />,
        children: [
          {
            key: 'content-pages',
            label: '页面',
            children: [
              { key: 'page-home', label: '首页' },
              { key: 'page-about', label: '关于我们' },
              { key: 'page-contact', label: '联系方式' },
            ],
          },
          {
            key: 'content-posts',
            label: '文章',
            children: [
              { key: 'post-list', label: '文章列表' },
              { key: 'post-draft', label: '草稿箱', badge: 3 },
            ],
          },
          { key: 'content-media', label: '媒体库' },
        ],
      },
      {
        key: 'settings',
        label: '设置',
        icon: <Settings class="size-4" />,
        children: [
          { key: 'settings-general', label: '通用设置' },
          { key: 'settings-security', label: '安全设置' },
        ],
      },
    ]

    return (
      <NavMenu
        items={items}
        value={value()}
        onValueChange={setValue}
        expandedKeys={expanded()}
        onExpandedKeysChange={setExpanded}
      />
    )
  },
}

/** 折叠模式（仅图标） */
export const Collapsed: Story = {
  decorators: [
    (Story) => (
      <div class="w-16 bg-sidebar p-2 rounded-lg border">
        <Story />
      </div>
    ),
  ],
  render: () => {
    const [value, setValue] = createSignal('home')

    const items: NavMenuItemType[] = [
      { key: 'home', label: '首页', icon: <Home class="size-4" /> },
      { key: 'pages', label: '页面', icon: <FileText class="size-4" /> },
      { key: 'posts', label: '文章', icon: <Edit class="size-4" /> },
      { key: 'settings', label: '设置', icon: <Settings class="size-4" /> },
    ]

    return (
      <NavMenu
        items={items}
        value={value()}
        onValueChange={setValue}
        collapsed
      />
    )
  },
}

/** 禁用项 */
export const WithDisabled: Story = {
  render: () => {
    const [value, setValue] = createSignal('home')

    const items: NavMenuItemType[] = [
      { key: 'home', label: '首页', icon: <Home class="size-4" /> },
      { key: 'pages', label: '页面', icon: <FileText class="size-4" /> },
      { key: 'posts', label: '文章', icon: <Edit class="size-4" />, disabled: true },
      { key: 'users', label: '用户', icon: <Users class="size-4" />, disabled: true },
      { key: 'settings', label: '设置', icon: <Settings class="size-4" /> },
    ]

    return (
      <NavMenu
        items={items}
        value={value()}
        onValueChange={setValue}
      />
    )
  },
}

