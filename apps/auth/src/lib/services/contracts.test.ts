import {describe, expect, it} from 'vitest'
import {
  ContractParseError,
  isThemeMode,
  parseAssistantRequestInput,
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

  it('rejects unknown batch actions instead of defaulting to an effectful action', () => {
    expect(() =>
      parseBatchUserActionInput({
        userIds: ['1'],
        action: {type: 'delete-user'},
      }),
    ).toThrow(ContractParseError)
  })

  it('rejects invalid role changes instead of coercing them', () => {
    expect(() =>
      parseBatchUserActionInput({
        userIds: ['1'],
        action: {type: 'set-role', role: 'owner'},
      }),
    ).toThrow(ContractParseError)
  })

  it('parses assistant requests defensively', () => {
    expect(
      parseAssistantRequestInput({
        intent: 'recover',
        userText: '  被会议打断  ',
        context: {
          dateText: '5月7日 星期四',
          preferredName: ' Lang ',
          tone: '温和',
          focusTitle: '  继续做 Beeve  ',
          doneItems: [' A ', '', 'B'],
          interruptedItems: ['会议'],
          tomorrowItems: ['收尾'],
        },
      }),
    ).toEqual({
      intent: 'recover',
      userText: '被会议打断',
      context: {
        dateText: '5月7日 星期四',
        preferredName: 'Lang',
        tone: '温和',
        focusTitle: '继续做 Beeve',
        doneItems: ['A', 'B'],
        interruptedItems: ['会议'],
        tomorrowItems: ['收尾'],
      },
    })
  })
})
