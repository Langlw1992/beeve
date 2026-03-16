import { createFileRoute } from '@tanstack/solid-router'
import { createSignal, Show } from 'solid-js'
import { authClient } from '@/lib/auth-client'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

// Simple SVG icons for social providers
const GoogleIcon = () => (
  <svg class="h-5 w-5" viewBox="0 0 24 24">
    <path
      fill="currentColor"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="currentColor"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="currentColor"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="currentColor"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
)

const GithubIcon = () => (
  <svg class="h-5 w-5" viewBox="0 0 24 24">
    <path
      fill="currentColor"
      d="M12 1C5.925 1 1 5.925 1 12c0 4.867 3.153 8.991 7.523 10.437.55.101.75-.238.75-.53 0-.261-.009-.957-.014-1.878-3.06.665-3.705-1.476-3.705-1.476-.501-1.272-1.222-1.612-1.222-1.612-.999-.683.076-.669.076-.669 1.105.078 1.686 1.135 1.686 1.135.981 1.68 2.575 1.195 3.202.914.1-.71.384-1.195.697-1.47-2.442-.278-5.01-1.222-5.01-5.437 0-1.2.428-2.183 1.132-2.95-.114-.279-.491-1.398.108-2.913 0 0 .923-.296 3.023 1.13A10.487 10.487 0 0112 6.11c.937.005 1.88.127 2.762.372 2.097-1.426 3.02-1.13 3.02-1.13.601 1.515.223 2.634.11 2.913.705.767 1.13 1.75 1.13 2.95 0 4.226-2.573 5.156-5.022 5.428.395.34.747 1.01.747 2.037 0 1.47-.014 2.657-.014 3.017 0 .295.199.637.756.53C19.85 20.988 23 16.865 23 12c0-6.075-4.925-11-11-11z"
    />
  </svg>
)

const AppleIcon = () => (
  <svg class="h-5 w-5" viewBox="0 0 24 24">
    <path
      fill="currentColor"
      d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.47 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"
    />
  </svg>
)

function LoginPage() {
  const [isLoading, setIsLoading] = createSignal<string | null>(null)
  const [error, setError] = createSignal<string | null>(null)

  const handleSocialSignIn = async (provider: 'google' | 'github' | 'apple') => {
    setIsLoading(provider)
    setError(null)

    try {
      const result = await authClient.signIn.social({
        provider,
        callbackURL: '/',
      })

      if (result.error) {
        setError(result.error.message || 'Sign in failed')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(null)
    }
  }

  return (
    <div class="min-h-screen flex items-center justify-center px-4 py-12 bg-neutral-50 dark:bg-neutral-950">
      <div class="w-full max-w-md space-y-8">
        {/* Logo and title */}
        <div class="text-center">
          <div class="mx-auto h-12 w-12 rounded-xl bg-primary flex items-center justify-center">
            <span class="text-primary-foreground text-xl font-bold">B</span>
          </div>
          <h1 class="mt-6 text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
            Welcome to Beeve
          </h1>
          <p class="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            Sign in to continue to your account
          </p>
        </div>

        {/* Error message */}
        <Show when={error()}>
          {(msg) => (
            <div class="rounded-lg bg-red-50 dark:bg-red-950/50 p-4 text-sm text-red-600 dark:text-red-400">
              {msg()}
            </div>
          )}
        </Show>

        {/* Social login buttons */}
        <div class="space-y-3">
          <button
            onClick={() => handleSocialSignIn('google')}
            disabled={isLoading() !== null}
            class="w-full flex items-center justify-center gap-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-2.5 text-sm font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Show when={isLoading() === 'google'} fallback={<GoogleIcon />}>
              <div class="h-5 w-5 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-600" />
            </Show>
            Continue with Google
          </button>

          <button
            onClick={() => handleSocialSignIn('github')}
            disabled={isLoading() !== null}
            class="w-full flex items-center justify-center gap-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-2.5 text-sm font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Show when={isLoading() === 'github'} fallback={<GithubIcon />}>
              <div class="h-5 w-5 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-600" />
            </Show>
            Continue with GitHub
          </button>

          <button
            onClick={() => handleSocialSignIn('apple')}
            disabled={isLoading() !== null}
            class="w-full flex items-center justify-center gap-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-2.5 text-sm font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Show when={isLoading() === 'apple'} fallback={<AppleIcon />}>
              <div class="h-5 w-5 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-600" />
            </Show>
            Continue with Apple
          </button>
        </div>

        {/* Terms */}
        <p class="text-center text-xs text-neutral-500 dark:text-neutral-500">
          By continuing, you agree to our{' '}
          <a href="#" class="underline hover:text-neutral-700 dark:hover:text-neutral-300">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" class="underline hover:text-neutral-700 dark:hover:text-neutral-300">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </div>
  )
}
