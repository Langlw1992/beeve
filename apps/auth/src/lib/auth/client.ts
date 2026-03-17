import {createAuthClient} from 'better-auth/solid'
import {adminClient, inferAdditionalFields} from 'better-auth/client/plugins'
import type {auth} from './server'

const baseURL = typeof window !== 'undefined'
  ? `${window.location.origin}/api/auth`
  : 'http://localhost:3000/api/auth'

export const authClient = createAuthClient({
  baseURL,
  plugins: [adminClient(), inferAdditionalFields<typeof auth>()],
})
