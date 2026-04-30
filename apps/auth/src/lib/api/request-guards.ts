import {ServiceError} from '@/lib/services/server/context'

const defaultAppOrigin = 'http://localhost:3000'

function normalizeOrigin(value: string): string | null {
  try {
    return new URL(value).origin
  } catch {
    return null
  }
}

function getTrustedWriteOrigins() {
  const configuredOrigins = [
    process.env.APP_ORIGIN,
    process.env.BETTER_AUTH_URL,
  ].filter((origin): origin is string => Boolean(origin))

  return configuredOrigins.length > 0 ? configuredOrigins : [defaultAppOrigin]
}

function assertTrustedOriginHeader(
  headerName: 'origin' | 'referer',
  headerValue: string,
  trustedOrigins: string[],
) {
  const requestOrigin = normalizeOrigin(headerValue)
  const trustedOriginSet = new Set(
    trustedOrigins
      .map((origin) => normalizeOrigin(origin))
      .filter((origin): origin is string => Boolean(origin)),
  )

  if (!requestOrigin || !trustedOriginSet.has(requestOrigin)) {
    throw new ServiceError(
      403,
      'FORBIDDEN_ORIGIN',
      `${headerName} 请求来源不被允许。`,
    )
  }
}

export function assertTrustedWriteRequest(
  headers: Headers,
  trustedOrigins = getTrustedWriteOrigins(),
) {
  const origin = headers.get('origin')

  if (origin) {
    assertTrustedOriginHeader('origin', origin, trustedOrigins)
    return
  }

  const referer = headers.get('referer')

  if (referer) {
    assertTrustedOriginHeader('referer', referer, trustedOrigins)
    return
  }

  throw new ServiceError(
    403,
    'FORBIDDEN_ORIGIN',
    '缺少可信请求来源。',
  )
}
