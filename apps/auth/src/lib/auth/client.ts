import {createAuthClient} from 'better-auth/solid'
import {adminClient, inferAdditionalFields} from 'better-auth/client/plugins'
import type {auth} from './server'

export const authClient = createAuthClient({
  plugins: [adminClient(), inferAdditionalFields<typeof auth>()],
})
