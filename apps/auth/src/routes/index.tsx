import {createFileRoute, Link} from '@tanstack/solid-router'
import {Button} from '@beeve/ui'
import {Shield, Github, ArrowRight} from 'lucide-solid'
import {requireGuest} from '@/lib/guards'

export const Route = createFileRoute('/')({
  beforeLoad: () => requireGuest(),
  component: IndexPage,
})

function IndexPage() {
  return (
    <div class="flex min-h-screen flex-col">
      {/* Header */}
      <header class="flex items-center justify-between px-6 py-4">
        <div class="flex items-center gap-2">
          <div class="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
            B
          </div>
          <span class="font-semibold text-lg">Beeve Auth</span>
        </div>
        <Link to="/login">
          <Button variant="outline" size="md">
            Sign in
            <ArrowRight class="size-3.5" />
          </Button>
        </Link>
      </header>

      {/* Hero */}
      <main class="flex flex-1 flex-col items-center justify-center px-6 pb-20">
        <div class="mx-auto max-w-2xl text-center">
          <div class="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground">
            <Shield class="size-4 text-primary" />
            Unified Authentication Center
          </div>

          <h1 class="mb-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Secure access to{' '}
            <span class="text-primary">Beeve</span>{' '}
            services
          </h1>

          <p class="mb-8 text-lg text-muted-foreground sm:text-xl">
            Sign in once, access everything. Powered by Better Auth social
            providers.
          </p>

          <div class="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link to="/login">
              <Button size="lg" class="gap-2 px-8">
                Get started
                <ArrowRight class="size-4" />
              </Button>
            </Link>
            <a
              href="https://github.com/Langlw1992/beeve"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="lg" class="gap-2 px-8">
                <Github class="size-4" />
                GitHub
              </Button>
            </a>
          </div>
        </div>

        {/* Feature grid */}
        <div class="mx-auto mt-20 grid max-w-4xl gap-6 sm:grid-cols-3">
          <FeatureCard
            title="Social Login"
            description="Sign in with your configured social providers. No passwords needed."
          />
          <FeatureCard
            title="Secure by Default"
            description="Built on Better Auth with OAuth 2.0 and session management."
          />
          <FeatureCard
            title="Multi-platform"
            description="Works across web, iOS, and macOS with a unified identity."
          />
        </div>
      </main>

      {/* Footer */}
      <footer class="border-t border-border px-6 py-6 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} Beeve. All rights reserved.
      </footer>
    </div>
  )
}

function FeatureCard(props: {title: string; description: string}) {
  return (
    <div class="rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-md">
      <h3 class="mb-2 font-semibold">{props.title}</h3>
      <p class="text-sm text-muted-foreground">{props.description}</p>
    </div>
  )
}
