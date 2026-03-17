import { createAuthClient } from 'better-auth/solid'

const baseURL = typeof window !== 'undefined'
  ? `${window.location.origin}/api/auth`
  : 'http://localhost:3000/api/auth'

export const authClient = createAuthClient({
  baseURL,
})
