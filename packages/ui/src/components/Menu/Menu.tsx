/**
 * @beeve/ui - Menu Component
 * 菜单组件，基于 @zag-js/menu 实现
 * 采用 Ant Design 风格的数据驱动 API
 *
 * @example
 * ```tsx
 * // Dropdown Menu
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
 *
 * // Context Menu
 * <ContextMenu items={items} onClick={(key) => console.log(key)}>
 *   <div>右键点击此处</div>
 * </ContextMenu>
 *
 * // Nested Menu
 * const nestedItems = [
 *   { key: 'new', label: '新建' },
 *   {
 *     key: 'share',
 *     label: '分享到...',
 *     children: [
 *       { key: 'wechat', label: '微信' },
 *       { key: 'email', label: '邮件' },
 *     ]
 *   },
 * ]
 *
 * <Dropdown items={nestedItems}>
 *   <Button>文件</Button>
 * </Dropdown>
 * ```
 */

import {
  createContext,
  useContext,
  onMount,
  createMemo,
  createUniqueId,
  splitProps,
  Show,
  For,
  type Component,
  type Accessor,
} from 'solid-js'
import { Portal } from 'solid-js/web'
import { tv } from 'tailwind-variants'
import { ChevronRight, Check } from 'lucide-solid'
import * as menu from '@zag-js/menu'
import { useMachine, normalizeProps, type PropTypes } from '@zag-js/solid'
import type {
  MenuItemType,
  MenuItemData,
  DropdownProps,
  ContextMenuProps,
  MenuRadioGroupData,
  MenuCheckboxData,
} from '../../primitives/menu'
import {
  isDivider,
  isGroup,
  isRadioGroup,
  isCheckbox,
  isMenuItem,
  hasChildren,
} from '../../primitives/menu'

// ==================== Types ====================

type MenuApi = menu.Api<PropTypes>
type MenuService = menu.Service

// ==================== 样式定义 ====================

