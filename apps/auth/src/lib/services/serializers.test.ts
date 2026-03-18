import {describe, expect, it} from 'vitest'
import {
  countAdminUsers,
  normalizeThemeMode,
  serializePreferences,
  serializeSession,
  serializeUser,
} from './serializers'

describe('service serializers', () => {
  it('serializes users into app-owned dto shape', () => {
    const user = serializeUser({
      id: 'user_1',
      name: ' Beeve ',
      email: 'beeve@example.com',
      emailVerified: true,
      image: null,
      role: 'admin',
      banned: false,
      banReason: null,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-02T00:00:00.000Z'),
    })

    expect(user).toMatchObject({
      id: 'user_1',
      name: 'Beeve',
      role: 'admin',
      banned: false,
    })
    expect(user.createdAt).toBe('2026-01-01T00:00:00.000Z')
  })

  it('serializes preferences and sessions safely', () => {
    expect(normalizeThemeMode('dark')).toBe('dark')
    expect(normalizeThemeMode('other')).toBe('system')
    expect(serializePreferences('light')).toEqual({themeMode: 'light'})
    expect(
      serializeSession(
        {
          id: 'session_1',
          token: 'token_1',
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
          expiresAt: new Date('2026-01-03T00:00:00.000Z'),
        },
        'token_1',
      ),
    ).toMatchObject({
      id: 'session_1',
      current: true,
    })
  })

  it('counts admin users through centralized role policy', () => {
    expect(
      countAdminUsers([
        {role: 'admin'},
        {role: 'user'},
        {role: 'ops'},
        {role: 'admin'},
      ]),
    ).toBe(2)
  })
})
