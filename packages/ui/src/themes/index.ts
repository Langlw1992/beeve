/**
 * @beeve/ui - Theme System
 * 主题系统入口
 */

import type {
  BaseColorName,
  ThemeColorName,
  BaseColorVariables,
  ThemeConfig,
  ResolvedTheme,
} from './types'
import { baseColors } from './base'
import { themeColors } from './colors'

export * from './types'
export * from './base'
export * from './colors'

/** Default theme configuration */
export const defaultThemeConfig: ThemeConfig = {
  mode: 'system',
  baseColor: 'neutral',
  themeColor: 'blue',
  radius: 0.625,
}

/** Radius presets */
export const radiusPresets = [
  { value: 0, label: 'None' },
  { value: 0.3, label: 'Small' },
  { value: 0.5, label: 'Medium' },
  { value: 0.625, label: 'Default' },
  { value: 0.75, label: 'Large' },
  { value: 1, label: 'Full' },
] as const

/**
 * Get merged CSS variables for a theme configuration
 */
export function getThemeVariables(
  baseColor: BaseColorName,
  themeColor: ThemeColorName,
  mode: 'light' | 'dark'
): BaseColorVariables {
  const base = baseColors[baseColor][mode]
  const theme = themeColors[themeColor][mode]

  return {
    ...base,
    ...theme,
  }
}

/**
 * Generate CSS string from theme variables
 */
export function generateThemeCSS(
  baseColor: BaseColorName,
  themeColor: ThemeColorName,
  radius: number
): string {
  const lightVars = getThemeVariables(baseColor, themeColor, 'light')
  const darkVars = getThemeVariables(baseColor, themeColor, 'dark')

  const formatVars = (vars: Record<string, string>) =>
    Object.entries(vars)
      .map(([key, value]) => `  --${key}: ${value};`)
      .join('\n')

  return `:root {
  --radius: ${radius}rem;
${formatVars(lightVars)}
}

.dark {
${formatVars(darkVars)}
}
`
}

/**
 * Apply theme variables to DOM
 */
export function applyThemeToDOM(
  baseColor: BaseColorName,
  themeColor: ThemeColorName,
  radius: number,
  mode: 'light' | 'dark'
): void {
  const vars = getThemeVariables(baseColor, themeColor, mode)
  const root = document.documentElement

  root.style.setProperty('--radius', `${radius}rem`)

  Object.entries(vars).forEach(([key, value]) => {
    root.style.setProperty(`--${key}`, value)
  })

  // Update dark class
  if (mode === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

/**
 * Get system color mode preference
 */
export function getSystemColorMode(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/**
 * Resolve theme mode (handle 'system' mode)
 */
export function resolveTheme(config: ThemeConfig): ResolvedTheme {
  const resolvedMode = config.mode === 'system' ? getSystemColorMode() : config.mode

  return {
    resolvedMode,
    baseColor: config.baseColor,
    themeColor: config.themeColor,
    radius: config.radius,
  }
}
