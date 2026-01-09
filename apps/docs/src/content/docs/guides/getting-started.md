---
title: 快速开始
description: 安装和使用 Beeve UI
---

## 安装

使用 pnpm 安装组件库：

```bash
pnpm add @beeve/ui
```

## 配置 TailwindCSS

在你的 `tailwind.config.js` 中添加组件库的内容路径：

```js
export default {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/@beeve/ui/dist/**/*.js',
  ],
  // ...
}
```

## 基础使用

```tsx
import { Button } from '@beeve/ui'

function App() {
  return (
    <Button variant="primary" onClick={() => console.log('clicked')}>
      点击我
    </Button>
  )
}
```

## 导入组件

所有组件都可以从 `@beeve/ui` 直接导入：

```tsx
import {
  Button,
  Input,
  Select,
  Dialog,
  Card,
  Badge,
  // ...更多组件
} from '@beeve/ui'
```

## 类型导入

组件的类型可以通过 `type` 关键字导入：

```tsx
import type { ButtonProps, InputProps, SelectProps } from '@beeve/ui'
```

## 下一步

- 浏览 [Button 按钮](/components/button/) 组件文档
- 查看 [Input 输入框](/components/input/) 了解表单组件
- 探索 [Dialog 对话框](/components/dialog/) 学习弹窗组件
