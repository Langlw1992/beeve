# 低代码引擎说明

## 核心概念

### Schema

Schema 是低代码系统的核心数据结构，描述了页面的完整信息。

```typescript
interface PageSchema {
  /** Schema 版本 */
  version: string
  /** 组件树 */
  components: ComponentNode[]
  /** 数据源配置 */
  dataSource?: DataSource[]
  /** 页面级状态 */
  state?: Record<string, unknown>
  /** 生命周期钩子 */
  lifeCycle?: LifeCycle
  /** 页面样式 */
  css?: string
}
```

### ComponentNode

组件节点是 Schema 的基本单元。

```typescript
interface ComponentNode {
  /** 唯一标识 */
  id: string
  /** 组件类型（对应物料 name） */
  type: string
  /** 组件属性 */
  props: Record<string, PropValue>
  /** 子组件 */
  children?: ComponentNode[]
  /** 条件渲染 */
  condition?: Expression
  /** 循环渲染 */
  loop?: LoopConfig
  /** 样式 */
  style?: Record<string, string>
  /** CSS 类名 */
  className?: string
  /** 事件绑定 */
  events?: EventBinding[]
}

// 属性值可以是静态值或表达式
type PropValue =
  | string
  | number
  | boolean
  | null
  | PropValue[]
  | { [key: string]: PropValue }
  | Expression

// 表达式
interface Expression {
  type: 'expression'
  value: string // JavaScript 表达式
}
```

### 示例 Schema

```json
{
  "version": "1.0",
  "state": {
    "count": 0
  },
  "components": [
    {
      "id": "root",
      "type": "Container",
      "props": {
        "className": "p-4"
      },
      "children": [
        {
          "id": "title",
          "type": "Text",
          "props": {
            "content": "Hello World",
            "variant": "h1"
          }
        },
        {
          "id": "counter",
          "type": "Text",
          "props": {
            "content": {
              "type": "expression",
              "value": "`Count: ${state.count}`"
            }
          }
        },
        {
          "id": "btn",
          "type": "Button",
          "props": {
            "children": "Increment"
          },
          "events": [
            {
              "name": "onClick",
              "actions": [
                {
                  "type": "setState",
                  "payload": {
                    "count": {
                      "type": "expression",
                      "value": "state.count + 1"
                    }
                  }
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

## 物料系统

### Material 定义

物料是可在设计器中使用的组件定义。

```typescript
interface Material {
  /** 物料名称（唯一标识） */
  name: string
  /** 显示名称 */
  title: string
  /** 描述 */
  description?: string
  /** 分类 */
  category: MaterialCategory
  /** 图标 */
  icon?: string
  /** 组件实现 */
  component: Component<any>
  /** 属性配置 schema */
  propsSchema: PropsSchema
  /** 默认属性值 */
  defaultProps?: Record<string, unknown>
  /** 是否为容器组件 */
  isContainer?: boolean
  /** 允许的子组件类型 */
  allowedChildren?: string[]
  /** 允许的父组件类型 */
  allowedParents?: string[]
  /** 预览配置 */
  preview?: PreviewConfig
}

type MaterialCategory =
  | 'basic'      // 基础组件
  | 'form'       // 表单组件
  | 'data'       // 数据展示
  | 'feedback'   // 反馈组件
  | 'layout'     // 布局组件
  | 'navigation' // 导航组件
  | 'advanced'   // 高级组件

interface PropsSchema {
  type: 'object'
  properties: Record<string, PropSchema>
  required?: string[]
}

interface PropSchema {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'expression'
  title: string
  description?: string
  default?: unknown
  enum?: unknown[]
  enumNames?: string[]
  // 用于属性面板的 setter 类型
  setter?: SetterType
}

type SetterType =
  | 'input'
  | 'textarea'
  | 'number'
  | 'switch'
  | 'select'
  | 'radio'
  | 'color'
  | 'icon'
  | 'expression'
  | 'json'
  | 'event'
  | 'slot'
```

### 物料注册

```typescript
// materials/registry.ts
import type { Material } from './protocol'

class MaterialRegistry {
  private materials = new Map<string, Material>()

  register(material: Material) {
    if (this.materials.has(material.name)) {
      console.warn(`Material "${material.name}" already registered, overwriting.`)
    }
    this.materials.set(material.name, material)
  }

  registerAll(materials: Material[]) {
    materials.forEach((m) => this.register(m))
  }

  get(name: string): Material | undefined {
    return this.materials.get(name)
  }

