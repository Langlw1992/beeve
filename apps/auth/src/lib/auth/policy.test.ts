import {describe, expect, it} from 'vitest'
import {isAdminRole, isAdminUser, normalizeUserRole} from './policy'

describe('auth policy', () => {
  it('normalizes unknown roles to user', () => {
    expect(normalizeUserRole(undefined)).toBe('user')
    expect(normalizeUserRole(null)).toBe('user')
    expect(normalizeUserRole('operator')).toBe('user')
  })

  it('recognizes admin role consistently', () => {
    expect(normalizeUserRole('admin')).toBe('admin')
    expect(isAdminRole('admin')).toBe(true)
    expect(isAdminRole('user')).toBe(false)
  })

  it('checks admin access from user objects', () => {
    expect(isAdminUser({role: 'admin'})).toBe(true)
    expect(isAdminUser({role: 'user'})).toBe(false)
    expect(isAdminUser(null)).toBe(false)
  })
})
