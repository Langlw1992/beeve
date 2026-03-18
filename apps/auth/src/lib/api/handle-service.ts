import {ServiceError} from '@/lib/services/server/context'

export interface ApiErrorResponse {
  error: string
  code: string
}

export async function handleService<T>(
  set: {status?: number | string},
  handler: () => Promise<T>,
): Promise<T | ApiErrorResponse> {
  try {
    return await handler()
  } catch (error) {
    if (error instanceof ServiceError) {
      set.status = error.status
      return {
        error: error.message,
        code: error.code,
      }
    }

    if (error instanceof Error) {
      set.status = 400
      return {
        error: error.message,
        code: 'BAD_REQUEST',
      }
    }

    set.status = 500
    return {
      error: 'Unexpected server error.',
      code: 'INTERNAL_SERVER_ERROR',
    }
  }
}
