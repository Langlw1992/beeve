# Dialog 对话框

模态对话框组件，用于显示重要信息或请求用户输入。采用 Ant Design 风格的 Props API。

## 基础用法

```tsx
import { createSignal } from 'solid-js'
import { Dialog, Button } from '@beeve/ui'

const [open, setOpen] = createSignal(false)

<Button onClick={() => setOpen(true)}>打开对话框</Button>
<Dialog
  open={open()}
  onOpenChange={setOpen}
  title="对话框标题"
  description="对话框描述内容"
/>
```

## 确认对话框

```tsx
<Dialog
  open={open()}
  onOpenChange={setOpen}
  title="确认删除"
  description="此操作不可撤销，所有数据将被永久删除。"
  role="alertdialog"
  okText="确认删除"
  okType="destructive"
  onOk={handleDelete}
  onCancel={handleCancel}
/>
```

## 异步操作

当 `onOk` 返回 Promise 时，确定按钮自动显示 loading 状态：

```tsx
<Dialog
  open={open()}
  onOpenChange={setOpen}
  title="保存数据"
  onOk={async () => {
    await saveData()
    // Promise resolve 后自动关闭
  }}
/>
```

## API

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| `open` | 是否打开 | `boolean` | - |
| `onOpenChange` | 打开状态变化回调 | `(open: boolean) => void` | - |
| `title` | 标题 | `JSX.Element` | - |
| `description` | 描述 | `JSX.Element` | - |
| `children` | 内容 | `JSX.Element` | - |
| `footer` | 自定义底部，`null` 则不显示 | `JSX.Element \| null` | 默认按钮 |
| `okText` | 确定按钮文字 | `string` | `'确定'` |
| `cancelText` | 取消按钮文字 | `string` | `'取消'` |
| `okType` | 确定按钮类型 | `'primary' \| 'destructive' \| ...` | `'primary'` |
| `confirmLoading` | 确定按钮 loading | `boolean` | - |
| `onOk` | 点击确定回调，返回 Promise 自动 loading | `() => void \| Promise<void>` | - |
| `onCancel` | 点击取消回调 | `() => void` | - |
| `width` | 宽度 | `'sm' \| 'md' \| 'lg' \| 'xl' \| '2xl' \| 'full'` | `'lg'` |
| `closable` | 显示关闭按钮 | `boolean` | `true` |
| `maskClosable` | 点击遮罩关闭 | `boolean` | `true` |
| `keyboard` | ESC 关闭 | `boolean` | `true` |
| `role` | 对话框角色 | `'dialog' \| 'alertdialog'` | `'dialog'` |
| `class` | 自定义类名 | `string` | - |

## 无障碍

- 打开时自动获取焦点
- 焦点限制在对话框内
- ESC 键关闭
- 关闭后焦点返回触发元素
- 危险操作使用 `role="alertdialog"`
