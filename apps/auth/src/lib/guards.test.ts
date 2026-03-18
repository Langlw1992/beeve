import {beforeEach, describe, expect, it, vi} from 'vitest'

const {redirectMock, getSessionMock} = vi.hoisted(() => ({
  redirectMock: vi.fn((options: {to: string}) => ({
    __redirect: true,
    ...options,
  })),
  getSessionMock: vi.fn(),
}))

vi.mock('@tanstack/solid-router', () => ({
  redirect: redirectMock,
}))

vi.mock('./auth/functions', () => ({
  getSession: getSessionMock,
}))

import {requireAdmin, requireAuth, requireGuest} from './guards'

describe('guards', () => {
  beforeEach(() => {
    redirectMock.mockClear()
    getSessionMock.mockReset()
  })

  it('returns the authenticated user for requireAuth', async () => {
    const user = {id: 'u1', role: 'user'}
    getSessionMock.mockResolvedValue({user})

    await expect(requireAuth()).resolves.toEqual({user})
  })

  it('redirects guests to login for requireAuth', async () => {
    getSessionMock.mockResolvedValue(null)

    await expect(requireAuth()).rejects.toMatchObject({
      __redirect: true,
      to: '/login',
    })
  })

  it('redirects authenticated users away from guest-only routes', async () => {
    getSessionMock.mockResolvedValue({user: {id: 'u1', role: 'user'}})

    await expect(requireGuest()).rejects.toMatchObject({
      __redirect: true,
      to: '/dashboard',
    })
  })

  it('redirects unauthenticated users away from admin routes', async () => {
    getSessionMock.mockResolvedValue(null)

    await expect(requireAdmin()).rejects.toMatchObject({
      __redirect: true,
      to: '/login',
    })
  })

  it('redirects non-admin users away from admin routes', async () => {
    getSessionMock.mockResolvedValue({user: {id: 'u1', role: 'user'}})

    await expect(requireAdmin()).rejects.toMatchObject({
      __redirect: true,
      to: '/dashboard',
    })
  })

  it('allows admin users into admin routes', async () => {
    const user = {id: 'u1', role: 'admin'}
    getSessionMock.mockResolvedValue({user})

    await expect(requireAdmin()).resolves.toEqual({user})
  })
})
