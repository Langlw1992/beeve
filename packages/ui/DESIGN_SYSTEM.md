# Beeve Design System

Beeve UI 的设计语言，旨在构建简洁、直观且高效的企业级低代码平台界面。融合了 shadcn/ui 的现代美学与 Ant Design 的交互规范。

## 1. 核心原则 (Principles)

- **清晰 (Clarity)**: 内容优先，减少装饰性元素。通过排版和间距确立层级。
- **高效 (Efficiency)**: 针对低代码场景优化信息密度，提供紧凑模式。
- **一致 (Consistency)**: 统一的色彩、圆角和交互反馈，降低认知负荷。

## 2. 色彩系统 (Colors)

基于 OKLCH 色彩空间，支持自动深色模式适配。

### 基础色板 (Palette)
- **Primary (品牌色)**: `Blue`
  - 用于主要操作按钮、激活状态、高亮信息。
  - 风格：科技、理智、沉稳。
- **Neutral (中性色)**: `Zinc`
  - 用于文本、背景、边框。
  - 特点：无色偏，干净利落，适合长时间使用的工具类应用。

### 语义色 (Semantic)
- **Success**: `Emerald` (操作成功、状态正常)
- **Warning**: `Amber` (非阻塞性警告、需注意)
- **Error**: `Rose` (破坏性操作、系统错误)
- **Info**: `Sky` (帮助信息、链接)

## 3. 形状与几何 (Geometry)

### 圆角 (Radius)
我们采用 **0.5rem (8px)** 作为标准圆角基数。

| 变量名 | 值 | 适用场景 |
|-------|----|---------|
| `radius-sm` | 4px | Checkbox, Tag, Badge, 小图标容器 |
| `radius-md` | 8px | Button, Input, Select, Card (内部) |
| `radius-lg` | 12px | Modal, Dialog, Popover, Card (外部容器) |
| `radius-full` | 9999px | Avatar, Pill Button, Status Indicator |

### 边框 (Borders)
- 默认宽度: `1px`
- 默认颜色: `border-zinc-200` (Light) / `border-zinc-800` (Dark)
- 聚焦状态: 必须使用主题色光晕 `ring-2 ring-primary/20`，禁止使用固定颜色 (如 blue-500)。

## 4. 排版 (Typography)

### 字体栈
```css
font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
```

### 字号阶梯 (Type Scale)
针对工具类应用优化，基准字号略小以提升信息密度。

- **Text Base**: `14px` (0.875rem) - 正文、表单控件、表格内容。
- **Text Small**: `12px` (0.75rem) - 辅助信息、标签、提示。
- **Heading 1**: `24px` (1.5rem) - 页面主标题。
- **Heading 2**: `20px` (1.25rem) - 区块标题。
- **Heading 3**: `16px` (1rem) - 卡片/弹窗标题。

## 5. 间距 (Spacing)

基于 **4px** 网格系统。

- **Compact (紧凑)**: `space-x-2` (8px), `p-2` (8px) - 用于工具栏、属性面板。
- **Default (默认)**: `space-x-4` (16px), `p-4` (16px) - 用于表单布局、卡片间距。
- **Loose (宽松)**: `space-x-6` (24px), `p-6` (24px) - 用于着陆页、文档展示。

## 6. 组件尺寸规范 (Component Sizing)

采用**紧凑型 (Compact)** 尺寸阶梯，针对高密度信息展示和复杂操作面板优化。

| 尺寸 (Size) | 高度 (Height) | 文本 (Text) | 内边距 (Padding X) | 图标 (Icon) | 适用场景 |
|------------|--------------|------------|-------------------|------------|---------|
| **Small (sm)** | `28px` (h-7) | `12px` (xs) | `px-2` | `14px` | 属性面板、密集表格、工具栏 |
| **Default (md)** | `32px` (h-8) | `14px` (sm) | `px-3` | `15px` | 标准表单、通用按钮 |
| **Large (lg)** | `36px` (h-9) | `14px` (sm) | `px-4` | `16px` | 模态框主操作、重要入口 |
| **Icon Only** | `size-7/8/9` | - | `p-0` | `14/15/16px` | 纯图标按钮 |

## 8. 技术规范 (Technical Specs)

### Ref 支持
所有组件（包括基础组件和复合组件）都必须支持 `ref` 属性，以便外部可以获取到底层 DOM 元素或组件实例。
- 对于原生 HTML 包装组件，直接转发 ref。
- 对于复合组件，暴露根元素或主要交互元素的 ref。

### 样式覆盖
所有组件必须接受 `class` (或 `className`) 属性，并使用 `tailwind-variants` 或 `clsx` 正确合并样式，允许外部覆盖默认样式。
- 遵循上述尺寸规范。
- 样式: 实心主色 (Primary)，描边次级 (Outline)，幽灵按钮 (Ghost) 用于低频操作。
- 交互: Hover 时亮度提升 (Light) 或降低 (Dark)，Active 时缩放 98%。

### 卡片 (Card)
- 背景: `bg-card` (纯白/纯黑)。
- 边框: `border` (极细微)。
- 阴影: `shadow-sm` (默认)，Hover 时可升至 `shadow-md`。

### 输入框 (Input)
- 背景: `bg-transparent` 或 `bg-muted/50`。
- 边框: `border-input`。
- 聚焦: 边框变色 + 外部光晕 (Ring)。
