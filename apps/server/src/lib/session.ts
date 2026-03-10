import {auth} from '@/auth'
import {Errors} from '@/lib/errors'

export async function requireSession(headers: Headers) {
  const session = await auth.api.getSession({headers})

  if (!session?.user?.id) {
    throw Errors.unauthorized('请先登录')
  }

  return session
}

export async function requireUserId(headers: Headers) {
  const session = await requireSession(headers)
  return session.user.id
}
