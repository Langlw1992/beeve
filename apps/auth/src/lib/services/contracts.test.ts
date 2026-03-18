import {describe, expect, it} from 'vitest'
import {
  isThemeMode,
  parseBatchUserActionInput,
  parsePreferencesUpdateInput,
  parseProfileUpdateInput,
} from './contracts'

describe('service contracts', () => {
  it('parses profile input safely', () => {
    expect(
      parseProfileUpdateInput({
        name: '  Beeve User  ',
        image: ' https://example.com/avatar.png ',
      }),
    ).toEqual({
      name: 'Beeve User',
      image: 'https://example.com/avatar.png',
    })

    expect(parseProfileUpdateInput(null)).toEqual({
      name: '',
      image: null,
    })
  })

  it('normalizes preferences input', () => {
    expect(parsePreferencesUpdateInput({themeMode: 'dark'})).toEqual({
      themeMode: 'dark',
    })
    expect(parsePreferencesUpdateInput({themeMode: 'invalid'})).toEqual({
      themeMode: 'system',
    })
    expect(isThemeMode('system')).toBe(true)
    expect(isThemeMode('blue')).toBe(false)
  })

  it('parses batch actions with deduplicated intent', () => {
    expect(
      parseBatchUserActionInput({
        userIds: ['1', ' 2 ', '', 3],
        action: {type: 'set-role', role: 'admin'},
      }),
    ).toEqual({
      userIds: ['1', '2'],
      action: {type: 'set-role', role: 'admin'},
    })

    expect(
      parseBatchUserActionInput({
        userIds: ['1'],
        action: {type: 'ban', banReason: ' abuse '},
      }),
    ).toEqual({
      userIds: ['1'],
      action: {type: 'ban', banReason: 'abuse'},
    })
  })
})
