/**
 * Menu Component Showcase Page
 */

import {createSignal} from 'solid-js'
import {createFileRoute} from '@tanstack/solid-router'
import {Dropdown, ContextMenu, Button, type MenuItemType} from '@beeve/ui'
import {ShowcaseSection} from '../components/ShowcaseGrid'
import {
  Copy,
  Trash2,
  Edit,
  Share2,
  Mail,
  MessageCircle,
  MoreHorizontal,
} from 'lucide-solid'

const basicItems: MenuItemType[] = [
  {key: 'edit', label: '编辑', icon: <Edit class="size-4" />},
  {key: 'copy', label: '复制', icon: <Copy class="size-4" />},
  {type: 'divider'},
  {key: 'delete', label: '删除', icon: <Trash2 class="size-4" />, danger: true},
]

const nestedItems: MenuItemType[] = [
  {key: 'edit', label: '编辑'},
  {
    key: 'share',
    label: '分享到...',
    icon: <Share2 class="size-4" />,
    children: [
      {key: 'email', label: '邮件', icon: <Mail class="size-4" />},
      {key: 'message', label: '消息', icon: <MessageCircle class="size-4" />},
    ],
  },
  {type: 'divider'},
  {key: 'delete', label: '删除', danger: true},
]

function MenuPage() {
  const [selectedKey, setSelectedKey] = createSignal('')
  const [checkboxChecked, setCheckboxChecked] = createSignal(false)
  const [radioValue, setRadioValue] = createSignal('option1')

  const checkboxItems: MenuItemType[] = [
    {key: 'normal', label: '普通选项'},
    {type: 'divider'},
    {
      type: 'checkbox',
      key: 'notifications',
      label: '启用通知',
      checked: checkboxChecked(),
      onChange: (checked) => setCheckboxChecked(checked),
    },
  ]

  const radioItems: MenuItemType[] = [
    {key: 'header', label: '选择主题', disabled: true},
    {
      type: 'radio',
      key: 'theme-group',
      name: 'theme',
      value: radioValue(),
      onChange: setRadioValue,
      children: [
        {key: 'option1', label: '浅色模式'},
        {key: 'option2', label: '深色模式'},
        {key: 'option3', label: '跟随系统'},
      ],
    },
  ]

  return (
    <div class="space-y-12">
      <div>
        <h1 class="text-3xl font-bold">Menu</h1>
        <p class="text-muted-foreground mt-2">
          菜单组件，支持下拉菜单和右键菜单。
        </p>
      </div>

      {/* Basic Dropdown */}
      <ShowcaseSection
        title="基础下拉菜单"
        description="点击触发的下拉菜单"
      >
        <div class="flex items-center gap-4">
          <Dropdown
            items={basicItems}
            onClick={setSelectedKey}
          >
            <Button variant="outline">
              <MoreHorizontal class="size-4 mr-2" />
              操作
            </Button>
          </Dropdown>
          {selectedKey() && (
            <span class="text-sm text-muted-foreground">
              选中: {selectedKey()}
            </span>
          )}
        </div>
      </ShowcaseSection>

      {/* Nested Menu */}
      <ShowcaseSection
        title="嵌套菜单"
        description="支持多级子菜单"
      >
        <Dropdown
          items={nestedItems}
          onClick={setSelectedKey}
        >
          <Button>文件操作</Button>
        </Dropdown>
      </ShowcaseSection>

      {/* Checkbox Menu */}
      <ShowcaseSection
        title="复选框菜单"
        description="菜单项可以是复选框"
      >
        <div class="flex items-center gap-4">
          <Dropdown items={checkboxItems}>
            <Button variant="outline">设置</Button>
          </Dropdown>
          <span class="text-sm text-muted-foreground">
            通知: {checkboxChecked() ? '开启' : '关闭'}
          </span>
        </div>
      </ShowcaseSection>

      {/* Radio Menu */}
      <ShowcaseSection
        title="单选菜单"
        description="菜单项可以是单选组"
      >
        <div class="flex items-center gap-4">
          <Dropdown items={radioItems}>
            <Button variant="outline">主题设置</Button>
          </Dropdown>
          <span class="text-sm text-muted-foreground">
            当前: {radioValue()}
          </span>
        </div>
      </ShowcaseSection>

      {/* Context Menu */}
      <ShowcaseSection
        title="右键菜单"
        description="右键点击触发的菜单"
      >
        <ContextMenu
          items={basicItems}
          onClick={setSelectedKey}
        >
          <div class="flex items-center justify-center w-64 h-32 border-2 border-dashed rounded-lg text-muted-foreground">
            右键点击此区域
          </div>
        </ContextMenu>
      </ShowcaseSection>

      {/* Menu Sizes */}
      <ShowcaseSection
        title="菜单尺寸"
        description="支持不同尺寸"
      >
        <div class="flex items-center gap-4">
          <Dropdown
            items={basicItems}
            size="sm"
          >
            <Button
              size="sm"
              variant="outline"
            >
              小尺寸
            </Button>
          </Dropdown>
          <Dropdown
            items={basicItems}
            size="md"
          >
            <Button variant="outline">中尺寸</Button>
          </Dropdown>
          <Dropdown
            items={basicItems}
            size="lg"
          >
            <Button
              size="lg"
              variant="outline"
            >
              大尺寸
            </Button>
          </Dropdown>
        </div>
      </ShowcaseSection>
    </div>
  )
}

export const Route = createFileRoute('/menu')({
  component: MenuPage,
})
