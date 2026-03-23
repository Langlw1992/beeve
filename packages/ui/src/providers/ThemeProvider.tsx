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
import type {
  BaseColorName,
  ThemeColorName,
  ColorMode,
  ThemeConfig,
} from '../themes'
import {
  defaultThemeConfig,
  baseColors,
  themeColors,
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
  setRadius: (radius: number | 'full') => void
  /** Set full config */
  setConfig: (config: Partial<ThemeConfig>) => void
}

const ThemeContext = createContext<ThemeContextValue>()
const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365

const validBaseColors = new Set<BaseColorName>(Object.keys(baseColors) as BaseColorName[])
const validThemeColors = new Set<ThemeColorName>(
  Object.keys(themeColors) as ThemeColorName[],
)

function readCookie(name: string): string | null {
  if (typeof document === 'undefined' || !document.cookie) {
    return null
  }

  const prefix = `${name}=`
  for (const entry of document.cookie.split('; ')) {
    if (entry.startsWith(prefix)) {
      return decodeURIComponent(entry.slice(prefix.length))
    }
  }

  return null
}

function normalizeThemeConfig(config: Partial<ThemeConfig>): ThemeConfig {
  const mode =
    config.mode === 'light' || config.mode === 'dark' || config.mode === 'system'
      ? config.mode
      : defaultThemeConfig.mode
  const baseColor = validBaseColors.has(config.baseColor as BaseColorName)
    ? (config.baseColor as BaseColorName)
    : defaultThemeConfig.baseColor
  const themeColor = validThemeColors.has(config.themeColor as ThemeColorName)
    ? (config.themeColor as ThemeColorName)
    : defaultThemeConfig.themeColor
  const radius =
    config.radius === 'full' ||
    (typeof config.radius === 'number' && Number.isFinite(config.radius))
      ? config.radius
      : defaultThemeConfig.radius

  return {
    mode,
    baseColor,
    themeColor,
    radius,
  }
}

function readStoredThemeConfig(storageKey: string): ThemeConfig | null {
  const cookieValue = readCookie(storageKey)
  if (!cookieValue) {
    return null
  }

  try {
    return normalizeThemeConfig(JSON.parse(cookieValue) as Partial<ThemeConfig>)
  } catch {
    // Ignore invalid cookie payloads.
  }

  return null
}

function writeStoredThemeConfig(storageKey: string, config: ThemeConfig) {
  if (typeof document === 'undefined') {
    return
  }

  const serialized = encodeURIComponent(JSON.stringify(config))
  // biome-ignore lint/suspicious/noDocumentCookie: theme persistence needs a cookie for SSR
  document.cookie = `${storageKey}=${serialized}; path=/; max-age=${THEME_COOKIE_MAX_AGE}; samesite=lax`

  try {
    localStorage.setItem(storageKey, JSON.stringify(config))
  } catch {
    // Ignore storage errors
  }
}

function shouldApplyThemeToRoot(
  root: HTMLElement,
  vars: Record<string, string>,
  radius: number | 'full',
  mode: 'light' | 'dark',
): boolean {
  const computed = window.getComputedStyle(root)
  const isFull = radius === 'full'
  const radiusValue = isFull ? '9999px' : `${radius}rem`
  const radiusLgValue = isFull ? '1.5rem' : `${radius}rem`
  const radiusSmValue = isFull ? '0.5rem' : `${Number(radius) * 0.75}rem`

  if (computed.getPropertyValue('--radius').trim() !== radiusValue) {
    return true
  }

  if (computed.getPropertyValue('--radius-lg').trim() !== radiusLgValue) {
    return true
  }

  if (computed.getPropertyValue('--radius-sm').trim() !== radiusSmValue) {
    return true
  }

  if (root.classList.contains('dark') !== (mode === 'dark')) {
    return true
  }

  for (const [key, value] of Object.entries(vars)) {
    if (computed.getPropertyValue(`--${key}`).trim() !== value) {
      return true
    }
  }

  return false
}

export type ThemeProviderProps = {
  /** Default theme configuration */
  defaultConfig?: Partial<ThemeConfig>
  /** Storage key for persisting theme in cookie/localStorage */
  storageKey?: string
  /** Apply theme to document */
  applyToDocument?: boolean
}