  getAll(): Material[] {
    return Array.from(this.materials.values())
  }

  getByCategory(category: MaterialCategory): Material[] {
    return this.getAll().filter((m) => m.category === category)
  }

  has(name: string): boolean {
    return this.materials.has(name)
  }

  unregister(name: string) {
    this.materials.delete(name)
  }
}

export const materialRegistry = new MaterialRegistry()
```

### 内置物料示例

```typescript
// materials/builtin/button.ts
import { Button } from '@beeve/ui'
import type { Material } from '../protocol'

export const buttonMaterial: Material = {
  name: 'Button',
  title: '按钮',
  description: '触发一个操作',
  category: 'basic',
  icon: 'cursor-click',
  component: Button,
  isContainer: false,

  propsSchema: {
    type: 'object',
    properties: {
      children: {
        type: 'string',
        title: '按钮文字',
        default: '按钮',
        setter: 'input',
      },
      variant: {
        type: 'string',
        title: '变体',
        enum: ['primary', 'secondary', 'outline', 'ghost', 'link', 'destructive'],
        enumNames: ['主要', '次要', '轮廓', '幽灵', '链接', '危险'],
        default: 'primary',
        setter: 'select',
      },
      size: {
        type: 'string',
        title: '尺寸',
        enum: ['sm', 'md', 'lg'],
        enumNames: ['小', '中', '大'],
        default: 'md',
        setter: 'radio',
      },
      disabled: {
        type: 'boolean',
        title: '禁用',
        default: false,
        setter: 'switch',
      },
      loading: {
        type: 'boolean',
        title: '加载中',
        default: false,
        setter: 'switch',
      },
    },
  },

  defaultProps: {
    children: '按钮',
    variant: 'primary',
    size: 'md',
  },
}
```

## 渲染器

### Renderer 组件

```typescript
// renderer/Renderer.tsx
import { For, Show, createMemo, type Component } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { materialRegistry } from '../materials/registry'
import { evaluateExpression } from './expression'
import { RendererContext, useRendererContext } from './context'
import type { ComponentNode, PageSchema } from '../schema/types'

interface RendererProps {
  schema: PageSchema
  mode?: 'preview' | 'design'
}

export const Renderer: Component<RendererProps> = (props) => {
  const [state, setState] = createStore(props.schema.state ?? {})

  const context = {
    state,
    setState,
    mode: () => props.mode ?? 'preview',
    // 其他上下文...
  }

  return (
    <RendererContext.Provider value={context}>
      <For each={props.schema.components}>
        {(node) => <NodeRenderer node={node} />}
      </For>
    </RendererContext.Provider>
  )
}

// 节点渲染器
const NodeRenderer: Component<{ node: ComponentNode }> = (props) => {
  const ctx = useRendererContext()
  const material = () => materialRegistry.get(props.node.type)

  // 条件渲染
  const shouldRender = createMemo(() => {
    if (!props.node.condition) return true
    return evaluateExpression(props.node.condition.value, {
      state: ctx.state,
    })
  })

  // 解析 props（处理表达式）
  const resolvedProps = createMemo(() => {
    return resolveProps(props.node.props, {
      state: ctx.state,
    })
  })

  // 处理事件
  const eventHandlers = createMemo(() => {
    return createEventHandlers(props.node.events ?? [], {
      state: ctx.state,
      setState: ctx.setState,
    })
  })

  return (
    <Show when={shouldRender() && material()}>
      {(mat) => (
        <Dynamic
          component={mat().component}
          {...resolvedProps()}
          {...eventHandlers()}
        >
          <Show when={props.node.children}>
            <For each={props.node.children}>
              {(child) => <NodeRenderer node={child} />}
            </For>
          </Show>
        </Dynamic>
      )}
    </Show>
  )
}
```

### 表达式求值

```typescript
// renderer/expression.ts

interface EvalContext {
  state: Record<string, unknown>
  props?: Record<string, unknown>
  item?: unknown      // 循环项
  index?: number      // 循环索引
}

export function evaluateExpression(
  expression: string,
  context: EvalContext
): unknown {
  try {
    // 创建安全的执行环境
    const fn = new Function(
      'state',
      'props',
      'item',
      'index',
      `"use strict"; return (${expression})`
    )
    return fn(context.state, context.props, context.item, context.index)
  } catch (error) {
    console.error('Expression evaluation error:', expression, error)
    return undefined
  }
}

export function isExpression(value: unknown): value is Expression {
  return (
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    value.type === 'expression'
  )
}