const menuStyles = tv({
  slots: {
    positioner: 'z-50',
    content: [
      'min-w-[8rem]',
      'overflow-hidden',
      'rounded-md border border-border',
      'bg-popover p-1',
      'text-popover-foreground',
      'shadow-md',
      '!outline-none',
      'data-[state=open]:animate-in',
      'data-[state=closed]:animate-out',
      'data-[state=closed]:fade-out-0',
      'data-[state=open]:fade-in-0',
      'data-[state=closed]:zoom-out-95',
      'data-[state=open]:zoom-in-95',
    ],
    item: [
      'relative flex',
      'cursor-default select-none items-center gap-2',
      'rounded-sm px-2 py-1.5',
      'text-sm',
      'outline-none',
      'transition-colors',
      'focus:bg-accent focus:text-accent-foreground',
      'data-[highlighted]:bg-accent',
      'data-[highlighted]:text-accent-foreground',
      'data-[disabled]:pointer-events-none',
      'data-[disabled]:opacity-50',
    ],
    itemDanger: [
      'text-destructive',
      'focus:bg-destructive/10 focus:text-destructive',
      'data-[highlighted]:bg-destructive/10',
      'data-[highlighted]:text-destructive',
    ],
    triggerItem: [
      'relative flex',
      'cursor-default select-none items-center gap-2',
      'rounded-sm px-2 py-1.5',
      'text-sm',
      'outline-none',
      'transition-colors',
      'focus:bg-accent',
      'data-[highlighted]:bg-accent',
      'data-[highlighted]:text-accent-foreground',
      'data-[state=open]:bg-accent',
      'data-[disabled]:pointer-events-none',
      'data-[disabled]:opacity-50',
    ],
    separator: '-mx-1 my-1 h-px bg-muted',
    itemGroup: '',
    itemGroupLabel: 'px-2 py-1.5 text-sm font-semibold text-muted-foreground',
    itemIndicator: [
      'absolute left-2 inline-flex size-4 items-center justify-center',
    ],
    itemText: '',
    shortcut: 'ml-auto text-xs tracking-widest text-muted-foreground',
  },
  variants: {
    size: {
      sm: {
        content: 'min-w-[6rem] p-1',
        item: 'px-2 py-1 text-xs gap-1.5',
        triggerItem: 'px-2 py-1 text-xs gap-1.5',
        itemGroupLabel: 'px-2 py-1 text-xs',
        itemIndicator: 'size-3.5',
      },
      md: {
        content: 'min-w-[8rem] p-1',
        item: 'px-2 py-1.5 text-sm gap-2',
        triggerItem: 'px-2 py-1.5 text-sm gap-2',
        itemGroupLabel: 'px-2 py-1.5 text-sm',
        itemIndicator: 'size-4',
      },
      lg: {
        content: 'min-w-[10rem] p-1',
        item: 'px-3 py-2 text-base gap-2.5',
        triggerItem: 'px-3 py-2 text-base gap-2.5',
        itemGroupLabel: 'px-3 py-2 text-base',
        itemIndicator: 'size-5',
      },
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

// ==================== Context ====================

interface MenuContextValue {
  api: Accessor<MenuApi>
  service: MenuService
  size: 'sm' | 'md' | 'lg'
  onClick?: (key: string) => void
  closeOnSelect?: boolean
}

const MenuContext = createContext<MenuContextValue>()

function useMenuContext() {
  const context = useContext(MenuContext)
  if (!context) {
    throw new Error('Menu components must be used within MenuContext')
  }
  return context
}

// ==================== 内部渲染组件 ====================

/** 渲染单个菜单项 */
const MenuItemRenderer: Component<{
  item: MenuItemData
  parentApi: Accessor<MenuApi>
}> = (props) => {
  const ctx = useMenuContext()
  const styles = createMemo(() => menuStyles({ size: ctx.size }))

  const handleSelect = () => {
    props.item.onClick?.()
    ctx.onClick?.(props.item.key)
  }

  return (
    <div
      {...props.parentApi().getItemProps({
        value: props.item.key,
        disabled: props.item.disabled,
        closeOnSelect: ctx.closeOnSelect,
      })}
      onClick={handleSelect}
      class={styles().item({
        class: props.item.danger ? styles().itemDanger() : undefined,
      })}
    >
      <Show when={props.item.icon}>
        <span class="size-4">{props.item.icon}</span>
      </Show>
      <span class="flex-1">{props.item.label}</span>
      <Show when={props.item.shortcut}>
        <span class={styles().shortcut()}>{props.item.shortcut}</span>
      </Show>
    </div>
  )
}

/** 渲染带子菜单的菜单项 */
const SubMenuRenderer: Component<{
  item: MenuItemData & { children: MenuItemType[] }
  parentApi: Accessor<MenuApi>
  parentService: MenuService
}> = (props) => {
  const ctx = useMenuContext()
  const styles = createMemo(() => menuStyles({ size: ctx.size }))

  // 创建子菜单的状态机
  const subService = useMachine(menu.machine, () => ({
    id: createUniqueId(),
    'aria-label': typeof props.item.label === 'string' ? props.item.label : props.item.key,
    closeOnSelect: ctx.closeOnSelect ?? true,
    loop: true,
    positioning: { placement: 'right-start' as const, gutter: -4 },
  }))

  const subApi = createMemo(() => menu.connect(subService, normalizeProps))

  // 注册父子关系
  onMount(() => {
    setTimeout(() => {
      props.parentApi().setChild(subService)
      subApi().setParent(props.parentService)
    })
  })

  // 获取触发项的 props
  const triggerProps = createMemo(() => props.parentApi().getTriggerItemProps(subApi()))

  return (
    <>
      <div {...triggerProps()} class={styles().triggerItem()}>
        <Show when={props.item.icon}>
          <span class="size-4">{props.item.icon}</span>
        </Show>
        <span class="flex-1">{props.item.label}</span>
        <ChevronRight class="ml-auto size-4" />
      </div>

      <Show when={subApi().open}>
        <Portal>
          <div {...subApi().getPositionerProps()} class={styles().positioner()}>
            <div {...subApi().getContentProps()} class={styles().content()}>
              <MenuItemsRenderer items={props.item.children} api={subApi} service={subService} />
            </div>
          </div>
        </Portal>
      </Show>
    </>
  )
}

/** 渲染复选框项 */
const CheckboxItemRenderer: Component<{
  item: MenuCheckboxData
  parentApi: Accessor<MenuApi>
}> = (props) => {
  const ctx = useMenuContext()
  const styles = createMemo(() => menuStyles({ size: ctx.size }))

  const itemProps = {
    type: 'checkbox' as const,
    value: props.item.key,
    checked: props.item.checked ?? false,
    disabled: props.item.disabled,
    onCheckedChange: props.item.onChange,
  }

  return (
    <div
      {...props.parentApi().getOptionItemProps(itemProps)}
      class={styles().item()}
    >
      <span {...props.parentApi().getItemIndicatorProps(itemProps)} class={styles().itemIndicator()}>
        <Check class="size-full" />
      </span>
      <span {...props.parentApi().getItemTextProps(itemProps)} class="pl-6">
        {props.item.label}
      </span>
    </div>
  )
}

/** 渲染单选组 */
const RadioGroupRenderer: Component<{
  group: MenuRadioGroupData
  parentApi: Accessor<MenuApi>
}> = (props) => {
  const ctx = useMenuContext()
  const styles = createMemo(() => menuStyles({ size: ctx.size }))

  return (
    <For each={props.group.children}>
      {(radioItem) => {
        const itemProps = {
          type: 'radio' as const,
          value: radioItem.key,
          name: props.group.name,
          checked: props.group.value === radioItem.key,
          disabled: radioItem.disabled,
          onCheckedChange: (checked: boolean) => {
            if (checked) {
              props.group.onChange?.(radioItem.key)
            }
          },
        }

        return (
          <div
            {...props.parentApi().getOptionItemProps(itemProps)}
            class={styles().item()}
          >
            <span {...props.parentApi().getItemIndicatorProps(itemProps)} class={styles().itemIndicator()}>
              <Check class="size-full" />
            </span>
            <span {...props.parentApi().getItemTextProps(itemProps)} class="pl-6">
              {radioItem.label}
            </span>
          </div>
        )
      }}
    </For>
  )
}

/** 渲染菜单项列表 */
const MenuItemsRenderer: Component<{
  items: MenuItemType[]
  api: Accessor<MenuApi>
  service: MenuService
}> = (props) => {
  const ctx = useMenuContext()
  const styles = createMemo(() => menuStyles({ size: ctx.size }))

  return (
    <For each={props.items}>
      {(item) => {
        // 分隔线
        if (isDivider(item)) {
          return <hr {...props.api().getSeparatorProps()} class={styles().separator()} />
        }

        // 分组
        if (isGroup(item)) {
          return (
            <div class={styles().itemGroup()}>
              <Show when={item.label}>
                <div class={styles().itemGroupLabel()}>{item.label}</div>
              </Show>
              <MenuItemsRenderer items={item.children} api={props.api} service={props.service} />
            </div>
          )
        }

        // 单选组
        if (isRadioGroup(item)) {
          return <RadioGroupRenderer group={item} parentApi={props.api} />
        }

        // 复选框
        if (isCheckbox(item)) {
          return <CheckboxItemRenderer item={item} parentApi={props.api} />
        }

        // 普通菜单项
        if (isMenuItem(item)) {
          // 有子菜单
          if (hasChildren(item)) {
            return (
              <SubMenuRenderer
                item={item as MenuItemData & { children: MenuItemType[] }}
                parentApi={props.api}
                parentService={props.service}
              />
            )
          }

          // 普通项
          return <MenuItemRenderer item={item} parentApi={props.api} />
        }

        return null
      }}
    </For>
  )
}

// ==================== Dropdown 组件 ====================

/**
 * Dropdown 下拉菜单组件
 *
 * @example
 * ```tsx
 * const items = [
 *   { key: 'edit', label: '编辑' },
 *   { key: 'delete', label: '删除', danger: true },
 * ]
 *
 * <Dropdown items={items} onClick={(key) => console.log(key)}>
 *   <Button>操作</Button>
 * </Dropdown>
 * ```
 */
export const Dropdown: Component<DropdownProps> = (props) => {
  const [local] = splitProps(props, [
    'children',
    'items',
    'size',
    'onClick',
    'id',
    'closeOnSelect',
    'loop',
    'class',
    'positioning',
    'onOpenChange',
  ])

  const service = useMachine(menu.machine, () => ({
    id: local.id ?? createUniqueId(),
    closeOnSelect: local.closeOnSelect ?? true,
    loop: local.loop ?? true,
    positioning: local.positioning ?? { placement: 'bottom-start' as const },
    onOpenChange: local.onOpenChange,
  }))

  const api = createMemo(() => menu.connect(service, normalizeProps))
  const size = () => local.size ?? 'md'
  const styles = createMemo(() => menuStyles({ size: size() }))

  return (
    <MenuContext.Provider
      value={{
        api,
        service,
        size: size(),
        onClick: local.onClick,
        closeOnSelect: local.closeOnSelect,
      }}
    >
      {/* 触发器 - 使用 span 避免嵌套 button，忽略 ref 类型不匹配 */}
      <span
        {...(api().getTriggerProps() as Record<string, unknown>)}
        class="inline-flex outline-none [&_button]:ring-0 [&_button]:outline-none [&_button]:focus-visible:ring-0"
      >
        {local.children}
      </span>

      {/* 菜单内容 */}
      <Show when={api().open}>
        <Portal>
          <div {...api().getPositionerProps()} class={styles().positioner()}>
            <div {...api().getContentProps()} class={styles().content({ class: local.class })}>
              <MenuItemsRenderer items={local.items} api={api} service={service} />
            </div>
          </div>
        </Portal>
      </Show>
    </MenuContext.Provider>
  )
}

// ==================== ContextMenu 组件 ====================

/**
 * ContextMenu 右键菜单组件
 *
 * @example
 * ```tsx
 * const items = [
 *   { key: 'copy', label: '复制' },
 *   { key: 'paste', label: '粘贴' },
 * ]
 *
 * <ContextMenu items={items} onClick={(key) => console.log(key)}>
 *   <div class="p-10 border">右键点击此处</div>
 * </ContextMenu>
 * ```
 */
export const ContextMenu: Component<ContextMenuProps> = (props) => {
  const [local] = splitProps(props, [
    'children',
    'items',
    'size',
    'onClick',
    'id',
    'closeOnSelect',
    'loop',
    'class',
    'onOpenChange',
  ])

  const service = useMachine(menu.machine, () => ({
    id: local.id ?? createUniqueId(),
    closeOnSelect: local.closeOnSelect ?? true,
    loop: local.loop ?? true,
    onOpenChange: local.onOpenChange,
  }))

  const api = createMemo(() => menu.connect(service, normalizeProps))
  const size = () => local.size ?? 'md'
  const styles = createMemo(() => menuStyles({ size: size() }))

  return (
    <MenuContext.Provider
      value={{
        api,
        service,
        size: size(),
        onClick: local.onClick,
        closeOnSelect: local.closeOnSelect,
      }}
    >
      {/* 触发区域 */}
      <div {...api().getContextTriggerProps()}>
        {local.children}
      </div>

      {/* 菜单内容 */}
      <Show when={api().open}>
        <Portal>
          <div {...api().getPositionerProps()} class={styles().positioner()}>
            <div {...api().getContentProps()} class={styles().content({ class: local.class })}>
              <MenuItemsRenderer items={local.items} api={api} service={service} />
            </div>
          </div>
        </Portal>
      </Show>
    </MenuContext.Provider>
  )
}

// ==================== 导出 ====================

export { Dropdown as Menu }
