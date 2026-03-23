import {createServerFn} from '@tanstack/solid-start'
import {getRequestHeader} from '@tanstack/solid-start/server'
import {
  baseColors,
  defaultThemeConfig,
  themeColors,
  type BaseColorName,
  type ThemeColorName,
  type ThemeConfig,
} from '@beeve/ui/themes'

const themeStorageKey = 'beeve-theme'

const validBaseColors = new Set<BaseColorName>(
  Object.keys(baseColors) as BaseColorName[],
)
const validThemeColors = new Set<ThemeColorName>(
  Object.keys(themeColors) as ThemeColorName[],
)

function readCookie(
  cookieHeader: string | null | undefined,
  name: string,
): string | null {
  if (!cookieHeader) {
    return null
  }

  const prefix = `${name}=`
  for (const entry of cookieHeader.split('; ')) {
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

export const loadThemeConfigData = createServerFn({
  method: 'GET',
}).handler(async () => {
  const cookieHeader = getRequestHeader('cookie')
  const storedTheme = readCookie(cookieHeader, themeStorageKey)

  if (!storedTheme) {
    return defaultThemeConfig
  }

  try {
    return normalizeThemeConfig(JSON.parse(storedTheme) as Partial<ThemeConfig>)
  } catch {
    return defaultThemeConfig
  }
})