export function resolveProps(
  props: Record<string, unknown>,
  context: EvalContext
): Record<string, unknown> {
  const resolved: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(props)) {
    if (isExpression(value)) {
      resolved[key] = evaluateExpression(value.value, context)
    } else if (typeof value === 'object' && value !== null) {
      resolved[key] = resolveProps(value as Record<string, unknown>, context)
    } else {
      resolved[key] = value
    }
  }

  return resolved
}
```

## 设计器

### Designer 状态管理

```typescript
// designer/store.ts
import { createStore, produce } from 'solid-js/store'
import type { ComponentNode, PageSchema } from '../schema/types'

interface DesignerState {
  /** 当前 Schema */
  schema: PageSchema
  /** 选中的组件 ID */
  selectedId: string | null
  /** 悬停的组件 ID */
  hoveredId: string | null
  /** 拖拽状态 */
  dragging: DraggingState | null
  /** 历史记录 */
  history: PageSchema[]
  /** 历史索引 */
  historyIndex: number
}

interface DraggingState {
  type: 'material' | 'node'
  materialName?: string
  nodeId?: string
  position: { x: number; y: number }
}

export function createDesignerStore(initialSchema: PageSchema) {
  const [state, setState] = createStore<DesignerState>({
    schema: initialSchema,
    selectedId: null,
    hoveredId: null,
    dragging: null,
    history: [initialSchema],
    historyIndex: 0,
  })

  // 选择组件
  function selectNode(id: string | null) {
    setState('selectedId', id)
  }

  // 悬停组件
  function hoverNode(id: string | null) {
    setState('hoveredId', id)
  }

  // 添加组件
  function addNode(node: ComponentNode, parentId: string, index?: number) {
    setState(
      produce((draft) => {
        const parent = findNode(draft.schema.components, parentId)
        if (parent) {
          parent.children = parent.children ?? []
          if (index !== undefined) {
            parent.children.splice(index, 0, node)
          } else {
            parent.children.push(node)
          }
        } else {
          // 添加到根级别
          if (index !== undefined) {
            draft.schema.components.splice(index, 0, node)
          } else {
            draft.schema.components.push(node)
          }
        }
      })
    )
    pushHistory()
  }

  // 删除组件
  function removeNode(id: string) {
    setState(
      produce((draft) => {
        removeNodeById(draft.schema.components, id)
        if (draft.selectedId === id) {
          draft.selectedId = null
        }
      })
    )
    pushHistory()
  }

  // 更新组件属性
  function updateNodeProps(id: string, props: Partial<ComponentNode['props']>) {
    setState(
      produce((draft) => {
        const node = findNode(draft.schema.components, id)
        if (node) {
          Object.assign(node.props, props)
        }
      })
    )
    pushHistory()
  }

  // 移动组件
  function moveNode(
    id: string,
    targetParentId: string | null,
    targetIndex: number
  ) {
    setState(
      produce((draft) => {
        const node = findNode(draft.schema.components, id)
        if (!node) return

        // 从原位置移除
        removeNodeById(draft.schema.components, id)

        // 添加到新位置
        if (targetParentId) {
          const parent = findNode(draft.schema.components, targetParentId)
          if (parent) {
            parent.children = parent.children ?? []
            parent.children.splice(targetIndex, 0, node)
          }
        } else {
          draft.schema.components.splice(targetIndex, 0, node)
        }
      })
    )
    pushHistory()
  }

  // 撤销
  function undo() {
    if (state.historyIndex > 0) {
      setState('historyIndex', state.historyIndex - 1)
      setState('schema', state.history[state.historyIndex - 1])
    }
  }

  // 重做
  function redo() {
    if (state.historyIndex < state.history.length - 1) {
      setState('historyIndex', state.historyIndex + 1)
      setState('schema', state.history[state.historyIndex + 1])
    }
  }

  // 记录历史
  function pushHistory() {
    setState(
      produce((draft) => {
        // 截断未来的历史
        draft.history = draft.history.slice(0, draft.historyIndex + 1)
        // 添加新状态
        draft.history.push(JSON.parse(JSON.stringify(draft.schema)))
        draft.historyIndex = draft.history.length - 1
      })
    )
  }

  return {
    state,
    actions: {
      selectNode,
      hoverNode,
      addNode,
      removeNode,
      updateNodeProps,
      moveNode,
      undo,
      redo,
    },
  }
}

