import {describe, expect, it} from 'vitest'
import {
  formatUserRoleLabel,
  isAdminRole,
  isAdminUser,
  normalizeUserRole,
} from './policy'

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

  it('formats user role labels in Chinese', () => {
    expect(formatUserRoleLabel('admin')).toBe('管理员')
    expect(formatUserRoleLabel('user')).toBe('普通成员')
    expect(formatUserRoleLabel(null)).toBe('普通成员')
  })

  it('checks admin access from user objects', () => {
    expect(isAdminUser({role: 'admin'})).toBe(true)
    expect(isAdminUser({role: 'user'})).toBe(false)
    expect(isAdminUser(null)).toBe(false)
  })
})
