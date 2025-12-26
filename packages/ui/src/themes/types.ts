/**
 * @beeve/ui - Theme Types
 * 主题系统类型定义
 */

/** Base color names - 基础灰色调 */
export type BaseColorName = 'neutral' | 'zinc' | 'stone' | 'gray' | 'slate'

/** Theme color names - 主题强调色 */
export type ThemeColorName =
  | 'blue'
  | 'green'
  | 'pink'
  | 'orange'
  | 'violet'
  | 'red'
  | 'rose'
  | 'yellow'
  | 'amber'
  | 'cyan'
  | 'emerald'
  | 'fuchsia'
  | 'indigo'
  | 'lime'
  | 'purple'
  | 'sky'
  | 'teal'

/** Color mode */
export type ColorMode = 'light' | 'dark' | 'system'

/** Radius preset values (in rem) */
export type RadiusPreset = 0 | 0.3 | 0.5 | 0.625 | 0.75 | 1

/** Base color variables - 完整的基础配色变量 */
export type BaseColorVariables = {
  background: string
  foreground: string
  card: string
  'card-foreground': string
  popover: string
  'popover-foreground': string
  primary: string
  'primary-foreground': string
  secondary: string
  'secondary-foreground': string
  muted: string
  'muted-foreground': string
  accent: string
  'accent-foreground': string
  destructive: string
  border: string
  input: string
  ring: string
  'chart-1': string
  'chart-2': string
  'chart-3': string
  'chart-4': string
  'chart-5': string
  sidebar: string
  'sidebar-foreground': string
  'sidebar-primary': string
  'sidebar-primary-foreground': string
  'sidebar-accent': string
  'sidebar-accent-foreground': string
  'sidebar-border': string
  'sidebar-ring': string
}

/** Theme color variables - 主题色覆盖变量 */
export type ThemeColorVariables = {
  primary: string
  'primary-foreground': string
  'chart-1': string
  'chart-2': string
  'chart-3': string
  'chart-4': string
  'chart-5': string
  'sidebar-primary': string
  'sidebar-primary-foreground': string
}

/** Base color preset with light and dark mode */
export type BaseColorPreset = {
  name: BaseColorName
  label: string
  light: BaseColorVariables
  dark: BaseColorVariables
}

/** Theme color preset with light and dark mode */
export type ThemeColorPreset = {
  name: ThemeColorName
  label: string
  light: ThemeColorVariables
  dark: ThemeColorVariables
}

/** Complete theme configuration */
export type ThemeConfig = {
  mode: ColorMode
  baseColor: BaseColorName
  themeColor: ThemeColorName
  radius: number
}

/** Resolved theme (after system mode detection) */
export type ResolvedTheme = {
  resolvedMode: 'light' | 'dark'
  baseColor: BaseColorName
  themeColor: ThemeColorName
  radius: number
}
