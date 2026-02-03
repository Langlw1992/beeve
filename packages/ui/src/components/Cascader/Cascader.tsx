/**
 * @beeve/ui - Cascader Component
 * 级联选择器组件，基于 @zag-js/popover 实现弹出层
 * 样式与 Menu 组件保持一致
 *
 * @example
 * ```tsx
 * // 单选模式
 * <Cascader
 *   options={options}
 *   value={['zhejiang', 'hangzhou']}
 *   onChange={(details) => console.log(details.value)}
 *   placeholder="请选择"
 * />
 *
 * // 多选模式
 * <Cascader
 *   multiple
 *   options={options}
 *   value={[['zhejiang', 'hangzhou'], ['jiangsu', 'suzhou']]}
 *   onChange={(details) => console.log(details.value)}
 *   showPath="last"
 *   checkStrategy="child"
 * />
 * ```
 */

import {
  createSignal,
  createMemo,
  createUniqueId,
  splitProps,
  Show,
  For,
  createEffect,
  on,
} from 'solid-js'
import {Portal} from 'solid-js/web'
import * as popover from '@zag-js/popover'
import {useMachine, normalizeProps} from '@zag-js/solid'
import {ChevronDown, ChevronRight, X, Check} from 'lucide-solid'

import {cascaderStyles} from './styles'
import type {
  CascaderProps,
  CascaderOption,
  CascaderSingleProps,
  CascaderMultipleProps,
  CascaderValueChangeDetails,
  CascaderMultipleValueChangeDetails,
} from './types'

export type {
  CascaderProps,
  CascaderOption,
  CascaderSingleProps,
  CascaderMultipleProps,
  CascaderValueChangeDetails,
  CascaderMultipleValueChangeDetails,
}

// 辅助函数：比较两个路径是否相等
function pathEquals(a: string[], b: string[]): boolean {
  if (a.length !== b.length) {
    return false
  }
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false
    }
  }
  return true
}

// 辅助函数：检查路径数组中是否包含某个路径
function containsPath(paths: string[][], target: string[]): boolean {
  for (const path of paths) {
    if (pathEquals(path, target)) {
      return true
    }
  }
  return false
}

// 内部 props 类型（合并所有可能的 props）
interface CascaderInternalProps<T = unknown> {
  options: CascaderOption<T>[]
  value?: string[] | string[][]
  defaultValue?: string[] | string[][]
  onChange?:
    | ((details: CascaderValueChangeDetails<T>) => void)
    | ((details: CascaderMultipleValueChangeDetails<T>) => void)
  placeholder?: string
  disabled?: boolean
  clearable?: boolean
  expandTrigger?: 'click' | 'hover'
  changeOnSelect?: boolean
  loadData?: (option: CascaderOption<T>) => Promise<CascaderOption<T>[]>
  displayRender?: unknown
  class?: string
  popupClass?: string
  onOpenChange?: (open: boolean) => void
  multiple?: boolean
  showPath?: 'full' | 'last'
  checkStrategy?: 'all' | 'parent' | 'child'
  maxTagCount?: number
  size?: 'sm' | 'md' | 'lg'
  error?: boolean
}

