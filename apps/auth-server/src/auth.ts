import {betterAuth} from 'better-auth'
import {drizzleAdapter} from 'better-auth/adapters/drizzle'
import {admin} from 'better-auth/plugins/admin'

import {db} from './db'
import * as schema from './db/schema'

const authWebOrigin = process.env.AUTH_WEB_ORIGIN ?? 'http://localhost:3000'

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:3001',
  basePath: '/api/auth',
  secret:
    process.env.BETTER_AUTH_SECRET ??
    'better-auth-dev-secret-change-me-in-production',
  trustedOrigins: [authWebOrigin, 'https://appleid.apple.com'],
  database: drizzleAdapter(db, {
    provider: 'sqlite',
    schema,
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? 'google-client-id',
      clientSecret:
        process.env.GOOGLE_CLIENT_SECRET ?? 'google-client-secret',
      accessType: 'offline',
      prompt: 'select_account consent',
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID ?? 'github-client-id',
      clientSecret:
        process.env.GITHUB_CLIENT_SECRET ?? 'github-client-secret',
    },
    apple: {
      clientId: process.env.APPLE_CLIENT_ID ?? 'apple-client-id',
      clientSecret: process.env.APPLE_CLIENT_SECRET ?? 'apple-client-secret',
      appBundleIdentifier: process.env.APPLE_APP_BUNDLE_IDENTIFIER,
    },
  },
  plugins: [admin()],
})