export const ThemeProvider: ParentComponent<ThemeProviderProps> = (props) => {
  const storageKey = props.storageKey ?? 'beeve-theme'
  const applyToDocument = props.applyToDocument ?? true

  // Initialize config from storage or defaults
  const getInitialConfig = (): ThemeConfig => {
    const fallback = normalizeThemeConfig({
      ...defaultThemeConfig,
      ...props.defaultConfig,
    })

    if (typeof window === 'undefined') {
      return fallback
    }

    const stored = readStoredThemeConfig(storageKey)
    if (!stored) {
      return fallback
    }

    return normalizeThemeConfig({
      ...fallback,
      ...stored,
      ...props.defaultConfig,
    })
  }

  const [config, setConfigState] = createSignal<ThemeConfig>(getInitialConfig())
  const [systemMode, setSystemMode] = createSignal<'light' | 'dark'>(
    getSystemColorMode(),
  )

  // Resolved mode (handles 'system')
  const resolvedMode = () => {
    const mode = config().mode
    return mode === 'system' ? systemMode() : mode
  }

  // Listen for system color scheme changes
  onMount(() => {
    if (typeof window === 'undefined') {
      return
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => {
      setSystemMode(e.matches ? 'dark' : 'light')
    }

    mediaQuery.addEventListener('change', handler)
    onCleanup(() => mediaQuery.removeEventListener('change', handler))
  })

  // Apply theme to document
  createEffect(() => {
    if (!applyToDocument || typeof document === 'undefined') {
      return
    }

    const {baseColor, themeColor, radius} = config()
    const mode = resolvedMode()
    const vars = getThemeVariables(baseColor, themeColor, mode)
    const root = document.documentElement

    if (!shouldApplyThemeToRoot(root, vars, radius, mode)) {
      return
    }

    // Set radius variables (support 'full' for pill shape)
    const isFull = radius === 'full'
    const radiusValue = isFull ? '9999px' : `${radius}rem`
    // --radius-lg has a max value to prevent oversized corners on containers
    const radiusLgValue = isFull ? '1.5rem' : `${radius}rem`
    const radiusSmValue = isFull ? '0.5rem' : `${Number(radius) * 0.75}rem`

    root.style.setProperty('--radius', radiusValue)
    root.style.setProperty('--radius-lg', radiusLgValue)
    root.style.setProperty('--radius-sm', radiusSmValue)

    // Set all theme variables
    for (const [key, value1] of Object.entries(vars)) {
      root.style.setProperty(`--${key}`, value1)
    }

    // Update dark class
    if (mode === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  })

  // Persist config to storage
  createEffect(() => {
    writeStoredThemeConfig(storageKey, config())
  })

  const setConfig = (partial: Partial<ThemeConfig>) => {
    setConfigState((prev) => ({...prev, ...partial}))
  }

  const value: ThemeContextValue = {
    config,
    resolvedMode,
    setMode: (mode) => setConfig({mode}),
    setBaseColor: (baseColor) => setConfig({baseColor}),
    setThemeColor: (themeColor) => setConfig({themeColor}),
    setRadius: (radius) => setConfig({radius}),
    setConfig,
  }

  return (
    <ThemeContext.Provider value={value}>
      {props.children}
    </ThemeContext.Provider>
  )
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
    var defaultConfig = ${JSON.stringify(defaultThemeConfig)};
    var baseColorMap = ${JSON.stringify(baseColors)};
    var themeColorMap = ${JSON.stringify(themeColors)};
    var stored = null;
    var cookiePrefix = '${storageKey}' + '=';
    var cookieParts = document.cookie ? document.cookie.split('; ') : [];

    for (var i = 0; i < cookieParts.length; i++) {
      if (cookieParts[i].indexOf(cookiePrefix) === 0) {
        stored = decodeURIComponent(cookieParts[i].slice(cookiePrefix.length));
        break;
      }
    }

    var config = defaultConfig;

    if (stored) {
      try {
        var parsed = JSON.parse(stored);
        config = {
          mode:
            parsed.mode === 'light' || parsed.mode === 'dark' || parsed.mode === 'system'
              ? parsed.mode
              : defaultConfig.mode,
          baseColor: baseColorMap[parsed.baseColor] ? parsed.baseColor : defaultConfig.baseColor,
          themeColor: themeColorMap[parsed.themeColor]
            ? parsed.themeColor
            : defaultConfig.themeColor,
          radius:
            parsed.radius === 'full' ||
            (typeof parsed.radius === 'number' && Number.isFinite(parsed.radius))
              ? parsed.radius
              : defaultConfig.radius,
        };
      } catch (e) {}
    }

    var mode = config.mode || 'system';

    if (mode === 'system') {
      mode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    var radius = config.radius === 'full' ? '9999px' : String(config.radius) + 'rem';
    var radiusLg = config.radius === 'full' ? '1.5rem' : String(config.radius) + 'rem';
    var radiusSm =
      config.radius === 'full'
        ? '0.5rem'
        : String(Number(config.radius) * 0.75) + 'rem';

    document.documentElement.style.setProperty('--radius', radius);
    document.documentElement.style.setProperty('--radius-lg', radiusLg);
    document.documentElement.style.setProperty('--radius-sm', radiusSm);

    var baseColor = baseColorMap[config.baseColor] || baseColorMap[defaultConfig.baseColor];
    var themeColor = themeColorMap[config.themeColor] || themeColorMap[defaultConfig.themeColor];
    var vars = Object.assign({}, baseColor[mode], themeColor[mode]);

    for (var key in vars) {
      document.documentElement.style.setProperty('--' + key, vars[key]);
    }

    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch (e) {}
})();
`
