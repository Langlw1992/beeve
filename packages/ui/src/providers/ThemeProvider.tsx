/**
 * @beeve/ui - ThemeProvider
 * SolidJS 主题上下文提供者
 */

import {
  createContext,
  useContext,
  createSignal,
  createEffect,
  onMount,
  onCleanup,
  type ParentComponent,
  type Accessor,
} from 'solid-js'
import type { BaseColorName, ThemeColorName, ColorMode, ThemeConfig } from '../themes/types'
import {
  defaultThemeConfig,
  getThemeVariables,
  getSystemColorMode,
} from '../themes'

type ThemeContextValue = {
  /** Current theme configuration */
  config: Accessor<ThemeConfig>
  /** Resolved color mode (light/dark) */
  resolvedMode: Accessor<'light' | 'dark'>
  /** Set color mode */
  setMode: (mode: ColorMode) => void
  /** Set base color */
  setBaseColor: (color: BaseColorName) => void
  /** Set theme color */
  setThemeColor: (color: ThemeColorName) => void
  /** Set radius */
  setRadius: (radius: number) => void
  /** Set full config */
  setConfig: (config: Partial<ThemeConfig>) => void
}

const ThemeContext = createContext<ThemeContextValue>()

export type ThemeProviderProps = {
  /** Default theme configuration */
  defaultConfig?: Partial<ThemeConfig>
  /** Storage key for persisting theme */
  storageKey?: string
  /** Apply theme to document */
  applyToDocument?: boolean
}

export const ThemeProvider: ParentComponent<ThemeProviderProps> = (props) => {
  const storageKey = props.storageKey ?? 'beeve-theme'
  const applyToDocument = props.applyToDocument ?? true

  // Initialize config from storage or defaults
  const getInitialConfig = (): ThemeConfig => {
    if (typeof window === 'undefined') {
      return { ...defaultThemeConfig, ...props.defaultConfig }
    }

    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        return { ...defaultThemeConfig, ...JSON.parse(stored), ...props.defaultConfig }
      }
    } catch {
      // Ignore storage errors
    }

    return { ...defaultThemeConfig, ...props.defaultConfig }
  }

  const [config, setConfigState] = createSignal<ThemeConfig>(getInitialConfig())
  const [systemMode, setSystemMode] = createSignal<'light' | 'dark'>(getSystemColorMode())

  // Resolved mode (handles 'system')
  const resolvedMode = () => {
    const mode = config().mode
    return mode === 'system' ? systemMode() : mode
  }

  // Listen for system color scheme changes
  onMount(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => {
      setSystemMode(e.matches ? 'dark' : 'light')
    }

    mediaQuery.addEventListener('change', handler)
    onCleanup(() => mediaQuery.removeEventListener('change', handler))
  })

  // Apply theme to document
  createEffect(() => {
    if (!applyToDocument || typeof document === 'undefined') return

    const { baseColor, themeColor, radius } = config()
    const mode = resolvedMode()
    const vars = getThemeVariables(baseColor, themeColor, mode)
    const root = document.documentElement

    // Set radius
    root.style.setProperty('--radius', `${radius}rem`)

    // Set all theme variables
    Object.entries(vars).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value)
    })

    // Update dark class
    if (mode === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  })

  // Persist config to storage
  createEffect(() => {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem(storageKey, JSON.stringify(config()))
    } catch {
      // Ignore storage errors
    }
  })

  const setConfig = (partial: Partial<ThemeConfig>) => {
    setConfigState((prev) => ({ ...prev, ...partial }))
  }

  const value: ThemeContextValue = {
    config,
    resolvedMode,
    setMode: (mode) => setConfig({ mode }),
    setBaseColor: (baseColor) => setConfig({ baseColor }),
    setThemeColor: (themeColor) => setConfig({ themeColor }),
    setRadius: (radius) => setConfig({ radius }),
    setConfig,
  }

  return <ThemeContext.Provider value={value}>{props.children}</ThemeContext.Provider>
}

/**
 * Hook to access theme context
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

/**
 * Script to prevent flash of wrong theme
 * Add this to <head> for SSR
 */
export const themeScript = (storageKey = 'beeve-theme') => `
(function() {
  try {
    var stored = localStorage.getItem('${storageKey}');
    var config = stored ? JSON.parse(stored) : {};
    var mode = config.mode || 'system';
    
    if (mode === 'system') {
      mode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
    }
  } catch (e) {}
})();
`
