/**
 * Layout component with theme control panel
 */

import {For, type Component, type JSX} from 'solid-js'
import {
  useTheme,
  Button,
  Select,
  Slider,
  baseColors,
  themeColors,
  radiusPresets,
  type BaseColorName,
  type ThemeColorName,
  type ColorMode,
} from '@beeve/ui'
import {navigate, useCurrentPath, type Route} from '../router'

const baseColorList = Object.keys(baseColors) as BaseColorName[]
const themeColorList = Object.keys(themeColors) as ThemeColorName[]
const modeOptions: {value: ColorMode; label: string}[] = [
  {value: 'light', label: '☀️ Light'},
  {value: 'dark', label: '🌙 Dark'},
  {value: 'system', label: '💻 System'},
]

interface LayoutProps {
  routes: Route[]
  children: JSX.Element
}

export const Layout: Component<LayoutProps> = (props) => {
  const {config, setMode, setBaseColor, setThemeColor, setRadius} = useTheme()
  const currentPath = useCurrentPath()

  const radiusOptions = radiusPresets.map((p) => ({
    value: String(p.value),
    label: p.label,
  }))

  return (
    <div class="min-h-screen bg-background text-foreground flex">
      {/* Sidebar */}
      <aside class="w-64 border-r bg-card p-4 flex flex-col gap-6 shrink-0">
        {/* Logo */}
        <div class="text-xl font-bold text-primary">Beeve UI</div>

        {/* Navigation */}
        <nav class="flex flex-col gap-1">
          <div class="text-xs text-muted-foreground uppercase tracking-wider mb-2">
            Components
          </div>
          <For each={props.routes}>
            {(route) => (
              <button
                type="button"
                class="text-left px-3 py-2 rounded-[var(--radius)] text-sm transition-colors"
                classList={{
                  'bg-primary text-primary-foreground':
                    currentPath() === route.path,
                  'hover:bg-accent hover:text-accent-foreground':
                    currentPath() !== route.path,
                }}
                onClick={() => navigate(route.path)}
              >
                {route.label}
              </button>
            )}
          </For>
        </nav>

        {/* Theme Controls */}
        <div class="mt-auto flex flex-col gap-4 pt-4 border-t">
          <div class="text-xs text-muted-foreground uppercase tracking-wider">
            Theme Settings
          </div>

          {/* Mode */}
          <div class="flex flex-col gap-1.5">
            <label class="text-xs text-muted-foreground">Mode</label>
            <Select
              size="sm"
              options={modeOptions}
              value={config().mode}
              onChange={(v) => setMode(v as ColorMode)}
            />
          </div>

          {/* Theme Color */}
          <div class="flex flex-col gap-1.5">
            <label class="text-xs text-muted-foreground">Theme Color</label>
            <div class="flex flex-wrap gap-1">
              <For each={themeColorList}>
                {(color) => (
                  <button
                    type="button"
                    class="size-6 rounded-[var(--radius)] border-2 transition-all"
                    classList={{
                      'border-ring ring-2 ring-ring ring-offset-1':
                        config().themeColor === color,
                      'border-transparent hover:scale-110':
                        config().themeColor !== color,
                    }}
                    style={{
                      'background-color': themeColors[color].light.primary,
                    }}
                    onClick={() => setThemeColor(color)}
                    title={themeColors[color].label}
                  />
                )}
              </For>
            </div>
          </div>

          {/* Base Color */}
          <div class="flex flex-col gap-1.5">
            <label class="text-xs text-muted-foreground">Base Color</label>
            <Select
              size="sm"
              options={baseColorList.map((c) => ({
                value: c,
                label: baseColors[c].label,
              }))}
              value={config().baseColor}
              onChange={(v) => setBaseColor(v as BaseColorName)}
            />
          </div>

          {/* Radius */}
          <div class="flex flex-col gap-1.5">
            <label class="text-xs text-muted-foreground">Radius</label>
            <Slider
              size="sm"
              min={0}
              max={radiusPresets.length - 1}
              step={1}
              value={[
                radiusPresets.findIndex((p) => p.value === config().radius),
              ]}
              onChange={(v: {value: number[]}) => {
                const preset = radiusPresets[v.value[0]]
                if (preset) {
                  setRadius(preset.value)
                }
              }}
              marks={radiusPresets.map((p, i) => ({value: i}))}
              showTooltip={false}
            />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main class="flex-1 overflow-auto">
        <div class="p-8">{props.children}</div>
      </main>
    </div>
  )
}
