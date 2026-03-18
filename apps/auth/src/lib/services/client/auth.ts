import {authClient} from '@/lib/auth/client'

export type SocialProvider = 'google' | 'github' | 'apple'

export function useAuthSession() {
  return authClient.useSession()
}

export async function signInWithSocial(
  provider: SocialProvider,
  callbackURL = '/dashboard',
) {
  return authClient.signIn.social({
    provider,
    callbackURL,
  })
}

export async function signOutUser() {
  return authClient.signOut()
}