// 辅助函数
function findNode(
  nodes: ComponentNode[],
  id: string
): ComponentNode | undefined {
  for (const node of nodes) {
    if (node.id === id) return node
    if (node.children) {
      const found = findNode(node.children, id)
      if (found) return found
    }
  }
  return undefined
}

function removeNodeById(nodes: ComponentNode[], id: string): boolean {
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].id === id) {
      nodes.splice(i, 1)
      return true
    }
    if (nodes[i].children) {
      if (removeNodeById(nodes[i].children!, id)) {
        return true
      }
    }
  }
  return false
}
```

### Designer 组件

```typescript
// designer/Designer.tsx
import { type Component, splitProps } from 'solid-js'
import { createDesignerStore } from './store'
import { DesignerContext } from './context'
import { Canvas } from './Canvas'
import { MaterialPanel } from './MaterialPanel'
import { PropertyPanel } from './PropertyPanel'
import { ComponentTree } from './ComponentTree'
import { Toolbar } from './Toolbar'
import type { PageSchema } from '../schema/types'

interface DesignerProps {
  schema: PageSchema
  onChange?: (schema: PageSchema) => void
}

export const Designer: Component<DesignerProps> = (props) => {
  const store = createDesignerStore(props.schema)

  // 监听变化
  createEffect(() => {
    props.onChange?.(store.state.schema)
  })

  return (
    <DesignerContext.Provider value={store}>
      <div class="flex h-screen">
        {/* 左侧：物料面板 + 组件树 */}
        <div class="w-64 flex flex-col border-r">
          <MaterialPanel />
          <ComponentTree />
        </div>

        {/* 中间：画布 */}
        <div class="flex-1 flex flex-col">
          <Toolbar />
          <Canvas />
        </div>

        {/* 右侧：属性面板 */}
        <div class="w-80 border-l">
          <PropertyPanel />
        </div>
      </div>
    </DesignerContext.Provider>
  )
}
```

## 事件系统

### 事件绑定

```typescript
interface EventBinding {
  /** 事件名称 */
  name: string // onClick, onChange, etc.
  /** 动作列表 */
  actions: Action[]
}

type Action =
  | SetStateAction
  | CallApiAction
  | NavigateAction
  | CustomAction

interface SetStateAction {
  type: 'setState'
  payload: Record<string, unknown | Expression>
}

interface CallApiAction {
  type: 'callApi'
  dataSourceId: string
  params?: Record<string, unknown | Expression>
  onSuccess?: Action[]
  onError?: Action[]
}

interface NavigateAction {
  type: 'navigate'
  path: string | Expression
  params?: Record<string, unknown | Expression>
}

interface CustomAction {
  type: 'custom'
  code: string // JavaScript 代码
}
```

### 事件处理器生成

```typescript
// renderer/events.ts
import type { EventBinding, Action } from '../schema/types'

interface ActionContext {
  state: Record<string, unknown>
  setState: (updates: Record<string, unknown>) => void
  navigate?: (path: string, params?: Record<string, unknown>) => void
  callApi?: (dataSourceId: string, params?: Record<string, unknown>) => Promise<unknown>
}

export function createEventHandlers(
  events: EventBinding[],
  context: ActionContext
): Record<string, (event: Event) => void> {
  const handlers: Record<string, (event: Event) => void> = {}

  for (const binding of events) {
    handlers[binding.name] = async (event: Event) => {
      for (const action of binding.actions) {
        await executeAction(action, { ...context, event })
      }
    }
  }

  return handlers
}

async function executeAction(
  action: Action,
  context: ActionContext & { event: Event }
): Promise<void> {
  switch (action.type) {
    case 'setState': {
      const updates: Record<string, unknown> = {}
      for (const [key, value] of Object.entries(action.payload)) {
        updates[key] = isExpression(value)
          ? evaluateExpression(value.value, { state: context.state })
          : value
      }
      context.setState(updates)
      break
    }

    case 'callApi': {
      if (!context.callApi) break
      try {
        const params = resolveProps(action.params ?? {}, { state: context.state })
        const result = await context.callApi(action.dataSourceId, params)
        if (action.onSuccess) {
          for (const successAction of action.onSuccess) {
            await executeAction(successAction, { ...context, result })
          }
        }
      } catch (error) {
        if (action.onError) {
          for (const errorAction of action.onError) {
            await executeAction(errorAction, { ...context, error })
          }
        }
      }
      break
    }

    case 'navigate': {
      if (!context.navigate) break
      const path = isExpression(action.path)
        ? evaluateExpression(action.path.value, { state: context.state })
        : action.path
      const params = resolveProps(action.params ?? {}, { state: context.state })
      context.navigate(String(path), params)
      break
    }

    case 'custom': {
      try {
        const fn = new Function('state', 'event', 'setState', action.code)
        await fn(context.state, context.event, context.setState)
      } catch (error) {
        console.error('Custom action error:', error)
      }
      break
    }
  }
}
```

## 数据源

### DataSource 定义

```typescript
interface DataSource {
  /** 数据源 ID */
  id: string
  /** 数据源类型 */
  type: 'api' | 'static' | 'computed'
  /** 配置 */
  config: ApiConfig | StaticConfig | ComputedConfig
}

