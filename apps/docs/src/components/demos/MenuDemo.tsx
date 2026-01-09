import { Dropdown, ContextMenu, Button } from '@beeve/ui'
import { Edit, Copy, Trash2, Share2, Download, Settings } from 'lucide-solid'
import { DemoBox } from '../DemoBox'

const basicItems = [
  { key: 'edit', label: '编辑', icon: <Edit class="size-4" /> },
  { key: 'copy', label: '复制', icon: <Copy class="size-4" /> },
  { type: 'divider' as const },
  { key: 'delete', label: '删除', icon: <Trash2 class="size-4" />, danger: true },
]

export function MenuDropdown() {
  return (
    <DemoBox title="下拉菜单">
      <Dropdown items={basicItems} onClick={(key) => console.log('clicked:', key)}>
        <Button>操作</Button>
      </Dropdown>
    </DemoBox>
  )
}

export function MenuContextMenu() {
  return (
    <DemoBox title="右键菜单">
      <ContextMenu items={basicItems} onClick={(key) => console.log('clicked:', key)}>
        <div class="flex size-40 items-center justify-center rounded-lg border-2 border-dashed border-border">
          <span class="text-sm text-muted-foreground">右键点击此处</span>
        </div>
      </ContextMenu>
    </DemoBox>
  )
}

export function MenuNested() {
  const nestedItems = [
    { key: 'new', label: '新建' },
    {
      key: 'share',
      label: '分享到...',
      icon: <Share2 class="size-4" />,
      children: [
        { key: 'wechat', label: '微信' },
        { key: 'weibo', label: '微博' },
        { key: 'email', label: '邮件' },
      ],
    },
    { type: 'divider' as const },
    {
      key: 'export',
      label: '导出',
      icon: <Download class="size-4" />,
      children: [
        { key: 'pdf', label: 'PDF' },
        { key: 'word', label: 'Word' },
        { key: 'excel', label: 'Excel' },
      ],
    },
  ]

  return (
    <DemoBox title="嵌套菜单">
      <Dropdown items={nestedItems}>
        <Button variant="outline">文件操作</Button>
      </Dropdown>
    </DemoBox>
  )
}

export function MenuGroups() {
  const groupedItems = [
    {
      type: 'group' as const,
      label: '编辑',
      children: [
        { key: 'edit', label: '编辑' },
        { key: 'copy', label: '复制' },
      ],
    },
    { type: 'divider' as const },
    {
      type: 'group' as const,
      label: '危险操作',
      children: [
        { key: 'delete', label: '删除', danger: true },
      ],
    },
  ]

  return (
    <DemoBox title="分组菜单">
      <Dropdown items={groupedItems}>
        <Button variant="outline">分组操作</Button>
      </Dropdown>
    </DemoBox>
  )
}

export function MenuWithShortcuts() {
  const shortcutItems = [
    { key: 'copy', label: '复制', shortcut: '⌘C' },
    { key: 'paste', label: '粘贴', shortcut: '⌘V' },
    { key: 'cut', label: '剪切', shortcut: '⌘X' },
    { type: 'divider' as const },
    { key: 'settings', label: '设置', icon: <Settings class="size-4" />, shortcut: '⌘,' },
  ]

  return (
    <DemoBox title="带快捷键">
      <Dropdown items={shortcutItems}>
        <Button variant="outline">快捷键菜单</Button>
      </Dropdown>
    </DemoBox>
  )
}

export function MenuSizes() {
  const items = [
    { key: 'item1', label: '选项一' },
    { key: 'item2', label: '选项二' },
    { key: 'item3', label: '选项三' },
  ]

  return (
    <DemoBox title="菜单尺寸">
      <Dropdown items={items} size="sm">
        <Button variant="outline" size="sm">小</Button>
      </Dropdown>
      <Dropdown items={items} size="md">
        <Button variant="outline">中</Button>
      </Dropdown>
      <Dropdown items={items} size="lg">
        <Button variant="outline" size="lg">大</Button>
      </Dropdown>
    </DemoBox>
  )
}
