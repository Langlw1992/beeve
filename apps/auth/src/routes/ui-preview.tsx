import {createFileRoute, Link} from '@tanstack/solid-router'
import {For, createMemo, type JSX} from 'solid-js'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  useTheme,
} from '@beeve/ui'

const baseColorOptions = ['neutral', 'zinc', 'stone', 'gray', 'slate'] as const
const themeColorOptions = [
  'blue',
  'sky',
  'teal',
  'emerald',
  'indigo',
  'violet',
  'rose',
] as const
const radiusOptions = [0, 0.3, 0.5, 0.625, 0.75, 1, 'full'] as const

export const Route = createFileRoute('/ui-preview')({
  component: UiPreviewPage,
  head: () => ({
    meta: [
      {
        title: 'Beeve UI Preview',
      },
    ],
  }),
})

function UiPreviewPage() {
  const theme = useTheme()
  const currentConfig = createMemo(() => theme.config())

  const updateBaseColor = (baseColor: (typeof baseColorOptions)[number]) => {
    theme.setBaseColor(baseColor)
  }

  const updateThemeColor = (themeColor: (typeof themeColorOptions)[number]) => {
    theme.setThemeColor(themeColor)
  }

  const updateRadius = (radius: (typeof radiusOptions)[number]) => {
    theme.setRadius(radius)
  }

  return (
    <div class="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.12),transparent_30%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.10),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent)]">
      <div class="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header class="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-[28px] border border-border/70 bg-card/80 px-5 py-4 backdrop-blur">
          <div class="flex items-center gap-3">
            <div class="flex size-10 items-center justify-center rounded-2xl bg-primary text-sm font-semibold text-primary-foreground">
              B
            </div>
            <div>
              <p class="text-sm font-semibold text-foreground">Beeve UI Preview</p>
              <p class="text-sm text-muted-foreground">
                Neutral base, blue accent, and flat surface exploration.
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <Link to="/">
              <Button variant="outline" size="sm">Home</Button>
            </Link>
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Login
              </Button>
            </Link>
          </div>
        </header>

        <main class="grid flex-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <section class="space-y-6">
            <Card variant="outlined" size="lg" class="border-border/70 bg-card/80 shadow-none">
              <div class="flex items-start justify-between gap-4 p-6">
                <div class="space-y-2">
                  <Badge variant="outline">Preview surface</Badge>
                  <h2 class="text-2xl font-semibold text-foreground sm:text-3xl">
                    A flatter, more intentional UI baseline
                  </h2>
                  <p class="max-w-2xl text-base leading-6 text-muted-foreground">
                    This page is the first validation surface for the new direction.
                    It keeps the structure minimal, makes state changes easy to inspect,
                    and keeps the theme controls close to the previewed components.
                  </p>
                </div>

                <div class="flex flex-wrap justify-end gap-2 text-sm text-muted-foreground">
                  <Badge variant="secondary">SSR-safe</Badge>
                  <Badge variant="secondary">Cookie theme</Badge>
                  <Badge variant="secondary">Flat surfaces</Badge>
                </div>
              </div>

              <CardContent class="grid gap-4 sm:grid-cols-3">
                <StatTile label="Mode" value={currentConfig().mode} />
                <StatTile label="Base" value={currentConfig().baseColor} />
                <StatTile label="Accent" value={currentConfig().themeColor} />
              </CardContent>
            </Card>

            <Card variant="outlined" size="lg" class="border-border/70 bg-card/80 shadow-none">
              <CardHeader>
                <CardTitle>Theme controls</CardTitle>
                <CardDescription>
                  Switch mode, palette, and radius without leaving the preview.
                </CardDescription>
              </CardHeader>

              <CardContent class="space-y-6">
                <ControlRow label="Mode">
                  <For each={['light', 'system', 'dark'] as const}>
                    {(mode) => (
                      <Button
                        size="sm"
                        variant={theme.config().mode === mode ? 'primary' : 'outline'}
                        onClick={() => theme.setMode(mode)}
                      >
                        {mode}
                      </Button>
                    )}
                  </For>
                </ControlRow>

                <ControlRow label="Base color">
                  <For each={baseColorOptions}>
                    {(baseColor) => (
                      <Button
                        size="sm"
                        variant={theme.config().baseColor === baseColor ? 'primary' : 'outline'}
                        onClick={() => updateBaseColor(baseColor)}
                      >
                        {baseColor}
                      </Button>
                    )}
                  </For>
                </ControlRow>

                <ControlRow label="Accent color">
                  <For each={themeColorOptions}>
                    {(themeColor) => (
                      <Button
                        size="sm"
                        variant={theme.config().themeColor === themeColor ? 'primary' : 'outline'}
                        onClick={() => updateThemeColor(themeColor)}
                      >
                        {themeColor}
                      </Button>
                    )}
                  </For>
                </ControlRow>

                <ControlRow label="Radius">
                  <For each={radiusOptions}>
                    {(radius) => (
                      <Button
                        size="sm"
                        variant={theme.config().radius === radius ? 'primary' : 'outline'}
                        onClick={() => updateRadius(radius)}
                      >
                        {String(radius)}
                      </Button>
                    )}
                  </For>
                </ControlRow>
              </CardContent>
            </Card>

            <div class="grid gap-6 lg:grid-cols-2">
              <Card variant="outlined" size="lg" class="border-border/70 bg-card/80 shadow-none">
                <CardHeader>
                  <CardTitle>Buttons</CardTitle>
                  <CardDescription>
                    Primary actions stay visually dominant without heavy depth.
                  </CardDescription>
                </CardHeader>
                <CardContent class="flex flex-wrap gap-2">
                  <Button>Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="link">Link</Button>
                </CardContent>
              </Card>

              <Card variant="outlined" size="lg" class="border-border/70 bg-card/80 shadow-none">
                <CardHeader>
                  <CardTitle>Badges</CardTitle>
                  <CardDescription>
                    Status and emphasis should read clearly at a glance.
                  </CardDescription>
                </CardHeader>
                <CardContent class="flex flex-wrap items-center gap-2">
                  <Badge variant="default">Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="outline">Outline</Badge>
                  <Badge variant="destructive">Destructive</Badge>
                  <Badge status="success" text="Success" />
                  <Badge status="warning" text="Warning" />
                </CardContent>
              </Card>
            </div>
          </section>

          <section class="space-y-6">
            <Card variant="outlined" size="lg" class="border-border/70 bg-card/80 shadow-none">
              <CardHeader>
                <CardTitle>Form surfaces</CardTitle>
                <CardDescription>
                  This pass keeps the surface focused on plain inputs so icon dependencies are excluded.
                </CardDescription>
              </CardHeader>

              <CardContent class="space-y-4">
                <div class="grid gap-3">
                  <Input
                    placeholder="Default input"
                    defaultValue="Beeve"
                  />
                  <Input
                    variant="filled"
                    placeholder="Filled input"
                    defaultValue="Filled surface"
                  />
                  <Input
                    variant="borderless"
                    placeholder="Borderless input"
                    defaultValue="Borderless surface"
                  />
                  <Input
                    status="error"
                    placeholder="Error state"
                    defaultValue="Broken state"
                  />
                  <p class="text-sm text-destructive">
                    This is what an error state looks like.
                  </p>
                </div>

                <p class="text-sm text-muted-foreground">
                  Select and dialog previews are temporarily removed to isolate the `lucide-solid`
                  dependency from this page.
                </p>
              </CardContent>
            </Card>

            <Card variant="outlined" size="lg" class="border-border/70 bg-card/80 shadow-none">
              <CardHeader>
                <CardTitle>Surface sample</CardTitle>
                <CardDescription>
                  A small reference card for spacing, typography, and border treatment.
                </CardDescription>
              </CardHeader>
              <CardContent class="space-y-3">
                <p class="text-sm text-muted-foreground">
                  The goal is to keep the library cohesive: fewer elevations, clearer spacing,
                  and fewer visually noisy focus treatments.
                </p>
                <div class="rounded-2xl border border-border/70 bg-background/80 p-4">
                  <p class="text-sm font-medium">Flat shell</p>
                  <p class="mt-1 text-sm text-muted-foreground">
                    Use border, tone, and spacing as the primary hierarchy instead of shadow.
                  </p>
                </div>
              </CardContent>
              <CardFooter class="justify-end">
                <Badge variant="outline">Preview only</Badge>
              </CardFooter>
            </Card>
          </section>
        </main>
      </div>
    </div>
  )
}

function ControlRow(props: {
  label: string
  children: JSX.Element
}) {
  return (
    <div class="space-y-3">
      <div class="flex items-center gap-2 text-sm font-medium text-foreground">
        <span class="inline-flex rounded-full border border-border/70 bg-background/80 px-2 py-0.5 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          UI
        </span>
        {props.label}
      </div>
      <div class="flex flex-wrap gap-2">{props.children}</div>
    </div>
  )
}

function StatTile(props: {label: string; value: string}) {
  return (
    <div class="rounded-2xl border border-border/70 bg-background/70 p-4">
      <p class="text-xs uppercase tracking-[0.18em] text-muted-foreground">
        {props.label}
      </p>
      <p class="mt-2 text-lg font-semibold text-foreground">{props.value}</p>
    </div>
  )
}