interface ApiConfig {
  url: string
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  headers?: Record<string, string>
  params?: Record<string, unknown>
  body?: Record<string, unknown>
  transform?: string // 响应转换表达式
}

interface StaticConfig {
  data: unknown
}

interface ComputedConfig {
  expression: string // 计算表达式
  deps: string[]     // 依赖的数据源 ID
}
```

### 数据源管理

```typescript
// renderer/data-source.ts
import { createSignal, createEffect, createMemo } from 'solid-js'

export function createDataSourceManager(dataSources: DataSource[]) {
  const cache = new Map<string, unknown>()
  const [loading, setLoading] = createSignal<Record<string, boolean>>({})
  const [errors, setErrors] = createSignal<Record<string, Error | null>>({})

  async function fetch(id: string, params?: Record<string, unknown>) {
    const ds = dataSources.find((d) => d.id === id)
    if (!ds) throw new Error(`DataSource "${id}" not found`)

    setLoading({ ...loading(), [id]: true })
    setErrors({ ...errors(), [id]: null })

    try {
      let result: unknown

      switch (ds.type) {
        case 'api': {
          const config = ds.config as ApiConfig
          const response = await fetchApi(config, params)
          result = config.transform
            ? evaluateExpression(config.transform, { response })
            : response
          break
        }
        case 'static': {
          result = (ds.config as StaticConfig).data
          break
        }
        case 'computed': {
          const config = ds.config as ComputedConfig
          const deps: Record<string, unknown> = {}
          for (const depId of config.deps) {
            deps[depId] = cache.get(depId)
          }
          result = evaluateExpression(config.expression, { deps })
          break
        }
      }

      cache.set(id, result)
      return result
    } catch (error) {
      setErrors({ ...errors(), [id]: error as Error })
      throw error
    } finally {
      setLoading({ ...loading(), [id]: false })
    }
  }

  function get(id: string) {
    return cache.get(id)
  }

  return {
    fetch,
    get,
    loading,
    errors,
  }
}
```

## 目录结构总结

```
packages/lowcode-core/
├── src/
│   ├── schema/
│   │   ├── types.ts         # 类型定义
│   │   ├── validators.ts    # Zod Schema 验证
│   │   ├── transforms.ts    # Schema 转换工具
│   │   └── index.ts
│   │
│   ├── renderer/
│   │   ├── Renderer.tsx     # 渲染器组件
│   │   ├── context.ts       # 渲染上下文
│   │   ├── expression.ts    # 表达式求值
│   │   ├── events.ts        # 事件处理
│   │   ├── data-source.ts   # 数据源管理
│   │   └── index.ts
│   │
│   ├── designer/
│   │   ├── Designer.tsx     # 设计器主组件
│   │   ├── Canvas.tsx       # 画布
│   │   ├── MaterialPanel.tsx
│   │   ├── PropertyPanel.tsx
│   │   ├── ComponentTree.tsx
│   │   ├── Toolbar.tsx
│   │   ├── DragDrop.tsx     # 拖拽系统
│   │   ├── Selection.tsx    # 选中态
│   │   ├── store.ts         # 状态管理
│   │   ├── context.ts
│   │   ├── history.ts       # 撤销/重做
│   │   └── index.ts
│   │
│   ├── materials/
│   │   ├── protocol.ts      # 物料协议
│   │   ├── registry.ts      # 物料注册
│   │   ├── builtin/         # 内置物料
│   │   │   ├── index.ts
│   │   │   ├── button.ts
│   │   │   ├── text.ts
│   │   │   ├── input.ts
│   │   │   ├── container.ts
│   │   │   └── ...
│   │   └── index.ts
│   │
│   ├── plugins/
│   │   ├── types.ts         # 插件类型
│   │   ├── manager.ts       # 插件管理器
│   │   └── index.ts
│   │
│   └── index.ts
│
├── package.json
└── tsconfig.json
```
