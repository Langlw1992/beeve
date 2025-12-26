import { For, createMemo } from 'solid-js'
import {
  useTheme,
  Button,
  baseColors,
  themeColors,
  radiusPresets,
  type BaseColorName,
  type ThemeColorName,
  type ColorMode,
} from '@beeve/ui'

const baseColorList = Object.keys(baseColors) as BaseColorName[]
const themeColorList = Object.keys(themeColors) as ThemeColorName[]
const modeOptions: ColorMode[] = ['light', 'dark', 'system']

export default function App() {
  const { config, resolvedMode, setMode, setBaseColor, setThemeColor, setRadius } = useTheme()

  const currentConfig = createMemo(() => config())

  return (
    <div class="min-h-screen bg-background text-foreground p-8">
      <div class="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <header class="text-center space-y-2">
          <h1 class="text-4xl font-bold">Beeve UI Theme Test</h1>
          <p class="text-muted-foreground">
            测试主题切换功能 - 参考 shadcn/ui 的多配色方案
          </p>
        </header>

        {/* Current Theme Info */}
        <div class="bg-card text-card-foreground p-6 rounded-lg border">
          <h2 class="text-xl font-semibold mb-4">当前配置</h2>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span class="text-muted-foreground">Mode:</span>{' '}
              <span class="font-medium">{currentConfig().mode}</span>
              <span class="text-muted-foreground ml-1">({resolvedMode()})</span>
            </div>
            <div>
              <span class="text-muted-foreground">Base:</span>{' '}
              <span class="font-medium">{currentConfig().baseColor}</span>
            </div>
            <div>
              <span class="text-muted-foreground">Theme:</span>{' '}
              <span class="font-medium">{currentConfig().themeColor}</span>
            </div>
            <div>
              <span class="text-muted-foreground">Radius:</span>{' '}
              <span class="font-medium">{currentConfig().radius}rem</span>
            </div>
          </div>
        </div>

        {/* Mode Selector */}
        <section class="space-y-3">
          <h2 class="text-xl font-semibold">Color Mode</h2>
          <div class="flex gap-2">
            <For each={modeOptions}>
              {(mode) => (
                <Button
                  variant={currentConfig().mode === mode ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setMode(mode)}
                >
                  {mode === 'light' ? '☀️ Light' : mode === 'dark' ? '🌙 Dark' : '💻 System'}
                </Button>
              )}
            </For>
          </div>
        </section>

        {/* Base Color Selector */}
        <section class="space-y-3">
          <h2 class="text-xl font-semibold">Base Color (灰色调)</h2>
          <div class="flex flex-wrap gap-2">
            <For each={baseColorList}>
              {(color) => (
                <Button
                  variant={currentConfig().baseColor === color ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setBaseColor(color)}
                >
                  {baseColors[color].label}
                </Button>
              )}
            </For>
          </div>
        </section>

        {/* Theme Color Selector */}
        <section class="space-y-3">
          <h2 class="text-xl font-semibold">Theme Color (主题色)</h2>
          <div class="flex flex-wrap gap-2">
            <For each={themeColorList}>
              {(color) => (
                <Button
                  variant="outline"
                  size="icon"
                  class="w-8 h-8 p-0"
                  classList={{
                    'border-ring ring-2 ring-ring ring-offset-2': currentConfig().themeColor === color,
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
        </section>

        {/* Radius Selector */}
        <section class="space-y-3">
          <h2 class="text-xl font-semibold">Radius</h2>
          <div class="flex gap-2">
            <For each={radiusPresets}>
              {(preset) => (
                <Button
                  variant={currentConfig().radius === preset.value ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setRadius(preset.value)}
                >
                  {preset.label}
                </Button>
              )}
            </For>
          </div>
        </section>

        {/* Button Variants Demo */}
        <section class="space-y-3">
          <h2 class="text-xl font-semibold">Button Variants</h2>
          <div class="flex flex-wrap gap-3">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="link">Link</Button>
          </div>
        </section>

        {/* Button Sizes Demo */}
        <section class="space-y-3">
          <h2 class="text-xl font-semibold">Button Sizes</h2>
          <div class="flex flex-wrap items-center gap-3">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
            <Button size="icon">🔔</Button>
          </div>
        </section>

        {/* Color Palette Preview */}
        <section class="space-y-3">
          <h2 class="text-xl font-semibold">Color Palette</h2>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
            <ColorSwatch name="Primary" bg="bg-primary" fg="text-primary-foreground" />
            <ColorSwatch name="Secondary" bg="bg-secondary" fg="text-secondary-foreground" />
            <ColorSwatch name="Muted" bg="bg-muted" fg="text-muted-foreground" />
            <ColorSwatch name="Accent" bg="bg-accent" fg="text-accent-foreground" />
            <ColorSwatch name="Destructive" bg="bg-destructive" fg="text-white" />
            <ColorSwatch name="Card" bg="bg-card" fg="text-card-foreground" />
            <ColorSwatch name="Popover" bg="bg-popover" fg="text-popover-foreground" />
            <ColorSwatch name="Background" bg="bg-background" fg="text-foreground" border />
          </div>
        </section>

        {/* Chart Colors Preview */}
        <section class="space-y-3">
          <h2 class="text-xl font-semibold">Chart Colors</h2>
          <div class="flex gap-2">
            <div class="w-12 h-12 rounded-md bg-chart-1" title="Chart 1" />
            <div class="w-12 h-12 rounded-md bg-chart-2" title="Chart 2" />
            <div class="w-12 h-12 rounded-md bg-chart-3" title="Chart 3" />
            <div class="w-12 h-12 rounded-md bg-chart-4" title="Chart 4" />
            <div class="w-12 h-12 rounded-md bg-chart-5" title="Chart 5" />
          </div>
        </section>

        {/* Sample Card */}
        <section class="space-y-3">
          <h2 class="text-xl font-semibold">Sample Card</h2>
          <div class="bg-card text-card-foreground p-6 rounded-xl border shadow-sm">
            <h3 class="text-lg font-semibold mb-2">Card Title</h3>
            <p class="text-muted-foreground mb-4">
              这是一个示例卡片，展示了主题系统在实际组件中的效果。
              卡片使用了语义化的颜色变量。
            </p>
            <div class="flex gap-2">
              <Button size="sm">Action</Button>
              <Button size="sm" variant="outline">Cancel</Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

function ColorSwatch(props: { name: string; bg: string; fg: string; border?: boolean }) {
  return (
    <div
      class={`p-4 rounded-lg ${props.bg} ${props.fg} ${props.border ? 'border' : ''}`}
    >
      <span class="font-medium">{props.name}</span>
    </div>
  )
}
