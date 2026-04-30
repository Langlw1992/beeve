import {describe, expect, it} from 'vitest'
import {assertTrustedWriteRequest} from './request-guards'
import {ServiceError} from '@/lib/services/server/context'

describe('request guards', () => {
  it('allows same-origin write requests', () => {
    expect(() =>
      assertTrustedWriteRequest(
        new Headers({origin: 'https://auth.example.com'}),
        ['https://auth.example.com'],
      ),
    ).not.toThrow()
  })

  it('rejects cross-origin write requests', () => {
    expect(() =>
      assertTrustedWriteRequest(
        new Headers({origin: 'https://evil.example.com'}),
        ['https://auth.example.com'],
      ),
    ).toThrow(ServiceError)
  })

  it('rejects write requests without origin evidence', () => {
    expect(() =>
      assertTrustedWriteRequest(new Headers(), ['https://auth.example.com']),
    ).toThrow(ServiceError)
  })
})