export function Cascader<T = unknown>(props: CascaderProps<T>) {
  const [local, styleProps] = splitProps(
    props as unknown as CascaderInternalProps<T>,
    [
      'options',
      'value',
      'defaultValue',
      'onChange',
      'placeholder',
      'disabled',
      'clearable',
      'expandTrigger',
      'changeOnSelect',
      'loadData',
      'displayRender',
      'class',
      'popupClass',
      'onOpenChange',
      'multiple',
      'showPath',
      'checkStrategy',
      'maxTagCount',
    ],
    ['size', 'error'],
  )

  const styles = cascaderStyles({...styleProps})
  const multiple = () => local.multiple === true
  const showPath = () => local.showPath ?? 'full'
  const checkStrategy = () => local.checkStrategy ?? 'child'

  // 单选内部值
  const [internalSingleValue, setInternalSingleValue] = createSignal<string[]>(
    !multiple() ? ((local.defaultValue as string[] | undefined) ?? []) : [],
  )

  // 多选内部值
  const [internalMultipleValue, setInternalMultipleValue] = createSignal<
    string[][]
  >(multiple() ? ((local.defaultValue as string[][] | undefined) ?? []) : [])

  // 当前展开的路径（用于显示多列）
  const [expandedPath, setExpandedPath] = createSignal<string[]>([])

  // 加载中的选项
  const [loadingOptions, setLoadingOptions] = createSignal<Set<string>>(
    new Set(),
  )

  // 受控/非受控值 - 单选
  const selectedSingleValue = createMemo(() => {
    if (multiple()) {
      return []
    }
    return (local.value as string[] | undefined) ?? internalSingleValue()
  })

  // 受控/非受控值 - 多选
  const selectedMultipleValue = createMemo(() => {
    if (!multiple()) {
      return []
    }
    return (local.value as string[][] | undefined) ?? internalMultipleValue()
  })

  // Popover 状态机
  const popoverService = useMachine(popover.machine, () => ({
    id: createUniqueId(),
    positioning: {placement: 'bottom-start' as const},
    onOpenChange: (details) => {
      local.onOpenChange?.(details.open)
      // 打开时，根据当前选中值设置展开路径
      if (details.open) {
        if (!multiple() && selectedSingleValue().length > 0) {
          setExpandedPath(selectedSingleValue().slice(0, -1))
        } else {
          setExpandedPath([])
        }
      }
    },
  }))

  const api = createMemo(() => popover.connect(popoverService, normalizeProps))

  // 同步外部 value 变化 - 单选
  createEffect(
    on(
      () => (!multiple() ? (local.value as string[] | undefined) : undefined),
      (newValue) => {
        if (newValue !== undefined && !multiple()) {
          setInternalSingleValue(newValue)
        }
      },
    ),
  )

  // 同步外部 value 变化 - 多选
  createEffect(
    on(
      () => (multiple() ? (local.value as string[][] | undefined) : undefined),
      (newValue) => {
        if (newValue !== undefined && multiple()) {
          setInternalMultipleValue(newValue)
        }
      },
    ),
  )

  // 获取选项路径对应的选项对象数组
  const getSelectedOptions = (
    options: CascaderOption<T>[],
    path: string[],
  ): CascaderOption<T>[] => {
    const result: CascaderOption<T>[] = []
    let currentOptions = options
    for (const value of path) {
      const found = currentOptions.find((opt) => opt.value === value)
      if (found) {
        result.push(found)
        currentOptions = found.children ?? []
      } else {
        break
      }
    }
    return result
  }

  // 计算要显示的列
  const columns = createMemo(() => {
    const cols: {options: CascaderOption<T>[]; level: number}[] = []
    // 第一列始终显示
    cols.push({options: local.options, level: 0})

    // 根据展开路径添加后续列
    let currentOptions = local.options
    const path = expandedPath()
    for (let i = 0; i < path.length; i++) {
      const value = path[i]
      const found = currentOptions.find((opt) => opt.value === value)
      if (found?.children && found.children.length > 0) {
        cols.push({options: found.children, level: i + 1})
        currentOptions = found.children
      } else {
        break
      }
    }
    return cols
  })

  // 单选 - 选中的选项对象
  const selectedSingleOptions = createMemo(() =>
    getSelectedOptions(local.options, selectedSingleValue()),
  )

  // 多选 - 选中的选项对象数组
  const selectedMultipleOptions = createMemo(() =>
    selectedMultipleValue().map((path) =>
      getSelectedOptions(local.options, path),
    ),
  )

  // 获取显示标签（根据 showPath 配置）
  const getDisplayLabel = (opts: CascaderOption<T>[]): string => {
    if (opts.length === 0) {
      return ''
    }
    if (showPath() === 'last') {
      const lastOpt = opts[opts.length - 1]
      return lastOpt ? lastOpt.label : ''
    }
    return opts.map((o) => o.label).join(' / ')
  }

  // 单选 - 显示文本
  const singleDisplayText = createMemo(() => {
    const opts = selectedSingleOptions()
    if (opts.length === 0) {
      return ''
    }
    if (local.displayRender && !multiple()) {
      const labels = opts.map((o) => o.label)
      const render =
        local.displayRender as CascaderSingleProps<T>['displayRender']
      if (render) {
        return render(labels, opts)
      }
    }
    return getDisplayLabel(opts)
  })

  // 多选 - 显示标签数据
  const multipleDisplayTags = createMemo(() => {
    const allPaths = selectedMultipleValue()
    const allOpts = selectedMultipleOptions()
    const maxCount = local.maxTagCount ?? Number.POSITIVE_INFINITY

    const visibleTags: {path: string[]; label: string}[] = []
    for (let i = 0; i < Math.min(allPaths.length, maxCount); i++) {
      const path = allPaths[i]
      const opts = allOpts[i]
      if (path && opts) {
        visibleTags.push({
          path,
          label: getDisplayLabel(opts),
        })
      }
    }

    const hiddenCount = allPaths.length - visibleTags.length
    return {visibleTags, hiddenCount}
  })

  // 判断选项是否可选（根据 checkStrategy）
  const isOptionSelectable = (option: CascaderOption<T>): boolean => {
    const hasChildren = !!(option.children && option.children.length > 0)
    const isLeaf = option.isLeaf || !hasChildren

    const strategy = checkStrategy()
    if (strategy === 'all') {
      return true
    }
    if (strategy === 'child') {
      return isLeaf
    }
    if (strategy === 'parent') {
      return hasChildren
    }
    return true
  }

  // 处理单选选项点击
  const handleSingleOptionClick = async (
    option: CascaderOption<T>,
    level: number,
  ) => {
    if (option.disabled) {
      return
    }

    const newPath = [...expandedPath().slice(0, level), option.value]

    // 如果有子选项或需要动态加载
    const hasChildren = option.children && option.children.length > 0
    const needsLoad = !option.isLeaf && local.loadData && !hasChildren

    if (needsLoad && local.loadData) {
      // 动态加载
      setLoadingOptions((prev) => new Set(prev).add(option.value))
      try {
        const children = await local.loadData(option)
        option.children = children
      } finally {
        setLoadingOptions((prev) => {
          const next = new Set(prev)
          next.delete(option.value)
          return next
        })
      }
    }

    // 更新展开路径
    if (option.children && option.children.length > 0) {
      setExpandedPath(newPath)
    } else {
      setExpandedPath(newPath.slice(0, -1))
    }

    // 判断是否应该触发 onChange
    const isLeaf =
      option.isLeaf || !option.children || option.children.length === 0
    const shouldChange = local.changeOnSelect || isLeaf

    if (shouldChange) {
      setInternalSingleValue(newPath)
      const onChange = local.onChange as CascaderSingleProps<T>['onChange']
      onChange?.({
        value: newPath,
        selectedOptions: getSelectedOptions(local.options, newPath),
      })

      // 如果是叶子节点，关闭弹出层
      if (isLeaf) {
        api().setOpen(false)
      }
    }
  }

  // 处理多选选项点击
  const handleMultipleOptionClick = async (
    option: CascaderOption<T>,
    level: number,
  ) => {
    if (option.disabled) {
      return
    }

    const newPath = [...expandedPath().slice(0, level), option.value]

    // 如果有子选项或需要动态加载
    const hasChildren = option.children && option.children.length > 0
    const needsLoad = !option.isLeaf && local.loadData && !hasChildren

    if (needsLoad && local.loadData) {
      setLoadingOptions((prev) => new Set(prev).add(option.value))
      try {
        const children = await local.loadData(option)
        option.children = children
      } finally {
        setLoadingOptions((prev) => {
          const next = new Set(prev)
          next.delete(option.value)
          return next
        })
      }
    }

    // 如果有子节点，展开它
    if (option.children && option.children.length > 0) {
      setExpandedPath(newPath)
    }

    // 检查是否可选
    if (!isOptionSelectable(option)) {
      return
    }

    // 切换选中状态
    const currentPaths = selectedMultipleValue()
    const existingIndex = currentPaths.findIndex((p) => pathEquals(p, newPath))

    let newPaths: string[][]
    if (existingIndex >= 0) {
      // 已选中，移除
      newPaths = [
        ...currentPaths.slice(0, existingIndex),
        ...currentPaths.slice(existingIndex + 1),
      ]
    } else {
      // 未选中，添加
      newPaths = [...currentPaths, newPath]
    }

    setInternalMultipleValue(newPaths)
    const onChange = local.onChange as CascaderMultipleProps<T>['onChange']
    onChange?.({
      value: newPaths,
      selectedOptions: newPaths.map((p) =>
        getSelectedOptions(local.options, p),
      ),
    })
  }

  // 处理选项点击（根据模式分发）
  const handleOptionClick = (option: CascaderOption<T>, level: number) => {
    if (multiple()) {
      handleMultipleOptionClick(option, level)
    } else {
      handleSingleOptionClick(option, level)
    }
  }

  // 处理选项悬停（hover 模式）
  const handleOptionHover = (option: CascaderOption<T>, level: number) => {
    if (local.expandTrigger !== 'hover' || option.disabled) {
      return
    }
    if (option.children && option.children.length > 0) {
      const newPath = [...expandedPath().slice(0, level), option.value]
      setExpandedPath(newPath)
    }
  }

  // 清除选择
  const handleClear = (e: MouseEvent) => {
    e.stopPropagation()
    setExpandedPath([])

    if (multiple()) {
      setInternalMultipleValue([])
      const onChange = local.onChange as CascaderMultipleProps<T>['onChange']
      onChange?.({value: [], selectedOptions: []})
    } else {
      setInternalSingleValue([])
      const onChange = local.onChange as CascaderSingleProps<T>['onChange']
      onChange?.({value: [], selectedOptions: []})
    }
  }

  // 移除单个多选标签
  const handleRemoveTag = (e: MouseEvent, path: string[]) => {
    e.stopPropagation()
    const currentPaths = selectedMultipleValue()
    const newPaths = currentPaths.filter((p) => !pathEquals(p, path))
    setInternalMultipleValue(newPaths)
    const onChange = local.onChange as CascaderMultipleProps<T>['onChange']
    onChange?.({
      value: newPaths,
      selectedOptions: newPaths.map((p) =>
        getSelectedOptions(local.options, p),
      ),
    })
  }

  // 判断选项是否在当前选中路径上（单选）
  const isInSelectedSinglePath = (value: string, level: number) => {
    return selectedSingleValue()[level] === value
  }

  // 判断选项是否被选中（多选）
  const isOptionChecked = (option: CascaderOption<T>, level: number) => {
    const currentPath = [...expandedPath().slice(0, level), option.value]
    return containsPath(selectedMultipleValue(), currentPath)
  }

  // 判断选项是否在展开路径上
  const isExpanded = (value: string, level: number) => {
    return expandedPath()[level] === value
  }

  // 判断是否有选中值
  const hasValue = () => {
    if (multiple()) {
      return selectedMultipleValue().length > 0
    }
    return selectedSingleValue().length > 0
  }

  return (
    <div class="flex flex-col gap-1.5 w-full">
      {/* 触发器 */}
      <button
        {...api().getTriggerProps()}
        disabled={local.disabled}
        class={styles.trigger({class: local.class})}
      >
        {/* 单选模式显示 */}
        <Show when={!multiple()}>
          <span class={styles.triggerText()}>
            <Show
              when={singleDisplayText()}
              fallback={
                <span class={styles.triggerPlaceholder()}>
                  {local.placeholder ?? '请选择'}
                </span>
              }
            >
              {singleDisplayText()}
            </Show>
          </span>
        </Show>

        {/* 多选模式显示 */}
        <Show when={multiple()}>
          <Show
            when={multipleDisplayTags().visibleTags.length > 0}
            fallback={
              <span class={styles.triggerText()}>
                <span class={styles.triggerPlaceholder()}>
                  {local.placeholder ?? '请选择'}
                </span>
              </span>
            }
          >
            <span class={styles.tagsContainer()}>
              <For each={multipleDisplayTags().visibleTags}>
                {(tag) => (
                  <span class={styles.tag()}>
                    <span class={styles.tagLabel()}>{tag.label}</span>
                    <button
                      type="button"
                      class={styles.tagClose()}
                      onClick={(e) => handleRemoveTag(e, tag.path)}
                    >
                      <X class="size-3" />
                    </button>
                  </span>
                )}
              </For>
              <Show when={multipleDisplayTags().hiddenCount > 0}>
                <span class={styles.tagCount()}>
                  +{multipleDisplayTags().hiddenCount}
                </span>
              </Show>
            </span>
          </Show>
        </Show>

        <span class={styles.triggerIcons()}>
          <Show when={local.clearable && hasValue() && !local.disabled}>
            <button
              type="button"
              class={styles.clearIcon()}
              onClick={handleClear}
              title="清除"
            >
              <X class="size-3.5" />
            </button>
          </Show>
          <ChevronDown
            class={styles.indicator({class: api().open ? 'rotate-180' : ''})}
            size={14}
          />
        </span>
      </button>

      {/* 弹出层 */}
      <Show when={api().open}>
        <Portal>
          <div
            {...api().getPositionerProps()}
            class={styles.positioner()}
          >
            <div
              {...api().getContentProps()}
              class={styles.content({class: local.popupClass})}
            >
              {/* 多列面板 */}
              <For each={columns()}>
                {(col) => (
                  <div class={styles.column()}>
                    <For each={col.options}>
                      {(option) => {
                        const hasChildren = () =>
                          (option.children && option.children.length > 0) ||
                          (!option.isLeaf && local.loadData)
                        const isLoading = () =>
                          loadingOptions().has(option.value)
                        const isActive = () =>
                          isExpanded(option.value, col.level)

                        // 单选：是否在选中路径上
                        const isSingleSelected = () =>
                          !multiple() &&
                          isInSelectedSinglePath(option.value, col.level)

                        // 多选：是否被选中
                        const isMultipleChecked = () =>
                          multiple() && isOptionChecked(option, col.level)

                        // 多选：是否可选
                        const canSelect = () =>
                          !multiple() || isOptionSelectable(option)

                        return (
                          <div
                            role="menuitem"
                            tabIndex={option.disabled ? -1 : 0}
                            aria-disabled={option.disabled || undefined}
                            class={styles.item()}
                            data-disabled={option.disabled || undefined}
                            data-selected={isSingleSelected() || undefined}
                            data-highlighted={isActive() || undefined}
                            onClick={() => handleOptionClick(option, col.level)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault()
                                handleOptionClick(option, col.level)
                              }
                            }}
                            onMouseEnter={() =>
                              handleOptionHover(option, col.level)
                            }
                          >
                            {/* 多选复选框 */}
                            <Show when={multiple() && canSelect()}>
                              <span
                                class={styles.itemCheckbox()}
                                data-checked={isMultipleChecked() || undefined}
                              >
                                <Show when={isMultipleChecked()}>
                                  <Check class="size-3" />
                                </Show>
                              </span>
                            </Show>

                            <span class={styles.itemLabel()}>
                              {option.label}
                            </span>

                            <Show when={isLoading()}>
                              <span class={styles.itemIndicator()}>
                                <span class="animate-spin">⏳</span>
                              </span>
                            </Show>
                            <Show when={!isLoading() && hasChildren()}>
                              <ChevronRight class={styles.itemIndicator()} />
                            </Show>
                            {/* 单选勾选图标 */}
                            <Show
                              when={
                                !multiple() &&
                                !isLoading() &&
                                !hasChildren() &&
                                isSingleSelected()
                              }
                            >
                              <Check class={styles.itemIndicator()} />
                            </Show>
                          </div>
                        )
                      }}
                    </For>
                  </div>
                )}
              </For>
            </div>
          </div>
        </Portal>
      </Show>
    </div>
  )
}
